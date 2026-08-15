import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Clock3,
  Download,
  Film,
  Gauge,
  Heart,
  Layers3,
  Library,
  ListVideo,
  Loader2,
  Package,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Target,
  Trash2,
  Upload,
  WandSparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildDailyJobs,
  calculateCreativeScore,
  emptyDailyWorkspace,
  learnFromPerformance,
  loadDailyWorkspace,
  objectiveLabels,
  publishingCopy,
  recommendBroll,
  saveDailyWorkspace,
  seededTemplates,
  statusLabels,
  suggestMediaTags,
  variationLabels,
  type CreativeTemplate,
  type DailyJobStatus,
  type DailyObjective,
  type DailyVideoJob,
  type DailyWorkspace,
  type MediaCatalogItem,
} from "@/features/daily-studio/workspace";
import { listPerformance, listProductLibrary } from "@/features/libraries/queries";
import {
  disposeVideoEngine,
  downloadVideo,
  getVideoDuration,
  loadVideoEngine,
  normalizeSegment,
  renderCombination,
  type EditorSegment,
} from "@/features/video-editor/engine";
import { transcriptToCaptions } from "@/features/video-editor/automation";
import {
  saveEditorProject,
  type VideoEditorProject,
} from "@/features/video-editor/project-persistence";

export const Route = createFileRoute("/_authenticated/daily-studio")({
  component: DailyStudioPage,
  head: () => ({ meta: [{ title: "Fábrica diária — Tik Supremo" }] }),
});

const workflowStatuses: DailyJobStatus[] = [
  "idea",
  "script",
  "recording",
  "editing",
  "queued",
  "ready",
  "scheduled",
  "published",
];

function DailyStudioPage() {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<DailyWorkspace>(emptyDailyWorkspace);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState("today");
  const [jobSearch, setJobSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState("");
  const [queueBusy, setQueueBusy] = useState(false);
  const [queueProgress, setQueueProgress] = useState("");
  const [mediaSearch, setMediaSearch] = useState("");
  const [mediaOrientation, setMediaOrientation] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const productsQuery = useQuery({ queryKey: ["daily-products"], queryFn: listProductLibrary });
  const performanceQuery = useQuery({ queryKey: ["daily-performance"], queryFn: listPerformance });

  useEffect(() => {
    void loadDailyWorkspace()
      .then(setWorkspace)
      .catch(() => toast.error("Não foi possível restaurar a fábrica diária."))
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const timer = window.setTimeout(
      () => void saveDailyWorkspace(workspace).catch(() => undefined),
      450,
    );
    return () => window.clearTimeout(timer);
  }, [loaded, workspace]);

  const selectedProduct = productsQuery.data?.find(
    (product) => product.id === workspace.selectedProductId,
  );
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayJobs = workspace.jobs.filter(
    (job) => new Date(job.createdAt).toISOString().slice(0, 10) === todayKey,
  );
  const readyCount = todayJobs.filter((job) =>
    ["ready", "scheduled", "published"].includes(job.status),
  ).length;
  const publishedCount = todayJobs.filter((job) => job.status === "published").length;
  const averageScore = todayJobs.length
    ? Math.round(todayJobs.reduce((sum, job) => sum + job.score, 0) / todayJobs.length)
    : 0;
  const filteredJobs = workspace.jobs.filter((job) =>
    `${job.title} ${job.hook} ${job.angle}`.toLowerCase().includes(jobSearch.toLowerCase()),
  );
  const selectedJob = workspace.jobs.find((job) => job.id === selectedJobId) ?? null;

  const historicalHooks = useMemo(
    () =>
      [...(performanceQuery.data ?? [])]
        .filter((record) => record.hook_text && record.views > 0)
        .sort((a, b) => b.views + b.orders * 1000 - (a.views + a.orders * 1000))
        .map((record) => record.hook_text)
        .filter((value, index, values) => values.indexOf(value) === index)
        .slice(0, 12),
    [performanceQuery.data],
  );
  const learning = useMemo(
    () => learnFromPerformance(performanceQuery.data ?? []),
    [performanceQuery.data],
  );
  const filteredMedia = useMemo(
    () =>
      workspace.media.filter((item) => {
        const query = mediaSearch.trim().toLowerCase();
        const matchesText =
          !query ||
          `${item.name} ${item.description ?? ""} ${item.tags.join(" ")} ${item.movement ?? ""}`
            .toLowerCase()
            .includes(query);
        const matchesOrientation =
          mediaOrientation === "all" || item.orientation === mediaOrientation;
        return matchesText && matchesOrientation && (!favoritesOnly || item.favorite);
      }),
    [favoritesOnly, mediaOrientation, mediaSearch, workspace.media],
  );

  const patchWorkspace = (patch: Partial<DailyWorkspace>) =>
    setWorkspace((current) => ({ ...current, ...patch, updatedAt: Date.now() }));

  const patchJob = (id: string, patch: Partial<DailyVideoJob>) => {
    setWorkspace((current) => ({
      ...current,
      jobs: current.jobs.map((job) => {
        if (job.id !== id) return job;
        const next = { ...job, ...patch, updatedAt: Date.now() };
        const quality = calculateCreativeScore(next);
        return { ...next, score: quality.score, scoreNotes: quality.notes };
      }),
      updatedAt: Date.now(),
    }));
  };

  const markMediaUsed = (ids: string[]) => {
    const used = new Set(ids);
    setWorkspace((current) => ({
      ...current,
      media: current.media.map((item) =>
        used.has(item.id) ? { ...item, useCount: item.useCount + 1, lastUsedAt: Date.now() } : item,
      ),
      updatedAt: Date.now(),
    }));
  };

  const generateDay = () => {
    const jobs = buildDailyJobs({
      count: workspace.dailyGoal,
      productId: selectedProduct?.id ?? null,
      productName: selectedProduct?.name ?? "Produto principal",
      objective: workspace.objective,
      duration: workspace.targetDuration,
      templates: workspace.templates,
      historicalHooks,
      suppressedPatterns: learning.losingPatterns,
    });
    patchWorkspace({ jobs: [...jobs, ...workspace.jobs] });
    setSelectedJobId(jobs[0]?.id ?? null);
    setActiveTab("pipeline");
    toast.success(`${jobs.length} roteiros e variações adicionados ao pipeline.`);
  };

  const addTemplate = () => {
    const name = templateDraft.trim();
    if (!name) return;
    const template: CreativeTemplate = {
      ...seededTemplates[0]!,
      id: `template-${crypto.randomUUID()}`,
      name,
      description: "Template personalizado para produção recorrente.",
      objective: workspace.objective,
      createdAt: Date.now(),
    };
    patchWorkspace({ templates: [...workspace.templates, template] });
    setTemplateDraft("");
    toast.success("Template criado.");
  };

  const importMedia = async (files: File[]) => {
    const existing = new Set(workspace.media.map((item) => item.fingerprint));
    const items: MediaCatalogItem[] = [];
    for (const file of files) {
      const fingerprint = `${file.name}:${file.size}:${file.lastModified}`;
      if (existing.has(fingerprint)) continue;
      const kind = file.type.startsWith("audio")
        ? "audio"
        : file.type.startsWith("image")
          ? "image"
          : "video";
      const metadata = await inspectMediaFile(file, kind);
      const tags = suggestMediaTags(file.name);
      items.push({
        id: `media-${crypto.randomUUID()}`,
        name: file.name,
        kind,
        tags,
        duration: metadata.duration,
        orientation: metadata.orientation,
        productId: workspace.selectedProductId,
        movement: tags.find((tag) => /close|zoom|pan|giro|m[aã]o/i.test(tag)) ?? null,
        favorite: false,
        collections: [],
        description: suggestSceneDescription(file.name),
        useCount: 0,
        lastUsedAt: null,
        fingerprint,
        createdAt: Date.now(),
        file,
      } satisfies MediaCatalogItem);
    }
    patchWorkspace({ media: [...items, ...workspace.media] });
    toast.success(`${items.length} ativo(s) catalogado(s); duplicados foram ignorados.`);
  };

  const exportPackage = () => {
    const payload = workspace.jobs.map((job) => ({
      arquivo: job.outputName,
      produto: job.productName,
      objetivo: objectiveLabels[job.objective],
      gancho: job.hook,
      corpo: job.body,
      cta: job.cta,
      legenda: publishingCopy(job),
      agendamento: job.scheduledFor,
      status: statusLabels[job.status],
      score: job.score,
    }));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pacote-publicacao-${todayKey}.json`;
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const openJobInEditor = async (job: DailyVideoJob) => {
    const agentSources = (job.recommendedMediaIds ?? [])
      .map((id) => workspace.media.find((item) => item.id === id))
      .filter((item): item is MediaCatalogItem => Boolean(item?.file));
    const sources = (
      agentSources.length
        ? agentSources
        : recommendBroll(`${job.hook} ${job.body} ${job.cta}`, workspace.media, job.productId).map(
            ({ item }) => item,
          )
    )
      .filter((item) => item.file)
      .slice(0, 4);
    if (!sources.length) {
      toast.error("Importe pelo menos um vídeo na Biblioteca para montar este criativo.");
      setActiveTab("library");
      return;
    }
    const project = await createEditorProjectForJob(job, sources);
    await saveEditorProject(project);
    markMediaUsed(sources.map((source) => source.id));
    patchJob(job.id, { status: "editing" });
    await navigate({ to: "/video-editor" });
  };

  const processRenderQueue = async () => {
    const queued = workspace.jobs.filter((job) => job.status === "queued");
    const firstQueued = queued[0];
    const agentSources = (firstQueued?.recommendedMediaIds ?? [])
      .map((id) => workspace.media.find((item) => item.id === id))
      .filter((item): item is MediaCatalogItem => Boolean(item?.file));
    const sources = firstQueued
      ? (agentSources.length
          ? agentSources
          : recommendBroll(
              `${firstQueued.hook} ${firstQueued.body} ${firstQueued.cta}`,
              workspace.media,
              firstQueued.productId,
            ).map(({ item }) => item)
        )
          .filter((item) => item.file)
          .slice(0, 4)
      : [];
    if (!queued.length) {
      toast.error("Avance pelo menos um criativo para Na fila.");
      return;
    }
    if (!sources.length) {
      setActiveTab("library");
      toast.error("Importe vídeos na Biblioteca antes de processar a fila.");
      return;
    }
    setQueueBusy(true);
    const files: Record<string, Uint8Array> = {};
    try {
      const firstProject = await createEditorProjectForJob(queued[0]!, sources);
      const ffmpeg = await loadVideoEngine({ onProgress: setQueueProgress });
      const normalized = new Map<string, string>();
      for (const [index, segment] of firstProject.segments.entries()) {
        setQueueProgress(`Preparando mídia ${index + 1} de ${firstProject.segments.length}...`);
        normalized.set(
          segment.id,
          await normalizeSegment(ffmpeg, segment, {
            removeAudio: false,
            width: 720,
            exportFormat: "9x16-720",
            fitMode: "cover",
            normalizeAudio: true,
            stripMetadata: true,
          }),
        );
      }
      for (const [index, job] of queued.entries()) {
        patchJob(job.id, { status: "rendering", attempts: job.attempts + 1 });
        setQueueProgress(`Renderizando ${index + 1} de ${queued.length}: ${job.title}`);
        try {
          const duration = firstProject.segments.reduce(
            (sum, segment) => sum + segment.end - segment.start,
            0,
          );
          const output = await renderCombination(
            ffmpeg,
            { number: index + 1, hook: 0, body: 0, cta: 0, label: job.title },
            normalized,
            {
              segments: firstProject.segments,
              segmentIds: firstProject.timelineIds,
              textOverlays: transcriptToCaptions(`${job.hook} ${job.body} ${job.cta}`, duration),
              audioLayers: [],
              width: 720,
              exportFormat: "9x16-720",
              stripMetadata: true,
            },
          );
          files[job.outputName] = new Uint8Array(await output.blob.arrayBuffer());
          patchJob(job.id, { status: "ready" });
        } catch {
          patchJob(job.id, { status: "failed" });
        }
      }
      if (Object.keys(files).length) {
        const { zipSync } = await import("fflate");
        const archive = zipSync(files, { level: 0 });
        downloadVideo(
          new Blob([archive.slice().buffer as ArrayBuffer], { type: "application/zip" }),
          `fabrica-diaria-${todayKey}.zip`,
        );
        toast.success(`${Object.keys(files).length} vídeo(s) renderizados e reunidos no ZIP.`);
        markMediaUsed(sources.map((source) => source.id));
      } else {
        toast.error("Nenhum vídeo da fila pôde ser renderizado.");
      }
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Falha ao processar a fila.");
    } finally {
      disposeVideoEngine();
      setQueueBusy(false);
      setQueueProgress("");
    }
  };

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] text-slate-100 md:-mx-8 md:-my-10">
      <input
        ref={mediaInputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*"
        className="sr-only"
        onChange={(event) => {
          importMedia(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <header className="border-b border-white/10 bg-[radial-gradient(circle_at_80%_0%,rgba(124,58,237,.2),transparent_30%),linear-gradient(135deg,#12101f,#090b11_60%)] px-5 py-7 md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-violet-300">
              <Sparkles className="size-3.5" /> Sistema operacional de conteúdo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">
              Fábrica diária de vídeos
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Planeje, varie, produza, revise e acompanhe dezenas de criativos sem perder o que já
              funcionou.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white"
              disabled={queueBusy}
              onClick={() => void processRenderQueue()}
            >
              {queueBusy ? <Loader2 className="animate-spin" /> : <Play />}
              {queueBusy ? queueProgress || "Processando..." : "Processar fila"}
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/5 text-white"
              onClick={exportPackage}
            >
              <Download /> Pacote de publicação
            </Button>
            <Button
              className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-950/40"
              onClick={generateDay}
            >
              <WandSparkles /> Gerar meu dia
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] p-4 md:p-6">
        <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi
            icon={Target}
            label="Meta diária"
            value={`${readyCount}/${workspace.dailyGoal}`}
            color="violet"
          />
          <Kpi icon={ListVideo} label="No pipeline" value={String(todayJobs.length)} color="cyan" />
          <Kpi
            icon={CheckCircle2}
            label="Publicados"
            value={String(publishedCount)}
            color="emerald"
          />
          <Kpi
            icon={Gauge}
            label="Creative Score"
            value={averageScore ? `${averageScore}/100` : "—"}
            color="amber"
          />
          <Kpi
            icon={BarChart3}
            label="Ganchos vencedores"
            value={String(historicalHooks.length)}
            color="pink"
          />
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#0d1018] p-1.5">
            <Tab value="today" icon={Zap} label="Hoje" />
            <Tab value="pipeline" icon={Layers3} label="Pipeline" />
            <Tab value="templates" icon={Sparkles} label="Templates" />
            <Tab value="library" icon={Library} label="Biblioteca" />
            <Tab value="calendar" icon={CalendarDays} label="Calendário" />
          </TabsList>

          <TabsContent value="today" className="mt-5 space-y-5">
            <section className="grid gap-5 xl:grid-cols-[1.05fr_.95fr]">
              <Panel
                title="Plano de produção"
                subtitle="Defina a meta uma vez e gere a fila do dia."
                icon={Target}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Produto">
                    <select
                      className="dark-control"
                      value={workspace.selectedProductId ?? ""}
                      onChange={(event) =>
                        patchWorkspace({ selectedProductId: event.target.value || null })
                      }
                    >
                      <option value="">Produto principal</option>
                      {(productsQuery.data ?? []).map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Objetivo">
                    <select
                      className="dark-control"
                      value={workspace.objective}
                      onChange={(event) =>
                        patchWorkspace({ objective: event.target.value as DailyObjective })
                      }
                    >
                      {Object.entries(objectiveLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Vídeos por dia">
                    <Input
                      className="dark-control"
                      type="number"
                      min={1}
                      max={100}
                      value={workspace.dailyGoal}
                      onChange={(event) =>
                        patchWorkspace({ dailyGoal: Math.max(1, Number(event.target.value)) })
                      }
                    />
                  </Field>
                  <Field label="Duração alvo">
                    <select
                      className="dark-control"
                      value={workspace.targetDuration}
                      onChange={(event) =>
                        patchWorkspace({ targetDuration: Number(event.target.value) })
                      }
                    >
                      <option value={15}>15 segundos</option>
                      <option value={24}>24 segundos</option>
                      <option value={30}>30 segundos</option>
                      <option value={45}>45 segundos</option>
                      <option value={60}>60 segundos</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-5 rounded-xl border border-violet-400/20 bg-violet-500/8 p-4">
                  <p className="text-xs font-semibold text-violet-200">Aprendizado ativado</p>
                  <p className="mt-1 text-[11px] leading-5 text-slate-400">
                    A geração usa {historicalHooks.length || "nenhum"} gancho(s) com histórico de
                    desempenho e distribui ângulos para reduzir repetição.
                  </p>
                </div>
                <Button
                  className="mt-5 w-full bg-violet-600 text-white hover:bg-violet-500"
                  onClick={generateDay}
                >
                  <WandSparkles /> Criar {workspace.dailyGoal} variações
                </Button>
              </Panel>

              <Panel
                title="Linha de produção"
                subtitle="Do roteiro publicado ao feedback de performance."
                icon={Layers3}
              >
                <div className="space-y-2">
                  {workflowStatuses.slice(0, 7).map((status, index) => {
                    const count = workspace.jobs.filter((job) => job.status === status).length;
                    return (
                      <div
                        key={status}
                        className="flex items-center gap-3 rounded-lg border border-white/[.07] bg-black/15 px-3 py-2.5"
                      >
                        <span className="flex size-7 items-center justify-center rounded-full bg-white/5 text-[10px] font-bold text-slate-400">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1 text-xs font-medium text-slate-300">
                          {statusLabels[status]}
                        </span>
                        <Badge className="bg-white/5 text-slate-400">{count}</Badge>
                      </div>
                    );
                  })}
                </div>
              </Panel>
            </section>
          </TabsContent>

          <TabsContent value="pipeline" className="mt-5">
            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
              <Panel
                title="Pipeline de criativos"
                subtitle={`${filteredJobs.length} vídeo(s) organizados por estágio.`}
                icon={ListVideo}
                actions={
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-slate-500" />
                    <Input
                      value={jobSearch}
                      onChange={(event) => setJobSearch(event.target.value)}
                      placeholder="Buscar"
                      className="h-9 w-44 border-white/10 bg-black/20 pl-8 text-xs"
                    />
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <div className="grid min-w-[1200px] grid-cols-6 gap-3">
                    {(
                      [
                        "script",
                        "recording",
                        "editing",
                        "queued",
                        "ready",
                        "failed",
                      ] as DailyJobStatus[]
                    ).map((status) => (
                      <PipelineColumn
                        key={status}
                        status={status}
                        jobs={filteredJobs.filter((job) => job.status === status)}
                        selectedJobId={selectedJobId}
                        onSelect={setSelectedJobId}
                        onAdvance={(job) => patchJob(job.id, { status: nextStatus(job.status) })}
                      />
                    ))}
                  </div>
                </div>
              </Panel>
              <JobInspector
                job={selectedJob}
                onChange={(patch) => selectedJob && patchJob(selectedJob.id, patch)}
                onOpenEditor={(job) => void openJobInEditor(job)}
                onRemove={() => {
                  if (!selectedJob) return;
                  patchWorkspace({
                    jobs: workspace.jobs.filter((job) => job.id !== selectedJob.id),
                  });
                  setSelectedJobId(null);
                }}
              />
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <LearningCard
                title="Ganchos vencedores"
                tone="emerald"
                items={learning.winningHooks.slice(0, 5)}
                empty="Adicione métricas para descobrir padrões vencedores."
              />
              <LearningCard
                title="Refazer vencedores"
                tone="cyan"
                items={learning.remakeRecommendations.map(
                  (item) => `${item.hook} — ${item.reason}`,
                )}
                empty="Nenhum vencedor com volume suficiente ainda."
              />
              <LearningCard
                title="Desgaste e estruturas fracas"
                tone="amber"
                items={[
                  ...learning.fatigueWarnings,
                  ...learning.losingPatterns.map((item) => `Evitar: ${item}`),
                ].slice(0, 6)}
                empty="Nenhum desgaste detectado."
              />
            </div>
          </TabsContent>

          <TabsContent value="templates" className="mt-5">
            <Panel
              title="Templates reutilizáveis"
              subtitle="Estruturas consistentes com campos variáveis para produzir em escala."
              icon={Sparkles}
              actions={
                <div className="flex gap-2">
                  <Input
                    className="h-9 w-56 border-white/10 bg-black/20 text-xs"
                    value={templateDraft}
                    onChange={(event) => setTemplateDraft(event.target.value)}
                    placeholder="Nome do novo template"
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addTemplate();
                    }}
                  />
                  <Button size="sm" onClick={addTemplate}>
                    <Plus /> Criar
                  </Button>
                </div>
              }
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {workspace.templates.map((template) => (
                  <article
                    key={template.id}
                    className="rounded-xl border border-white/10 bg-black/15 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
                        <Film className="size-4" />
                      </span>
                      <Badge className="bg-white/5 text-slate-400">{template.duration}s</Badge>
                    </div>
                    <h3 className="mt-4 text-sm font-semibold">{template.name}</h3>
                    <p className="mt-1 min-h-10 text-[11px] leading-5 text-slate-500">
                      {template.description}
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      <Badge className="bg-cyan-500/10 text-cyan-300">
                        {objectiveLabels[template.objective]}
                      </Badge>
                      <Badge className="bg-white/5 text-slate-400">{template.captionStyle}</Badge>
                    </div>
                    {!template.id.startsWith("template-") || template.createdAt > 10 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-rose-300"
                        onClick={() =>
                          patchWorkspace({
                            templates: workspace.templates.filter(
                              (item) => item.id !== template.id,
                            ),
                          })
                        }
                      >
                        <Trash2 /> Excluir
                      </Button>
                    ) : null}
                  </article>
                ))}
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="library" className="mt-5">
            <Panel
              title="Biblioteca inteligente"
              subtitle="Catálogo local com tags, duplicidade e desgaste de ativos."
              icon={Library}
              actions={
                <div className="flex flex-wrap gap-2">
                  <Input
                    className="h-9 w-52 border-white/10 bg-black/20 text-xs"
                    value={mediaSearch}
                    onChange={(event) => setMediaSearch(event.target.value)}
                    placeholder="Buscar: mão mostrando tecido"
                  />
                  <select
                    className="dark-control h-9 text-xs"
                    value={mediaOrientation}
                    onChange={(event) => setMediaOrientation(event.target.value)}
                  >
                    <option value="all">Todas orientações</option>
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                    <option value="square">Quadrado</option>
                  </select>
                  <Button
                    size="sm"
                    variant={favoritesOnly ? "default" : "outline"}
                    onClick={() => setFavoritesOnly((value) => !value)}
                  >
                    <Heart /> Favoritos
                  </Button>
                  <Button size="sm" onClick={() => mediaInputRef.current?.click()}>
                    <Upload /> Importar
                  </Button>
                </div>
              }
            >
              {!workspace.media.length ? (
                <Empty
                  icon={Library}
                  title="Sua biblioteca inteligente está vazia"
                  text="Importe vídeos, áudios ou imagens. O sistema cataloga os arquivos e ignora duplicados."
                  action={() => mediaInputRef.current?.click()}
                />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                  {filteredMedia.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-white/10 bg-black/15 p-3"
                    >
                      <div className="relative">
                        <MediaPreview item={item} />
                        <button
                          type="button"
                          className={`absolute right-2 top-2 rounded-full bg-black/70 p-1.5 ${item.favorite ? "text-rose-400" : "text-white/60"}`}
                          onClick={() =>
                            patchWorkspace({
                              media: workspace.media.map((media) =>
                                media.id === item.id
                                  ? { ...media, favorite: !media.favorite }
                                  : media,
                              ),
                            })
                          }
                        >
                          <Heart className={`size-3.5 ${item.favorite ? "fill-current" : ""}`} />
                        </button>
                      </div>
                      <p className="mt-3 truncate text-xs font-semibold" title={item.name}>
                        {item.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} className="bg-white/5 text-[9px] text-slate-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-2 line-clamp-2 text-[10px] text-slate-500">
                        {item.description || "Cena catalogada"}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[9px] text-slate-600">
                        <span>{item.duration ? `${item.duration.toFixed(1)}s` : item.kind}</span>
                        <span>{item.orientation}</span>
                      </div>
                      <p
                        className={`mt-2 text-[10px] ${item.useCount >= 6 ? "text-amber-300" : "text-slate-600"}`}
                      >
                        {item.useCount >= 6
                          ? "⚠ Cena usada em excesso"
                          : `Usado ${item.useCount} vez(es)`}
                      </p>
                      <Input
                        className="mt-2 h-8 border-white/10 bg-black/20 text-[10px]"
                        value={item.tags.join(", ")}
                        onChange={(event) =>
                          patchWorkspace({
                            media: workspace.media.map((media) =>
                              media.id === item.id
                                ? {
                                    ...media,
                                    tags: event.target.value
                                      .split(",")
                                      .map((tag) => tag.trim())
                                      .filter(Boolean),
                                  }
                                : media,
                            ),
                          })
                        }
                        aria-label={`Tags de ${item.name}`}
                      />
                    </article>
                  ))}
                </div>
              )}
              {selectedJob && workspace.media.length > 0 && (
                <div className="mt-5 rounded-xl border border-cyan-400/15 bg-cyan-400/5 p-4">
                  <p className="text-xs font-semibold text-cyan-200">
                    B-roll sugerido para “{selectedJob.title}”
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recommendBroll(
                      `${selectedJob.hook} ${selectedJob.body}`,
                      workspace.media,
                      selectedJob.productId,
                    ).map(({ item, relevance }) => (
                      <Badge key={item.id} className="bg-black/25 text-cyan-100">
                        {item.name} · relevância {relevance}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </TabsContent>

          <TabsContent value="calendar" className="mt-5">
            <Panel
              title="Calendário de conteúdo"
              subtitle="Agende, prepare a legenda e registre a publicação."
              icon={CalendarDays}
              actions={
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/10 bg-white/5"
                  onClick={exportPackage}
                >
                  <Download /> Exportar pacote
                </Button>
              }
            >
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {workspace.jobs
                  .filter(
                    (job) =>
                      job.scheduledFor || ["ready", "scheduled", "published"].includes(job.status),
                  )
                  .map((job) => (
                    <article
                      key={job.id}
                      className="rounded-xl border border-white/10 bg-black/15 p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <Badge className="bg-violet-500/10 text-violet-300">
                          {statusLabels[job.status]}
                        </Badge>
                        <span className="text-[10px] text-slate-500">Score {job.score}</span>
                      </div>
                      <h3 className="mt-3 text-sm font-semibold">{job.title}</h3>
                      <Input
                        type="datetime-local"
                        className="mt-3 border-white/10 bg-[#090b11] text-xs"
                        value={job.scheduledFor?.slice(0, 16) ?? ""}
                        onChange={(event) =>
                          patchJob(job.id, {
                            scheduledFor: event.target.value
                              ? new Date(event.target.value).toISOString()
                              : null,
                            status: event.target.value ? "scheduled" : "ready",
                          })
                        }
                      />
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-white/10 bg-white/5"
                          onClick={() => {
                            void navigator.clipboard.writeText(publishingCopy(job));
                            toast.success("Legenda copiada.");
                          }}
                        >
                          <ClipboardCopy /> Legenda
                        </Button>
                        <Button size="sm" onClick={() => patchJob(job.id, { status: "published" })}>
                          <CheckCircle2 /> Publicado
                        </Button>
                      </div>
                    </article>
                  ))}
              </div>
              {!workspace.jobs.some(
                (job) =>
                  job.scheduledFor || ["ready", "scheduled", "published"].includes(job.status),
              ) && (
                <Empty
                  icon={CalendarDays}
                  title="Nenhum vídeo pronto para agendar"
                  text="Avance um criativo até Pronto no pipeline para organizar a publicação."
                />
              )}
            </Panel>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    violet: "text-violet-300 bg-violet-500/10",
    cyan: "text-cyan-300 bg-cyan-500/10",
    emerald: "text-emerald-300 bg-emerald-500/10",
    amber: "text-amber-300 bg-amber-500/10",
    pink: "text-pink-300 bg-pink-500/10",
  };
  return (
    <article className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0d1018] p-4 shadow-lg shadow-black/10">
      <span className={`flex size-10 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon className="size-4" />
      </span>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-semibold">{value}</p>
      </div>
    </article>
  );
}

function Tab({ value, icon: Icon, label }: { value: string; icon: typeof Zap; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="gap-2 px-4 text-xs data-[state=active]:bg-violet-500/15 data-[state=active]:text-violet-200"
    >
      <Icon className="size-3.5" />
      {label}
    </TabsTrigger>
  );
}

function Panel({
  title,
  subtitle,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  icon: typeof Target;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0d1018] shadow-xl shadow-black/15">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
        <span className="flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-300">
          <Icon className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-[10px] text-slate-500">{subtitle}</p>
        </div>
        {actions && <div className="ml-auto">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-wider text-slate-500">
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PipelineColumn({
  status,
  jobs,
  selectedJobId,
  onSelect,
  onAdvance,
}: {
  status: DailyJobStatus;
  jobs: DailyVideoJob[];
  selectedJobId: string | null;
  onSelect: (id: string) => void;
  onAdvance: (job: DailyVideoJob) => void;
}) {
  return (
    <div className="rounded-xl bg-black/15 p-2">
      <div className="flex items-center justify-between px-1 py-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          {statusLabels[status]}
        </span>
        <Badge className="bg-white/5 text-slate-500">{jobs.length}</Badge>
      </div>
      <div className="space-y-2">
        {jobs.map((job) => (
          <button
            key={job.id}
            type="button"
            onClick={() => onSelect(job.id)}
            className={`w-full rounded-lg border p-3 text-left transition ${selectedJobId === job.id ? "border-violet-400/40 bg-violet-500/10" : "border-white/[.07] bg-[#11141d] hover:border-white/20"}`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[11px] font-semibold">{job.title}</span>
              <span
                className={`text-[10px] font-bold ${job.score >= 80 ? "text-emerald-400" : job.score >= 65 ? "text-amber-300" : "text-rose-300"}`}
              >
                {job.score}
              </span>
            </div>
            <Badge className="mt-2 bg-violet-500/10 text-[9px] text-violet-300">
              {job.variationPurpose ? variationLabels[job.variationPurpose] : job.angle}
            </Badge>
            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-slate-500">{job.hook}</p>
            <span
              role="button"
              tabIndex={0}
              className="mt-3 flex items-center justify-end gap-1 text-[9px] text-violet-300"
              onClick={(event) => {
                event.stopPropagation();
                onAdvance(job);
              }}
            >
              Avançar <ChevronRight className="size-3" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function JobInspector({
  job,
  onChange,
  onOpenEditor,
  onRemove,
}: {
  job: DailyVideoJob | null;
  onChange: (patch: Partial<DailyVideoJob>) => void;
  onOpenEditor: (job: DailyVideoJob) => void;
  onRemove: () => void;
}) {
  if (!job)
    return (
      <Panel title="Creative Inspector" subtitle="Selecione um vídeo no pipeline." icon={Gauge}>
        <Empty
          icon={Gauge}
          title="Nenhum criativo selecionado"
          text="Selecione um cartão para editar roteiro, score e publicação."
        />
      </Panel>
    );
  return (
    <Panel
      title="Creative Inspector"
      subtitle={`${job.score}/100 · ${job.variationPurpose ? variationLabels[job.variationPurpose] : job.angle} · ${job.outputName}`}
      icon={Gauge}
    >
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${job.score >= 80 ? "bg-emerald-400" : job.score >= 65 ? "bg-amber-400" : "bg-rose-400"}`}
          style={{ width: `${job.score}%` }}
        />
      </div>
      <div className="space-y-4">
        {job.approvalStatus && (
          <div className="rounded-lg border border-violet-400/15 bg-violet-400/5 p-3">
            <p className="text-[10px] font-semibold text-violet-200">
              Fila do Agente ·{" "}
              {job.approvalStatus === "pending"
                ? "aguardando aprovação"
                : job.approvalStatus === "approved"
                  ? "aprovado"
                  : "alterações solicitadas"}
            </p>
            {job.agentStoryboard?.slice(0, 4).map((scene) => (
              <p key={scene.scene} className="mt-1 text-[10px] text-slate-500">
                {scene.scene}. {scene.visual} · {scene.duration}s
              </p>
            ))}
          </div>
        )}
        <Field label="Gancho">
          <textarea
            className="dark-textarea"
            value={job.hook}
            onChange={(event) => onChange({ hook: event.target.value })}
          />
        </Field>
        <Field label="Corpo">
          <textarea
            className="dark-textarea min-h-28"
            value={job.body}
            onChange={(event) => onChange({ body: event.target.value })}
          />
        </Field>
        <Field label="CTA">
          <textarea
            className="dark-textarea"
            value={job.cta}
            onChange={(event) => onChange({ cta: event.target.value })}
          />
        </Field>
        {job.scoreNotes.length > 0 && (
          <div className="rounded-lg border border-amber-400/15 bg-amber-400/5 p-3">
            <p className="text-[10px] font-semibold text-amber-200">Melhorias sugeridas</p>
            {job.scoreNotes.map((note) => (
              <p key={note} className="mt-1 text-[10px] leading-4 text-slate-500">
                • {note}
              </p>
            ))}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="border-white/10 bg-white/5"
            onClick={() => onOpenEditor(job)}
          >
            <Film /> Montar no editor
          </Button>
          <Button onClick={() => onChange({ status: nextStatus(job.status) })}>
            <Play /> Avançar
          </Button>
        </div>
        {job.approvalStatus === "pending" && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="border-amber-400/20 text-amber-200"
              onClick={() => onChange({ approvalStatus: "changes-requested" })}
            >
              Pedir ajustes
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-500"
              onClick={() => onChange({ approvalStatus: "approved", status: "queued" })}
            >
              Aprovar e enfileirar
            </Button>
          </div>
        )}
        <Button variant="ghost" className="w-full text-rose-300" onClick={onRemove}>
          <Trash2 /> Remover
        </Button>
      </div>
    </Panel>
  );
}

function Empty({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: typeof Library;
  title: string;
  text: string;
  action?: () => void;
}) {
  return (
    <div className="py-12 text-center">
      <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-white/5 text-slate-600">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 text-sm font-semibold text-slate-300">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-[11px] leading-5 text-slate-500">{text}</p>
      {action && (
        <Button size="sm" className="mt-4" onClick={action}>
          <Plus /> Adicionar
        </Button>
      )}
    </div>
  );
}

function MediaPreview({ item }: { item: MediaCatalogItem }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!item.file) return;
    const next = URL.createObjectURL(item.file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [item.file]);
  if (!url)
    return (
      <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/10 to-cyan-500/5">
        <Film className="size-6 text-slate-600" />
      </div>
    );
  if (item.kind === "image")
    return <img src={url} alt="" className="aspect-video w-full rounded-lg object-cover" />;
  if (item.kind === "video")
    return (
      <video src={url} muted playsInline className="aspect-video w-full rounded-lg object-cover" />
    );
  return (
    <div className="flex aspect-video items-center justify-center rounded-lg bg-cyan-500/5">
      <Play className="size-6 text-cyan-700" />
    </div>
  );
}

function LearningCard({
  title,
  items,
  empty,
  tone,
}: {
  title: string;
  items: string[];
  empty: string;
  tone: "emerald" | "cyan" | "amber";
}) {
  const colors = {
    emerald: "border-emerald-400/15 bg-emerald-400/5 text-emerald-200",
    cyan: "border-cyan-400/15 bg-cyan-400/5 text-cyan-200",
    amber: "border-amber-400/15 bg-amber-400/5 text-amber-200",
  };
  return (
    <section className={`rounded-xl border p-4 ${colors[tone]}`}>
      <h3 className="text-xs font-semibold">{title}</h3>
      <div className="mt-3 space-y-2">
        {(items.length ? items : [empty]).map((item, index) => (
          <p key={`${item}-${index}`} className="text-[10px] leading-4 text-slate-400">
            {items.length ? "• " : ""}
            {item}
          </p>
        ))}
      </div>
    </section>
  );
}

async function inspectMediaFile(file: File, kind: MediaCatalogItem["kind"]) {
  if (kind === "audio") {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);
    try {
      audio.preload = "metadata";
      audio.src = url;
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => resolve();
        audio.onerror = () => resolve();
      });
      return {
        duration: Number.isFinite(audio.duration) ? audio.duration : 0,
        orientation: "unknown" as const,
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  const element = document.createElement(kind === "image" ? "img" : "video");
  const url = URL.createObjectURL(file);
  try {
    if (element instanceof HTMLVideoElement) element.preload = "metadata";
    element.src = url;
    await new Promise<void>((resolve) => {
      if (element instanceof HTMLImageElement) {
        element.onload = () => resolve();
        element.onerror = () => resolve();
      } else {
        element.onloadedmetadata = () => resolve();
        element.onerror = () => resolve();
      }
    });
    const width = element instanceof HTMLImageElement ? element.naturalWidth : element.videoWidth;
    const height =
      element instanceof HTMLImageElement ? element.naturalHeight : element.videoHeight;
    const ratio = width / Math.max(1, height);
    const orientation: MediaCatalogItem["orientation"] =
      Math.abs(ratio - 1) < 0.12 ? "square" : ratio < 1 ? "vertical" : "horizontal";
    return {
      duration:
        element instanceof HTMLVideoElement && Number.isFinite(element.duration)
          ? element.duration
          : 0,
      orientation,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function suggestSceneDescription(filename: string) {
  const text = filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .toLowerCase();
  const details = [
    /m[aã]o|hand/.test(text) ? "mão mostrando produto" : "",
    /tecido|fabric/.test(text) ? "detalhe do tecido" : "",
    /mesa|table/.test(text) ? "produto sobre mesa" : "",
    /close|macro|detalhe/.test(text) ? "close de detalhe" : "",
    /uso|demo|teste/.test(text) ? "demonstração de uso" : "",
  ].filter(Boolean);
  return details.length ? details.join(" · ") : `Cena identificada como ${text}`;
}

function nextStatus(status: DailyJobStatus): DailyJobStatus {
  if (status === "failed") return "queued";
  if (status === "rendering") return "ready";
  const order: DailyJobStatus[] = [
    "idea",
    "script",
    "recording",
    "editing",
    "queued",
    "ready",
    "scheduled",
    "published",
  ];
  return order[Math.min(order.length - 1, Math.max(0, order.indexOf(status) + 1))]!;
}

async function createEditorProjectForJob(
  job: DailyVideoJob,
  sources: MediaCatalogItem[],
): Promise<VideoEditorProject> {
  const segments: EditorSegment[] = [];
  for (const [index, source] of sources.entries()) {
    const file = source.file!;
    const duration = await getVideoDuration(file);
    const selectedDuration = Math.min(duration, Math.max(2, job.duration / sources.length));
    segments.push({
      id: `daily-clip-${crypto.randomUUID()}`,
      label: source.name.replace(/\.[^.]+$/, ""),
      group: index === 0 ? "hook" : index === sources.length - 1 ? "cta" : "body",
      file,
      start: 0,
      end: selectedDuration,
      duration,
      mute: false,
      playbackRate: 1,
      volume: 100,
      mirror: false,
      brightness: 0,
      contrast: 1,
      saturation: 1,
      fadeIn: 0,
      fadeOut: 0,
      animationIn: "none",
      animationOut: "none",
      animationDuration: 0.25,
      transition: "fade",
      transitionDuration: 0.18,
      audioDetached: false,
      hideOverlay: false,
      overlayPosition: "top-right",
      overlayWidth: 18,
      overlayHeight: 8,
    });
  }
  const duration = segments.reduce((sum, segment) => sum + (segment.end - segment.start), 0);
  return {
    name: job.title,
    segments,
    timelineIds: segments.map((segment) => segment.id),
    textOverlays: transcriptToCaptions(`${job.hook} ${job.body} ${job.cta}`, duration),
    audioLayers: [],
    removeAudio: false,
    stripMetadata: true,
    width: 720,
    exportFormat: "9x16-720",
    updatedAt: Date.now(),
  };
}
