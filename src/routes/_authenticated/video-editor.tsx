import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock3,
  Download,
  Film,
  HelpCircle,
  Loader2,
  Plus,
  Redo2,
  Save,
  ShieldCheck,
  Shuffle,
  Undo2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  disposeVideoEngine,
  downloadVideo,
  getAudioDuration,
  getTimelineLayout,
  getVideoDuration,
  loadVideoEngine,
  normalizeSegment,
  renderCombination,
  type EditorAudioLayer,
  type EditorSegment,
} from "@/features/video-editor/engine";
import {
  clearEditorProject,
  loadEditorProject,
  saveEditorProject,
  type VideoEditorProject,
} from "@/features/video-editor/project-persistence";
import { VideoStudio } from "@/features/video-editor/studio";
import { useEditorHistory } from "@/features/video-editor/use-editor-history";

export const Route = createFileRoute("/_authenticated/video-editor")({
  component: ProfessionalVideoEditorPage,
  head: () => ({ meta: [{ title: "Editor de vídeo — Tik Supremo" }] }),
});

function emptyProject(): VideoEditorProject {
  return {
    name: "Meu vídeo",
    segments: [],
    timelineIds: [],
    textOverlays: [],
    audioLayers: [],
    removeAudio: false,
    stripMetadata: true,
    width: 720,
    updatedAt: Date.now(),
  };
}

function createSegment(file: File, duration: number, index: number): EditorSegment {
  return {
    id: `clip-${crypto.randomUUID()}`,
    label: file.name.replace(/\.[^.]+$/, "") || `Clipe ${index + 1}`,
    group: "body",
    file,
    start: 0,
    end: duration,
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
    animationDuration: 0.4,
    transition: "none",
    transitionDuration: 0.45,
    audioDetached: false,
    hideOverlay: false,
    overlayPosition: "top-right",
    overlayWidth: 18,
    overlayHeight: 8,
  };
}

function ProfessionalVideoEditorPage() {
  const editor = useEditorHistory(emptyProject());
  const project = editor.state;
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"loading" | "saved" | "dirty" | "saving" | "error">(
    "loading",
  );
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState("");
  const [shortcutsOpenRequest, setShortcutsOpenRequest] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const loadedRef = useRef(false);
  const replaceProject = editor.replace;

  useEffect(() => {
    void loadEditorProject()
      .then((saved) => {
        if (saved) {
          replaceProject(saved);
          setSelectedSegmentId(saved.timelineIds[0] ?? null);
          toast.success("Projeto anterior restaurado.");
        }
        loadedRef.current = true;
        setSaveStatus("saved");
      })
      .catch(() => {
        loadedRef.current = true;
        setSaveStatus("error");
      });
    return () => disposeVideoEngine();
  }, [replaceProject]);

  useEffect(() => {
    if (!loadedRef.current) return;
    setSaveStatus("dirty");
    const timer = window.setTimeout(() => {
      setSaveStatus("saving");
      void saveEditorProject({ ...project, updatedAt: Date.now() })
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, 850);
    return () => window.clearTimeout(timer);
  }, [project]);

  const updateProject = (
    updater: VideoEditorProject | ((current: VideoEditorProject) => VideoEditorProject),
    key = "editor",
    immediate = false,
  ) => editor.update(updater, { key, immediate });

  const importVideos = async (files: File[]) => {
    if (!files.length) return;
    const accepted = files.filter((file) => file.type.startsWith("video/"));
    if (!accepted.length) {
      toast.error("Escolha arquivos de vídeo válidos.");
      return;
    }
    const toastId = toast.loading(`Lendo ${accepted.length} arquivo(s)...`);
    try {
      const created = await Promise.all(
        accepted.map(async (file, index) =>
          createSegment(file, await getVideoDuration(file), index),
        ),
      );
      updateProject(
        (current) => ({
          ...current,
          segments: [...current.segments, ...created],
          timelineIds: [...current.timelineIds, ...created.map((segment) => segment.id)],
          updatedAt: Date.now(),
        }),
        "import-video",
        true,
      );
      setSelectedSegmentId(created[0]?.id ?? null);
      toast.success(`${created.length} clipe(s) adicionado(s) à timeline.`, { id: toastId });
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível importar o vídeo.", {
        id: toastId,
      });
    }
  };

  const importAudio = async (file: File) => {
    try {
      const duration = await getAudioDuration(file);
      const layer: EditorAudioLayer = {
        id: `audio-${crypto.randomUUID()}`,
        name: file.name,
        file,
        start: 0,
        duration,
        trimStart: 0,
        trimEnd: duration,
        volume: 70,
        muted: false,
        fadeIn: 0.3,
        fadeOut: 0.3,
      };
      updateProject(
        (current) => ({ ...current, audioLayers: [...current.audioLayers, layer] }),
        "import-audio",
        true,
      );
      toast.success("Áudio adicionado à timeline.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível importar o áudio.");
    }
  };

  const splitSegment = (id: string, sourceTime: number) => {
    updateProject(
      (current) => {
        const segment = current.segments.find((item) => item.id === id);
        if (!segment || sourceTime <= segment.start + 0.05 || sourceTime >= segment.end - 0.05)
          return current;
        const right: EditorSegment = {
          ...segment,
          id: `clip-${crypto.randomUUID()}`,
          label: `${segment.label} · corte`,
          start: sourceTime,
          audioDetached: false,
        };
        const insertAt = current.timelineIds.indexOf(id) + 1;
        const timelineIds = [...current.timelineIds];
        timelineIds.splice(insertAt, 0, right.id);
        return {
          ...current,
          segments: current.segments.flatMap((item) =>
            item.id === id ? [{ ...item, end: sourceTime }, right] : [item],
          ),
          timelineIds,
        };
      },
      "split-video",
      true,
    );
    toast.success("Clipe dividido no cursor.");
  };

  const removeSegment = (id: string) => {
    updateProject(
      (current) => ({
        ...current,
        segments: current.segments.filter((segment) => segment.id !== id),
        timelineIds: current.timelineIds.filter((segmentId) => segmentId !== id),
        audioLayers: current.audioLayers.filter((layer) => layer.sourceSegmentId !== id),
      }),
      "remove-video",
      true,
    );
    setSelectedSegmentId(null);
    toast.success("Clipe removido. Use Ctrl + Z para desfazer.");
  };

  const duplicateSegment = (id: string) => {
    updateProject(
      (current) => {
        const segment = current.segments.find((item) => item.id === id);
        if (!segment) return current;
        const copy = {
          ...segment,
          id: `clip-${crypto.randomUUID()}`,
          label: `${segment.label} · cópia`,
        };
        const insertAt = current.timelineIds.indexOf(id) + 1;
        const timelineIds = [...current.timelineIds];
        timelineIds.splice(insertAt, 0, copy.id);
        return { ...current, segments: [...current.segments, copy], timelineIds };
      },
      "duplicate-video",
      true,
    );
    toast.success("Clipe duplicado.");
  };

  const saveNow = async () => {
    setSaveStatus("saving");
    try {
      await saveEditorProject({ ...project, updatedAt: Date.now() });
      setSaveStatus("saved");
      toast.success("Projeto salvo neste dispositivo.");
    } catch {
      setSaveStatus("error");
      toast.error("Não foi possível salvar. Verifique o espaço disponível no navegador.");
    }
  };

  const exportVideo = async () => {
    if (!project.timelineIds.length) return;
    setExporting(true);
    const outputFiles = new Map<string, string>();
    try {
      setExportProgress("Carregando o motor de exportação...");
      const ffmpeg = await loadVideoEngine();
      for (const [index, id] of project.timelineIds.entries()) {
        const segment = project.segments.find((item) => item.id === id);
        if (!segment?.file) throw new Error("Um dos clipes não possui arquivo de origem.");
        setExportProgress(`Preparando clipe ${index + 1} de ${project.timelineIds.length}...`);
        const filename = await normalizeSegment(ffmpeg, segment, {
          removeAudio: project.removeAudio,
          width: project.width,
          stripMetadata: project.stripMetadata,
        });
        outputFiles.set(segment.id, filename);
      }
      setExportProgress("Renderizando textos, áudio e transições...");
      const output = await renderCombination(
        ffmpeg,
        { number: 1, hook: 0, body: 0, cta: 0, label: project.name },
        outputFiles,
        {
          segments: project.segments,
          segmentIds: project.timelineIds,
          textOverlays: project.textOverlays,
          audioLayers: project.audioLayers,
          width: project.width,
          removeAudio: project.removeAudio,
          stripMetadata: project.stripMetadata,
        },
      );
      const safeName = project.name.trim().replace(/[^a-z0-9-_]+/gi, "-") || "video-editado";
      downloadVideo(output.blob, `${safeName}.mp4`);
      toast.success("Vídeo exportado com sucesso.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível exportar o vídeo.");
    } finally {
      setExporting(false);
      setExportProgress("");
    }
  };

  const clearProject = async () => {
    await clearEditorProject();
    editor.replace(emptyProject());
    setSelectedSegmentId(null);
    toast.success("Novo projeto iniciado.");
  };

  const hasMedia = project.timelineIds.length > 0;
  const totalDuration = getTimelineLayout(
    project.timelineIds
      .map((id) => project.segments.find((segment) => segment.id === id))
      .filter((segment): segment is EditorSegment => Boolean(segment)),
  ).duration;

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] text-slate-100 md:-mx-8 md:-my-10">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        className="sr-only"
        onChange={(event) => {
          void importVideos(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      <header className="sticky top-16 z-20 flex min-h-16 flex-wrap items-center gap-3 border-b border-white/10 bg-[#0c0e14]/95 px-4 py-3 backdrop-blur-xl md:px-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-cyan/10 ring-1 ring-primary/25">
            <Film className="size-4 text-primary" />
          </span>
          <div>
            <Input
              value={project.name}
              onChange={(event) =>
                updateProject(
                  (current) => ({ ...current, name: event.target.value }),
                  "project-name",
                )
              }
              className="h-6 w-44 border-0 bg-transparent px-0 text-sm font-semibold text-white shadow-none focus-visible:ring-0"
              aria-label="Nome do projeto"
            />
            <p className="flex items-center gap-1 text-[10px] text-slate-500">
              {saveStatus === "saving" && <Loader2 className="size-3 animate-spin" />}
              {saveStatus === "saved" && <Check className="size-3 text-emerald-400" />}
              {saveStatus === "error"
                ? "Erro ao salvar"
                : saveStatus === "dirty"
                  ? "Alterações não salvas"
                  : saveStatus === "saving"
                    ? "Salvando..."
                    : "Salvo neste dispositivo"}
            </p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            disabled={!editor.canUndo}
            onClick={editor.undo}
            title="Desfazer (Ctrl + Z)"
            aria-label="Desfazer"
          >
            <Undo2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            disabled={!editor.canRedo}
            onClick={editor.redo}
            title="Refazer (Ctrl + Shift + Z)"
            aria-label="Refazer"
          >
            <Redo2 />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => void saveNow()}
            title="Salvar projeto (Ctrl + S)"
            aria-label="Salvar projeto"
          >
            <Save />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => setShortcutsOpenRequest((value) => value + 1)}
            title="Atalhos de teclado (?)"
            aria-label="Abrir ajuda de atalhos"
          >
            <HelpCircle />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
            onClick={() => fileInputRef.current?.click()}
          >
            <Plus /> Mídia
          </Button>
          <Button size="sm" disabled={!hasMedia || exporting} onClick={() => void exportVideo()}>
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Exportar
          </Button>
        </div>
      </header>

      <div className="hidden border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-100 max-lg:block">
        O editor funciona melhor em computador. Nesta tela você ainda pode visualizar o projeto.
      </div>

      {!hasMedia ? (
        <EditorEmptyState
          onImport={() => fileInputRef.current?.click()}
          onClear={() => void clearProject()}
        />
      ) : (
        <div className="p-3 md:p-4">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
            <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-slate-300">
              {project.timelineIds.length} clipe(s)
            </Badge>
            <span className="flex items-center gap-1">
              <Clock3 className="size-3" /> {formatDuration(totalDuration)}
            </span>
            <span className="hidden md:inline">
              Espaço reproduz · S divide · Delete remove · Ctrl + K busca ações
            </span>
            {exportProgress && (
              <span className="ml-auto flex items-center gap-2 text-primary">
                <Loader2 className="size-3 animate-spin" /> {exportProgress}
              </span>
            )}
          </div>
          <VideoStudio
            segments={project.segments}
            timelineIds={project.timelineIds}
            selectedSegmentId={selectedSegmentId}
            disabled={exporting}
            removeAudio={project.removeAudio}
            textOverlays={project.textOverlays}
            audioLayers={project.audioLayers}
            canUndo={editor.canUndo}
            canRedo={editor.canRedo}
            shortcutsOpenRequest={shortcutsOpenRequest}
            onUndo={editor.undo}
            onRedo={editor.redo}
            onSave={() => void saveNow()}
            onImportVideos={(files) => void importVideos(files)}
            onSelectSegment={setSelectedSegmentId}
            onSelectFile={(id, file) => {
              if (!file) return removeSegment(id);
              void getVideoDuration(file).then((duration) =>
                updateProject(
                  (current) => ({
                    ...current,
                    segments: current.segments.map((segment) =>
                      segment.id === id
                        ? {
                            ...segment,
                            file,
                            label: file.name.replace(/\.[^.]+$/, ""),
                            duration,
                            start: 0,
                            end: duration,
                          }
                        : segment,
                    ),
                  }),
                  `replace-${id}`,
                  true,
                ),
              );
            }}
            onChangeSegment={(id, patch) =>
              updateProject(
                (current) => ({
                  ...current,
                  segments: current.segments.map((segment) =>
                    segment.id === id ? { ...segment, ...patch } : segment,
                  ),
                }),
                `segment-${id}`,
              )
            }
            onChangeTextOverlays={(textOverlays) =>
              updateProject((current) => ({ ...current, textOverlays }), "text-overlays")
            }
            onImportAudio={(file) => void importAudio(file)}
            onChangeAudioLayers={(audioLayers) =>
              updateProject((current) => ({ ...current, audioLayers }), "audio-layers")
            }
            onReorderTimeline={(timelineIds) =>
              updateProject((current) => ({ ...current, timelineIds }), "reorder", true)
            }
            onSplitSegment={splitSegment}
            onRemoveSegment={removeSegment}
            onDuplicateSegment={duplicateSegment}
          />
        </div>
      )}
    </div>
  );
}

function EditorEmptyState({ onImport, onClear }: { onImport: () => void; onClear: () => void }) {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-5 py-16">
      <div className="absolute left-[15%] top-[18%] size-80 rounded-full bg-primary/10 blur-[110px]" />
      <div className="absolute bottom-[10%] right-[10%] size-72 rounded-full bg-cyan-400/10 blur-[100px]" />
      <div className="relative w-full max-w-3xl text-center">
        <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-cyan-400/10 shadow-2xl shadow-primary/10 ring-1 ring-primary/30">
          <Film className="size-7 text-primary" />
        </span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          Editor profissional
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white md:text-5xl">
          Comece importando o que você realmente vai editar
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-400 md:text-base">
          A timeline começa vazia. Seus clipes, textos e áudios só aparecem depois da importação —
          sem ganchos ou CTAs fictícios ocupando a tela.
        </p>
        <button
          type="button"
          onClick={onImport}
          className="group mx-auto mt-8 flex w-full max-w-xl flex-col items-center rounded-3xl border border-dashed border-primary/35 bg-gradient-to-b from-primary/[0.09] to-white/[0.025] px-8 py-10 transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition group-hover:scale-105">
            <Upload className="size-5" />
          </span>
          <span className="mt-4 text-base font-semibold text-white">Importar vídeos</span>
          <span className="mt-1 text-xs text-slate-500">
            MP4, MOV, WebM ou outros formatos aceitos pelo navegador
          </span>
        </button>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-emerald-400" /> Processamento local
          </span>
          <span>•</span>
          <span>Autosave neste dispositivo</span>
          <span>•</span>
          <span>Ctrl + Z para desfazer</span>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-slate-500">
            Quer criar dezenas de combinações de Gancho + Corpo + CTA?
          </p>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="mt-2 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Link to="/video-combiner">
              <Shuffle /> Abrir Juntar vídeos <ChevronRight />
            </Link>
          </Button>
          <button
            type="button"
            className="ml-2 text-[10px] text-slate-600 hover:text-slate-400"
            onClick={onClear}
          >
            Limpar rascunho local
          </button>
        </div>
      </div>
    </main>
  );
}

function formatDuration(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
