import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  CheckCircle2,
  Download,
  Film,
  Loader2,
  Scissors,
  Trash2,
  Volume2,
  VolumeX,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  combinations,
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

const initialSegments = (): EditorSegment[] => [
  ...Array.from({ length: 4 }, (_, index) => ({
    id: `hook-${index + 1}`,
    label: `Gancho ${index + 1}`,
    group: "hook" as const,
    file: null,
    start: 0,
    end: 8,
    duration: 8,
    mute: false,
  })),
  ...Array.from({ length: 4 }, (_, index) => [
    {
      id: `body-${index + 1}-a`,
      label: `Corpo ${index + 1} · Cena 1`,
      group: "body" as const,
      file: null,
      start: 0,
      end: 8,
      duration: 8,
      mute: false,
    },
    {
      id: `body-${index + 1}-b`,
      label: `Corpo ${index + 1} · Cena 2`,
      group: "body" as const,
      file: null,
      start: 0,
      end: 8,
      duration: 8,
      mute: false,
    },
  ]).flat(),
  ...Array.from({ length: 3 }, (_, index) => ({
    id: `cta-${index + 1}`,
    label: `CTA ${index + 1}`,
    group: "cta" as const,
    file: null,
    start: 0,
    end: 8,
    duration: 8,
    mute: false,
  })),
];

function VideoEditorPage() {
  const [segments, setSegments] = useState(initialSegments);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [width, setWidth] = useState<720 | 1080>(720);
  const [phase, setPhase] = useState<"idle" | "loading" | "normalizing" | "rendering">("idle");
  const [progress, setProgress] = useState("");
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const normalizedRef = useRef(new Map<string, string>());
  const cancelRef = useRef(false);

  useEffect(() => () => disposeVideoEngine(), []);

  const uploadedCount = segments.filter((segment) => segment.file).length;
  const allReady = uploadedCount === segments.length;
  const groups = useMemo(
    () => [
      { key: "hook", title: "4 ganchos", description: "Uma cena de 8 segundos por gancho" },
      { key: "body", title: "4 corpos", description: "Duas cenas de 8 segundos por corpo" },
      { key: "cta", title: "3 CTAs", description: "Uma cena de 8 segundos por CTA" },
    ] as const,
    [],
  );

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
      await prepareSegments();
      for (const combination of combinations) {
        if (cancelRef.current) break;
        setPhase("rendering");
        setProgress(`Gerando vídeo ${combination.number} de 48 · ${combination.label}`);
        await renderAndDownload(combination, true);
      }
      toast.success(cancelRef.current ? "Lote interrompido." : "As 48 combinações foram processadas.");
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
    setSegments(initialSegments());
    setCompleted(new Set());
    setProgress("");
    setPhase("idle");
    toast.success("Arquivos temporários removidos.");
  };

  const busy = phase !== "idle";

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Produção em escala</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Editor de vídeos randomizado</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Envie os 15 clipes modulares e monte 48 vídeos diferentes. Todo o processamento acontece no seu navegador; nenhum vídeo é enviado ou salvo no banco.
          </p>
        </div>
        <Badge variant="outline" className="w-fit px-3 py-1.5">{uploadedCount}/15 arquivos enviados</Badge>
      </header>

      <section className="surface-card grid gap-5 p-5 md:grid-cols-3 md:p-6">
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
          {removeAudio ? <VolumeX className="text-primary" /> : <Volume2 className="text-primary" />}
          Remover o áudio de todos os vídeos
        </label>
        <div className="flex items-end gap-2">
          <Button variant="outline" className="w-full" disabled={busy && phase !== "rendering"} onClick={resetEditor}>
            <Trash2 /> Limpar tudo
          </Button>
        </div>
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
                  />
                ))}
            </div>
          </div>
        ))}
      </section>

      {busy && (
        <section className="glass-card border-primary/25 p-5">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin text-primary" />
            <div className="flex-1">
              <p className="text-sm font-semibold">Processando localmente</p>
              <p className="mt-1 text-xs text-muted-foreground">{progress}</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => { cancelRef.current = true; }}>
              Parar após este vídeo
            </Button>
          </div>
        </section>
      )}

      <section className="surface-card space-y-5 p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">48 combinações disponíveis</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              O primeiro processamento prepara os 15 clipes; depois, as combinações são montadas rapidamente e descartadas após o download.
            </p>
          </div>
          <Button variant="hero" disabled={!allReady || busy} onClick={() => void renderAll()}>
            {busy ? <Loader2 className="animate-spin" /> : <Wand2 />}
            Gerar e baixar as 48
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
              {completed.has(combination.number) ? <CheckCircle2 className="size-4 text-emerald-400" /> : <Download className="size-4 text-muted-foreground" />}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-secondary/20 p-5 text-xs leading-5 text-muted-foreground">
        <Film className="mb-2 size-5 text-primary" />
        Para o lote automático, o navegador pode pedir permissão para vários downloads. Mantenha esta aba aberta durante o processamento. Ao limpar ou fechar a página, os arquivos temporários são eliminados da memória.
      </section>
    </div>
  );
}

function SegmentCard({
  segment,
  disabled,
  onFile,
  onChange,
}: {
  segment: EditorSegment;
  disabled: boolean;
  onFile: (file: File | null) => void;
  onChange: (patch: Partial<EditorSegment>) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/15 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{segment.label}</p>
        {segment.file && <CheckCircle2 className="size-4 text-emerald-400" />}
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
            onChange={(event) => onChange({ start: Math.max(0, Number(event.target.value)) })}
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
            onChange={(event) => onChange({ end: Math.min(segment.duration, Number(event.target.value)) })}
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
    </div>
  );
}
