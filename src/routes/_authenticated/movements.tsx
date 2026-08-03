import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardCopy,
  Code2,
  Camera,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { listMovementLibrary } from "@/features/libraries/queries";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MovementPreset } from "@/lib/supabase/types";

import {
  BUILTIN_MOVEMENT_PRESETS,
  PRESET_VIDEO_MAP,
  TWO_CLOTHES_ON_RUG_PRESET,
  POV_SELFIE_TRYON_PRESET,
  POV_SOFTNESS_PRESET,
  POV_TEXTURE_PRESET,
  POV_CHOOSING_PRESET,
  POV_ELASTICITY_PRESET,
  POV_REVEALING_PRESET,
  POV_FOLDING_PRESET,
  PASSANDO_A_MAO_PRESET,
  FLAT_LAY_CLOTHING_PRESET,
  MULTICOLOR_CROCHET_PRESET,
  DUAL_SET_ELASTICITY_PRESET,
  TREADMILL_MANNEQUIN_PRESET,
} from "@/features/movements/movement-presets";
import { MovementVideoCard } from "@/features/movements/MovementVideoCard";

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

  // Favorites state backed by localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("tik_favorite_movements");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      toast.success("Movimento salvo.");
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
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = `${item.name} ${item.description} ${item.tags.join(" ")}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const copyMovementJson = async (movement: MovementPreset) => {
    await navigator.clipboard.writeText(JSON.stringify(movement.movement_json, null, 2));
    setCopiedId(movement.id);
    toast.success("JSON do movimento copiado.");
    setTimeout(() => setCopiedId(null), 1_800);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-12">
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Direção criativa reutilizável
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Poses e movimentos em JSON</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Vitrine padronizada com vídeo interativo, título e cópia direta do JSON para seu gerador.
          </p>
        </div>
        <Button variant="hero" onClick={() => setShowForm((value) => !value)}>
          <Plus />
          Novo movimento
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-primary">{combinedList.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">movimentos reutilizáveis</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-amber-400 flex items-center gap-1.5">
            <Star className="size-5 fill-amber-400" />
            {favorites.length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">prompts favoritados</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-emerald-300">Vitrine 100% Padronizada</p>
          <p className="mt-1 text-xs text-muted-foreground">cards de mesmo tamanho com cópia em 1 clique</p>
        </div>
      </section>

      {showForm && (
        <section className="bento-card bento-card-accent space-y-5 p-5 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">Criar movimento personalizado</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                A instrução será inserida diretamente no JSON do VEO.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_SELFIE_TRYON_PRESET, "POV Selfie Try-On")}
              >
                <Sparkles className="size-3.5 text-indigo-400" /> POV Selfie Try-On (15s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_SOFTNESS_PRESET, "POV Maciez")}
              >
                <Sparkles className="size-3.5 text-rose-400" /> POV Maciez & Compressão (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_TEXTURE_PRESET, "POV Textura")}
              >
                <Sparkles className="size-3.5 text-cyan-400" /> POV Textura (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_CHOOSING_PRESET, "POV Escolhendo")}
              >
                <Sparkles className="size-3.5 text-purple-400" /> POV Escolhendo (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_ELASTICITY_PRESET, "POV Elasticidade")}
              >
                <Sparkles className="size-3.5 text-emerald-400" /> POV Elasticidade (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_REVEALING_PRESET, "POV Revelando")}
              >
                <Sparkles className="size-3.5 text-blue-400" /> POV Revelando (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(POV_FOLDING_PRESET, "POV Dobra")}
              >
                <Sparkles className="size-3.5 text-yellow-400" /> POV Dobra (8s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(TWO_CLOTHES_ON_RUG_PRESET, "Roupas no Tapete")}
              >
                <Sparkles className="size-3.5 text-amber-400" /> Roupas no Tapete (12s)
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => loadPresetIntoForm(PASSANDO_A_MAO_PRESET, "Mãos Deslizando")}
              >
                <Sparkles className="size-3.5 text-pink-400" /> Mãos Deslizando (15s)
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={loadDefaultUgcTemplate}>
                Limpar editor
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(event) => setName(event.target.value)} />
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
              <Label>Formatos</Label>
              <Input
                value={formats}
                onChange={(event) => setFormats(event.target.value)}
                placeholder="UGC, POV"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Descrição curta</Label>
              <Input value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Instrução detalhada do movimento</Label>
              <Textarea
                rows={5}
                value={instruction}
                onChange={(event) => setInstruction(event.target.value)}
                placeholder="Descreva início, movimento, interação com o produto, câmera e encerramento."
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <div className="flex items-center justify-between gap-2">
                <Label>JSON do movimento</Label>
                <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                  <Code2 className="size-3" /> Obrigatório e validado antes de salvar
                </span>
              </div>
              <Textarea
                rows={18}
                value={movementJson}
                onChange={(event) => setMovementJson(event.target.value)}
                className="font-mono text-xs leading-5"
                spellCheck={false}
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Tags separadas por vírgula</Label>
              <Input value={tags} onChange={(event) => setTags(event.target.value)} />
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar movimento por nome, tag ou descrição..."
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={onlyFavorites ? "secondary" : "outline"}
            className={onlyFavorites ? "border-amber-400/50 text-amber-400 bg-amber-500/10" : ""}
            onClick={() => setOnlyFavorites((prev) => !prev)}
          >
            <Star className={`size-4 mr-1.5 ${onlyFavorites ? "fill-amber-400 text-amber-400" : ""}`} />
            Favoritos ({favorites.length})
          </Button>

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
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

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movements.map((movement) => {
            const isFav = favorites.includes(movement.id);
            const videoUrl = PRESET_VIDEO_MAP[movement.id];

            return (
              <article
                key={movement.id}
                className="bento-card interactive-card flex flex-col justify-between overflow-hidden p-3 h-full space-y-3"
              >
                {/* Unified Video or Video-like Media Area */}
                {videoUrl ? (
                  <MovementVideoCard
                    videoUrl={videoUrl}
                    isFavorite={isFav}
                    onToggleFavorite={() => toggleFavorite(movement.id)}
                  />
                ) : (
                  <div className="relative aspect-[9/16] w-full overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-secondary/40 to-slate-900 border border-border/40 p-4 flex flex-col justify-between group">
                    <div className="flex items-center justify-between">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Camera className="size-4" />
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
                      <p className="text-[10px] text-muted-foreground">JSON de Direção de Cena</p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-white/5 pt-2">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {movement.formats[0] || "PROMPT VEO"}
                      </Badge>
                      <span className="font-mono text-[9px]">Padrão</span>
                    </div>
                  </div>
                )}

                {/* Title area with uniform height */}
                <div className="px-1 flex-1 flex flex-col justify-center min-h-[3rem]">
                  <h2 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground" title={movement.name}>
                    {movement.name}
                  </h2>
                </div>

                {/* Action Buttons: Copy JSON + Delete (if user custom) */}
                <div className="flex items-center gap-2 pt-1 border-t border-border/50">
                  <Button
                    size="sm"
                    variant="hero"
                    className="w-full h-8 text-xs font-medium gap-1.5"
                    onClick={() => void copyMovementJson(movement)}
                  >
                    {copiedId === movement.id ? (
                      <>
                        <Check className="size-3.5" /> Copiado!
                      </>
                    ) : (
                      <>
                        <ClipboardCopy className="size-3.5" /> Copiar JSON
                      </>
                    )}
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
    </div>
  );
}
