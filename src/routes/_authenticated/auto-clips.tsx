import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronRight,
  Clock3,
  Download,
  Film,
  FolderOpen,
  Layers,
  Loader2,
  Play,
  Plus,
  RefreshCw,
  Save,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  WandSparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeVideoLocally, type LocalVideoAnalysis } from "@/features/auto-clips/analyze-local";
import type { AutoClipResult } from "@/features/auto-clips/ai-contract";
import { analyzeAutomaticClips } from "@/features/auto-clips/server";
import {
  disposeVideoEngine,
  downloadVideo,
  loadVideoEngine,
  normalizeSegment,
  renderCombination,
  type EditorSegment,
} from "@/features/video-editor/engine";
import { saveEditorProject } from "@/features/video-editor/project-persistence";

export const Route = createFileRoute("/_authenticated/auto-clips")({
  component: AutomaticClipsPage,
  head: () => ({ meta: [{ title: "Clipes automáticos — Tik Supremo" }] }),
});

type UploadedVideo = { id: string; file: File; url: string };
type TransitionType = EditorSegment["transition"];
type AutomaticClip = AutoClipResult["clips"][number] & {
  transition?: TransitionType;
  transitionDuration?: number;
  mute?: boolean;
};
type AutomaticResult = Omit<AutoClipResult, "clips"> & {
  provider: string;
  clips: AutomaticClip[];
};
type Pacing = "energetic" | "balanced" | "story";

const pacingOptions: Array<{ value: Pacing; label: string; description: string }> = [
  { value: "energetic", label: "Dinâmico", description: "Cortes curtos e mais variação" },
  { value: "balanced", label: "Equilibrado", description: "Ritmo natural e versátil" },
  { value: "story", label: "Narrativo", description: "Ações mais completas" },
];

const transitionOptions: Array<{ value: TransitionType; label: string }> = [
  { value: "fade", label: "Dissolver (Fade)" },
  { value: "fadeblacks", label: "Fade em Preto" },
  { value: "fadewhites", label: "Fade em Branco" },
  { value: "wipeleft", label: "Varredura Esquerda" },
  { value: "wiperight", label: "Varredura Direita" },
  { value: "wipeup", label: "Varredura Cima" },
  { value: "wipedown", label: "Varredura Baixo" },
  { value: "slideleft", label: "Deslizar Esquerda" },
  { value: "slideright", label: "Deslizar Direita" },
  { value: "slideup", label: "Deslizar Cima" },
  { value: "slidedown", label: "Deslizar Baixo" },
  { value: "smoothleft", label: "Deslizar Suave Esquerda" },
  { value: "smoothright", label: "Deslizar Suave Direita" },
  { value: "circleopen", label: "Círculo Abrindo" },
  { value: "circleclose", label: "Círculo Fechando" },
  { value: "pixelize", label: "Pixelizar" },
  { value: "zoomin", label: "Zoom In" },
  { value: "none", label: "Corte Seco (Sem transição)" },
];

function formatDuration(value: number) {
  const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue - minutes * 60;
  return `${minutes}:${seconds.toFixed(safeValue < 60 ? 1 : 0).padStart(safeValue < 60 ? 4 : 2, "0")}`;
}

function editorSegment(
  clip: AutomaticClip,
  source: UploadedVideo,
  index: number,
  total: number,
  defaultTransition: TransitionType = "fade",
  defaultTransitionDuration = 0.6,
  globalMute = false,
): EditorSegment {
  const chosenTransition = clip.transition ?? defaultTransition;
  const isNone = chosenTransition === "none" || index === total - 1;
  return {
    id: `auto-clip-${crypto.randomUUID()}`,
    label: clip.label || `Corte ${index + 1}`,
    group: index === 0 ? "hook" : index === total - 1 ? "cta" : "body",
    file: source.file,
    start: clip.start,
    end: clip.end,
    duration: source.file ? Math.max(clip.end, clip.end - clip.start) : clip.end,
    mute: globalMute || (clip.mute ?? false),
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
    animationDuration: 0.4,
    transition: isNone ? "none" : chosenTransition,
    transitionDuration: isNone ? 0 : (clip.transitionDuration ?? defaultTransitionDuration),
    audioDetached: false,
    hideOverlay: false,
    overlayPosition: "top-right",
    overlayWidth: 18,
    overlayHeight: 8,
  };
}

function AutomaticClipsPage() {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const uploadedRef = useRef<UploadedVideo[]>([]);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [analyses, setAnalyses] = useState<LocalVideoAnalysis[]>([]);
  const [result, setResult] = useState<AutomaticResult | null>(null);
  const [phase, setPhase] = useState<"idle" | "sampling" | "ai">("idle");
  const [progress, setProgress] = useState({ value: 0, label: "" });
  const [targetDuration, setTargetDuration] = useState(30);
  const [pacing, setPacing] = useState<Pacing>("balanced");
  const [globalTransition, setGlobalTransition] = useState<TransitionType>("fade");
  const [transitionDuration, setTransitionDuration] = useState(0.6);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [selectedClip, setSelectedClip] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [renderedUrl, setRenderedUrl] = useState<string | null>(null);
  const busy = phase !== "idle" || exporting;

  useEffect(() => {
    uploadedRef.current = videos;
  }, [videos]);

  useEffect(
    () => () => {
      uploadedRef.current.forEach((video) => URL.revokeObjectURL(video.url));
      disposeVideoEngine();
    },
    [],
  );

  useEffect(
    () => () => {
      if (renderedUrl) URL.revokeObjectURL(renderedUrl);
    },
    [renderedUrl],
  );

  useEffect(() => {
    if (!playing) return;
    setIsTransitioning(true);
    const timer = setTimeout(
      () => setIsTransitioning(false),
      Math.round(transitionDuration * 1000),
    );
    return () => clearTimeout(timer);
  }, [selectedClip, playing, transitionDuration]);

  const timelineDuration = useMemo(
    () => result?.clips.reduce((total, clip) => total + Math.max(0, clip.end - clip.start), 0) ?? 0,
    [result],
  );
  const activeClip = result?.clips[selectedClip];
  const activeSource = videos.find((video) => video.id === activeClip?.videoId);

  useEffect(() => {
    const player = videoRef.current;
    if (!player || !activeClip) return;
    player.muted = Boolean(removeAudio || activeClip.mute);
    if (Math.abs(player.currentTime - activeClip.start) > 0.15) {
      player.currentTime = activeClip.start;
    }
    if (playing) {
      void player.play().catch(() => setPlaying(false));
    }
  }, [selectedClip, activeSource?.id, activeClip?.start, activeClip?.mute, removeAudio, playing]);

  const resetResult = () => {
    setResult(null);
    setAnalyses([]);
    setSelectedClip(0);
    setPlaying(false);
    setSaved(false);
    setRenderedUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  };

  const addFiles = (files: File[]) => {
    const accepted = files.filter((file) => file.type.startsWith("video/"));
    if (!accepted.length) {
      toast.error("Escolha arquivos de vídeo válidos.");
      return;
    }
    const existing = new Set(
      videos.map((video) => `${video.file.name}-${video.file.size}-${video.file.lastModified}`),
    );
    const unique = accepted.filter(
      (file) => !existing.has(`${file.name}-${file.size}-${file.lastModified}`),
    );
    const available = Math.max(0, 6 - videos.length);
    const next = unique.slice(0, available).map((file) => ({
      id: `video-${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    if (unique.length > available) toast.warning("É possível analisar até 6 vídeos por projeto.");
    if (!next.length) return;
    setVideos((current) => [...current, ...next]);
    resetResult();
  };

  const removeVideo = (id: string) => {
    setVideos((current) => {
      const removed = current.find((video) => video.id === id);
      if (removed) URL.revokeObjectURL(removed.url);
      return current.filter((video) => video.id !== id);
    });
    resetResult();
  };

  const runAnalysis = async () => {
    if (!videos.length) return;
    try {
      setSaved(false);
      setResult(null);
      setSelectedClip(0);
      setPhase("sampling");
      const completed: LocalVideoAnalysis[] = [];
      for (const [videoIndex, source] of videos.entries()) {
        const analysis = await analyzeVideoLocally(source.file, source.id, 9, (frame, total) => {
          const ratio = (videoIndex + frame / total) / videos.length;
          setProgress({
            value: ratio * 58,
            label: `Lendo cenas de ${source.file.name} · frame ${frame}/${total}`,
          });
        });
        completed.push(analysis);
      }
      setAnalyses(completed);
      setPhase("ai");
      setProgress({ value: 68, label: "A IA está comparando ações, qualidade e ritmo..." });
      const selection = await analyzeAutomaticClips({
        data: {
          targetDuration,
          pacing,
          videos: completed.map((video) => ({
            id: video.id,
            name: video.name,
            duration: video.duration,
            width: video.width,
            height: video.height,
            contactSheet: video.contactSheet,
            samples: video.samples.map((sample) => ({
              id: sample.id,
              time: sample.time,
              brightness: sample.brightness,
              contrast: sample.contrast,
              sharpness: sample.sharpness,
              motion: sample.motion,
              quality: sample.quality,
            })),
          })),
        },
      });
      setProgress({ value: 100, label: "Timeline pronta" });
      setResult(selection);
      toast.success(`${selection.clips.length} melhores cortes foram reunidos em uma timeline.`);
    } catch (cause) {
      console.error("[Auto Clips] Falha na análise:", cause);
      toast.error(cause instanceof Error ? cause.message : "Não foi possível analisar os vídeos.");
    } finally {
      setPhase("idle");
    }
  };

  const selectTimelineClip = (index: number) => {
    setPlaying(false);
    setSelectedClip(index);
  };

  const togglePlayback = async () => {
    const player = videoRef.current;
    if (!player || !activeClip) return;
    if (playing) {
      player.pause();
      setPlaying(false);
      return;
    }
    if (player.currentTime < activeClip.start || player.currentTime >= activeClip.end - 0.08) {
      player.currentTime = activeClip.start;
    }
    setPlaying(true);
    try {
      await player.play();
    } catch {
      setPlaying(false);
    }
  };

  const advancePreview = () => {
    if (!result || !activeClip) return;
    if (selectedClip < result.clips.length - 1) {
      setSelectedClip((current) => current + 1);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = activeClip.start;
      }
      setPlaying(false);
    }
  };

  const updateClip = (index: number, patch: Partial<AutomaticResult["clips"][number]>) => {
    setSaved(false);
    setRenderedUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
    setResult((current) =>
      current
        ? {
            ...current,
            clips: current.clips.map((clip, clipIndex) =>
              clipIndex === index ? { ...clip, ...patch } : clip,
            ),
          }
        : current,
    );
  };

  const moveClip = (index: number, direction: -1 | 1) => {
    if (!result) return;
    const destination = index + direction;
    if (destination < 0 || destination >= result.clips.length) return;
    const clips = [...result.clips];
    const [clip] = clips.splice(index, 1);
    if (!clip) return;
    clips.splice(destination, 0, clip);
    setResult({ ...result, clips });
    setSelectedClip(destination);
    setSaved(false);
  };

  const deleteClip = (index: number) => {
    if (!result || result.clips.length <= 1) return;
    setResult({ ...result, clips: result.clips.filter((_, clipIndex) => clipIndex !== index) });
    setSelectedClip((current) => Math.min(current, result.clips.length - 2));
    setPlaying(false);
    setSaved(false);
  };

  const buildSegments = () => {
    if (!result) return [];
    return result.clips.flatMap((clip, index) => {
      const source = videos.find((video) => video.id === clip.videoId);
      return source
        ? [
            editorSegment(
              clip,
              source,
              index,
              result.clips.length,
              globalTransition,
              transitionDuration,
              removeAudio,
            ),
          ]
        : [];
    });
  };

  const saveProject = async () => {
    if (!result) return;
    const segments = buildSegments();
    if (!segments.length) return;
    try {
      await saveEditorProject({
        name: result.projectTitle,
        segments,
        timelineIds: segments.map((segment) => segment.id),
        textOverlays: [],
        audioLayers: [],
        removeAudio,
        stripMetadata: true,
        width: 720,
        updatedAt: Date.now(),
      });
      setSaved(true);
      toast.success("Projeto salvo neste dispositivo e pronto para continuar no editor.");
    } catch {
      toast.error("Não foi possível salvar o projeto neste dispositivo.");
    }
  };

  const exportVideo = async () => {
    if (!result) return;
    const segments = buildSegments();
    if (!segments.length) return;
    setExporting(true);
    try {
      setExportProgress("Carregando o motor de vídeo...");
      const ffmpeg = await loadVideoEngine({ onProgress: setExportProgress });
      const normalized = new Map<string, string>();
      for (const [index, segment] of segments.entries()) {
        setExportProgress(`Preparando corte ${index + 1} de ${segments.length}...`);
        const filename = await normalizeSegment(ffmpeg, segment, {
          removeAudio: removeAudio || segment.mute,
          width: 720,
          stripMetadata: true,
        });
        normalized.set(segment.id, filename);
      }
      setExportProgress("Unindo a timeline final com transições...");
      const output = await renderCombination(
        ffmpeg,
        { number: 1, hook: 0, body: 0, cta: 0, label: result.projectTitle },
        normalized,
        {
          segments,
          segmentIds: segments.map((segment) => segment.id),
          textOverlays: [],
          audioLayers: [],
          width: 720,
          removeAudio,
          stripMetadata: true,
        },
      );
      const url = URL.createObjectURL(output.blob);
      setRenderedUrl((current) => {
        if (current) URL.revokeObjectURL(current);
        return url;
      });
      const safeName =
        result.projectTitle.trim().replace(/[^a-z0-9-_]+/gi, "-") || "clipes-automaticos";
      downloadVideo(output.blob, `${safeName}.mp4`);
      toast.success("Vídeo completo gerado e baixado.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível gerar o MP4.");
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] text-slate-100 md:-mx-8 md:-my-10">
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <header className="border-b border-white/10 bg-[#0c0e14]/90 px-5 py-6 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/30 to-cyan-400/10 ring-1 ring-primary/30">
            <WandSparkles className="size-5 text-primary" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
              Edição com IA
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Clipes automáticos
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              A IA encontra os melhores momentos e monta uma única timeline.
            </p>
          </div>
          {videos.length > 0 && (
            <div className="ml-auto flex flex-wrap gap-2">
              <Button
                variant="outline"
                className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                onClick={() => inputRef.current?.click()}
                disabled={busy || videos.length >= 6}
              >
                <Plus /> Adicionar vídeos
              </Button>
              <Button onClick={() => void runAnalysis()} disabled={busy}>
                {phase !== "idle" ? <Loader2 className="animate-spin" /> : <Sparkles />}
                {result ? "Analisar novamente" : "Criar cortes com IA"}
              </Button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        {!videos.length ? (
          <EmptyUpload onFiles={addFiles} onBrowse={() => inputRef.current?.click()} />
        ) : (
          <div className="space-y-5">
            <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
              <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4 md:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold text-white">Vídeos de origem</h2>
                    <p className="mt-1 text-xs text-slate-500">
                      {videos.length}/6 arquivos · somente amostras visuais compactas vão para a IA
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                  >
                    Processamento local
                  </Badge>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((video, index) => {
                    const analysis = analyses.find((item) => item.id === video.id);
                    return (
                      <article
                        key={video.id}
                        className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0b0d13]"
                      >
                        <div className="relative aspect-video bg-black">
                          <video
                            src={video.url}
                            className="h-full w-full object-contain"
                            muted
                            preload="metadata"
                          />
                          <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] font-semibold">
                            V{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVideo(video.id)}
                            disabled={busy}
                            aria-label={`Remover ${video.file.name}`}
                            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-lg bg-black/70 text-slate-300 opacity-0 transition hover:bg-red-500/80 hover:text-white group-hover:opacity-100 focus:opacity-100"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <div className="p-3">
                          <p
                            className="truncate text-xs font-medium text-slate-200"
                            title={video.file.name}
                          >
                            {video.file.name}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {analysis
                              ? `${formatDuration(analysis.duration)} · ${analysis.width}×${analysis.height}`
                              : `${(video.file.size / 1024 / 1024).toFixed(1)} MB`}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>

              <aside className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center gap-2">
                  <Zap className="size-4 text-primary" />
                  <h2 className="text-sm font-semibold text-white">Direção da edição</h2>
                </div>
                <label className="mt-5 block text-[11px] font-medium text-slate-400">
                  Duração desejada
                  <select
                    value={targetDuration}
                    onChange={(event) => setTargetDuration(Number(event.target.value))}
                    disabled={busy}
                    className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#0b0d13] px-3 text-xs text-white outline-none focus:border-primary/50"
                  >
                    {[15, 30, 45, 60, 90].map((duration) => (
                      <option key={duration} value={duration}>
                        {duration} segundos
                      </option>
                    ))}
                  </select>
                </label>
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-medium text-slate-400">Ritmo</p>
                  {pacingOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPacing(option.value)}
                      disabled={busy}
                      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${pacing === option.value ? "border-primary/35 bg-primary/10" : "border-white/10 bg-[#0b0d13] hover:border-white/20"}`}
                    >
                      <span
                        className={`block text-xs font-medium ${pacing === option.value ? "text-primary" : "text-slate-200"}`}
                      >
                        {option.label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-500">
                        {option.description}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-5 space-y-2">
                  <p className="text-[11px] font-medium text-slate-400">Transição entre vídeos</p>
                  <select
                    value={globalTransition}
                    onChange={(event) =>
                      setGlobalTransition(event.target.value as TransitionType)
                    }
                    disabled={busy}
                    className="h-10 w-full rounded-xl border border-white/10 bg-[#0b0d13] px-3 text-xs text-white outline-none focus:border-primary/50"
                  >
                    {transitionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mt-5">
                  <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/10 bg-[#0b0d13] p-3 text-xs text-slate-200 transition hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={removeAudio}
                      onChange={(event) => setRemoveAudio(event.target.checked)}
                      disabled={busy}
                      className="size-4 rounded border-white/20 bg-black text-primary focus:ring-primary/50"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-200">Remover áudio original</span>
                      <span className="block text-[10px] text-slate-500">
                        Exporta o vídeo final sem som
                      </span>
                    </div>
                  </label>
                </div>
              </aside>
            </section>

            {phase !== "idle" && (
              <section className="overflow-hidden rounded-2xl border border-primary/25 bg-primary/[0.07] p-5">
                <div className="flex items-center gap-3">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-4 text-xs">
                      <span className="truncate font-medium text-slate-200">{progress.label}</span>
                      <span className="text-primary">{Math.round(progress.value)}%</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-400 transition-all duration-300"
                        style={{ width: `${progress.value}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {result && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4">
                  <div className="flex gap-3">
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-400/15 text-emerald-300">
                      <Check className="size-4" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm font-semibold text-white">{result.projectTitle}</h2>
                        <Badge
                          variant="outline"
                          className="border-white/10 text-[9px] text-slate-400"
                        >
                          IA · {result.provider}
                        </Badge>
                      </div>
                      <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-400">
                        {result.rationale}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span>{result.clips.length} cortes</span>
                    <span className="flex items-center gap-1">
                      <Clock3 className="size-3.5" /> {formatDuration(timelineDuration)}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[minmax(340px,0.75fr)_minmax(620px,1.5fr)]">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-white">Prévia contínua</h3>
                      <span className="text-[10px] text-slate-500">
                        Corte {selectedClip + 1}/{result.clips.length}
                      </span>
                    </div>
                    <div
                      className={`relative mx-auto aspect-[9/16] max-h-[610px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10 transition-all duration-500 ${
                        isTransitioning
                          ? (activeClip?.transition ?? globalTransition) === "slideleft"
                            ? "-translate-x-4 opacity-50 scale-95"
                            : (activeClip?.transition ?? globalTransition) === "zoomin"
                              ? "scale-90 opacity-50"
                              : (activeClip?.transition ?? globalTransition) === "pixelize"
                                ? "blur-md opacity-40"
                                : "opacity-30 scale-98"
                          : "translate-x-0 scale-100 opacity-100 blur-0"
                      }`}
                    >
                      {renderedUrl ? (
                        <video
                          src={renderedUrl}
                          controls
                          className="h-full w-full object-contain"
                        />
                      ) : activeSource && activeClip ? (
                        <>
                          <video
                            key={activeSource.id}
                            ref={videoRef}
                            src={activeSource.url}
                            className="h-full w-full object-contain"
                            playsInline
                            muted={Boolean(removeAudio || activeClip?.mute)}
                            onLoadedMetadata={(event) => {
                              event.currentTarget.muted = Boolean(removeAudio || activeClip?.mute);
                              event.currentTarget.currentTime = activeClip.start;
                              if (playing) void event.currentTarget.play().catch(() => setPlaying(false));
                            }}
                            onEnded={advancePreview}
                            onTimeUpdate={(event) => {
                              if (event.currentTarget.currentTime >= activeClip.end - 0.05) {
                                advancePreview();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => void togglePlayback()}
                            className="absolute inset-0 flex items-center justify-center bg-black/0 transition hover:bg-black/10"
                            aria-label={playing ? "Pausar prévia" : "Reproduzir prévia"}
                          >
                            {!playing && (
                              <span className="flex size-14 items-center justify-center rounded-full bg-black/65 text-white shadow-xl backdrop-blur">
                                <Play className="ml-1 size-6" />
                              </span>
                            )}
                          </button>
                          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between rounded-xl bg-black/65 px-3 py-2 text-[10px] backdrop-blur">
                            <span className="truncate font-medium text-white">
                              {activeClip.label}
                            </span>
                            <span className="ml-3 shrink-0 text-slate-300">
                              {formatDuration(activeClip.end - activeClip.start)}
                            </span>
                          </div>
                        </>
                      ) : null}
                    </div>
                    {renderedUrl && (
                      <p className="mt-3 text-center text-[10px] text-emerald-300">
                        Esta é a versão MP4 final renderizada.
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 rounded-3xl border border-white/10 bg-white/[0.025] p-4 md:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold text-white">
                          Timeline criada pela IA
                        </h3>
                        <p className="mt-1 text-[10px] text-slate-500">
                          Ajustes são opcionais. Use as setas apenas se quiser mudar a ordem.
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:bg-white/10 hover:text-white"
                        onClick={() => void runAnalysis()}
                        disabled={busy}
                      >
                        <RefreshCw /> Nova versão
                      </Button>
                    </div>

                    <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-[#080a0f] p-2 pb-3">
                      {result.clips.map((clip, index) => {
                        const analysis = analyses.find((item) => item.id === clip.videoId);
                        const center = (clip.start + clip.end) / 2;
                        const sample = analysis?.samples.reduce(
                          (best, item) =>
                            Math.abs(item.time - center) < Math.abs(best.time - center)
                              ? item
                              : best,
                          analysis.samples[0]!,
                        );
                        const width = Math.max(88, Math.min(190, (clip.end - clip.start) * 34));
                        return (
                          <button
                            key={`${clip.videoId}-${index}`}
                            type="button"
                            onClick={() => selectTimelineClip(index)}
                            className={`group relative shrink-0 overflow-hidden rounded-xl border text-left transition ${selectedClip === index ? "border-primary ring-2 ring-primary/20" : "border-white/10 hover:border-white/25"}`}
                            style={{ width }}
                          >
                            <div className="h-20 bg-slate-950">
                              {sample && (
                                <img
                                  src={sample.imageDataUrl}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                            </div>
                            <div
                              className={`px-2 py-2 ${selectedClip === index ? "bg-primary/15" : "bg-white/[0.04]"}`}
                            >
                              <p className="truncate text-[10px] font-medium text-white">
                                {index + 1}. {clip.label}
                              </p>
                              <p className="mt-0.5 text-[9px] text-slate-500">
                                {formatDuration(clip.end - clip.start)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 space-y-2.5">
                      {result.clips.map((clip, index) => {
                        const source = videos.find((video) => video.id === clip.videoId);
                        const analysis = analyses.find((item) => item.id === clip.videoId);
                        return (
                          <article
                            key={`${clip.videoId}-detail-${index}`}
                            onClick={() => selectTimelineClip(index)}
                            className={`grid cursor-pointer gap-3 rounded-2xl border p-3 transition md:grid-cols-[72px_minmax(0,1fr)_240px_auto] md:items-center ${selectedClip === index ? "border-primary/40 bg-primary/[0.07]" : "border-white/10 bg-[#0b0d13] hover:border-white/20"}`}
                          >
                            <div className="relative h-14 overflow-hidden rounded-lg bg-black">
                              {analysis?.samples[0] && (
                                <img
                                  src={
                                    analysis.samples.reduce((best, item) =>
                                      Math.abs(item.time - (clip.start + clip.end) / 2) <
                                      Math.abs(best.time - (clip.start + clip.end) / 2)
                                        ? item
                                        : best,
                                    ).imageDataUrl
                                  }
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              )}
                              <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[8px]">
                                {index + 1}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-xs font-medium text-white">
                                  {clip.label}
                                </p>
                                <Badge
                                  variant="outline"
                                  className="border-primary/20 bg-primary/10 px-1.5 py-0 text-[8px] text-primary"
                                >
                                  {clip.score}
                                </Badge>
                              </div>
                              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-slate-500">
                                {clip.reason}
                              </p>
                              <p className="mt-1 truncate text-[9px] text-slate-600">
                                {source?.file.name}
                              </p>
                            </div>
                            <div
                              className="grid grid-cols-2 gap-2"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <label className="text-[9px] text-slate-500">
                                Início
                                <Input
                                  type="number"
                                  min={0}
                                  max={Math.max(0, (analysis?.duration ?? clip.end) - 0.4)}
                                  step={0.1}
                                  value={clip.start}
                                  onChange={(event) =>
                                    updateClip(index, {
                                      start: Math.min(Number(event.target.value), clip.end - 0.4),
                                    })
                                  }
                                  className="mt-1 h-8 border-white/10 bg-black/25 px-2 text-[10px] text-white"
                                />
                              </label>
                              <label className="text-[9px] text-slate-500">
                                Fim
                                <Input
                                  type="number"
                                  min={clip.start + 0.4}
                                  max={analysis?.duration ?? clip.end}
                                  step={0.1}
                                  value={clip.end}
                                  onChange={(event) =>
                                    updateClip(index, {
                                      end: Math.max(Number(event.target.value), clip.start + 0.4),
                                    })
                                  }
                                  className="mt-1 h-8 border-white/10 bg-black/25 px-2 text-[10px] text-white"
                                />
                              </label>
                              <label className="col-span-2 text-[9px] text-slate-500">
                                Transição
                                <select
                                  value={clip.transition ?? globalTransition}
                                  onChange={(event) =>
                                    updateClip(index, {
                                      transition: event.target.value as TransitionType,
                                    })
                                  }
                                  className="mt-1 h-8 w-full rounded-lg border border-white/10 bg-black/25 px-2 text-[10px] text-white outline-none focus:border-primary/50"
                                >
                                  {transitionOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>
                            <div
                              className="flex gap-1"
                              onClick={(event) => event.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className={`size-8 ${clip.mute ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" : "text-slate-500 hover:bg-white/10 hover:text-white"}`}
                                onClick={() => updateClip(index, { mute: !clip.mute })}
                                title={clip.mute ? "Áudio desativado neste corte" : "Silenciar este corte"}
                              >
                                {clip.mute ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-slate-500 hover:bg-white/10 hover:text-white"
                                disabled={index === 0}
                                onClick={() => moveClip(index, -1)}
                                aria-label="Mover corte para cima"
                              >
                                <ArrowUp className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-slate-500 hover:bg-white/10 hover:text-white"
                                disabled={index === result.clips.length - 1}
                                onClick={() => moveClip(index, 1)}
                                aria-label="Mover corte para baixo"
                              >
                                <ArrowDown className="size-3.5" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="size-8 text-slate-500 hover:bg-red-500/10 hover:text-red-300"
                                disabled={result.clips.length <= 1}
                                onClick={() => deleteClip(index)}
                                aria-label="Excluir corte"
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            </div>
                          </article>
                        );
                      })}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
                      {exportProgress && (
                        <p className="mb-3 flex items-center gap-2 text-[10px] text-primary">
                          <Loader2 className="size-3 animate-spin" /> {exportProgress}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          onClick={() => void saveProject()}
                          disabled={busy}
                          variant={saved ? "outline" : "default"}
                          className={
                            saved ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : ""
                          }
                        >
                          {saved ? <Check /> : <Save />}{" "}
                          {saved ? "Salvo no editor" : "Salvar projeto"}
                        </Button>
                        {saved && (
                          <Button
                            variant="outline"
                            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                            onClick={() => void navigate({ to: "/video-editor" })}
                          >
                            <FolderOpen /> Abrir no editor
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
                          onClick={() => void exportVideo()}
                          disabled={busy}
                        >
                          {exporting ? <Loader2 className="animate-spin" /> : <Download />} Exportar
                          MP4
                        </Button>
                        <span className="ml-auto text-[10px] text-slate-600">
                          720 × 1280 · áudio original · metadados removidos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyUpload({
  onFiles,
  onBrowse,
}: {
  onFiles: (files: File[]) => void;
  onBrowse: () => void;
}) {
  const [dragging, setDragging] = useState(false);
  return (
    <section className="relative flex min-h-[calc(100vh-13rem)] items-center justify-center overflow-hidden py-10">
      <div className="absolute left-[14%] top-[12%] size-80 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute bottom-[5%] right-[8%] size-80 rounded-full bg-cyan-400/[0.08] blur-[120px]" />
      <div className="relative w-full max-w-4xl text-center">
        <Badge variant="outline" className="border-primary/25 bg-primary/10 text-primary">
          <Sparkles className="mr-1 size-3" /> IA + edição local
        </Badge>
        <h2 className="mx-auto mt-5 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Dos vídeos brutos para um corte pronto, em minutos.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          Envie vários vídeos. A IA compara os melhores frames, encontra os momentos fortes e
          organiza tudo em uma timeline única para você aprovar.
        </p>
        <button
          type="button"
          onClick={onBrowse}
          onDragEnter={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            onFiles(Array.from(event.dataTransfer.files));
          }}
          className={`group mx-auto mt-9 flex w-full max-w-2xl flex-col items-center rounded-[2rem] border border-dashed px-8 py-12 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${dragging ? "border-primary bg-primary/15" : "border-primary/35 bg-gradient-to-b from-primary/[0.09] to-white/[0.02] hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.12]"}`}
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/25 transition group-hover:scale-105">
            <Upload className="size-6" />
          </span>
          <span className="mt-5 text-base font-semibold text-white">Arraste seus vídeos aqui</span>
          <span className="mt-1 text-xs text-slate-500">
            ou clique para escolher até 6 arquivos
          </span>
          <span className="mt-5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] text-slate-500">
            MP4, MOV, WebM e formatos aceitos pelo navegador
          </span>
        </button>
        <div className="mx-auto mt-8 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
          {[
            [Film, "1. Analisa", "Qualidade, movimento e cenas"],
            [Scissors, "2. Monta", "Melhores cortes em uma timeline"],
            [Download, "3. Você aprova", "Salve no editor ou exporte MP4"],
          ].map(([Icon, title, description]) => {
            const FeatureIcon = Icon as typeof Film;
            return (
              <div
                key={String(title)}
                className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
              >
                <FeatureIcon className="size-4 text-primary" />
                <p className="mt-3 text-xs font-medium text-slate-200">{String(title)}</p>
                <p className="mt-1 text-[10px] text-slate-500">{String(description)}</p>
              </div>
            );
          })}
        </div>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="mt-6 text-slate-500 hover:bg-white/5 hover:text-slate-300"
        >
          <Link to="/video-editor">
            Prefiro editar manualmente <ChevronRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
