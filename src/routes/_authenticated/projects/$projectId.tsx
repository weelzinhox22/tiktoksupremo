import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Copy,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Film,
  Package,
  FileText,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Layers,
  Clock,
  Volume2,
  Share2,
  CheckCircle2,
  ShieldAlert,
  Zap,
  Target,
  BarChart3,
  Video,
  Lightbulb,
  MessageSquareText,
  Hash,
  ChevronRight,
  Play,
  Smartphone,
  Eye,
  Terminal,
  ChevronLeft,
  Wand2,
  PencilLine,
  UserRound,
  Save,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getProject } from "@/features/projects/queries";
import { listGenerationPerformance } from "@/features/libraries/queries";
import { importTikTokPerformance } from "@/features/performance/server";
import { generateProjectScript } from "@/features/script-generation/server";
import { reviseScenePrompt } from "@/features/validated-copies/server";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { ScriptScene } from "@/lib/supabase/types";

type ModularScene = { spoken_text: string; veo_prompt: string };
type ModularModule = { title: string; strategy: string; scenes: ModularScene[] };
type ProjectGenerationResult = {
  hook?: string;
  development?: string;
  cta?: string;
  target_audience?: string;
  sales_angle?: string;
  product_diagnosis?: { overall_score?: number; score_explanation?: string };
  strategy?: {
    name?: string;
    rationale?: string;
    strongest_benefits?: string[];
    objections_to_answer?: string[];
  };
  modular_variations?: {
    format?: string;
    total_combinations?: number;
    hook_modules?: ModularModule[];
    body_modules?: ModularModule[];
    cta_modules?: ModularModule[];
    combinations?: Array<{
      number: number;
      label: string;
      hook_index: number;
      body_index: number;
      cta_index: number;
      diversity_score?: number;
      performance_score?: number;
      recommended_rank?: number;
      recommended?: boolean;
      difference_summary?: string;
    }>;
    recommended_count?: number;
  };
};

export const Route = createFileRoute("/_authenticated/projects/$projectId")({
  component: ProjectPage,
  head: () => ({ meta: [{ title: "Estúdio de Roteiro VEO — Tik Supremo" }] }),
});

const sceneTypeLabels: Record<number, { title: string; subtitle: string; color: string }> = {
  1: {
    title: "CENA 1 — GANCHO",
    subtitle: "Atenção imediata nos primeiros 2s, curiosidade ou dor real",
    color: "from-pink-500 to-rose-500",
  },
  2: {
    title: "CENA 2 — BENEFÍCIO PRINCIPAL",
    subtitle: "Por que é diferente, benefício mais desejado e quebra de objeção",
    color: "from-purple-500 to-indigo-500",
  },
  3: {
    title: "CENA 3 — BENEFÍCIOS COMPLEMENTARES",
    subtitle: "Versatilidade, conforto, transformação e ocasiões de uso",
    color: "from-cyan-500 to-blue-500",
  },
  4: {
    title: "CENA 4 — URGÊNCIA E PERDA",
    subtitle: "O que a pessoa perde se deixar para depois (estoque, preço, tamanho)",
    color: "from-amber-500 to-orange-500",
  },
  5: {
    title: "CENA 5 — CTA",
    subtitle: "Chamada para ação amigável (link, tamanho, preço no TikTok Shop)",
    color: "from-emerald-500 to-teal-500",
  },
};

function ProjectPage() {
  const { projectId } = Route.useParams();
  const { user } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId),
  });

  const mutation = useMutation({
    mutationFn: () => generateProjectScript({ data: { projectId } }),
    onSuccess: async () => {
      toast.success("Nova versão do roteiro gerada!");
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (e) => toast.error(e.message),
  });

  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(1); // Guided Flow: 1=Diagnóstico, 2=Cenas VEO, 3=Roteiro Corrido, 4=TikTok Kit
  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editInstruction, setEditInstruction] = useState("");
  const [performanceLink, setPerformanceLink] = useState("");
  const [performanceForm, setPerformanceForm] = useState({
    combination: "",
    publicationUrl: "",
    publishedAt: new Date().toISOString().slice(0, 10),
    views: "",
    likes: "",
    comments: "",
    shares: "",
    clicks: "",
    orders: "",
    revenue: "",
    notes: "",
  });
  const loadedGenerations = [...(query.data?.script_generations ?? [])].sort(
    (a, b) => b.version - a.version,
  );
  const selectedGenerationForPerformance =
    loadedGenerations.find(
      (generation) => generation.version === (selectedVersion ?? loadedGenerations[0]?.version),
    ) ?? loadedGenerations[0];
  const performanceQuery = useQuery({
    queryKey: ["generation-performance", selectedGenerationForPerformance?.id],
    queryFn: () => listGenerationPerformance(selectedGenerationForPerformance!.id),
    enabled: Boolean(selectedGenerationForPerformance?.id),
  });

  const performanceMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const result = await getSupabaseBrowserClient().from("content_performance").insert(payload);
      if (result.error)
        throw new Error(`Não foi possível salvar o desempenho: ${result.error.message}`);
    },
    onSuccess: async () => {
      toast.success("Desempenho registrado. O ranking foi atualizado.");
      setPerformanceForm((current) => ({
        ...current,
        views: "",
        likes: "",
        comments: "",
        shares: "",
        clicks: "",
        orders: "",
        revenue: "",
        notes: "",
      }));
      await queryClient.invalidateQueries({ queryKey: ["generation-performance"] });
      await queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const automaticPerformanceMutation = useMutation({
    mutationFn: () => {
      if (!selectedGenerationForPerformance?.id) {
        throw new Error("Gere um roteiro antes de analisar o vídeo publicado.");
      }
      if (!performanceLink.trim()) throw new Error("Cole o link público do vídeo no TikTok.");
      return importTikTokPerformance({
        data: {
          projectId,
          generationId: selectedGenerationForPerformance.id,
          url: performanceLink.trim(),
        },
      });
    },
    onSuccess: async (data) => {
      const message = data.publicMetricsAvailable
        ? `${data.views.toLocaleString("pt-BR")} visualizações encontradas.`
        : "Vídeo identificado. O TikTok não liberou as métricas públicas desta vez.";
      toast.success(`Análise salva. ${message}`);
      await queryClient.invalidateQueries({ queryKey: ["generation-performance"] });
      await queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const revisionMutation = useMutation({
    mutationFn: ({ sceneId, instruction }: { sceneId: string; instruction: string }) =>
      reviseScenePrompt({ data: { projectId, sceneId, instruction } }),
    onSuccess: async () => {
      toast.success("Prompt corrigido e salvo.");
      setEditOpen(false);
      setEditInstruction("");
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (e) => toast.error(e.message),
  });

  const variationMutation = useMutation({
    mutationFn: (sceneId: string) =>
      reviseScenePrompt({
        data: {
          projectId,
          sceneId,
          instruction:
            "Crie outra variação criativa desta cena em JSON. Mantenha o produto, o avatar, os fatos confirmados, o formato e a duração de 8 segundos. Mude o texto falado, o movimento principal e a direção de câmera sem repetir a versão atual e sem inventar promessas.",
        },
      }),
    onSuccess: async () => {
      toast.success("Nova variação criada e salva.");
      await queryClient.invalidateQueries({ queryKey: ["project", projectId] });
    },
    onError: (error) => toast.error(error.message),
  });

  const handleCopy = async (text: string, sectionId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionId);
      toast.success("Copiado com sucesso!");
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      toast.error("Erro ao copiar.");
    }
  };

  if (query.isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center p-24 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Carregando estúdio de roteiros...
        </p>
      </div>
    );
  }

  if (query.error || !query.data) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Voltar para projetos
        </Link>
        <div className="glass-card border-destructive/50 p-6 text-destructive">
          <h2 className="font-bold text-lg">Projeto indisponível</h2>
          <p className="mt-1 text-sm">
            {query.error?.message ?? "Não foi possível carregar as informações do projeto."}
          </p>
        </div>
      </div>
    );
  }

  const project = query.data;
  const product = project.products?.[0];
  const generations = loadedGenerations;

  const activeGen =
    generations.find((g) => g.version === (selectedVersion ?? generations[0]?.version)) ??
    generations[0];

  const result = activeGen?.result as ProjectGenerationResult | null | undefined;
  const generationSnapshot = (activeGen as unknown as { input_snapshot?: Record<string, unknown> })
    ?.input_snapshot;
  const activeAvatar = generationSnapshot?.["selected_avatar"] as
    { name?: string; reference_image_available?: boolean } | undefined;
  const scenes = [...(activeGen?.script_scenes ?? [])].sort(
    (a, b) => a.scene_number - b.scene_number,
  );
  const totalDuration = scenes.reduce((sum, s) => sum + (s.duration_seconds || 8), 0);
  const getSceneTypeInfo = (sceneNumber: number) =>
    scenes.length === 4 && sceneNumber === 4
      ? sceneTypeLabels[5]!
      : (sceneTypeLabels[sceneNumber] ?? {
          title: `CENA ${sceneNumber}`,
          color: "from-primary to-cyan",
        });

  // Mantém prompts novos e históricos copiáveis no formato JSON preferido pelo VEO.
  const formatVeoPromptMarkdown = (scene: ScriptScene) => {
    if (scene.veo_prompt) {
      try {
        return JSON.stringify(JSON.parse(scene.veo_prompt), null, 2);
      } catch {
        // Prompts históricos em texto são normalizados abaixo.
      }
    }
    const configuredCharacter =
      (project.settings as Record<string, unknown> | null)?.["character"] ||
      product?.target_audience ||
      "Brazilian creator matching the target audience, natural appearance, casual outfit";
    return JSON.stringify(
      {
        version: "3.1",
        aspect_ratio: "9:16",
        duration_seconds: scene.duration_seconds || 8,
        format: (project.settings as Record<string, unknown> | null)?.["video_format"] || "UGC",
        reference_lock:
          "Preserve the exact character identity, product, clothing, accessories, environment and lighting from the supplied reference images.",
        style: "Hyper-realistic vertical smartphone video, authentic UGC, natural timing.",
        character: scene.character_direction || configuredCharacter,
        environment: scene.setting || "Modern cozy room with natural lighting.",
        product: `${product?.name || "Product"}. Preserve exact visible color, texture, shape, proportions, print and packaging.`,
        camera: scene.camera_direction || "Eye-level smartphone camera, stable medium shot.",
        hands: scene.product_direction || "Natural interaction only.",
        movement: scene.visual_action || "Subtle natural movements during speech.",
        voice:
          "Brazilian Portuguese, matching the configured character and target audience, natural conversational tone.",
        dialogue: scene.spoken_text,
        continuity:
          scene.continuity_rules || "Continue directly from the previous scene when applicable.",
        screen:
          "Completely clean screen. No text, subtitles, captions, stickers, logos, watermarks or overlays.",
        negative_prompt:
          "No identity changes, no product deformation, no extra fingers, no artificial motion, no commercial acting, no overlays, no cuts, no unrequested camera movement.",
      },
      null,
      2,
    );
  };

  const currentScene = scenes[activeSceneIndex] ?? scenes[0];
  const modular = result?.modular_variations;
  const selectedPerformanceCombination = modular?.combinations?.find(
    (combination) => String(combination.number) === performanceForm.combination,
  );
  const submitPerformance = () => {
    if (!activeGen?.id) return;
    const hookIndex = selectedPerformanceCombination?.hook_index ?? null;
    const bodyIndex = selectedPerformanceCombination?.body_index ?? null;
    const ctaIndex = selectedPerformanceCombination?.cta_index ?? null;
    const hookText =
      hookIndex === null
        ? (result?.hook ?? scenes[0]?.spoken_text ?? "")
        : (modular?.hook_modules?.[hookIndex]?.scenes.map((scene) => scene.spoken_text).join(" ") ??
          "");
    const bodyText =
      bodyIndex === null
        ? (result?.development ??
          scenes
            .slice(1, -1)
            .map((scene) => scene.spoken_text)
            .join(" "))
        : (modular?.body_modules?.[bodyIndex]?.scenes.map((scene) => scene.spoken_text).join(" ") ??
          "");
    const ctaText =
      ctaIndex === null
        ? (result?.cta ?? scenes.at(-1)?.spoken_text ?? "")
        : (modular?.cta_modules?.[ctaIndex]?.scenes.map((scene) => scene.spoken_text).join(" ") ??
          "");
    const integer = (value: string) => Math.max(0, Math.round(Number(value) || 0));
    performanceMutation.mutate({
      user_id: user.id,
      project_id: projectId,
      generation_id: activeGen.id,
      combination_number: selectedPerformanceCombination?.number ?? null,
      hook_index: hookIndex,
      body_index: bodyIndex,
      cta_index: ctaIndex,
      hook_text: hookText,
      body_text: bodyText,
      cta_text: ctaText,
      platform: "TikTok Shop",
      publication_url: performanceForm.publicationUrl.trim() || null,
      published_at: new Date(`${performanceForm.publishedAt}T12:00:00`).toISOString(),
      views: integer(performanceForm.views),
      likes: integer(performanceForm.likes),
      comments: integer(performanceForm.comments),
      shares: integer(performanceForm.shares),
      clicks: integer(performanceForm.clicks),
      orders: integer(performanceForm.orders),
      revenue: Math.max(0, Number(performanceForm.revenue.replace(",", ".")) || 0),
      notes: performanceForm.notes.trim(),
    });
  };

  // Steps definition for Guided Flow
  const steps = [
    { id: 1, label: "Diagnóstico & Potencial", icon: BarChart3 },
    { id: 2, label: "Estúdio de Cenas VEO", icon: Video },
    { id: 3, label: "Roteiro Corrido", icon: FileText },
    { id: 4, label: "Kit TikTok", icon: Share2 },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-20">
      {/* Top Breadcrumb & Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" /> Seus Projetos
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {/* Version Selector Pill Dropdown */}
          <div className="glass-panel flex items-center gap-1 p-1">
            <span className="px-2 text-xs font-medium text-muted-foreground">Versão</span>
            {generations.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedVersion(g.version)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  (selectedVersion ?? generations[0]?.version) === g.version
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                }`}
              >
                v{g.version}
              </button>
            ))}
          </div>

          <Button
            variant="hero"
            size="sm"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Wand2 className="mr-1.5 size-4" />
            )}
            Gerar Outra Versão
          </Button>
        </div>
      </div>

      {/* Main Glassmorphic Hero Banner */}
      <div className="glass-card p-6 md:p-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge className="border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Package className="mr-1.5 size-3.5" />
                {product?.name ?? "Produto"}
              </Badge>
              <Badge
                variant="outline"
                className="border-border bg-secondary/30 text-xs text-muted-foreground"
              >
                {scenes.length} Cenas ({totalDuration}s total)
              </Badge>
              {activeAvatar?.name && (
                <Badge variant="outline" className="border-cyan/25 bg-cyan/10 text-xs text-cyan">
                  <UserRound className="mr-1.5 size-3.5" />
                  Avatar: {activeAvatar.name}
                </Badge>
              )}
            </div>

            {result?.product_diagnosis?.overall_score && (
              <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/[0.06] px-3 py-1.5">
                <Sparkles className="size-4 text-primary" />
                <span className="text-xs text-muted-foreground">Score VEO:</span>
                <span className="text-sm font-semibold text-primary">
                  {result.product_diagnosis.overall_score}/10
                </span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {project.name}
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {product?.description ||
                "Roteiro modelado e otimizado para o TikTok Shop e geração de vídeos no Google VEO."}
            </p>
          </div>
        </div>
      </div>

      {/* FLUXO GUIADO (Guided Flow Stepper Bar) */}
      <div className="glass-card p-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                  isActive
                    ? "bg-gradient-supremo text-white shadow-lg shadow-primary/30 font-bold"
                    : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-foreground"
                }`}
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-80">
                    Etapa 0{step.id}
                  </span>
                  <span className="block truncate text-xs font-semibold">{step.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* STEP 1: DIAGNÓSTICO & POTENCIAL */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Score Radial Card */}
            <div className="glass-card p-6 md:col-span-1 space-y-4 flex flex-col items-center text-center justify-center">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Potencial Comercial
              </span>
              <div className="relative flex size-36 items-center justify-center">
                <div className="relative flex size-32 flex-col items-center justify-center rounded-full border border-primary/30 bg-secondary/30">
                  <span className="text-4xl font-semibold text-primary">
                    {result?.product_diagnosis?.overall_score || "8.5"}
                  </span>
                  <span className="text-[10px] font-medium uppercase text-muted-foreground">
                    de 10
                  </span>
                </div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {result?.product_diagnosis?.score_explanation ||
                  "Produto com excelente apelo visual e fácil demonstração no formato UGC TikTok."}
              </p>
            </div>

            {/* Target Audience & Angle */}
            <div className="glass-card p-6 md:col-span-2 space-y-5">
              <div className="flex items-center gap-2 border-b border-border pb-3">
                <Target className="size-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Análise do Público & Ângulo Validado
                </h3>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1 rounded-xl border border-border bg-secondary/20 p-4">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Público-Alvo Estimado
                  </span>
                  <p className="text-sm font-medium text-foreground leading-relaxed">
                    {result?.target_audience ||
                      "Mulheres brasileiras de 20-35 anos buscando versatilidade e praticidade."}
                  </p>
                </div>
                <div className="space-y-1 rounded-xl border border-border bg-secondary/20 p-4">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    Ângulo Persuasivo
                  </span>
                  <p className="text-sm font-medium leading-relaxed text-foreground">
                    {result?.sales_angle ||
                      "Transformação visual rápida + fim da dúvida do que vestir."}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/[0.06] p-4">
                <span className="text-xs font-medium uppercase text-primary">
                  Estratégia Escolhida
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {result?.strategy?.name || "Tik Supremo Conversão Máxima"}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {result?.strategy?.rationale}
                </p>
              </div>
            </div>
          </div>

          {/* Strongest Benefits vs Objections */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3 text-emerald-400">
                <CheckCircle2 className="size-5" />
                <h3 className="text-lg font-semibold">Benefícios Mais Fortes a Destacar</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {(
                  result?.strategy?.strongest_benefits ?? [
                    "Caimento perfeito no corpo",
                    "Tecido confortável que não marca",
                    "Combina com múltiplos looks",
                  ]
                ).map((b: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.06] p-3 text-foreground/90"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-slate-950 font-bold text-xs">
                      ✓
                    </span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-2 border-b border-border pb-3 text-amber-400">
                <ShieldAlert className="size-5" />
                <h3 className="text-lg font-semibold">Objeções a Quebrar nas Cenas</h3>
              </div>
              <ul className="space-y-2.5 text-sm">
                {(
                  result?.strategy?.objections_to_answer ?? [
                    "Medo da qualidade do tecido",
                    "Dúvida sobre servir perfeitamente",
                  ]
                ).map((o: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 rounded-lg border border-amber-500/15 bg-amber-500/[0.06] p-3 text-foreground/90"
                  >
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-slate-950 font-bold text-xs">
                      !
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Guided Step Footer Navigation */}
          <div className="flex justify-end pt-4">
            <Button variant="hero" size="lg" onClick={() => setCurrentStep(2)}>
              Ir para Estúdio de Cenas VEO <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ESTÚDIO DE CENAS VEO (NAVEGADOR PASSO A PASSO + FORMATO TIKTOK.MD) */}
      {currentStep === 2 && (
        <div className="space-y-6">
          {/* Scene Stepper Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {scenes.map((scene, idx) => {
              const isCurrent = activeSceneIndex === idx;
              const typeInfo = getSceneTypeInfo(scene.scene_number);
              return (
                <button
                  key={scene.id ?? idx}
                  onClick={() => setActiveSceneIndex(idx)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-lg border px-4 py-3 text-left transition-colors ${
                    isCurrent
                      ? "border-cyan/50 bg-slate-900/90 text-white shadow-xl shadow-cyan/20 ring-2 ring-cyan/40"
                      : "border-white/10 bg-slate-900/40 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <span
                    className={`flex size-7 items-center justify-center rounded-xl bg-gradient-to-br ${typeInfo.color} font-bold text-xs text-white`}
                  >
                    #{scene.scene_number}
                  </span>
                  <div>
                    <span className="block text-xs font-bold truncate max-w-[140px]">
                      {typeInfo.title}
                    </span>
                    <span className="block text-[10px] opacity-75">
                      {scene.duration_seconds || 8}s
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Scene Studio Card */}
          {currentScene && (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Mobile 9:16 TikTok Simulator */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="relative flex aspect-[9/16] w-full max-w-[320px] flex-col justify-between overflow-hidden rounded-[2rem] border-4 border-border bg-[#09090b] p-4 shadow-xl shadow-black/20">
                  {/* Phone Notch Header */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                    <div className="flex items-center gap-1">
                      <Smartphone className="size-3 text-cyan" />
                      <span>TikTok 9:16</span>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2">
                      {currentScene.duration_seconds || 8}s
                    </Badge>
                  </div>

                  {/* Phone Screen Center: Visual Simulation */}
                  <div className="my-auto space-y-4 text-center p-2">
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-cyan/20 px-3 py-1 text-[11px] font-bold text-cyan border border-cyan/30">
                      <Eye className="size-3" />
                      {getSceneTypeInfo(currentScene.scene_number).title}
                    </div>

                    <div className="rounded-xl border border-border bg-card/90 p-4">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-pink mb-1">
                        🔊 Texto Falado na Cena
                      </span>
                      <p className="text-sm font-semibold text-white italic leading-relaxed">
                        "{currentScene.spoken_text}"
                      </p>
                    </div>

                    <div className="space-y-1 rounded-lg border border-border bg-secondary/40 p-3 text-left text-[11px] text-muted-foreground">
                      <p>
                        <strong className="text-cyan">Ação:</strong> {currentScene.visual_action}
                      </p>
                      <p>
                        <strong className="text-cyan">Câmera:</strong>{" "}
                        {currentScene.camera_direction}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Navigation */}
                  <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                    <span>Tela 100% Limpa</span>
                    <span>Google VEO Ready</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Google VEO Structured Code Block (Tiktok.md Standard) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-card p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Terminal className="size-5 text-primary" />
                        <h3 className="text-lg font-semibold text-foreground">
                          Prompt Google VEO · JSON
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        JSON validado segundo a base tiktok.md, pronto para copiar cena por cena
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={!currentScene.id || variationMutation.isPending}
                        onClick={() => currentScene.id && variationMutation.mutate(currentScene.id)}
                        className="text-xs font-semibold"
                      >
                        <RefreshCw
                          className={`mr-1.5 size-4 ${variationMutation.isPending ? "animate-spin" : ""}`}
                        />
                        {variationMutation.isPending ? "Criando..." : "Outra variação"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditOpen(true)}
                        className="text-xs font-semibold"
                      >
                        <PencilLine className="mr-1.5 size-4" />
                        Corrigir com IA
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() =>
                          handleCopy(
                            formatVeoPromptMarkdown(currentScene),
                            `veo-md-${currentScene.scene_number}`,
                          )
                        }
                        className="text-xs font-semibold"
                      >
                        {copiedSection === `veo-md-${currentScene.scene_number}` ? (
                          <Check className="mr-1.5 size-4 text-emerald-400" />
                        ) : (
                          <Copy className="mr-1.5 size-4" />
                        )}
                        Copiar Prompt VEO
                      </Button>
                    </div>
                  </div>

                  {/* Formatted VEO Code Block Container */}
                  <div className="max-h-[420px] overflow-x-auto rounded-xl border border-border bg-[#09090b] p-5 font-mono text-xs leading-relaxed text-foreground/85">
                    <pre className="whitespace-pre-wrap font-mono text-slate-200">
                      {formatVeoPromptMarkdown(currentScene)}
                    </pre>
                  </div>
                </div>
                {editOpen && (
                  <div className="glass-card space-y-4 border-primary/25 p-5">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        O que precisa ser corrigido?
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Descreva o erro. A IA ajustará o texto falado, o personagem e o prompt VEO,
                        mantendo os dados do produto e o formato da cena.
                      </p>
                    </div>
                    <Textarea
                      rows={5}
                      autoFocus
                      value={editInstruction}
                      onChange={(event) => setEditInstruction(event.target.value)}
                      placeholder='Ex.: O produto é para homens. Não use "amiga" e troque a personagem por um homem brasileiro.'
                    />
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setEditOpen(false)}
                        disabled={revisionMutation.isPending}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="hero"
                        disabled={
                          !currentScene.id ||
                          editInstruction.trim().length < 3 ||
                          revisionMutation.isPending
                        }
                        onClick={() =>
                          currentScene.id &&
                          revisionMutation.mutate({
                            sceneId: currentScene.id,
                            instruction: editInstruction.trim(),
                          })
                        }
                      >
                        {revisionMutation.isPending ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <Wand2 />
                        )}
                        {revisionMutation.isPending ? "Corrigindo..." : "Aplicar correção"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {modular && (
            <div className="glass-card space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="size-5 text-primary" />
                    <h3 className="text-lg font-semibold">Pacote modular de variações</h3>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Combine qualquer gancho, corpo e CTA. Cada combinação forma um vídeo com 4 cenas
                    de 8 segundos.
                  </p>
                </div>
                <Badge className="bg-primary/10 text-primary">
                  {modular.total_combinations ?? 48} combinações · {modular.format ?? "UGC"}
                </Badge>
              </div>
              {modular.combinations?.length ? (
                <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.05] p-5">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="size-5 text-cyan" />
                      <div>
                        <h4 className="font-semibold">Combinações mais diferentes</h4>
                        <p className="text-xs text-muted-foreground">
                          Ranking local sem custo, considerando linguagem, troca de módulos e
                          resultados já cadastrados.
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">Top {modular.recommended_count ?? 12}</Badge>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                    {modular.combinations
                      .filter((combination) => combination.recommended)
                      .sort((a, b) => (a.recommended_rank ?? 99) - (b.recommended_rank ?? 99))
                      .map((combination) => (
                        <button
                          key={combination.number}
                          type="button"
                          onClick={() => {
                            setPerformanceForm((current) => ({
                              ...current,
                              combination: String(combination.number),
                            }));
                            toast.success(
                              `Combinação ${combination.number} selecionada para acompanhamento.`,
                            );
                          }}
                          className="rounded-xl border border-border bg-background/50 p-3 text-left transition hover:border-cyan/40"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-semibold text-cyan">
                              #{combination.recommended_rank} · Vídeo {combination.number}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {combination.diversity_score ?? 0}% diferente
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-medium">{combination.label}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                            {combination.difference_summary}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-5 xl:grid-cols-3">
                {[
                  {
                    label: "4 prompts de gancho",
                    modules: modular.hook_modules ?? [],
                    key: "hook",
                  },
                  { label: "4 prompts de corpo", modules: modular.body_modules ?? [], key: "body" },
                  { label: "3 prompts de CTA", modules: modular.cta_modules ?? [], key: "cta" },
                ].map((group) => (
                  <div key={group.key} className="space-y-3">
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-primary">
                      {group.label}
                    </h4>
                    {group.modules.map((module, moduleIndex: number) => {
                      const prompt = (module.scenes ?? [])
                        .map((scene) => scene.veo_prompt)
                        .join("\n\n--- PRÓXIMA CENA ---\n\n");
                      return (
                        <div
                          key={moduleIndex}
                          className="rounded-xl border border-border bg-secondary/20 p-4"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold">
                                {moduleIndex + 1}. {module.title}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {module.strategy}
                              </p>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              aria-label={`Copiar ${group.label} ${moduleIndex + 1}`}
                              onClick={() =>
                                handleCopy(prompt, `module-${group.key}-${moduleIndex}`)
                              }
                            >
                              {copiedSection === `module-${group.key}-${moduleIndex}` ? (
                                <Check />
                              ) : (
                                <Copy />
                              )}
                            </Button>
                          </div>
                          <div className="mt-3 space-y-2">
                            {(module.scenes ?? []).map((scene, sceneIndex: number) => (
                              <p
                                key={sceneIndex}
                                className="rounded-lg bg-background/60 p-2 text-xs leading-5 text-foreground/85"
                              >
                                “{scene.spoken_text}”
                              </p>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="flex items-center justify-between border-t border-border pt-4">
            <Button
              variant="outline"
              onClick={() => {
                if (activeSceneIndex > 0) setActiveSceneIndex(activeSceneIndex - 1);
                else setCurrentStep(1);
              }}
            >
              <ChevronLeft className="mr-1 size-4" /> Anterior
            </Button>

            <span className="text-xs font-medium text-muted-foreground">
              Cena {activeSceneIndex + 1} de {scenes.length}
            </span>

            <Button
              variant="hero"
              onClick={() => {
                if (activeSceneIndex < scenes.length - 1) setActiveSceneIndex(activeSceneIndex + 1);
                else setCurrentStep(3);
              }}
            >
              Próxima Cena <ChevronRight className="ml-1 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: ROTEIRO CORRIDO */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-4">
            <div className="flex flex-col gap-2 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  Texto de Locução Fiel
                </span>
                <h2 className="text-2xl font-semibold tracking-tight">
                  Roteiro Completo Sem Interrupções
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(activeGen.full_script!, "step3-script")}
                className="border-primary/40 hover:bg-primary/20 text-xs font-semibold"
              >
                {copiedSection === "step3-script" ? (
                  <Check className="mr-1.5 size-4 text-emerald-400" />
                ) : (
                  <Copy className="mr-1.5 size-4 text-cyan" />
                )}
                Copiar Roteiro Corrido
              </Button>
            </div>

            <div className="whitespace-pre-line rounded-xl border border-border bg-secondary/20 p-6 font-sans text-base leading-relaxed text-foreground/90">
              {activeGen.full_script || "Nenhum roteiro corrido gerado."}
            </div>
          </div>

          <section className="glass-card space-y-5 p-6 md:p-8">
            <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="size-5" />
                </span>
                <div>
                  <h2 className="font-semibold">Registrar desempenho após publicar</h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Esses números ensinam quais ganchos, corpos e CTAs devem ser priorizados.
                  </p>
                </div>
              </div>
              <Badge variant="outline">
                {performanceQuery.data?.length ?? 0} registro(s) nesta versão
              </Badge>
            </div>
            <div className="bento-card bento-card-accent grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="automatic-performance-link">Cole apenas o link do TikTok</Label>
                <Input
                  id="automatic-performance-link"
                  type="url"
                  placeholder="https://www.tiktok.com/@perfil/video/..."
                  value={performanceLink}
                  onChange={(event) => setPerformanceLink(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !automaticPerformanceMutation.isPending) {
                      automaticPerformanceMutation.mutate();
                    }
                  }}
                  className="h-12 bg-background/70"
                />
                <p className="text-xs leading-5 text-muted-foreground">
                  A IA identifica o vídeo, tenta ler as métricas públicas, transcreve quando o
                  arquivo está acessível e relaciona gancho, corpo e CTA à versão do roteiro.
                </p>
              </div>
              <Button
                variant="hero"
                size="lg"
                disabled={automaticPerformanceMutation.isPending || !performanceLink.trim()}
                onClick={() => automaticPerformanceMutation.mutate()}
              >
                {automaticPerformanceMutation.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Sparkles />
                )}
                {automaticPerformanceMutation.isPending ? "Analisando vídeo..." : "Analisar link"}
              </Button>
            </div>

            <details className="group rounded-2xl border border-border bg-secondary/15 p-4 open:bg-secondary/25">
              <summary className="cursor-pointer list-none text-sm font-semibold transition-colors hover:text-primary">
                Complementar cliques, pedidos e receita manualmente
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  opcional — esses dados não são públicos no TikTok
                </span>
              </summary>
              <div className="mt-5 grid gap-4 border-t border-border pt-5 md:grid-cols-3">
                <div className="space-y-2 md:col-span-2">
                  <Label>Vídeo publicado</Label>
                  <select
                    value={performanceForm.combination}
                    onChange={(event) =>
                      setPerformanceForm((current) => ({
                        ...current,
                        combination: event.target.value,
                      }))
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Roteiro normal desta versão</option>
                    {modular?.combinations
                      ?.slice()
                      .sort((a, b) => (a.recommended_rank ?? 99) - (b.recommended_rank ?? 99))
                      .map((combination) => (
                        <option key={combination.number} value={combination.number}>
                          {combination.recommended
                            ? `Recomendado #${combination.recommended_rank} — `
                            : ""}
                          Vídeo {combination.number}: {combination.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Data da publicação</Label>
                  <Input
                    type="date"
                    value={performanceForm.publishedAt}
                    onChange={(event) =>
                      setPerformanceForm((current) => ({
                        ...current,
                        publishedAt: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label>Link da publicação (opcional)</Label>
                  <Input
                    type="url"
                    placeholder="https://www.tiktok.com/..."
                    value={performanceForm.publicationUrl}
                    onChange={(event) =>
                      setPerformanceForm((current) => ({
                        ...current,
                        publicationUrl: event.target.value,
                      }))
                    }
                  />
                </div>
                {[
                  { key: "views", label: "Visualizações" },
                  { key: "likes", label: "Curtidas" },
                  { key: "comments", label: "Comentários" },
                  { key: "shares", label: "Compartilhamentos" },
                  { key: "clicks", label: "Cliques" },
                  { key: "orders", label: "Pedidos" },
                ].map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Input
                      inputMode="numeric"
                      min="0"
                      value={performanceForm[field.key as keyof typeof performanceForm]}
                      onChange={(event) =>
                        setPerformanceForm((current) => ({
                          ...current,
                          [field.key]: event.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label>Receita (R$)</Label>
                  <Input
                    inputMode="decimal"
                    min="0"
                    value={performanceForm.revenue}
                    onChange={(event) =>
                      setPerformanceForm((current) => ({ ...current, revenue: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Observações</Label>
                  <Input
                    placeholder="Ex.: publicado às 19h, promoção ativa"
                    value={performanceForm.notes}
                    onChange={(event) =>
                      setPerformanceForm((current) => ({ ...current, notes: event.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end md:col-span-3">
                  <Button
                    variant="outline"
                    disabled={performanceMutation.isPending || !performanceForm.publishedAt}
                    onClick={submitPerformance}
                  >
                    {performanceMutation.isPending ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Save />
                    )}
                    Salvar complemento manual
                  </Button>
                </div>
              </div>
            </details>
          </section>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(2)}>
              <ChevronLeft className="mr-1 size-4" /> Voltar às Cenas
            </Button>
            <Button variant="hero" onClick={() => setCurrentStep(4)}>
              Ver Kit TikTok <ArrowRight className="ml-2 size-5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: KIT DE PUBLICAÇÃO TIKTOK */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 space-y-6">
            <div className="border-b border-border pb-4">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Pronto para Postar
              </span>
              <h2 className="text-2xl font-semibold tracking-tight">
                Kit Completo de Publicação TikTok
              </h2>
            </div>

            {/* Headline */}
            {activeGen.headline && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan flex items-center gap-1.5">
                    <Sparkles className="size-4" /> Headline da Capa / Thumbnail
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(activeGen.headline!, "headline")}
                    className="h-7 border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedSection === "headline" ? (
                      <Check className="mr-1 size-3 text-emerald-400" />
                    ) : (
                      <Copy className="mr-1 size-3" />
                    )}
                    Copiar Headline
                  </Button>
                </div>
                <div className="rounded-xl border border-primary/20 bg-primary/[0.06] p-5 text-lg font-semibold text-foreground">
                  {activeGen.headline}
                </div>
              </div>
            )}

            {/* Caption */}
            {activeGen.caption && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <MessageSquareText className="size-4" /> Legenda Persuasiva
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(activeGen.caption!, "caption")}
                    className="h-7 border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedSection === "caption" ? (
                      <Check className="mr-1 size-3 text-emerald-400" />
                    ) : (
                      <Copy className="mr-1 size-3" />
                    )}
                    Copiar Legenda
                  </Button>
                </div>
                <div className="whitespace-pre-line rounded-xl border border-border bg-secondary/20 p-5 text-sm leading-relaxed text-foreground/90">
                  {activeGen.caption}
                </div>
              </div>
            )}

            {/* Hashtags */}
            {activeGen.hashtags && activeGen.hashtags.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-pink flex items-center gap-1.5">
                    <Hash className="size-4" /> 5 Hashtags de Alta Entrega
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopy(activeGen.hashtags!.join(" "), "hashtags")}
                    className="h-7 border-border text-xs text-muted-foreground hover:text-foreground"
                  >
                    {copiedSection === "hashtags" ? (
                      <Check className="mr-1 size-3 text-emerald-400" />
                    ) : (
                      <Copy className="mr-1 size-3" />
                    )}
                    Copiar Todas Hashtags
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {activeGen.hashtags.map((tag: string, i: number) => (
                    <Badge
                      key={i}
                      className="cursor-pointer border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
                      onClick={() => handleCopy(tag, `tag-${i}`)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setCurrentStep(3)}>
              <ChevronLeft className="mr-1 size-4" /> Voltar ao Roteiro
            </Button>
            <Button
              variant="hero"
              onClick={() => handleCopy(activeGen.full_script || "", "final-copy")}
            >
              <Check className="mr-2 size-5" /> Concluir e Copiar Tudo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
