import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Eye,
  Film,
  Loader2,
  Scissors,
  Trash2,
  Volume2,
  VolumeX,
  Archive,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createCombinations,
  disposeVideoEngine,
  downloadVideo,
  getVideoDuration,
  loadVideoEngine,
  normalizeSegment,
  renderCombination,
  type EditorCombination,
  type EditorSegment,
} from "@/features/video-editor/engine";

export const Route = createFileRoute("/_authenticated/video-editor")({
  component: VideoEditorPage,
  head: () => ({ meta: [{ title: "Editor de vídeos — Tik Supremo" }] }),
});

const makeSegment = (id: string, label: string, group: EditorSegment["group"]): EditorSegment => ({
  id,
  label,
  group,
  file: null,
  start: 0,
  end: 8,
  duration: 8,
  mute: false,
  playbackRate: 1,
  volume: 100,
  mirror: false,
  brightness: 0,
  contrast: 1,
  saturation: 1,
  fadeIn: 0,
  fadeOut: 0,
  hideOverlay: false,
  overlayPosition: "top-right",
  overlayWidth: 18,
  overlayHeight: 8,
});

const initialSegments = (hookCount = 4, bodyCount = 4, ctaCount = 3): EditorSegment[] => [
  ...Array.from({ length: hookCount }, (_, index) =>
    makeSegment(`hook-${index + 1}`, `Gancho ${index + 1}`, "hook"),
  ),
  ...Array.from({ length: bodyCount }, (_, index) => [
    makeSegment(`body-${index + 1}-a`, `Corpo ${index + 1} · Cena 1`, "body"),
    makeSegment(`body-${index + 1}-b`, `Corpo ${index + 1} · Cena 2`, "body"),
  ]).flat(),
  ...Array.from({ length: ctaCount }, (_, index) =>
    makeSegment(`cta-${index + 1}`, `CTA ${index + 1}`, "cta"),
  ),
];

function VideoEditorPage() {
  const [hookCount, setHookCount] = useState(4);
  const [bodyCount, setBodyCount] = useState(4);
  const [ctaCount, setCtaCount] = useState(3);
  const [segments, setSegments] = useState(initialSegments);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [width, setWidth] = useState<720 | 1080>(720);
  const [phase, setPhase] = useState<"idle" | "loading" | "normalizing" | "rendering">("idle");
  const [progress, setProgress] = useState("");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [showTimeline, setShowTimeline] = useState(true);
  const [timelineCombination, setTimelineCombination] = useState(0);
  const [previewSegmentId, setPreviewSegmentId] = useState<string | null>(null);
  const normalizedRef = useRef(new Map<string, string>());
  const cancelRef = useRef(false);

  useEffect(() => () => disposeVideoEngine(), []);

  const uploadedCount = segments.filter((segment) => segment.file).length;
  const allReady = uploadedCount === segments.length;
  const combinations = useMemo(
    () => createCombinations(hookCount, bodyCount, ctaCount),
    [hookCount, bodyCount, ctaCount],
  );
  const selectedTimelineCombination =
    combinations[Math.min(timelineCombination, combinations.length - 1)];
  const timelineIds = selectedTimelineCombination
    ? [
        `hook-${selectedTimelineCombination.hook + 1}`,
        `body-${selectedTimelineCombination.body + 1}-a`,
        `body-${selectedTimelineCombination.body + 1}-b`,
        `cta-${selectedTimelineCombination.cta + 1}`,
      ]
    : [];
  const previewSegment = segments.find((segment) => segment.id === previewSegmentId);
  const previewUrl = useMemo(
    () => (previewSegment?.file ? URL.createObjectURL(previewSegment.file) : ""),
    [previewSegment?.file],
  );
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const groups = useMemo(
    () =>
      [
        {
          key: "hook",
          title: `${hookCount} ganchos`,
          description: "Uma cena de 8 segundos por gancho",
        },
        {
          key: "body",
          title: `${bodyCount} corpos`,
          description: "Duas cenas de 8 segundos por corpo",
        },
        { key: "cta", title: `${ctaCount} CTAs`, description: "Uma cena de 8 segundos por CTA" },
      ] as const,
    [hookCount, bodyCount, ctaCount],
  );

  const changeStructure = (next: { hooks?: number; bodies?: number; ctas?: number }) => {
    const nextHookCount = next.hooks ?? hookCount;
    const nextBodyCount = next.bodies ?? bodyCount;
    const nextCtaCount = next.ctas ?? ctaCount;
    setHookCount(nextHookCount);
    setBodyCount(nextBodyCount);
    setCtaCount(nextCtaCount);
    setSegments((current) =>
      initialSegments(nextHookCount, nextBodyCount, nextCtaCount).map(
        (segment) => current.find((existing) => existing.id === segment.id) ?? segment,
      ),
    );
    normalizedRef.current = new Map();
    setCompleted(new Set());
    setTimelineCombination(0);
    setPreviewSegmentId(null);
  };

  const updateSegment = (id: string, patch: Partial<EditorSegment>) => {
    normalizedRef.current = new Map();
    setCompleted(new Set());
    setSegments((current) =>
      current.map((segment) => (segment.id === id ? { ...segment, ...patch } : segment)),
    );
  };

  const selectFile = async (id: string, file: File | null) => {
    if (!file) return updateSegment(id, { file: null });
    try {
      const duration = await getVideoDuration(file);
      updateSegment(id, { file, duration, start: 0, end: Math.min(8, duration) });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível ler o vídeo.");
    }
  };

  const prepareSegments = async () => {
    if (!allReady) throw new Error(`Envie os ${segments.length} arquivos antes de gerar.`);
    setPhase("loading");
    setProgress("Carregando o editor local pela primeira vez...");
    const ffmpeg = await loadVideoEngine();
    if (normalizedRef.current.size === segments.length) return ffmpeg;
    normalizedRef.current = new Map();
    setPhase("normalizing");
    for (const [index, segment] of segments.entries()) {
      if (cancelRef.current) throw new Error("Processamento cancelado.");
      setProgress(`Preparando cena ${index + 1} de ${segments.length}: ${segment.label}`);
      const output = await normalizeSegment(ffmpeg, segment, { removeAudio, width });
      normalizedRef.current.set(segment.id, output);
    }
    return ffmpeg;
  };

  const renderAndDownload = async (combination: EditorCombination, keepBusy = false) => {
    try {
      cancelRef.current = false;
      const ffmpeg = await prepareSegments();
      setPhase("rendering");
      setProgress(`Montando ${combination.label}...`);
      const output = await renderCombination(ffmpeg, combination, normalizedRef.current);
      downloadVideo(output.blob, output.filename);
      setCompleted((current) => new Set(current).add(combination.number));
      if (!keepBusy) toast.success(`Vídeo ${combination.number} gerado e baixado.`);
    } finally {
      if (!keepBusy) {
        setPhase("idle");
        setProgress("");
      }
    }
  };

  const renderAll = async () => {
    try {
      cancelRef.current = false;
      const ffmpeg = await prepareSegments();
      const { Zip, ZipPassThrough } = await import("fflate");
      const chunks: Uint8Array[] = [];
      let generatedCount = 0;
      const archivePromise = new Promise<Blob>((resolve, reject) => {
        const archive = new Zip((error, data, final) => {
          if (error) {
            reject(error);
            return;
          }
          chunks.push(data);
          if (final) {
            resolve(
              new Blob(
                chunks.map((chunk) => chunk.slice().buffer as ArrayBuffer),
                { type: "application/zip" },
              ),
            );
          }
        });

        void (async () => {
          try {
            for (const combination of combinations) {
              if (cancelRef.current) break;
              setPhase("rendering");
              setProgress(
                `Gerando vídeo ${combination.number} de ${combinations.length} · ${combination.label}`,
              );
              const output = await renderCombination(ffmpeg, combination, normalizedRef.current);
              const entry = new ZipPassThrough(output.filename);
              archive.add(entry);
              entry.push(new Uint8Array(await output.blob.arrayBuffer()), true);
              generatedCount += 1;
              setCompleted((current) => new Set(current).add(combination.number));
            }
            archive.end();
          } catch (cause) {
            archive.terminate();
            reject(cause);
          }
        })();
      });

      const archive = await archivePromise;
      if (generatedCount > 0) {
        downloadVideo(archive, `tik-supremo-${generatedCount}-videos.zip`);
      }
      toast.success(
        cancelRef.current
          ? `${generatedCount} vídeos foram reunidos em um ZIP antes da interrupção.`
          : `${generatedCount} vídeos foram reunidos em um único ZIP.`,
      );
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível gerar o lote.");
    } finally {
      setPhase("idle");
      setProgress("");
    }
  };

  const resetEditor = () => {
    cancelRef.current = true;
    disposeVideoEngine();
    normalizedRef.current = new Map();
    setSegments(initialSegments(hookCount, bodyCount, ctaCount));
    setCompleted(new Set());
    setProgress("");
    setPhase("idle");
    toast.success("Arquivos temporários removidos.");
  };

  const busy = phase !== "idle";
  const progressPercent =
    phase === "rendering"
      ? Math.round((completed.size / combinations.length) * 100)
      : phase === "normalizing"
        ? Math.round((normalizedRef.current.size / segments.length) * 100)
        : phase === "loading"
          ? 3
          : 0;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      <header className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-background to-violet-500/10 p-6 shadow-2xl shadow-primary/5 md:p-8">
        <div className="absolute -right-24 -top-24 size-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Estúdio de variações
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Editor de vídeos randomizado
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Combine ganchos, corpos e CTAs em escala, faça os ajustes finais e baixe tudo em um
              único ZIP. O processamento acontece no seu navegador e não ocupa o banco de dados.
            </p>
          </div>
          <Badge variant="outline" className="w-fit bg-background/60 px-3 py-1.5 backdrop-blur">
            {uploadedCount}/{segments.length} arquivos enviados
          </Badge>
        </div>
        <div className="relative mt-6 grid gap-3 sm:grid-cols-4">
          <Metric label="Ganchos" value={hookCount} />
          <Metric label="Corpos" value={bodyCount} />
          <Metric label="CTAs" value={ctaCount} />
          <Metric label="Vídeos finais" value={combinations.length} accent />
        </div>
      </header>

      <section className="surface-card space-y-5 p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <SlidersHorizontal className="size-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold">Estrutura e saída</h2>
            <p className="text-xs text-muted-foreground">
              Escolha a quantidade de módulos. Cada corpo usa duas cenas.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <CountControl
            label="Ganchos"
            value={hookCount}
            disabled={busy}
            onChange={(value) => changeStructure({ hooks: value })}
          />
          <CountControl
            label="Corpos"
            value={bodyCount}
            disabled={busy}
            onChange={(value) => changeStructure({ bodies: value })}
          />
          <CountControl
            label="CTAs"
            value={ctaCount}
            disabled={busy}
            onChange={(value) => changeStructure({ ctas: value })}
          />
        </div>
        <div className="grid gap-5 border-t border-border/70 pt-5 md:grid-cols-3">
          <label className="space-y-2 text-sm font-medium">
            Qualidade de saída
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={width}
              disabled={busy}
              onChange={(event) => {
                normalizedRef.current = new Map();
                setWidth(Number(event.target.value) as 720 | 1080);
              }}
            >
              <option value="720">720 × 1280 · mais rápido</option>
              <option value="1080">1080 × 1920 · maior qualidade</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4 text-sm">
            <input
              type="checkbox"
              className="size-4"
              checked={removeAudio}
              disabled={busy}
              onChange={(event) => {
                normalizedRef.current = new Map();
                setRemoveAudio(event.target.checked);
              }}
            />
            {removeAudio ? (
              <VolumeX className="text-primary" />
            ) : (
              <Volume2 className="text-primary" />
            )}
            Remover o áudio de todos os vídeos
          </label>
          <div className="flex items-end gap-2">
            <Button variant="outline" className="w-full" disabled={busy} onClick={resetEditor}>
              <Trash2 /> Limpar tudo
            </Button>
          </div>
        </div>
        {combinations.length > 100 && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
            Este lote tem {combinations.length} vídeos. Para reduzir o uso de memória e o tempo de
            processamento, prefira gerar em lotes menores.
          </p>
        )}
      </section>

      <section className="space-y-6">
        {groups.map((group) => (
          <div key={group.key} className="surface-card p-5 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {segments
                .filter((segment) => segment.group === group.key)
                .map((segment) => (
                  <SegmentCard
                    key={segment.id}
                    segment={segment}
                    disabled={busy}
                    onFile={(file) => void selectFile(segment.id, file)}
                    onChange={(patch) => updateSegment(segment.id, patch)}
                    onPreview={() => setPreviewSegmentId(segment.id)}
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      <section className="surface-card space-y-5 overflow-hidden p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Eye className="size-4" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Linha do tempo</h2>
              <p className="text-xs text-muted-foreground">
                Visualize a sequência de 32 segundos antes de renderizar.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTimeline((current) => !current)}
          >
            <Eye /> {showTimeline ? "Ocultar linha do tempo" : "Mostrar linha do tempo"}
          </Button>
        </div>

        {showTimeline && selectedTimelineCombination && (
          <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
            <div className="min-w-0 space-y-4">
              <label className="block max-w-md space-y-2 text-xs font-medium text-muted-foreground">
                Combinação para visualizar
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground"
                  value={timelineCombination}
                  onChange={(event) => {
                    setTimelineCombination(Number(event.target.value));
                    setPreviewSegmentId(null);
                  }}
                >
                  {combinations.map((combination, index) => (
                    <option key={combination.number} value={index}>
                      Vídeo {combination.number} · {combination.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="overflow-x-auto pb-2">
                <div className="flex min-w-[680px] gap-1 rounded-2xl border border-border bg-black/20 p-3">
                  {timelineIds.map((id, index) => {
                    const segment = segments.find((item) => item.id === id);
                    const colors = [
                      "bg-fuchsia-500/20 border-fuchsia-400/35",
                      "bg-blue-500/20 border-blue-400/35",
                      "bg-blue-500/20 border-blue-400/35",
                      "bg-emerald-500/20 border-emerald-400/35",
                    ];
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPreviewSegmentId(id)}
                        className={`group relative h-24 flex-1 overflow-hidden rounded-xl border p-3 text-left transition hover:-translate-y-0.5 ${colors[index]}`}
                      >
                        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                          {index * 8}s — {(index + 1) * 8}s
                        </span>
                        <span className="mt-2 block text-xs font-semibold">{segment?.label}</span>
                        <span className="mt-1 block truncate text-[10px] text-muted-foreground">
                          {segment?.file?.name ?? "Aguardando vídeo"}
                        </span>
                        <span className="absolute bottom-0 left-0 h-1 w-full bg-current opacity-30" />
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>00:00</span>
                <span>Duração final: 00:32</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-black">
              {previewUrl ? (
                <video
                  key={previewUrl}
                  src={previewUrl}
                  controls
                  className="aspect-[9/16] max-h-[430px] w-full object-contain"
                />
              ) : (
                <button
                  type="button"
                  className="flex aspect-[9/16] max-h-[430px] w-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-secondary/70 to-black text-muted-foreground"
                  onClick={() => timelineIds[0] && setPreviewSegmentId(timelineIds[0])}
                >
                  <Film className="size-8" />
                  <span className="max-w-40 text-center text-xs">
                    Clique em uma cena da linha do tempo para visualizar
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </section>

      {busy && (
        <section className="glass-card border-primary/25 p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Processando localmente</p>
              <p className="mt-1 text-xs text-muted-foreground">{progress}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                cancelRef.current = true;
              }}
            >
              Parar após este vídeo
            </Button>
          </div>
          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-300"
              style={{ width: `${Math.max(3, progressPercent)}%` }}
            />
          </div>
        </section>
      )}

      <section className="surface-card space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">{combinations.length} combinações disponíveis</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              O primeiro processamento prepara os {segments.length} clipes; depois, todos os vídeos
              são reunidos em um arquivo ZIP e descartados da memória.
            </p>
          </div>
          <Button variant="hero" disabled={!allReady || busy} onClick={() => void renderAll()}>
            {busy ? <Loader2 className="animate-spin" /> : <Archive />}
            Gerar ZIP com {combinations.length}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {combinations.map((combination) => (
            <button
              key={combination.number}
              type="button"
              disabled={!allReady || busy}
              onClick={() => void renderAndDownload(combination)}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/[0.05] disabled:opacity-50"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {combination.number}
              </span>
              <span className="min-w-0 flex-1 text-xs font-medium">{combination.label}</span>
              {completed.has(combination.number) ? (
                <CheckCircle2 className="size-4 text-emerald-400" />
              ) : (
                <Download className="size-4 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-xl border border-border bg-secondary/20 p-5 text-xs leading-5 text-muted-foreground">
        <Film className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>
          O lote completo gera apenas um download em formato ZIP. Mantenha esta aba aberta durante o
          processamento. Ao limpar ou fechar a página, os arquivos temporários são eliminados da
          memória.
        </p>
      </section>
    </div>
  );
}

function SegmentCard({
  segment,
  disabled,
  onFile,
  onChange,
  onPreview,
}: {
  segment: EditorSegment;
  disabled: boolean;
  onFile: (file: File | null) => void;
  onChange: (patch: Partial<EditorSegment>) => void;
  onPreview: () => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-secondary/15 p-4 transition-colors hover:border-primary/20">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{segment.label}</p>
        <div className="flex items-center gap-1">
          {segment.file && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={disabled}
              onClick={onPreview}
              title="Visualizar clipe"
            >
              <Eye className="size-3.5" />
            </Button>
          )}
          {segment.file && <CheckCircle2 className="size-4 text-emerald-400" />}
        </div>
      </div>
      <Input
        className="mt-3"
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        disabled={disabled}
        onChange={(event) => onFile(event.target.files?.[0] ?? null)}
      />
      <p className="mt-2 truncate text-[11px] text-muted-foreground">
        {segment.file?.name ?? "Nenhum vídeo selecionado"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <label className="text-[11px] text-muted-foreground">
          Início
          <Input
            className="mt-1 h-8"
            type="number"
            min="0"
            max={segment.duration}
            step="0.1"
            disabled={disabled || !segment.file}
            value={segment.start}
            onChange={(event) => {
              const start = Math.min(
                Math.max(0, Number(event.target.value)),
                Math.max(0, segment.duration - 0.1),
              );
              onChange({ start, end: Math.max(segment.end, start + 0.1) });
            }}
          />
        </label>
        <label className="text-[11px] text-muted-foreground">
          Fim
          <Input
            className="mt-1 h-8"
            type="number"
            min={segment.start + 0.1}
            max={segment.duration}
            step="0.1"
            disabled={disabled || !segment.file}
            value={segment.end}
            onChange={(event) =>
              onChange({
                end: Math.max(
                  segment.start + 0.1,
                  Math.min(segment.duration, Number(event.target.value)),
                ),
              })
            }
          />
        </label>
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="checkbox"
          checked={segment.mute}
          disabled={disabled || !segment.file}
          onChange={(event) => onChange({ mute: event.target.checked })}
        />
        <Scissors className="size-3.5" /> Silenciar esta cena
      </label>

      <details className="mt-4 border-t border-border/70 pt-3">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-semibold text-primary">
          <SlidersHorizontal className="size-3.5" /> Ajustes profissionais
        </summary>
        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-muted-foreground">
              Velocidade
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.playbackRate}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ playbackRate: Number(event.target.value) })}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                  <option key={rate} value={rate}>
                    {rate}×
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[11px] text-muted-foreground">
              Volume · {segment.volume}%
              <input
                className="mt-2 w-full accent-primary"
                type="range"
                min="0"
                max="200"
                step="5"
                value={segment.volume}
                disabled={disabled || !segment.file || segment.mute}
                onChange={(event) => onChange({ volume: Number(event.target.value) })}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <input
              type="checkbox"
              checked={segment.mirror}
              disabled={disabled || !segment.file}
              onChange={(event) => onChange({ mirror: event.target.checked })}
            />
            Espelhar o vídeo horizontalmente
          </label>

          <RangeControl
            label="Brilho"
            value={segment.brightness}
            display={segment.brightness.toFixed(2)}
            min={-1}
            max={1}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(brightness) => onChange({ brightness })}
          />
          <RangeControl
            label="Contraste"
            value={segment.contrast}
            display={`${segment.contrast.toFixed(2)}×`}
            min={0.5}
            max={2}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(contrast) => onChange({ contrast })}
          />
          <RangeControl
            label="Saturação"
            value={segment.saturation}
            display={`${segment.saturation.toFixed(2)}×`}
            min={0}
            max={2}
            step={0.05}
            disabled={disabled || !segment.file}
            onChange={(saturation) => onChange({ saturation })}
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="text-[11px] text-muted-foreground">
              Entrada suave
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.fadeIn}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ fadeIn: Number(event.target.value) })}
              >
                <option value="0">Sem efeito</option>
                <option value="0.25">0,25 s</option>
                <option value="0.5">0,5 s</option>
                <option value="1">1 s</option>
                <option value="2">2 s</option>
              </select>
            </label>
            <label className="text-[11px] text-muted-foreground">
              Saída suave
              <select
                className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                value={segment.fadeOut}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ fadeOut: Number(event.target.value) })}
              >
                <option value="0">Sem efeito</option>
                <option value="0.25">0,25 s</option>
                <option value="0.5">0,5 s</option>
                <option value="1">1 s</option>
                <option value="2">2 s</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl border border-border bg-background/40 p-3">
            <label className="flex items-start gap-2 text-[11px] font-medium">
              <input
                className="mt-0.5"
                type="checkbox"
                checked={segment.hideOverlay}
                disabled={disabled || !segment.file}
                onChange={(event) => onChange({ hideOverlay: event.target.checked })}
              />
              <span>
                Ocultar marca ou elemento fixo
                <span className="mt-0.5 block font-normal text-muted-foreground">
                  Use somente em conteúdo próprio ou com autorização.
                </span>
              </span>
            </label>
            {segment.hideOverlay && (
              <div className="mt-3 space-y-3">
                <label className="block text-[11px] text-muted-foreground">
                  Posição
                  <select
                    className="mt-1 flex h-8 w-full rounded-md border border-input bg-background px-2 text-xs text-foreground"
                    value={segment.overlayPosition}
                    disabled={disabled}
                    onChange={(event) =>
                      onChange({
                        overlayPosition: event.target.value as EditorSegment["overlayPosition"],
                      })
                    }
                  >
                    <option value="top-left">Superior esquerda</option>
                    <option value="top-right">Superior direita</option>
                    <option value="bottom-left">Inferior esquerda</option>
                    <option value="bottom-right">Inferior direita</option>
                  </select>
                </label>
                <RangeControl
                  label="Largura da área"
                  value={segment.overlayWidth}
                  display={`${segment.overlayWidth}%`}
                  min={5}
                  max={40}
                  step={1}
                  disabled={disabled}
                  onChange={(overlayWidth) => onChange({ overlayWidth })}
                />
                <RangeControl
                  label="Altura da área"
                  value={segment.overlayHeight}
                  display={`${segment.overlayHeight}%`}
                  min={3}
                  max={25}
                  step={1}
                  disabled={disabled}
                  onChange={(overlayHeight) => onChange({ overlayHeight })}
                />
              </div>
            )}
          </div>
        </div>
      </details>
    </div>
  );
}

function CountControl({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="rounded-xl border border-border bg-secondary/15 p-3 text-xs font-medium text-muted-foreground">
      {label}
      <select
        className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-semibold text-foreground"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {Array.from({ length: 8 }, (_, index) => index + 1).map((count) => (
          <option key={count} value={count}>
            {count}
          </option>
        ))}
      </select>
    </label>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-4 backdrop-blur ${accent ? "border-primary/30 bg-primary/15" : "border-border/70 bg-background/45"}`}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

function RangeControl({
  label,
  value,
  display,
  min,
  max,
  step,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-[11px] text-muted-foreground">
      <span className="flex items-center justify-between">
        <span>{label}</span>
        <span className="font-medium text-foreground">{display}</span>
      </span>
      <input
        className="mt-2 w-full accent-primary"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
