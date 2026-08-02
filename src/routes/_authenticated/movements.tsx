import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  ClipboardCopy,
  Code2,
  Camera,
  ArrowRight,
  Loader2,
  Plus,
  Search,
  Sparkles,
  Trash2,
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

export const Route = createFileRoute("/_authenticated/movements")({
  component: MovementsPage,
  head: () => ({ meta: [{ title: "Poses e movimentos — Tik Supremo" }] }),
});

const categoryLabels: Record<MovementPreset["category"], string> = {
  fashion: "Moda",
  product_demo: "Demonstração",
  ugc: "UGC",
  pov: "POV",
  cta: "CTA",
};

function movementActions(movement: MovementPreset) {
  const json = movement.movement_json as Record<string, unknown>;
  const sequence = json["action_sequence"];
  if (Array.isArray(sequence)) {
    return sequence.slice(0, 3).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action = typeof item["action"] === "string" ? item["action"] : "";
      const time = typeof item["time"] === "string" ? item["time"] : "";
      return action ? [{ action, time }] : [];
    });
  }
  const legacy = json["sequence"];
  return Array.isArray(legacy)
    ? legacy.slice(0, 3).map((action, index) => ({ action: String(action), time: `${index + 1}` }))
    : [];
}

function movementCamera(movement: MovementPreset) {
  const camera = (movement.movement_json as Record<string, unknown>)["camera"];
  if (typeof camera === "string") return camera;
  if (!camera || Array.isArray(camera) || typeof camera !== "object") return "Câmera natural";
  const detail = camera as Record<string, unknown>;
  return [detail["framing"], detail["movement"], detail["focus"]]
    .filter((value): value is string => typeof value === "string")
    .join(" · ");
}

const defaultMovementJson = JSON.stringify(
  {
    version: "2.0",
    format: "UGC",
    duration_seconds: 8,
    aspect_ratio: "9:16",
    creative_goal: "",
    start_pose: {
      body_position: "",
      gaze: "camera",
      expression: "natural",
      product_position: "",
    },
    timing: {
      frame_0_2s: "visual setup and immediate hook",
      frame_2_6s: "main movement with natural timing",
      frame_6_8s: "controlled ending ready for continuity",
    },
    action_sequence: [
      { time: "0-2s", action: "" },
      { time: "2-6s", action: "" },
      { time: "6-8s", action: "" },
    ],
    biomechanics: {
      anatomy: "natural adult human anatomy",
      breathing: "subtle natural breathing",
      weight_transfer: "physically plausible",
      hands: "anatomically correct fingers and natural grip",
      micro_expressions: "spontaneous and restrained",
    },
    product_interaction: {
      hand: "right",
      container_closed: true,
      label_visible: true,
      allow_rotation: false,
      allow_camera_approach: false,
    },
    camera: {
      type: "handheld_smartphone",
      framing: "medium_shot",
      movement: "static_with_natural_micro_movement",
      lens: "24mm smartphone equivalent",
      focus: "face_and_product",
      focus_shift: "none",
      zoom: "none",
      shake: "subtle human micro vibration only",
    },
    identity_lock: {
      face: "preserve exactly",
      hair: "preserve style color and length",
      body: "preserve proportions and skin tone",
      clothing: "preserve color print texture and accessories",
    },
    product_lock: {
      shape: "preserve exactly",
      packaging: "preserve color label text and proportions",
      duplication: false,
    },
    environment: {
      setting: "preserve reference environment",
      lighting: "preserve direction intensity and color temperature",
      background_changes: false,
    },
    dialogue: {
      enabled: true,
      language: "pt-BR",
      lip_sync: "natural",
      delivery: "conversational",
    },
    continuity: {
      start_from_previous_frame: true,
      same_character: true,
      same_product: true,
      same_environment: true,
      same_camera_axis: true,
    },
    ending: {
      pose: "",
      gaze: "camera",
      continuity_ready: true,
    },
    quality: {
      render: "photorealistic 4K HDR",
      motion: "smooth natural real-time motion",
      fabric_physics: "realistic folds drape and inertia",
      hair_physics: "realistic gravity and secondary motion",
    },
    negative_prompt: [
      "robotic movement",
      "abrupt acceleration",
      "deformed hands",
      "extra fingers",
      "identity change",
      "face morphing",
      "product deformation",
      "label mutation",
      "floating objects",
      "jump cuts",
      "digital transitions",
      "text",
      "subtitles",
      "watermark",
      "AI artifacts",
    ],
  },
  null,
  2,
);

function MovementsPage() {
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [customCategory, setCustomCategory] = useState<MovementPreset["category"]>("ugc");
  const [formats, setFormats] = useState("UGC");
  const [description, setDescription] = useState("");
  const [instruction, setInstruction] = useState("");
  const [movementJson, setMovementJson] = useState(defaultMovementJson);
  const [tags, setTags] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
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
  const movements = (query.data ?? []).filter((item) => {
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
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="bento-hero flex flex-col gap-5 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Direção criativa reutilizável
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Poses e movimentos em JSON</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Escolha movimentos prontos para moda, demonstração, UGC, POV e CTA ou salve seus
            próprios padrões. Cada card já entrega uma estrutura JSON pronta para o gerador.
          </p>
        </div>
        <Button variant="hero" onClick={() => setShowForm((value) => !value)}>
          <Plus />
          Novo movimento
        </Button>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-primary">{query.data?.length ?? 0}</p>
          <p className="mt-1 text-xs text-muted-foreground">movimentos reutilizáveis</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-cyan">
            {(query.data ?? []).filter((item) => item.category === "fashion").length}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">direções para mostrar roupas</p>
        </div>
        <div className="bento-card p-4">
          <p className="text-2xl font-semibold text-emerald-300">3 passos</p>
          <p className="mt-1 text-xs text-muted-foreground">visualizados antes de copiar o JSON</p>
        </div>
      </section>

      {showForm && (
        <section className="bento-card bento-card-accent space-y-5 p-5 md:p-7">
          <div>
            <h2 className="font-semibold">Criar movimento personalizado</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              A instrução será inserida diretamente no JSON do VEO.
            </p>
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar movimento..."
            className="pl-10"
          />
        </div>
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

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {movements.map((movement) => (
            <article key={movement.id} className="bento-card interactive-card space-y-4 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Camera className="size-5" />
                </span>
                <div className="flex gap-2">
                  <Badge variant="outline">{categoryLabels[movement.category]}</Badge>
                  <Badge className="bg-secondary text-muted-foreground">
                    {movement.user_id ? "Seu" : "Padrão"}
                  </Badge>
                </div>
              </div>
              <div>
                <h2 className="font-semibold">{movement.name}</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {movement.description}
                </p>
              </div>
              {movementActions(movement).length > 0 && (
                <div className="rounded-xl border border-border bg-secondary/20 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sequência visual
                  </p>
                  <div className="mt-3 space-y-2">
                    {movementActions(movement).map((step, index) => (
                      <div key={`${step.time}-${index}`} className="flex items-center gap-2">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                          {index + 1}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/85">
                          {step.action}
                        </span>
                        {index < movementActions(movement).length - 1 && (
                          <ArrowRight className="size-3 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="mt-3 border-t border-border pt-2 text-[10px] text-cyan">
                    <Camera className="mr-1 inline size-3" /> {movementCamera(movement)}
                  </p>
                </div>
              )}
              <details className="space-y-2 rounded-xl border border-border bg-[#09090b] p-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-cyan">
                    <Code2 className="size-3" /> Ver JSON completo
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2 text-[11px]"
                    onClick={(event) => {
                      event.preventDefault();
                      void copyMovementJson(movement);
                    }}
                  >
                    {copiedId === movement.id ? <Check /> : <ClipboardCopy />}
                    {copiedId === movement.id ? "Copiado" : "Copiar JSON"}
                  </Button>
                </summary>
                <pre className="max-h-52 overflow-auto whitespace-pre-wrap font-mono text-[11px] leading-5 text-slate-300">
                  {JSON.stringify(movement.movement_json, null, 2)}
                </pre>
              </details>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {movement.formats.map((format) => (
                    <Badge key={format} variant="outline">
                      {format}
                    </Badge>
                  ))}
                </div>
                {movement.user_id && (
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Remover ${movement.name}`}
                    disabled={removeMutation.isPending}
                    onClick={() => removeMutation.mutate(movement.id)}
                  >
                    <Trash2 />
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
