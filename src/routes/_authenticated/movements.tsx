import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardCopy,
  Code2,
  Film,
  Image as ImageIcon,
  Layers,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Star,
  ShoppingBag,
  Volume2,
  VolumeX,
  CalendarDays,
  Flame,
  Zap,
  ArrowRight,
  Package,
  Wand2,
  Info,
  CheckCircle2,
  Key,
  Download,
  Play,
  Pause,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listMovementLibrary, listProductLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MovementPreset } from "@/lib/supabase/types";

import {
  BUILTIN_MOVEMENT_PRESETS,
  PRESET_VIDEO_MAP,
  PRESET_IMAGE_MAP,
  PRESET_DURATION_MAP,
  SITE_VIDEO_PRESETS,
  SITE_IMAGE_PRESETS,
  GANCHO_ESTICAR_ROUPA_PRESET,
  GANCHO_EMBALAGEM_TIKTOK_SHOP_PRESET,
  GANCHO_TAPAR_CAMERA_COM_A_MAO_PRESET,
  GANCHO_ALCA_PRESET,
  CTA_SIMPATICA_PRESET,
  RECRIANDO_CENARIO_PRESET,
  REMOVER_ROUPAS_TEXTO_PRESET,
  COLOCANDO_A_MAO_NO_AMBIENTE_PRESET,
  COLOCAR_ROUPA_NO_AMBIENTE_PRESET,
  ROUPA_NO_PACOTE_PRESET,
  COLOCAR_EMBALAGEM_TIKTOK_PRESET,
} from "@/features/movements/movement-presets";
import { MovementVideoCard } from "@/features/movements/MovementVideoCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  adaptPromptForProduct,
  generateUgcVoiceScriptsList,
  generateDaily5VideoPlan,
  DEFAULT_PRODUCT_CONFIG,
  PRODUCT_TEMPLATES,
  type CustomProductConfig,
  type DailyVideoScheduleItem,
  type UgcVoiceScript,
} from "@/features/movements/tiktok-sales-engine";
import {
  ELEVENLABS_VOICES,
  getStoredElevenLabsKey,
  saveStoredElevenLabsKey,
  generateElevenLabsAudio,
  type ElevenLabsVoice,
} from "@/features/voice-studio/elevenlabs-engine";

export const Route = createFileRoute("/_authenticated/movements")({
  component: MovementsPage,
});

const categoryLabels: Record<MovementPreset["category"], string> = {
  fashion: "Moda & Vestuário",
  ugc: "Criadores UGC",
  product_demo: "Demonstração de Produto",
  pov: "Ponto de Vista",
  cta: "Chamada para Ação",
};

const defaultMovementJson = JSON.stringify(
  {
    duracao_total_segundos: 8,
    formato: "9:16",
    enquadramento: {
      angulo: "top-down / visão frontal",
      cenario: "estúdio limpo com iluminação natural",
      estilo: "demonstração fluida",
    },
    timing: {
      frame_0_2s: "setup visual e gancho inicial",
      frame_2_6s: "movimento principal com ritmo natural",
      frame_6_8s: "finalização controlada pronta para continuidade",
    },
    action_sequence: [
      { time: "0-2s", action: "Aproximação suave da mão" },
      { time: "2-6s", action: "Movimento contínuo de toque no tecido" },
      { time: "6-8s", action: "Ajuste delicado e pausa no centro" },
    ],
    quality: {
      render: "photorealistic 4K HDR",
      motion: "smooth natural motion",
    },
  },
  null,
  2,
);

function MovementsPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [mediaFilter, setMediaFilter] = useState<"all" | "video" | "image">("all");
  const [funnelFilter, setFunnelFilter] = useState<"all" | "anti_scroll" | "fabric" | "unboxing" | "cta">("all");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [customCategory, setCustomCategory] = useState<MovementPreset["category"]>("ugc");
  const [formats, setFormats] = useState("UGC");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [movementJson, setMovementJson] = useState(defaultMovementJson);
  const [tags, setTags] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [selectedMovement, setSelectedMovement] = useState<MovementPreset | null>(null);

  // Growth & Product Adaptation State
  const [productAdaptMovement, setProductAdaptMovement] = useState<MovementPreset | null>(null);
  const [productConfig, setProductConfig] = useState<CustomProductConfig>(DEFAULT_PRODUCT_CONFIG);
  const [selectedLibraryProductId, setSelectedLibraryProductId] = useState<string | null>(null);

  // ElevenLabs & Voiceover State
  const [voiceMovement, setVoiceMovement] = useState<MovementPreset | null>(null);
  const [selectedHookIndex, setSelectedHookIndex] = useState<number>(0);
  const [selectedElevenVoice, setSelectedElevenVoice] = useState<ElevenLabsVoice>(ELEVENLABS_VOICES[0]!);
  const [elevenLabsApiKey, setElevenLabsApiKey] = useState<string>(() => getStoredElevenLabsKey());
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isGeneratingElevenAudio, setIsGeneratingElevenAudio] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [isPlayingGeneratedAudio, setIsPlayingGeneratedAudio] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Daily 5-Video Matrix State
  const [showDailyPlanModal, setShowDailyPlanModal] = useState(false);
  const [dailyPlan, setDailyPlan] = useState<DailyVideoScheduleItem[]>(() =>
    generateDaily5VideoPlan(DEFAULT_PRODUCT_CONFIG)
  );

  // Favorites state backed by localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tik_favorite_movements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Security protection: block right-click, saving, dragging and inspection hotkeys
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      toast.info("Downloads e cópias diretas de mídia estão bloqueados para proteção de direitos autorais.", {
        duration: 2500,
      });
    };

    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && (e.key === "s" || e.key === "S" || e.key === "u" || e.key === "U")) ||
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "i", "C", "c", "J", "j"].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const isFav = prev.includes(id);
      const next = isFav ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("tik_favorite_movements", JSON.stringify(next));
      } catch {}
      toast.success(isFav ? "Removido dos favoritos." : "Adicionado aos favoritos!");
      return next;
    });
  };

  const query = useQuery({ queryKey: ["movement-library"], queryFn: listMovementLibrary });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2 || instruction.trim().length < 12)
        throw new Error("Informe um nome e descreva o movimento com mais detalhes.");
      let parsedMovement: Record<string, unknown>;
      try {
        const parsed = JSON.parse(movementJson) as unknown;
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          throw new Error("invalid");
        }
        parsedMovement = parsed as Record<string, unknown>;
      } catch {
        throw new Error("O JSON do movimento está inválido. Revise vírgulas, aspas e chaves.");
      }
      const result = await getSupabaseBrowserClient()
        .from("movement_library")
        .insert({
          user_id: user.id,
          name: name.trim(),
          category: customCategory,
          formats: formats
            .split(",")
            .map((item) => item.trim().toUpperCase())
            .filter(Boolean),
          description: description.trim(),
          prompt_instruction: instruction.trim(),
          movement_json: parsedMovement,
          tags: tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
        });
      if (result.error) throw new Error(`Não foi possível salvar: ${result.error.message}`);
    },
    onSuccess: async () => {
      setName("");
      setDescription("");
      setInstruction("");
      setMovementJson(defaultMovementJson);
      setTags("");
      setShowForm(false);
      toast.success("Movimento salvo com sucesso.");
      await queryClient.invalidateQueries({ queryKey: ["movement-library"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const result = await getSupabaseBrowserClient()
        .from("movement_library")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (result.error) throw new Error("Não foi possível remover o movimento.");
    },
    onSuccess: async () => {
      toast.success("Movimento removido.");
      await queryClient.invalidateQueries({ queryKey: ["movement-library"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const loadPresetIntoForm = (preset: MovementPreset, label: string) => {
    setName(preset.name);
    setCustomCategory(preset.category);
    setFormats(preset.formats.join(", "));
    setDescription(preset.description);
    setInstruction(preset.prompt_instruction);
    setMovementJson(JSON.stringify(preset.movement_json, null, 2));
    setTags(preset.tags.join(", "));
    toast.success(`Modelo ${label} carregado no editor.`);
  };

  const loadDefaultUgcTemplate = () => {
    setName("");
    setCustomCategory("ugc");
    setFormats("UGC");
    setDescription("");
    setInstruction("");
    setMovementJson(defaultMovementJson);
    setTags("");
  };

  const rawList = query.data ?? [];
  const missingBuiltIns = BUILTIN_MOVEMENT_PRESETS.filter(
    (preset) => !rawList.some((item) => item.id === preset.id),
  );

  // Combine and sort newest-first by created_at (descending)
  const combinedList = [...missingBuiltIns, ...rawList].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  // Filter movements
  const movements = combinedList.filter((item) => {
    const isFav = favorites.includes(item.id);
    if (onlyFavorites && !isFav) return false;

    const isVideo = Boolean(PRESET_VIDEO_MAP[item.id]);
    const isImage = Boolean(PRESET_IMAGE_MAP[item.id]) || item.formats.includes("IMAGEM");

    if (mediaFilter === "video" && !isVideo) return false;
    if (mediaFilter === "image" && !isImage) return false;

    // Funnel filter
    const tagsLower = item.tags.map((t) => t.toLowerCase());
    if (funnelFilter === "anti_scroll") {
      const isAntiScroll = tagsLower.some(
        (t) => t.includes("esticar") || t.includes("gancho") || t.includes("tapar") || t.includes("jogar")
      );
      if (!isAntiScroll) return false;
    } else if (funnelFilter === "fabric") {
      const isFabric = tagsLower.some(
        (t) => t.includes("tecido") || t.includes("textura") || t.includes("elasticidade") || t.includes("qualidade")
      );
      if (!isFabric) return false;
    } else if (funnelFilter === "unboxing") {
      const isUnboxing = tagsLower.some(
        (t) => t.includes("unboxing") || t.includes("pacote") || t.includes("embalagem")
      );
      if (!isUnboxing) return false;
    } else if (funnelFilter === "cta") {
      const isCta = item.category === "cta" || tagsLower.some((t) => t.includes("cta"));
      if (!isCta) return false;
    }

    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = `${item.name} ${item.description} ${item.prompt_instruction} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const videoCount = combinedList.filter((item) => Boolean(PRESET_VIDEO_MAP[item.id])).length;
  const imageCount = combinedList.filter(
    (item) => Boolean(PRESET_IMAGE_MAP[item.id]) || item.formats.includes("IMAGEM"),
  ).length;

  const copyMovementPrompt = async (movement: MovementPreset, type?: "auto" | "text" | "json") => {
    let textToCopy = "";
    if (type === "text") {
      textToCopy = movement.prompt_instruction || JSON.stringify(movement.movement_json, null, 2);
    } else if (type === "json") {
      textToCopy = JSON.stringify(movement.movement_json, null, 2);
    } else {
      const isPureJson =
        movement.prompt_instruction.trim().startsWith("{") &&
        movement.prompt_instruction.trim().endsWith("}");
      if (isPureJson) {
        textToCopy = movement.prompt_instruction;
      } else if (movement.prompt_instruction && movement.prompt_instruction.length > 30) {
        textToCopy = movement.prompt_instruction;
      } else if (movement.movement_json && Object.keys(movement.movement_json).length > 0) {
        textToCopy = JSON.stringify(movement.movement_json, null, 2);
      } else {
        textToCopy = movement.prompt_instruction;
      }
    }
    await navigator.clipboard.writeText(textToCopy);
    setCopiedId(movement.id);
    toast.success("Prompt copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 1_800);
  };

  // Generate Ultra-Realistic ElevenLabs Audio
  const handleGenerateElevenLabs = async (scriptText: string) => {
    if (!elevenLabsApiKey.trim()) {
      setShowApiKeyInput(true);
      toast.error("Por favor, insira sua chave da API do ElevenLabs para gerar vozes ultra-realistas.");
      return;
    }

    setIsGeneratingElevenAudio(true);
    try {
      saveStoredElevenLabsKey(elevenLabsApiKey);
      const { audioUrl } = await generateElevenLabsAudio({
        text: scriptText,
        voiceId: selectedElevenVoice.id,
        apiKey: elevenLabsApiKey.trim(),
      });
      setGeneratedAudioUrl(audioUrl);
      setIsPlayingGeneratedAudio(true);
      toast.success("Narração ElevenLabs gerada com sucesso!");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar áudio no ElevenLabs.";
      toast.error(message);
    } finally {
      setIsGeneratingElevenAudio(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      {/* Hero Header with TikTok Shop Growth Tools */}
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs px-2.5 py-0.5 font-semibold">
              TikTok Shop Growth & Scale Engine
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {combinedList.length} Modelos Anti-Queda
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Biblioteca de Prompts, Vídeos & Movimentos
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Prompts profissionais com retenção ultra-alta, ganchos de parada de scroll e locuções persuasivas para escalar vendas no TikTok Shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            className="gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/30 text-amber-300 hover:text-amber-200 shadow-sm"
            onClick={() => {
              setDailyPlan(generateDaily5VideoPlan(productConfig));
              setShowDailyPlanModal(true);
            }}
          >
            <CalendarDays className="size-4 text-amber-400" />
            Plano 5 Vídeos / Dia
          </Button>

          <Button variant="hero" onClick={() => setShowForm((value) => !value)}>
            <Plus />
            Novo movimento
          </Button>
        </div>
      </header>

      {/* Metrics & Overview Tabs */}
      <section className="grid gap-3 sm:grid-cols-4">
        <div
          onClick={() => setMediaFilter("all")}
          className={`bento-card p-4 cursor-pointer transition-all ${
            mediaFilter === "all" ? "ring-2 ring-primary/60 bg-primary/5" : "hover:border-primary/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-foreground">{combinedList.length}</p>
            <Layers className="size-5 text-muted-foreground" />
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Total de Prompts</p>
        </div>

        <div
          onClick={() => setMediaFilter("video")}
          className={`bento-card p-4 cursor-pointer transition-all ${
            mediaFilter === "video"
              ? "ring-2 ring-indigo-500/60 bg-indigo-500/5"
              : "hover:border-indigo-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-indigo-400">{videoCount}</p>
            <Film className="size-5 text-indigo-400" />
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Prompts de Vídeo</p>
        </div>

        <div
          onClick={() => setMediaFilter("image")}
          className={`bento-card p-4 cursor-pointer transition-all ${
            mediaFilter === "image"
              ? "ring-2 ring-emerald-500/60 bg-emerald-500/5"
              : "hover:border-emerald-500/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-emerald-400">{imageCount}</p>
            <ImageIcon className="size-5 text-emerald-400" />
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Prompts de Imagem</p>
        </div>

        <div
          onClick={() => setOnlyFavorites((prev) => !prev)}
          className={`bento-card p-4 cursor-pointer transition-all ${
            onlyFavorites ? "ring-2 ring-amber-400/60 bg-amber-500/5" : "hover:border-amber-400/40"
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-amber-400 flex items-center gap-1.5">
              {favorites.length}
            </p>
            <Star className={`size-5 ${favorites.length > 0 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Favoritos salvos</p>
        </div>
      </section>

      {/* Strategic Sales Funnel Tabs */}
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-card/40 border border-border/40 backdrop-blur-md">
        <span className="text-xs font-bold text-muted-foreground px-2 flex items-center gap-1.5">
          <Flame className="size-3.5 text-primary" />
          Funil TikTok Shop:
        </span>

        <button
          type="button"
          onClick={() => setFunnelFilter("all")}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            funnelFilter === "all"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          Todos os Prompts
        </button>

        <button
          type="button"
          onClick={() => setFunnelFilter("anti_scroll")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            funnelFilter === "anti_scroll"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Zap className="size-3 text-amber-300" />
          Ganchos Anti-Scroll (0-2s)
        </button>

        <button
          type="button"
          onClick={() => setFunnelFilter("fabric")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            funnelFilter === "fabric"
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Sparkles className="size-3 text-emerald-300" />
          Prova de Tecido & Qualidade
        </button>

        <button
          type="button"
          onClick={() => setFunnelFilter("unboxing")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            funnelFilter === "unboxing"
              ? "bg-cyan-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Package className="size-3 text-cyan-300" />
          Unboxing & Pacote TikTok
        </button>

        <button
          type="button"
          onClick={() => setFunnelFilter("cta")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            funnelFilter === "cta"
              ? "bg-pink-600 text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <ShoppingBag className="size-3 text-pink-300" />
          CTA Sacolinha Amarela
        </button>
      </div>

      {/* Creation Drawer */}
      {showForm && (
        <section className="bento-card bento-card-accent space-y-5 p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-base">Criar prompt / movimento personalizado</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Cadastre suas próprias instruções e templates para reaproveitar em qualquer geração.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(GANCHO_ESTICAR_ROUPA_PRESET, "Esticar Roupa")}
              >
                <Film className="size-3 text-indigo-400 mr-1" /> Esticar Roupa (Vídeo)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(RECRIANDO_CENARIO_PRESET, "Recriando Cenário")}
              >
                <ImageIcon className="size-3 text-emerald-400 mr-1" /> Recriando Cenário (Img)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(GANCHO_EMBALAGEM_TIKTOK_SHOP_PRESET, "Embalagem TikTok")}
              >
                <Film className="size-3 text-indigo-400 mr-1" /> Embalagem TikTok
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(ROUPA_NO_PACOTE_PRESET, "Roupa no Pacote")}
              >
                <ImageIcon className="size-3 text-emerald-400 mr-1" /> Roupa no Pacote (Img)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(GANCHO_TAPAR_CAMERA_COM_A_MAO_PRESET, "Tapar Câmera")}
              >
                <Sparkles className="size-3 text-amber-400 mr-1" /> Tapar Câmera (5s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => loadPresetIntoForm(CTA_SIMPATICA_PRESET, "CTA Simpática")}
              >
                <Sparkles className="size-3 text-pink-400 mr-1" /> CTA Simpática
              </Button>
              <Button type="button" variant="ghost" size="sm" className="text-xs" onClick={loadDefaultUgcTemplate}>
                Limpar editor
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nome do prompt</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex: Gancho Unboxing Rápido" />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={customCategory}
                onChange={(event) =>
                  setCustomCategory(event.target.value as MovementPreset["category"])
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Formatos / Tags de Formato</Label>
              <Input
                value={formats}
                onChange={(event) => setFormats(event.target.value)}
                placeholder="POV, FLAT LAY, UNBOXING"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Descrição curta</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Resumo do efeito visual..." />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Instrução detalhada do prompt</Label>
              <Textarea
                rows={5}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Descreva o enquadramento, iluminação, mãos, movimentos e comportamento exato..."
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <div className="flex items-center justify-between gap-2">
                <Label>JSON Estruturado</Label>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Code2 className="size-3" /> Validado antes de salvar
                </span>
              </div>
              <Textarea
                rows={12}
                value={movementJson}
                onChange={(event) => setMovementJson(event.target.value)}
                className="font-mono text-xs leading-5"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Tags separadas por vírgula</Label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="moda, pov, unboxing, tiktok" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="hero"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              {createMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}Salvar
              movimento
            </Button>
          </div>
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card/40 p-3 rounded-xl border border-border/40 backdrop-blur-md">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, tag ou instrução..."
            className="pl-10 h-9 bg-background/80"
          />
        </div>

        {/* Media & Category Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Media Type Tabs */}
          <div className="flex items-center rounded-lg bg-background/80 p-0.5 border border-border/50">
            <button
              type="button"
              onClick={() => setMediaFilter("all")}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mediaFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({combinedList.length})
            </button>
            <button
              type="button"
              onClick={() => setMediaFilter("video")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mediaFilter === "video"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Film className="size-3" />
              Vídeos ({videoCount})
            </button>
            <button
              type="button"
              onClick={() => setMediaFilter("image")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                mediaFilter === "image"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ImageIcon className="size-3" />
              Imagens ({imageCount})
            </button>
          </div>

          <Button
            type="button"
            size="sm"
            variant={onlyFavorites ? "secondary" : "outline"}
            className={`h-8 text-xs ${
              onlyFavorites ? "border-amber-400/50 text-amber-400 bg-amber-500/10 font-semibold" : ""
            }`}
            onClick={() => setOnlyFavorites((prev) => !prev)}
          >
            <Star className={`size-3.5 mr-1 ${onlyFavorites ? "fill-amber-400 text-amber-400" : ""}`} />
            Favoritos ({favorites.length})
          </Button>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-8 rounded-md border border-input bg-background/80 px-2.5 text-xs"
          >
            <option value="all">Todas as categorias</option>
            {Object.entries(categoryLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Movement Cards */}
      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : movements.length === 0 ? (
        <div className="bento-card p-12 text-center space-y-3">
          <Layers className="size-10 mx-auto text-muted-foreground/50" />
          <p className="text-base font-semibold text-foreground">Nenhum prompt encontrado</p>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Tente alterar os termos de busca ou mudar o filtro de mídia para visualizar os modelos disponíveis.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setMediaFilter("all");
              setFunnelFilter("all");
              setOnlyFavorites(false);
            }}
          >
            Limpar Filtros
          </Button>
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movements.map((movement) => {
            const isFav = favorites.includes(movement.id);
            const videoUrl = PRESET_VIDEO_MAP[movement.id];
            const imageUrl = PRESET_IMAGE_MAP[movement.id];
            const isVideo = Boolean(videoUrl);
            const isImage = Boolean(imageUrl) || movement.formats.includes("IMAGEM");
            const duration = PRESET_DURATION_MAP[movement.id];

            return (
              <article
                key={movement.id}
                className="bento-card interactive-card flex flex-col justify-between overflow-hidden p-3 h-full space-y-3 border-border/40 hover:border-primary/50 transition-all shadow-sm"
              >
                {/* Unified Media Area */}
                {videoUrl ? (
                  <MovementVideoCard
                    videoUrl={videoUrl}
                    duration={duration}
                    isFavorite={isFav}
                    onToggleFavorite={() => toggleFavorite(movement.id)}
                  />
                ) : imageUrl ? (
                  <div
                    className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-black/90 shadow-inner group cursor-pointer border border-emerald-500/20 hover:border-emerald-500/50 transition-all select-none"
                    onClick={() => setSelectedMovement(movement)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      return false;
                    }}
                    onDragStart={(e) => {
                      e.preventDefault();
                      return false;
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={movement.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none"
                      loading="lazy"
                      draggable={false}
                    />

                    {/* Invisible anti-download protective glass shield */}
                    <div
                      className="absolute inset-0 z-0 bg-transparent select-none"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      draggable={false}
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-40 transition-opacity pointer-events-none" />

                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 size-8 rounded-full bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(movement.id);
                      }}
                      title={isFav ? "Remover dos favoritos" : "Favoritar prompt"}
                    >
                      <Star className={`size-4 ${isFav ? "fill-amber-400 text-amber-400" : "text-white/80"}`} />
                    </Button>

                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] font-semibold text-white bg-black/70 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-white/10 shadow-lg pointer-events-none">
                      <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                        <ImageIcon className="size-3.5" />
                        Prompt de Imagem
                      </span>
                      <span className="text-[10px] text-emerald-300/80 font-mono">Foto 4K</span>
                    </div>
                  </div>
                ) : (
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-secondary/40 to-slate-900 border border-border/40 p-4 flex flex-col justify-between group select-none">
                    <div className="flex items-center justify-between">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Layers className="size-4" />
                      </span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/70 text-white"
                        onClick={() => toggleFavorite(movement.id)}
                        title={isFav ? "Remover dos favoritos" : "Favoritar movimento"}
                      >
                        <Star className={`size-4 ${isFav ? "fill-amber-400 text-amber-400" : "text-white/80"}`} />
                      </Button>
                    </div>

                    <div className="space-y-1 text-center py-6">
                      <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                        {categoryLabels[movement.category]}
                      </p>
                      <p className="text-[10px] text-muted-foreground">Prompt de Produção</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-white/5 pt-2">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {movement.formats[0] || "PROMPT"}
                      </Badge>
                      <span className="font-mono text-[9px]">{duration || "Geração"}</span>
                    </div>
                  </div>
                )}

                {/* Title area, Media Type Badge & Category */}
                <div className="px-1 flex-1 flex flex-col justify-between gap-1.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {/* Media Type Badge */}
                    {isVideo ? (
                      <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-[10px] font-semibold gap-1 px-2 py-0.5 hover:bg-indigo-500/25">
                        <Film className="size-3" /> Vídeo {duration ? `· ${duration}` : ""}
                      </Badge>
                    ) : isImage ? (
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] font-semibold gap-1 px-2 py-0.5 hover:bg-emerald-500/25">
                        <ImageIcon className="size-3" /> Imagem
                      </Badge>
                    ) : null}

                    {/* Category Badge */}
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 border-white/10 text-muted-foreground bg-white/5"
                    >
                      {categoryLabels[movement.category]}
                    </Badge>

                    {/* Primary Format Tag */}
                    {movement.formats.filter((f) => f !== "IMAGEM" && f !== "UGC" || movement.formats.length === 1)[0] && (
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 font-medium">
                        {movement.formats.filter((f) => f !== "IMAGEM")[0] || movement.formats[0]}
                      </Badge>
                    )}
                  </div>

                  <h2
                    className="font-semibold text-sm leading-snug line-clamp-2 text-foreground pt-0.5"
                    title={movement.name}
                  >
                    {movement.name}
                  </h2>
                </div>

                {/* Growth Action Row: Adapt to Product + Spoken UGC Voiceover */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-medium gap-1 px-2 border-primary/30 bg-primary/5 hover:bg-primary/15 text-primary"
                    onClick={() => {
                      setProductAdaptMovement(movement);
                    }}
                    title="Personalizar prompt com o nome, cor e tecido do seu produto"
                  >
                    <Sparkles className="size-3 text-primary" />
                    Meu Produto
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px] font-medium gap-1 px-2 border-pink-500/30 bg-pink-500/5 hover:bg-pink-500/15 text-pink-300"
                    onClick={() => {
                      setVoiceMovement(movement);
                      setSelectedHookIndex(0);
                      setGeneratedAudioUrl(null);
                    }}
                    title="Gerar áudio ultra-realista ElevenLabs com ganchos virais"
                  >
                    <Volume2 className="size-3 text-pink-400" />
                    Locução ElevenLabs
                  </Button>
                </div>

                {/* Action Buttons: Copy Prompt + View Details Modal + Delete */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="hero"
                    className="flex-1 h-8 text-xs font-medium gap-1.5"
                    onClick={() => void copyMovementPrompt(movement)}
                  >
                    {copiedId === movement.id ? (
                      <>
                        <Check className="size-3.5 text-emerald-300" /> Copiado!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="size-3.5" /> Copiar Prompt
                      </>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground shrink-0 border-border/60 hover:bg-secondary"
                    onClick={() => setSelectedMovement(movement)}
                    title="Ver detalhes e prompt completo"
                  >
                    <Code2 className="size-3.5" />
                  </Button>

                  {movement.user_id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-8 text-muted-foreground hover:text-destructive shrink-0"
                      aria-label={`Remover ${movement.name}`}
                      disabled={removeMutation.isPending}
                      onClick={() => removeMutation.mutate(movement.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Movement Details & Prompt Modal */}
      <Dialog open={Boolean(selectedMovement)} onOpenChange={(open) => !open && setSelectedMovement(null)}>
        <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto border-primary/20 bg-slate-950/95 backdrop-blur-xl">
          {selectedMovement && (
            <>
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {PRESET_VIDEO_MAP[selectedMovement.id] ? (
                    <Badge className="bg-indigo-500/20 text-indigo-300 border-indigo-500/40 text-xs gap-1">
                      <Film className="size-3.5" /> Prompt de Vídeo
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs gap-1">
                      <ImageIcon className="size-3.5" /> Prompt de Imagem
                    </Badge>
                  )}

                  <Badge variant="outline" className="text-xs border-primary/40 text-primary bg-primary/10">
                    {categoryLabels[selectedMovement.category]}
                  </Badge>

                  {selectedMovement.formats.map((fmt) => (
                    <Badge key={fmt} variant="secondary" className="text-xs">
                      {fmt}
                    </Badge>
                  ))}

                  <span className="ml-auto font-mono text-xs text-muted-foreground">
                    {PRESET_DURATION_MAP[selectedMovement.id]
                      ? `Duração: ${PRESET_DURATION_MAP[selectedMovement.id]}`
                      : "Formato: Imagem 4K"}
                  </span>
                </div>

                <DialogTitle className="text-xl font-bold text-foreground">
                  {selectedMovement.name}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                  {selectedMovement.description}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 pt-3">
                {/* Media Preview (Video or Image) */}
                {PRESET_VIDEO_MAP[selectedMovement.id] ? (
                  <div className="max-w-xs mx-auto">
                    <MovementVideoCard
                      videoUrl={PRESET_VIDEO_MAP[selectedMovement.id]!}
                      duration={PRESET_DURATION_MAP[selectedMovement.id]}
                      isFavorite={favorites.includes(selectedMovement.id)}
                      onToggleFavorite={() => toggleFavorite(selectedMovement.id)}
                    />
                  </div>
                ) : PRESET_IMAGE_MAP[selectedMovement.id] ? (
                  <div
                    className="relative max-w-xs mx-auto rounded-xl overflow-hidden border border-emerald-500/30 shadow-lg bg-black select-none"
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <img
                      src={PRESET_IMAGE_MAP[selectedMovement.id]}
                      alt={selectedMovement.name}
                      className="w-full object-cover max-h-[380px] pointer-events-none select-none"
                      draggable={false}
                    />
                    <div
                      className="absolute inset-0 bg-transparent select-none"
                      onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    />
                  </div>
                ) : null}

                {/* Quick Action Banner */}
                <div className="flex flex-wrap gap-2 justify-center p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 text-primary border-primary/30"
                    onClick={() => {
                      const m = selectedMovement;
                      setSelectedMovement(null);
                      setProductAdaptMovement(m);
                    }}
                  >
                    <Sparkles className="size-3.5" /> Adaptar ao Meu Produto
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs gap-1.5 text-pink-400 border-pink-500/30"
                    onClick={() => {
                      const m = selectedMovement;
                      setSelectedMovement(null);
                      setVoiceMovement(m);
                      setSelectedHookIndex(0);
                    }}
                  >
                    <Volume2 className="size-3.5" /> Gerar Locução ElevenLabs
                  </Button>
                </div>

                {/* Prompt Text */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Prompt Completo (Instrução)
                    </Label>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs gap-1.5"
                      onClick={() => void copyMovementPrompt(selectedMovement, "text")}
                    >
                      <ClipboardCopy className="size-3" /> Copiar Texto
                    </Button>
                  </div>
                  <pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/60 p-3.5 font-mono text-xs leading-relaxed text-slate-200 border border-white/10 selection:bg-primary/30">
                    {selectedMovement.prompt_instruction || "Sem instrução de texto direta."}
                  </pre>
                </div>

                {/* JSON Representation if available */}
                {selectedMovement.movement_json && Object.keys(selectedMovement.movement_json).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Code2 className="size-3.5 text-emerald-400" /> JSON Estruturado
                      </Label>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5"
                        onClick={() => void copyMovementPrompt(selectedMovement, "json")}
                      >
                        <ClipboardCopy className="size-3" /> Copiar JSON
                      </Button>
                    </div>
                    <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/80 p-3 font-mono text-xs text-emerald-300 border border-emerald-500/20 selection:bg-emerald-500/30">
                      {JSON.stringify(selectedMovement.movement_json, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Tags */}
                {selectedMovement.tags && selectedMovement.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                    {selectedMovement.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full text-slate-400"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Visual Product Adapter Dialog ("Meu Produto") */}
      <Dialog
        open={Boolean(productAdaptMovement)}
        onOpenChange={(open) => !open && setProductAdaptMovement(null)}
      >
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto border-primary/30 bg-slate-950/98 backdrop-blur-2xl p-6">
          {productAdaptMovement && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-primary/20 text-primary border-primary/40 text-xs font-semibold">
                    Personalizador de Alta Conversão
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Sparkles className="size-5 text-primary" />
                  Adaptar Prompt para Seu Produto
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Selecione um produto da sua loja ou use um dos templates prontos para injetar tecido, cor e nome da peça preservando 100% o realismo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 pt-3">
                {/* Visual Product Cards from Store */}
                {productsQuery.data && productsQuery.data.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <ShoppingBag className="size-3.5 text-primary" />
                      Produtos Cadastrados na Sua Loja ({productsQuery.data.length}):
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {productsQuery.data.map((p) => {
                        const isSelected = selectedLibraryProductId === p.id;
                        return (
                          <div
                            key={p.id}
                            onClick={() => {
                              setSelectedLibraryProductId(p.id);
                              setProductConfig({
                                name: p.name,
                                color: "Conforme fotos do anúncio",
                                fabric: p.description || "Tecido premium encorpado",
                                benefit: "Caimento impecável e modelagem perfeita",
                                scenario: "Cenário limpo com luz suave de estúdio",
                              });
                              toast.success(`Produto "${p.name}" selecionado!`);
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-primary bg-primary/10 ring-1 ring-primary"
                                : "border-border/50 bg-card/40 hover:border-primary/40 hover:bg-card/70"
                            }`}
                          >
                            <div className="size-10 rounded-md bg-black/60 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                              {p.previewUrl ? (
                                <img src={p.previewUrl} alt={p.name} className="size-full object-cover" />
                              ) : (
                                <Package className="size-5 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-foreground truncate">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{p.category || "Produto"}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="size-4 text-primary shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Fast Category Presets */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                    <Wand2 className="size-3.5 text-amber-400" />
                    Ou preencher com 1 clique usando Nichos Prontos:
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {PRODUCT_TEMPLATES.map((tmpl) => (
                      <Button
                        key={tmpl.label}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-xs h-7 gap-1 bg-white/5 border-white/10 hover:border-primary/50 hover:bg-primary/10 text-foreground"
                        onClick={() => {
                          setSelectedLibraryProductId(null);
                          setProductConfig(tmpl.config);
                          toast.success(`Template ${tmpl.label} aplicado!`);
                        }}
                      >
                        {tmpl.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid gap-3 sm:grid-cols-2 p-3.5 rounded-xl bg-card/40 border border-border/50">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Nome da Peça / Produto</Label>
                    <Input
                      value={productConfig.name}
                      onChange={(e) => setProductConfig({ ...productConfig, name: e.target.value })}
                      placeholder="Ex: Vestido Midi Canelado com Fenda"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Cor / Variação da Foto</Label>
                    <Input
                      value={productConfig.color}
                      onChange={(e) => setProductConfig({ ...productConfig, color: e.target.value })}
                      placeholder="Ex: Preto Fosco / Terracota"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Tecido & Toque</Label>
                    <Input
                      value={productConfig.fabric}
                      onChange={(e) => setProductConfig({ ...productConfig, fabric: e.target.value })}
                      placeholder="Ex: Canelado encorpado 320g com elastano"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Diferencial / Benefício Chave</Label>
                    <Input
                      value={productConfig.benefit}
                      onChange={(e) => setProductConfig({ ...productConfig, benefit: e.target.value })}
                      placeholder="Ex: Zero transparência e modela a cintura"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-medium">Cenário / Superfície</Label>
                    <Input
                      value={productConfig.scenario}
                      onChange={(e) => setProductConfig({ ...productConfig, scenario: e.target.value })}
                      placeholder="Ex: Cama com lençol bege minimalista e luz suave de estúdio"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                {/* Live Tailored Prompt Output */}
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Sparkles className="size-3.5" />
                      Prompt 100% Adaptado para "{productConfig.name}":
                    </Label>
                    <Button
                      size="sm"
                      variant="hero"
                      className="h-7 text-xs gap-1.5 shadow-sm"
                      onClick={async () => {
                        const adapted = adaptPromptForProduct(
                          productAdaptMovement.prompt_instruction,
                          productConfig
                        );
                        await navigator.clipboard.writeText(adapted);
                        toast.success("Prompt personalizado copiado para a área de transferência!");
                      }}
                    >
                      <ClipboardCopy className="size-3" /> Copiar Prompt Adaptado
                    </Button>
                  </div>
                  <pre className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-lg bg-black/80 p-3.5 font-mono text-xs leading-relaxed text-emerald-300 border border-emerald-500/20">
                    {adaptPromptForProduct(
                      productAdaptMovement.prompt_instruction,
                      productConfig
                    )}
                  </pre>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Ultra-Realistic ElevenLabs Voiceover Modal */}
      <Dialog
        open={Boolean(voiceMovement)}
        onOpenChange={(open) => {
          if (!open) {
            if (audioPlayerRef.current) {
              audioPlayerRef.current.pause();
            }
            setGeneratedAudioUrl(null);
            setIsPlayingGeneratedAudio(false);
            setVoiceMovement(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto border-pink-500/30 bg-slate-950/98 backdrop-blur-2xl p-6">
          {voiceMovement && (
            <>
              {(() => {
                const scriptsList = generateUgcVoiceScriptsList(voiceMovement, productConfig);
                const currentScript = scriptsList[selectedHookIndex] || scriptsList[0]!;

                return (
                  <>
                    <DialogHeader>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/40 text-xs font-semibold">
                          Voz Humana Ultra-Realista · ElevenLabs AI
                        </Badge>
                      </div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                        <Volume2 className="size-5 text-pink-400" />
                        Locução Profissional Humana (ElevenLabs)
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Vozes com respiração real, entonações naturais de criadoras brasileiras do TikTok e 5 ganchos virais para retenção.
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 pt-3">
                      {/* ElevenLabs API Key Quick Config */}
                      <div className="p-3 rounded-xl bg-card/60 border border-border/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Key className="size-4 text-amber-400" />
                            <span className="text-xs font-bold text-foreground">
                              Chave da API ElevenLabs:
                            </span>
                            {elevenLabsApiKey ? (
                              <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px]">
                                Configurada ✓
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                                Necessária
                              </Badge>
                            )}
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setShowApiKeyInput((prev) => !prev)}
                          >
                            {showApiKeyInput ? "Ocultar" : "Alterar Chave"}
                          </Button>
                        </div>

                        {(!elevenLabsApiKey || showApiKeyInput) && (
                          <div className="flex gap-2 pt-1">
                            <Input
                              type="password"
                              placeholder="Cole sua chave ElevenLabs (ex: xi-...)"
                              value={elevenLabsApiKey}
                              onChange={(e) => {
                                setElevenLabsApiKey(e.target.value);
                                saveStoredElevenLabsKey(e.target.value);
                              }}
                              className="h-8 text-xs bg-background"
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-8 text-xs shrink-0"
                              onClick={() => {
                                saveStoredElevenLabsKey(elevenLabsApiKey);
                                setShowApiKeyInput(false);
                                toast.success("Chave ElevenLabs salva!");
                              }}
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs shrink-0 gap-1 text-muted-foreground"
                              onClick={() => window.open("https://elevenlabs.io", "_blank")}
                            >
                              Pegar Chave <ExternalLink className="size-3" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Select Human Voice Persona */}
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Selecione a Voz Humana (Criadores Brasileiros):
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {ELEVENLABS_VOICES.map((voice) => {
                            const isSelected = selectedElevenVoice.id === voice.id;
                            return (
                              <div
                                key={voice.id}
                                onClick={() => setSelectedElevenVoice(voice)}
                                className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? "border-pink-500 bg-pink-500/10 ring-1 ring-pink-500/40"
                                    : "border-border/50 bg-card/40 hover:border-pink-500/30 hover:bg-card/70"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-bold text-xs text-foreground">{voice.name}</span>
                                  <Badge variant="outline" className="text-[9px] py-0 border-white/10">
                                    {voice.style}
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-tight">
                                  {voice.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Psychological Hook Selector Tabs */}
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Selecione o Gancho Psicológico de Retenção:
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {scriptsList.map((item, idx) => (
                            <button
                              key={item.hookType}
                              type="button"
                              onClick={() => {
                                setSelectedHookIndex(idx);
                                setGeneratedAudioUrl(null);
                              }}
                              className={`p-2 rounded-lg text-left text-xs font-bold border transition-all ${
                                selectedHookIndex === idx
                                  ? "bg-pink-500/15 border-pink-500/60 text-pink-300 shadow-sm ring-1 ring-pink-500/40"
                                  : "bg-card/40 border-border/50 text-muted-foreground hover:text-foreground hover:bg-white/5"
                              }`}
                            >
                              {item.hookTitle}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Retention Algorithm Tip */}
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                        <Info className="size-4 text-amber-400 shrink-0" />
                        <span>{currentScript.retentionTip}</span>
                      </div>

                      {/* Audio Playback & Generation Action */}
                      <div className="p-3.5 rounded-xl bg-pink-500/10 border border-pink-500/20 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <Button
                            type="button"
                            variant="hero"
                            disabled={isGeneratingElevenAudio}
                            className="h-9 gap-2 text-xs font-bold shadow-md"
                            onClick={() => handleGenerateElevenLabs(currentScript.fullScript)}
                          >
                            {isGeneratingElevenAudio ? (
                              <>
                                <Loader2 className="size-4 animate-spin" /> Gerando Áudio Ultra-Realista...
                              </>
                            ) : (
                              <>
                                <Sparkles className="size-4 text-amber-300" /> Gerar Voz com ElevenLabs AI
                              </>
                            )}
                          </Button>

                          <div className="flex items-center gap-2">
                            {generatedAudioUrl && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                                onClick={() => {
                                  const a = document.createElement("a");
                                  a.href = generatedAudioUrl;
                                  a.download = `narracao-${selectedElevenVoice.name.toLowerCase().replace(/\s+/g, "-")}.mp3`;
                                  a.click();
                                  toast.success("Download do MP3 iniciado!");
                                }}
                              >
                                <Download className="size-3.5" /> Baixar MP3
                              </Button>
                            )}

                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-8 text-xs gap-1.5 border-pink-500/30 text-pink-300 hover:bg-pink-500/20"
                              onClick={async () => {
                                await navigator.clipboard.writeText(currentScript.fullScript);
                                toast.success("Roteiro falado copiado!");
                              }}
                            >
                              <ClipboardCopy className="size-3.5" /> Copiar Roteiro
                            </Button>
                          </div>
                        </div>

                        {/* Real Audio Player */}
                        {generatedAudioUrl && (
                          <div className="p-2.5 rounded-lg bg-black/60 border border-pink-500/30 flex items-center gap-3">
                            <audio
                              ref={audioPlayerRef}
                              src={generatedAudioUrl}
                              controls
                              autoPlay
                              className="w-full h-8"
                              onPlay={() => setIsPlayingGeneratedAudio(true)}
                              onPause={() => setIsPlayingGeneratedAudio(false)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Phased Script Breakdown */}
                      <div className="space-y-2">
                        <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                          <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>⏱️ 0s a 2s — Gancho de Parada de Scroll</span>
                            <span className="text-[10px] text-indigo-300 font-mono">Retenção Máxima</span>
                          </p>
                          <p className="text-sm font-medium text-foreground italic">
                            "{currentScript.hook}"
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                          <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>🧵 2s a 6s — Demonstração & Quebra de Objeção</span>
                            <span className="text-[10px] text-emerald-300 font-mono">Sensorial & Tecido</span>
                          </p>
                          <p className="text-sm font-medium text-foreground italic">
                            "{currentScript.body}"
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
                          <p className="text-[11px] font-bold text-pink-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                            <span>🛒 6s a 8s — Chamada para a Sacolinha Amarela</span>
                            <span className="text-[10px] text-pink-300 font-mono">Conversão & Clique</span>
                          </p>
                          <p className="text-sm font-medium text-foreground italic">
                            "{currentScript.cta}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Daily 5-Video Matrix Modal ("Plano Diário Anti-Fadiga") */}
      <Dialog open={showDailyPlanModal} onOpenChange={setShowDailyPlanModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-amber-500/30 bg-slate-950/98 backdrop-blur-2xl p-6">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold">
                Estratégia Anti-Fadiga de Criativos
              </Badge>
            </div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <CalendarDays className="size-5 text-amber-400" />
              Grade de 5 Vídeos do Dia para Escalar Vendas
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Postar 3 a 5 variações de ganchos por dia é a única forma comprovada de manter o TikTok Shop entregando seus vídeos todos os dias sem cortar alcance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-3">
              {dailyPlan.map((item, idx) => (
                <div
                  key={item.timeSlot}
                  className="p-3.5 rounded-xl bg-card/60 border border-border/50 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="flex size-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-xs text-amber-300">{item.timeSlot}</span>
                      <Badge variant="outline" className="text-[10px] py-0 border-amber-500/30 text-amber-400">
                        {item.hookTypeBadge}
                      </Badge>
                    </div>
                    <p className="font-semibold text-sm text-foreground">{item.presetName}</p>
                    <p className="text-xs text-muted-foreground">{item.hookGoal}</p>
                    <p className="text-xs text-emerald-300/90 font-mono italic pt-0.5">
                      Áudio: "{item.suggestedAudioHook}"
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 text-amber-300 border-amber-500/30 hover:bg-amber-500/10 shrink-0"
                    onClick={() => {
                      const match = combinedList.find((m) => m.id === item.presetId);
                      if (match) {
                        setShowDailyPlanModal(false);
                        setSelectedMovement(match);
                      } else {
                        toast.info("Prompt disponível na vitrine principal.");
                      }
                    }}
                  >
                    Ver Prompt <ArrowRight className="size-3" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs text-amber-200">
                💡 <strong>Dica de Ouro:</strong> Nunca poste os 5 vídeos seguidos. Dê um intervalo mínimo de 2 a 3 horas entre cada publicação.
              </span>
              <Button
                size="sm"
                variant="hero"
                className="h-8 text-xs gap-1.5 shrink-0"
                onClick={async () => {
                  const fullText = dailyPlan
                    .map(
                      (p, i) =>
                        `VÍDEO ${i + 1} (${p.timeSlot}) - ${p.phase} [${p.hookTypeBadge}]\nModelo: ${p.presetName}\nObjetivo: ${p.hookGoal}\nGancho de Áudio: "${p.suggestedAudioHook}"\n`
                    )
                    .join("\n---\n\n");
                  await navigator.clipboard.writeText(fullText);
                  toast.success("Plano de 5 vídeos do dia copiado!");
                }}
              >
                <ClipboardCopy className="size-3.5" /> Copiar Grade do Dia
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
