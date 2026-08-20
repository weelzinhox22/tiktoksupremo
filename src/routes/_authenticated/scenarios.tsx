import { useState, useRef } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Plus,
  Search,
  SlidersHorizontal,
  FileCode,
  Sun,
  Camera,
  Layers,
  Sparkles,
  Wand2,
  Copy,
  Check,
  Clapperboard,
  Sparkle,
  Image as ImageIcon,
  Flame,
  Upload,
  RefreshCw,
  Shirt,
  Scissors,
  Save,
  CheckCircle2,
  Trash2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { ScenarioProfile } from "@/features/four-modules/types";
import { scenarioRepository } from "@/features/four-modules/repositories";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  analyzeScenarioComposerServerFn,
  type ScenarioComposerResult,
} from "@/features/scenarios/server";

export const Route = createFileRoute("/_authenticated/scenarios")({
  component: ScenariosPage,
  head: () => ({ meta: [{ title: "Biblioteca de Cenários & Compositor IA — Tik Supremo" }] }),
});

interface FluxScenarioPreset {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  description: string;
  fluxPrompt: string;
  lighting: string;
  surface: string;
  decor: string;
}

const FLUX_SCENARIO_PRESETS: FluxScenarioPreset[] = [
  {
    id: "flux-1",
    name: "Quarto Minimalista Pinterest (Tapete Felpudo & Madeira)",
    category: "bedroom",
    categoryLabel: "Quarto Acolhedor",
    description: "Cenário favorito para vídeos unboxing e flat lay: tapete fofo cream, piso de carvalho claro e luz solar suave de janela.",
    fluxPrompt: `Ultra-realistic 8k smartphone photo of a cozy minimalist bedroom setup, soft fluffy cream carpet on light oak wooden floor, warm golden hour sunlight streaming from a side window, subtle marble side table partially visible, neutral dried flower arrangement in ceramic vase, perfume bottle, delicate aesthetic decor, Pinterest fashion unboxing POV, authentic realistic shadows, no studio lighting, 9:16 vertical --ar 9:16 --v 6.1`,
    lighting: "Golden Hour Suave (Luz natural de janela lateral)",
    surface: "Tapete felpudo bege/cream sobre piso de carvalho claro",
    decor: "Mesinha de mármore, vaso cerâmico com flores secas, perfume e pratinho de anéis",
  },
  {
    id: "flux-2",
    name: "Closet de Boutique Chic & Provador",
    category: "boutique",
    categoryLabel: "Boutique & Moda",
    description: "Ambiente sofisticado de loja boutique com araras de metal dourado, espelho de chão com moldura orgânica e iluminação quente.",
    fluxPrompt: `High-end fashion boutique showroom corner, modern luxury interior, minimalist brass clothing rack with beige linen hangers, full-length arched golden floor mirror, warm ambient spotlights, clean polished microcement floor, elegant neutral palette, authentic boutique lighting, 9:16 vertical --ar 9:16`,
    lighting: "Spots direcionais quentes 3000K com luz difusa de fundo",
    surface: "Piso de microcimento acetinado neutro",
    decor: "Arara de latão dourado, espelho orgânico de corpo inteiro e poltrona boucle",
  },
  {
    id: "flux-3",
    name: "Sala de Estar Escandinava Clean",
    category: "living_room",
    categoryLabel: "Sala & Sofá",
    description: "Cenário amplo e iluminado com sofá em tecido boucle off-white, plantas naturais e luz difusa da manhã.",
    fluxPrompt: `Bright Scandinavian aesthetic living room, natural morning daylight filling the room, cozy textured off-white boucle sofa, light travertine coffee table, large fiddle leaf fig plant, sheer white linen curtains, minimal clean styling, realistic smartphone exposure, 9:16 vertical --ar 9:16`,
    lighting: "Luz difusa da manhã através de cortinas de linho",
    surface: "Tapete de juta e lã mesclada",
    decor: "Sofá boucle off-white, mesa de travertino e planta natural",
  },
  {
    id: "flux-4",
    name: "Banheiro de Mármore Spa Luxo",
    category: "bathroom",
    categoryLabel: "Skincare & Beleza",
    description: "Perfeito para cosméticos, perfumes e autocuidado: bancada de mármore calacatta com espelho iluminado e toalhas de algodão.",
    fluxPrompt: `Luxury modern bathroom vanity with white Calacatta marble countertop, brushed brass faucet, backlit round mirror with soft warm glow, small glass tray with skincare bottles, folded plush white cotton towels, high-end spa aesthetic, realistic moisture reflections, 9:16 vertical --ar 9:16`,
    lighting: "Espelho retroiluminado com temperatura suave 4000K",
    surface: "Bancada de mármore Calacatta branco com veios cinza",
    decor: "Bandeja de vidro, toalhas dobradas e torneira em latão escovado",
  },
  {
    id: "flux-5",
    name: "Cozinha Gourmet Americana & Ilha",
    category: "kitchen",
    categoryLabel: "Casa & Utilidades",
    description: "Cenário premium para produtos de cozinha e utilidades: ilha de quartzo branco com banquetas e armários em madeira ripada.",
    fluxPrompt: `Modern open-concept gourmet kitchen island with white quartz countertop, warm under-cabinet LED lighting, fluted oak wood cabinetry, clean minimalist styling, natural daylight, POV angle, shot on iPhone 15 Pro, realistic home setting, 9:16 vertical --ar 9:16`,
    lighting: "Fitas LED embutidas sob os armários + luz natural",
    surface: "Ilha central em quartzo branco polido",
    decor: "Armários ripados em carvalho e tábua de madeira rústica",
  },
];

function ScenariosPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"composer" | "library" | "flux_builder">("composer");
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- COMPOSER STATE ---
  const [scenarioImageBase64, setScenarioImageBase64] = useState<string | null>(null);
  const [clothingImageBase64, setClothingImageBase64] = useState<string | null>(null);
  const [clothingDescription, setClothingDescription] = useState("");
  const [placementStyle, setPlacementStyle] = useState<"flat_lay_carpet" | "folded_aesthetic" | "wooden_hanger" | "bed_drape">("flat_lay_carpet");
  const [composerResult, setComposerResult] = useState<ScenarioComposerResult | null>(null);

  const scenarioFileInputRef = useRef<HTMLInputElement | null>(null);
  const clothingFileInputRef = useRef<HTMLInputElement | null>(null);

  // --- CUSTOM FLUX BUILDER STATE ---
  const [customRoom, setCustomRoom] = useState("Quarto Minimalista Acolhedor");
  const [customLighting, setCustomLighting] = useState("Golden hour natural de janela lateral");
  const [customSurface, setCustomSurface] = useState("Tapete felpudo bege/cream sobre piso de madeira");
  const [customDecor, setCustomDecor] = useState("Mesinha de mármore, flores secas em vaso cerâmico, perfume e espelho dourado");
  const [customAesthetic, setCustomAesthetic] = useState("Pinterest Aesthetic (POV Smartphone Hiper-realista)");

  const generatedFluxPrompt = `Ultra-realistic 8k photo of a ${customRoom.toLowerCase()}, surface: ${customSurface.toLowerCase()}, lighting: ${customLighting.toLowerCase()}, decor elements: ${customDecor.toLowerCase()}, aesthetic: ${customAesthetic.toLowerCase()}, shot on iPhone 15 Pro, authentic soft shadows and realistic texture, no studio lighting, clean framing for TikTok Shop fashion/product unboxing POV, 9:16 vertical --ar 9:16 --v 6.1`;

  const scenariosQuery = useQuery({
    queryKey: ["scenarios", user.id],
    queryFn: () => scenarioRepository.list(user.id),
  });

  // Handle Image Uploads to Base64
  const handleFileUpload = (file: File, type: "scenario" | "clothing") => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor envie um arquivo de imagem válido (PNG, JPG, WEBP).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        if (type === "scenario") {
          setScenarioImageBase64(reader.result);
          toast.success("Foto do cenário carregada com sucesso!");
        } else {
          setClothingImageBase64(reader.result);
          toast.success("Foto da roupa carregada com sucesso!");
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Composer Mutation
  const composerMutation = useMutation({
    mutationFn: async (mode: "extract_clean_scenario" | "compose_clothing_in_scenario") => {
      if (!scenarioImageBase64) {
        throw new Error("Faça o upload da foto do cenário primeiro.");
      }
      if (mode === "compose_clothing_in_scenario" && !clothingImageBase64 && !clothingDescription.trim()) {
        throw new Error("Para compor uma roupa, envie a foto da roupa ou preencha a descrição.");
      }

      return await analyzeScenarioComposerServerFn({
        data: {
          mode,
          scenarioImageBase64,
          clothingImageBase64: clothingImageBase64 || undefined,
          clothingDescription: clothingDescription.trim() || undefined,
          placementStyle,
          aspectRatio: "9:16",
        },
      });
    },
    onSuccess: (data) => {
      setComposerResult(data);
      if (data.mode === "extract_clean_scenario") {
        toast.success("Cenário limpo extraído com sucesso pelo Gemini Vision!");
      } else {
        toast.success("Prompt de composição de roupa gerado com sucesso!");
      }
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao processar imagem.");
    },
  });

  const saveFluxScenarioMutation = useMutation({
    mutationFn: async (preset: { name: string; description: string; fluxPrompt: string; category: string; surface?: string; lighting?: string }) => {
      const supabase = getSupabaseBrowserClient();
      const result = await supabase.from("scenarios").insert({
        user_id: user.id,
        name: preset.name,
        description: preset.description,
        category: preset.category,
        environment: {
          spaceType: preset.name,
          wall: "Neutro",
          floor: preset.surface || "Madeira clara",
          ceiling: "Branco",
          furniture: ["Móveis minimalistas"],
          decor: ["Decoração estética"],
          depth: "3m",
        },
        lighting: {
          mainSource: preset.lighting || "Janela natural",
          temperature: "4500K",
          intensity: "Suave",
          contrast: "Baixo",
          shadows: "Suaves",
          naturalLight: "Abundante",
          preset: "natural_golden",
        },
        camera_presets: [
          {
            id: `cp-${Date.now()}`,
            name: "Overhead Top-Down 9:16",
            framing: "Plano fixo superior",
            height: "1.8m",
            distance: "1.2m",
            angle: "90 graus",
            depthOfField: "Nitidez total no plano",
            promptSnippet: preset.fluxPrompt,
          },
        ],
        fixed_elements: [],
        action_zones: {
          characterZone: "Mãos na base",
          productZone: "Centro do tapete",
          demonstrationZone: "Área central",
          textSafeZone: "Terço superior",
        },
        audio: {
          ambientNoise: "Silencioso",
          reverberation: "Mínima",
          suggestedMusic: "Lo-fi acústico",
          forbiddenSounds: [],
        },
        environment_prompt: preset.fluxPrompt,
        lighting_prompt: preset.lighting || "Warm golden hour natural window light",
        camera_prompt: "Static top-down overhead view",
        continuity_prompt: "Preserve exact same scene and objects",
        negative_prompt: "camera movement, deformed objects, floating items, artificial studio lighting",
        compatible_formats: ["UGC", "UNBOXING", "FASHION", "FLAT LAY"],
        compatible_categories: ["Moda", "Beleza", "Casa", "Acessórios"],
        tags: ["flux", "cenario real", preset.category, "gemini_vision"],
      });
      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenarios"] });
      toast.success("Cenário salvo no Banco de Dados com sucesso!");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyPrompt = (prompt: string, id: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    toast.success("Prompt copiado para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scenarios = (scenariosQuery.data ?? []).filter((s) => {
    const matchesSearch = `${s.name} ${s.description} ${s.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <Badge className="border-cyan-500/30 bg-cyan-500/10 text-cyan-400 font-bold px-3 py-1 text-xs">
            <Building2 className="mr-1.5 size-3.5" /> Cenários Hiper-realistas & Compositor Gemini Vision
          </Badge>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-4xl text-[#F7F7FB]">
            Biblioteca de Cenários & Compositor de Roupas
          </h1>
          <p className="text-xs leading-relaxed text-[#A3A6B3] md:text-sm">
            Reutilize fotos de cenários reais do seu computador: o <strong>Gemini Vision</strong> analisa o ambiente, remove objetos indesejados e gera o prompt exato para inserir qualquer roupa no mesmo cenário mantendo 100% de consistência.
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-xs font-medium">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-cyan-300">
              <Sparkles className="size-3.5 text-cyan-400" /> Compositor Inteligente (Cenário + Roupa)
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-amber-300">
              <Scissors className="size-3.5 text-amber-400" /> Extração de Cenário Vazio Limpo
            </span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.03] px-2.5 py-1 border border-white/[0.06] text-[#9B7CFF]">
              <Layers className="size-3.5 text-[#9B7CFF]" /> Multi-Reference Flux & Midjourney
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("composer")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "composer"
              ? "bg-[#9B7CFF] text-black shadow-md shadow-[#9B7CFF]/20"
              : "bg-[#11131E] border border-white/[0.08] text-[#A3A6B3] hover:text-white"
          }`}
        >
          <Sparkles className="size-3.5" /> 🎨 Compositor: Cenário + Roupa (Gemini Vision)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("library")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "library"
              ? "bg-cyan-400 text-black shadow-md shadow-cyan-400/20"
              : "bg-[#11131E] border border-white/[0.08] text-[#A3A6B3] hover:text-white"
          }`}
        >
          <Building2 className="size-3.5" /> 📚 Meus Cenários & Presets Salvos
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flux_builder")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition shrink-0 ${
            activeTab === "flux_builder"
              ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
              : "bg-[#11131E] border border-white/[0.08] text-[#A3A6B3] hover:text-white"
          }`}
        >
          <Wand2 className="size-3.5" /> ⚡ Criador Manual Flux
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB 1: COMPOSITOR CENÁRIO + ROUPA (GEMINI VISION)
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "composer" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          {/* Left Column: Upload & Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Box 1: Scenario Image */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-cyan-500/15 text-cyan-300 border-cyan-500/25 text-[10px] font-bold">
                    Passo 1
                  </Badge>
                  <h2 className="text-xs font-bold text-[#F7F7FB]">Foto do Cenário de Referência</h2>
                </div>
                {scenarioImageBase64 && (
                  <button
                    type="button"
                    onClick={() => setScenarioImageBase64(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Trocar Foto
                  </button>
                )}
              </div>

              <p className="text-[11px] text-[#A3A6B3] leading-relaxed">
                Envie a foto do seu cenário do PC (ex: tapete felpudo, chão de madeira, mesa de mármore). Mesmo que tenha alguma roupa ou objeto em cima, o Gemini vai extrair apenas o ambiente de fundo.
              </p>

              <input
                type="file"
                ref={scenarioFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "scenario");
                }}
              />

              {scenarioImageBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-cyan-500/30 group max-h-48 bg-black">
                  <img
                    src={scenarioImageBase64}
                    alt="Cenário de Referência"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/80 text-white border-white/20 text-xs h-8"
                      onClick={() => scenarioFileInputRef.current?.click()}
                    >
                      Alterar Foto
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => scenarioFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-white/15 hover:border-cyan-400/50 bg-[#11131E]/60 p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5"
                >
                  <div className="size-10 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Clique para fazer upload da foto do Cenário</span>
                    <span className="text-[10px] text-[#666A78]">PNG, JPG ou WEBP (Qualquer foto sua de cenário)</span>
                  </div>
                </div>
              )}

              {/* Or Select from Saved Presets */}
              {scenarios.length > 0 && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                  <span className="text-[10px] text-[#666A78] block">Ou selecione um cenário salvo:</span>
                  <select
                    className="w-full h-8 text-xs bg-[#11131E] border border-white/[0.08] rounded-lg px-2.5 text-white"
                    onChange={(e) => {
                      const selected = scenarios.find((s) => s.id === e.target.value);
                      if (selected) {
                        toast.info(`Cenário "${selected.name}" selecionado!`);
                        setClothingDescription((prev) => prev || `Cenário de base: ${selected.name}`);
                      }
                    }}
                  >
                    <option value="">Selecione um cenário da sua biblioteca...</option>
                    {scenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Box 2: Clothing / Product Image */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-pink-500/15 text-pink-300 border-pink-500/25 text-[10px] font-bold">
                    Passo 2
                  </Badge>
                  <h2 className="text-xs font-bold text-[#F7F7FB]">Foto da Roupa / Produto (Opcional se for extrair só cenário)</h2>
                </div>
                {clothingImageBase64 && (
                  <button
                    type="button"
                    onClick={() => setClothingImageBase64(null)}
                    className="text-[10px] text-red-400 hover:underline"
                  >
                    Remover
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={clothingFileInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, "clothing");
                }}
              />

              {clothingImageBase64 ? (
                <div className="relative rounded-xl overflow-hidden border border-pink-500/30 group max-h-48 bg-black">
                  <img
                    src={clothingImageBase64}
                    alt="Foto da Roupa"
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="bg-black/80 text-white border-white/20 text-xs h-8"
                      onClick={() => clothingFileInputRef.current?.click()}
                    >
                      Alterar Roupa
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => clothingFileInputRef.current?.click()}
                  className="rounded-xl border-2 border-dashed border-white/15 hover:border-pink-400/50 bg-[#11131E]/60 p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2"
                >
                  <div className="size-9 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center">
                    <Shirt className="size-4.5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Upload da Foto da Roupa / Vestido</span>
                    <span className="text-[10px] text-[#666A78]">A IA vai extrair tecido, cor e modelo para inserir no cenário</span>
                  </div>
                </div>
              )}

              {/* Placement Style Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-[#A3A6B3]">Estilo de Disposição da Peça:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "flat_lay_carpet", label: "🛏️ Flat Lay no Tapete / Chão" },
                    { id: "folded_aesthetic", label: "🧺 Dobrada Estilo Pinterest" },
                    { id: "wooden_hanger", label: "🪵 Em Cabide de Madeira Chic" },
                    { id: "bed_drape", label: "🛋️ Estendida na Cama / Sofá" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setPlacementStyle(style.id as typeof placementStyle)}
                      className={`p-2 rounded-xl text-left font-medium border text-[11px] transition ${
                        placementStyle === style.id
                          ? "bg-[#9B7CFF]/15 border-[#9B7CFF] text-white font-bold"
                          : "bg-[#11131E] border-white/[0.08] text-[#A3A6B3] hover:text-white"
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Text Details */}
              <div className="space-y-1">
                <label className="text-xs text-[#A3A6B3]">Detalhes Adicionais da Roupa (Opcional):</label>
                <Input
                  value={clothingDescription}
                  onChange={(e) => setClothingDescription(e.target.value)}
                  placeholder="Ex: Vestido midi canelado verde menta com fenda lateral"
                  className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                disabled={composerMutation.isPending || !scenarioImageBase64}
                onClick={() => composerMutation.mutate("compose_clothing_in_scenario")}
                className="h-11 text-xs font-bold bg-[#9B7CFF] hover:bg-[#AA92FF] text-[#07080D] shadow-lg shadow-[#9B7CFF]/20 gap-2"
              >
                {composerMutation.isPending ? <RefreshCw className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                Compor Roupa no Cenário
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={composerMutation.isPending || !scenarioImageBase64}
                onClick={() => composerMutation.mutate("extract_clean_scenario")}
                className="h-11 text-xs font-bold border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 gap-2"
              >
                {composerMutation.isPending ? <RefreshCw className="size-4 animate-spin" /> : <Scissors className="size-4" />}
                Extrair Cenário Limpo (Vazio)
              </Button>
            </div>
          </div>

          {/* Right Column: AI Output & Generated Prompts (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {composerResult ? (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-6 shadow-xl space-y-5">
                {/* Result Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/25 text-[10px] font-bold">
                        <CheckCircle2 className="size-3 mr-1" />
                        {composerResult.mode === "extract_clean_scenario" ? "Cenário Vazio Extraído" : "Composição de Roupa Gerada"}
                      </Badge>
                      <span className="text-[11px] font-mono text-[#666A78]">Gemini Vision + Flux 1.1</span>
                    </div>
                    <h2 className="text-base font-bold text-[#F7F7FB]">{composerResult.scenarioName}</h2>
                  </div>

                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-md shadow-cyan-400/15 gap-1.5"
                    onClick={() => {
                      saveFluxScenarioMutation.mutate({
                        name: composerResult.scenarioName,
                        description: `Superfície: ${composerResult.surfaceType} | Luz: ${composerResult.lightingSetup}`,
                        fluxPrompt: composerResult.fluxPrompt,
                        category: "custom_extracted",
                        surface: composerResult.surfaceType,
                        lighting: composerResult.lightingSetup,
                      });
                    }}
                  >
                    <Save className="size-3.5" /> Salvar Cenário
                  </Button>
                </div>

                {/* Detected DNA Breakdown Badges */}
                <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl border border-white/[0.06] bg-[#11131E] p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <Sun className="size-3" /> Iluminação Detectada:
                    </span>
                    <p className="text-xs text-[#F7F7FB]">{composerResult.lightingSetup}</p>
                  </div>

                  <div className="rounded-xl border border-white/[0.06] bg-[#11131E] p-3 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      <Layers className="size-3" /> Superfície / Chão:
                    </span>
                    <p className="text-xs text-[#F7F7FB]">{composerResult.surfaceType}</p>
                  </div>

                  {composerResult.detectedGarment && (
                    <div className="rounded-xl border border-white/[0.06] bg-[#11131E] p-3 space-y-1 sm:col-span-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1">
                        <Shirt className="size-3" /> Roupa Identificada:
                      </span>
                      <p className="text-xs text-[#F7F7FB]">
                        <strong>{composerResult.detectedGarment.type}</strong> — Cor: {composerResult.detectedGarment.color} | Tecido: {composerResult.detectedGarment.fabric} ({composerResult.detectedGarment.details})
                      </p>
                    </div>
                  )}
                </div>

                {/* Prompt Block 1: Multi-Reference Prompt (Flux / Midjourney) */}
                {composerResult.multiImagePrompt && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#9B7CFF] flex items-center gap-1">
                        <Sparkles className="size-3" /> Prompt Multi-Referência (Flux Image-to-Image / Midjourney):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(composerResult.multiImagePrompt!, "multi-ref")}
                        className="text-[10px] text-[#A3A6B3] hover:text-white flex items-center gap-1 font-medium transition"
                      >
                        {copiedId === "multi-ref" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {copiedId === "multi-ref" ? "Copiado!" : "Copiar Multi-Ref"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-[#9B7CFF]/20 bg-[#9B7CFF]/[0.03] p-3 text-xs leading-relaxed text-[#F7F7FB] font-mono whitespace-pre-wrap">
                      {composerResult.multiImagePrompt}
                    </div>
                  </div>
                )}

                {/* Prompt Block 2: Full Single Text Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                      <Camera className="size-3" /> Prompt Completo em Inglês (Texto Único):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(composerResult.fluxPrompt, "single-prompt")}
                      className="text-[10px] text-[#A3A6B3] hover:text-white flex items-center gap-1 font-medium transition"
                    >
                      {copiedId === "single-prompt" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      {copiedId === "single-prompt" ? "Copiado!" : "Copiar Prompt"}
                    </button>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-black/60 p-3 text-xs leading-relaxed text-[#A3A6B3] font-mono whitespace-pre-wrap">
                    {composerResult.fluxPrompt}
                  </div>
                </div>

                {/* Prompt Block 3: Negative Prompt */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                      🚫 Prompt Negativo (Tela Limpa & Sem Artefatos):
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyPrompt(composerResult.negativePrompt, "neg-prompt")}
                      className="text-[10px] text-[#A3A6B3] hover:text-white flex items-center gap-1 font-medium transition"
                    >
                      {copiedId === "neg-prompt" ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      {copiedId === "neg-prompt" ? "Copiado!" : "Copiar Negativo"}
                    </button>
                  </div>
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-2.5 text-[11px] text-amber-200 font-mono">
                    {composerResult.negativePrompt}
                  </div>
                </div>

                {/* Placement Tips */}
                {composerResult.placementTips.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-[#11131E] p-3 space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#A3A6B3] flex items-center gap-1">
                      <HelpCircle className="size-3 text-cyan-400" /> Dicas de Iluminação & Dobra de Tecido:
                    </span>
                    <ul className="text-xs text-[#A3A6B3] list-disc list-inside space-y-0.5">
                      {composerResult.placementTips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.08] bg-[#0E1017] p-8 text-center space-y-3 flex flex-col items-center justify-center min-h-[400px]">
                <div className="size-14 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Sparkles className="size-7 animate-pulse" />
                </div>
                <h3 className="text-sm font-bold text-white">Nenhum cenário analisado ainda</h3>
                <p className="text-xs text-[#A3A6B3] max-w-md leading-relaxed">
                  Faça o upload da foto do seu cenário e da roupa ao lado e clique em <strong>Compor Roupa</strong> ou <strong>Extrair Cenário Limpo</strong> para o Gemini Vision gerar os prompts perfeitos.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 2: LIBRARY & PRESETS
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "library" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="size-4 text-amber-400" /> Cenários Fotográficos de Alta Conversão (Flux & Midjourney)
            </h2>
            <span className="text-xs text-slate-400">Modelos profissionais pré-calibrados</span>
          </div>

          {/* Grid of Ready Flux Presets */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {FLUX_SCENARIO_PRESETS.map((preset) => (
              <article
                key={preset.id}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#0e1017] p-5 shadow-xl hover:border-cyan-400/40 hover:bg-white/[0.02] transition-all"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                      {preset.categoryLabel}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-500">Flux 1.1 / Midjourney</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {preset.name}
                  </h3>

                  <p className="text-xs leading-relaxed text-slate-400">
                    {preset.description}
                  </p>

                  <div className="rounded-xl border border-white/5 bg-black/40 p-3 space-y-1.5 text-[11px] text-slate-400">
                    <p><strong className="text-slate-300">Iluminação:</strong> {preset.lighting}</p>
                    <p><strong className="text-slate-300">Superfície:</strong> {preset.surface}</p>
                    <p><strong className="text-slate-300">Decoração:</strong> {preset.decor}</p>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Sparkles className="size-3" /> Prompt Flux em Inglês:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(preset.fluxPrompt, preset.id)}
                        className="text-[10px] text-slate-400 hover:text-amber-300 flex items-center gap-1 font-medium transition"
                      >
                        {copiedId === preset.id ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                        {copiedId === preset.id ? "Copiado!" : "Copiar"}
                      </button>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-black/50 p-2.5 text-[11px] leading-relaxed text-slate-400 font-mono line-clamp-3">
                      {preset.fluxPrompt}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-white/5 flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs font-semibold flex-1 border-white/10 bg-white/[0.02] hover:bg-white/[0.08]"
                    onClick={() => handleCopyPrompt(preset.fluxPrompt, preset.id)}
                  >
                    <Copy className="size-3.5 mr-1" /> Copiar Prompt
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 text-xs font-bold bg-cyan-400 text-black flex-1 shadow"
                    onClick={() => saveFluxScenarioMutation.mutate(preset)}
                  >
                    <Plus className="size-3.5 mr-1" /> Salvar no Banco
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* User's custom saved scenarios */}
          {scenarios.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Cenários Salvos no seu Banco de Dados ({scenarios.length})
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                {scenarios.map((sc) => (
                  <div key={sc.id} className="rounded-xl border border-white/10 bg-[#0e1017] p-4 space-y-2">
                    <span className="text-xs font-bold text-white block">{sc.name}</span>
                    <p className="text-[11px] text-[#A3A6B3] line-clamp-2">{sc.description}</p>
                    <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                      <Badge className="text-[10px] bg-cyan-500/10 text-cyan-300 border-cyan-500/20">{sc.category}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs text-cyan-400 hover:text-white"
                        onClick={() => handleCopyPrompt(sc.environmentPrompt || "", `saved-${sc.id}`)}
                      >
                        {copiedId === `saved-${sc.id}` ? "Copiado!" : "Copiar Prompt"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          TAB 3: MANUAL FLUX BUILDER
      ───────────────────────────────────────────────────────────── */}
      {activeTab === "flux_builder" && (
        <div className="grid gap-6 lg:grid-cols-12 items-start">
          <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Wand2 className="size-4 text-cyan-400" /> Configurar Cenário Manual
            </h2>

            <div className="space-y-1">
              <label className="text-xs text-[#A3A6B3]">Tipo de Ambiente:</label>
              <Input
                value={customRoom}
                onChange={(e) => setCustomRoom(e.target.value)}
                className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A3A6B3]">Iluminação:</label>
              <Input
                value={customLighting}
                onChange={(e) => setCustomLighting(e.target.value)}
                className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A3A6B3]">Superfície / Chão:</label>
              <Input
                value={customSurface}
                onChange={(e) => setCustomSurface(e.target.value)}
                className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-[#A3A6B3]">Elementos Decorativos:</label>
              <Input
                value={customDecor}
                onChange={(e) => setCustomDecor(e.target.value)}
                className="h-8.5 text-xs bg-[#11131E] border-white/[0.08] text-white"
              />
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl border border-white/[0.08] bg-[#0E1017] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" /> Prompt Gerado para o Flux 1.1
              </h2>
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-[#9B7CFF] text-black"
                onClick={() => handleCopyPrompt(generatedFluxPrompt, "manual-flux")}
              >
                {copiedId === "manual-flux" ? "Copiado!" : "Copiar Prompt"}
              </Button>
            </div>

            <div className="rounded-xl border border-white/[0.06] bg-black/60 p-4 text-xs leading-relaxed text-[#A3A6B3] font-mono whitespace-pre-wrap">
              {generatedFluxPrompt}
            </div>

            <Button
              size="lg"
              className="w-full h-10 text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow"
              onClick={() => {
                saveFluxScenarioMutation.mutate({
                  name: customRoom,
                  description: `Superfície: ${customSurface} | Iluminação: ${customLighting}`,
                  fluxPrompt: generatedFluxPrompt,
                  category: "custom_manual",
                  surface: customSurface,
                  lighting: customLighting,
                });
              }}
            >
              <Save className="size-4 mr-2" /> Salvar Cenário no Banco de Dados
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
