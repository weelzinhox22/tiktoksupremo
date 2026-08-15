import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Clock3,
  Captions,
  AudioLines,
  LayoutTemplate,
  Download,
  Film,
  HelpCircle,
  Loader2,
  Monitor,
  Plus,
  Redo2,
  Save,
  ShieldCheck,
  Shuffle,
  Smartphone,
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
  applyEditorTemplate,
  createTemplateFromProject,
  listEditorTemplates,
  loadEditorProject,
  saveEditorTemplate,
  saveEditorProject,
  type ExportFormat,
  type VideoEditorProject,
  type VideoEditorTemplate,
} from "@/features/video-editor/project-persistence";
import { VideoStudio } from "@/features/video-editor/studio";
import { useEditorHistory } from "@/features/video-editor/use-editor-history";
import {
  auditEditorProject,
  analyzeSpeech,
  createSmartCaptions,
  detectSpeechBounds,
  enrichCreativeAudit,
  type CaptionPreset,
} from "@/features/video-editor/automation";
import { transcribeLocalFileServerFn } from "@/features/tiktok-downloader/transcribe-server";

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
    exportFormat: "9x16-720",
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

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
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
  const [exportPercent, setExportPercent] = useState(0);
  const [shortcutsOpenRequest, setShortcutsOpenRequest] = useState(0);
  const [automationBusy, setAutomationBusy] = useState<"captions" | "silence" | null>(null);
  const [captionPreset, setCaptionPreset] = useState<CaptionPreset>("capcut");
  const [captionEmojis, setCaptionEmojis] = useState(true);
  const [auditBusy, setAuditBusy] = useState(false);
  const [editorTemplates, setEditorTemplates] = useState<VideoEditorTemplate[]>([]);
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
    void listEditorTemplates()
      .then(setEditorTemplates)
      .catch(() => undefined);
  }, []);

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
    setExportPercent(2);
    const outputFiles = new Map<string, string>();
    try {
      setExportProgress("Carregando o motor de exportação...");
      const ffmpeg = await loadVideoEngine({
        onProgress: (msg) => setExportProgress(msg),
      });
      for (const [index, id] of project.timelineIds.entries()) {
        const segment = project.segments.find((item) => item.id === id);
        if (!segment?.file) throw new Error("Um dos clipes não possui arquivo de origem.");
        setExportProgress(`Preparando clipe ${index + 1} de ${project.timelineIds.length}...`);
        const onClipProgress = ({ progress }: { progress: number }) => {
          setExportPercent(
            Math.min(
              88,
              Math.round(((index + Math.max(0, progress)) / project.timelineIds.length) * 88),
            ),
          );
        };
        ffmpeg.on("progress", onClipProgress);
        let filename: string;
        try {
          filename = await normalizeSegment(ffmpeg, segment, {
            removeAudio: project.removeAudio,
            width: project.width,
            stripMetadata: project.stripMetadata,
            exportFormat: project.exportFormat ?? "9x16-720",
          });
        } finally {
          ffmpeg.off("progress", onClipProgress);
        }
        outputFiles.set(segment.id, filename);
      }
      setExportProgress("Renderizando textos, áudio e transições...");
      setExportPercent(90);
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
          exportFormat: project.exportFormat ?? "9x16-720",
          removeAudio: project.removeAudio,
          stripMetadata: project.stripMetadata,
        },
      );
      const safeName = project.name.trim().replace(/[^a-z0-9-_]+/gi, "-") || "video-editado";
      downloadVideo(output.blob, `${safeName}.mp4`);
      setExportPercent(100);
      toast.success("Vídeo exportado com sucesso.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível exportar o vídeo.");
    } finally {
      setExporting(false);
      setExportProgress("");
      setExportPercent(0);
    }
  };

  const selectedSegment =
    project.segments.find((segment) => segment.id === selectedSegmentId) ?? null;
  const creativeAudit = auditEditorProject(project);

  const createAutomaticCaptions = async () => {
    if (!selectedSegment?.file) {
      toast.error("Selecione um clipe com áudio na timeline.");
      return;
    }
    if (selectedSegment.file.size > 50 * 1024 * 1024) {
      toast.error("Para legendas automáticas, use um clipe de até 50 MB.");
      return;
    }
    setAutomationBusy("captions");
    const toastId = toast.loading("Transcrevendo e criando legendas...");
    try {
      const result = await transcribeLocalFileServerFn({
        data: {
          base64: await fileToBase64(selectedSegment.file),
          filename: selectedSegment.file.name,
          mimeType: selectedSegment.file.type,
        },
      });
      const duration = Math.max(0.1, selectedSegment.end - selectedSegment.start);
      const timeline = getTimelineLayout(
        project.timelineIds
          .map((id) => project.segments.find((segment) => segment.id === id))
          .filter((segment): segment is EditorSegment => Boolean(segment)),
      );
      const offset =
        timeline.entries.find((entry) => entry.segment.id === selectedSegment.id)?.start ?? 0;
      const smart = await createSmartCaptions(result.transcript, selectedSegment.file, {
        preset: captionPreset,
        emojis: captionEmojis,
        wordsPerCard: 4,
      });
      const captions = smart.captions
        .filter((caption) => caption.start < duration)
        .map((caption) => ({
          ...caption,
          start: caption.start + offset,
          end: Math.min(duration, caption.end) + offset,
        }));
      updateProject(
        (current) => ({ ...current, textOverlays: [...current.textOverlays, ...captions] }),
        "automatic-captions",
        true,
      );
      toast.success(
        `${smart.words.length} palavras sincronizadas · ${smart.importantPhrases.length} frase(s) importante(s).`,
        { id: toastId },
      );
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível criar legendas.", {
        id: toastId,
      });
    } finally {
      setAutomationBusy(null);
    }
  };

  const removeInternalSilences = async () => {
    if (!selectedSegment?.file) {
      toast.error("Selecione um clipe na timeline.");
      return;
    }
    setAutomationBusy("silence");
    try {
      const analysis = await analyzeSpeech(selectedSegment.file);
      const regions = analysis.speech
        .map((region) => ({
          start: Math.max(selectedSegment.start, region.start - 0.06),
          end: Math.min(selectedSegment.end, region.end + 0.06),
        }))
        .filter((region) => region.end - region.start >= 0.16);
      if (regions.length <= 1) {
        await removeEdgeSilence();
        return;
      }
      const replacements = regions.map((region, index): EditorSegment => ({
        ...selectedSegment,
        id: `${selectedSegment.id}-speech-${crypto.randomUUID()}`,
        label: `${selectedSegment.label} · fala ${index + 1}`,
        start: region.start,
        end: region.end,
        transition: "none",
      }));
      updateProject(
        (current) => ({
          ...current,
          segments: [
            ...current.segments.filter((segment) => segment.id !== selectedSegment.id),
            ...replacements,
          ],
          timelineIds: current.timelineIds.flatMap((id) =>
            id === selectedSegment.id ? replacements.map((segment) => segment.id) : [id],
          ),
        }),
        "remove-internal-silences",
        true,
      );
      setSelectedSegmentId(replacements[0]?.id ?? null);
      const removed = analysis.silences
        .filter((silence) => silence.duration >= 0.28)
        .reduce((sum, silence) => sum + silence.duration, 0);
      toast.success(`${removed.toFixed(1)}s de pausas removidos em ${replacements.length} cortes.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível remover as pausas.");
    } finally {
      setAutomationBusy(null);
    }
  };

  const runCreativeAudit = async () => {
    setAuditBusy(true);
    const toastId = toast.loading("Analisando áudio, pausas, ritmo e segurança...");
    try {
      const clips = project.timelineIds
        .map((id) => project.segments.find((segment) => segment.id === id))
        .filter((segment): segment is EditorSegment => Boolean(segment));
      const audit = await enrichCreativeAudit(creativeAudit, clips);
      const failed = audit.checks.filter((check) => !check.passed);
      if (failed.length) {
        toast.info(
          `Creative Score ${audit.score}/100 · ${failed.map((item) => item.label).join(" · ")}`,
          { id: toastId, duration: 9000 },
        );
      } else
        toast.success(`Creative Score ${audit.score}/100 — pronto para exportar.`, { id: toastId });
    } catch (cause) {
      toast.error(
        cause instanceof Error ? cause.message : "Não foi possível concluir a auditoria.",
        { id: toastId },
      );
    } finally {
      setAuditBusy(false);
    }
  };

  const removeEdgeSilence = async () => {
    if (!selectedSegment?.file) {
      toast.error("Selecione um clipe na timeline.");
      return;
    }
    setAutomationBusy("silence");
    try {
      const bounds = await detectSpeechBounds(selectedSegment.file);
      updateProject(
        (current) => ({
          ...current,
          segments: current.segments.map((segment) =>
            segment.id === selectedSegment.id
              ? { ...segment, start: bounds.start, end: bounds.end }
              : segment,
          ),
        }),
        "remove-edge-silence",
        true,
      );
      toast.success(
        bounds.removed > 0.08
          ? `${bounds.removed.toFixed(1)}s de silêncio removido das bordas.`
          : "Não encontrei silêncio relevante nas bordas.",
      );
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível analisar o áudio.");
    } finally {
      setAutomationBusy(null);
    }
  };

  const saveAsTemplate = async () => {
    if (!project.timelineIds.length) return;
    const template = createTemplateFromProject(project, `${project.name} · Template`);
    await saveEditorTemplate(template);
    setEditorTemplates(await listEditorTemplates());
    toast.success("Template visual salvo neste dispositivo.");
  };

  const applyTemplateById = (templateId: string) => {
    const template = editorTemplates.find((item) => item.id === templateId);
    if (!template) return;
    editor.replace(applyEditorTemplate(project, template));
    toast.success(`Template “${template.name}” aplicado.`);
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
          <div className="hidden items-center gap-1.5 xl:flex">
            <select
              aria-label="Aplicar template visual"
              className="h-8 max-w-40 rounded-md border border-white/10 bg-[#0b0d13] px-2 text-[10px] text-slate-300"
              defaultValue=""
              disabled={!hasMedia || exporting}
              onChange={(event) => {
                if (event.target.value) applyTemplateById(event.target.value);
                event.target.value = "";
              }}
            >
              <option value="">Aplicar template</option>
              {editorTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
            <Button
              size="icon"
              variant="ghost"
              className="size-8 text-slate-300 hover:bg-white/10"
              disabled={!hasMedia || exporting}
              onClick={() => void saveAsTemplate()}
              title="Salvar o projeto atual como template visual"
            >
              <LayoutTemplate />
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
            disabled={!selectedSegment || Boolean(automationBusy)}
            onClick={() => void createAutomaticCaptions()}
            title="Transcrever o clipe selecionado e criar legendas"
          >
            {automationBusy === "captions" ? <Loader2 className="animate-spin" /> : <Captions />}
            <span className="hidden xl:inline">Legendas IA</span>
          </Button>
          <select
            aria-label="Preset das legendas automáticas"
            className="hidden h-8 rounded-md border border-white/10 bg-[#0b0d13] px-2 text-[10px] text-slate-300 2xl:block"
            value={captionPreset}
            disabled={Boolean(automationBusy)}
            onChange={(event) => setCaptionPreset(event.target.value as CaptionPreset)}
          >
            <option value="capcut">CapCut bold</option>
            <option value="tiktok">TikTok creator</option>
            <option value="karaoke">Karaokê</option>
            <option value="impact">Oferta impacto</option>
            <option value="minimal">Minimalista</option>
          </select>
          <Button
            size="sm"
            variant="ghost"
            className={captionEmojis ? "text-amber-300" : "text-slate-500"}
            aria-pressed={captionEmojis}
            onClick={() => setCaptionEmojis((value) => !value)}
            title="Adicionar emojis contextuais nas legendas"
          >
            {captionEmojis ? "✨ Emoji" : "Emoji off"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/10"
            disabled={!selectedSegment || Boolean(automationBusy)}
            onClick={() => void removeInternalSilences()}
            title="Detectar e remover pausas e silêncios internos"
          >
            {automationBusy === "silence" ? <Loader2 className="animate-spin" /> : <AudioLines />}
            <span className="hidden 2xl:inline">Remover pausas</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className={`border-white/10 bg-white/[0.04] ${creativeAudit.score >= 80 ? "text-emerald-300" : creativeAudit.score >= 65 ? "text-amber-300" : "text-rose-300"}`}
            disabled={auditBusy || !hasMedia}
            onClick={() => void runCreativeAudit()}
            title="Auditoria automática do projeto"
          >
            {auditBusy ? <Loader2 className="animate-spin" /> : <ShieldCheck />}{" "}
            {creativeAudit.score}
          </Button>
          <FormatSelector
            value={project.exportFormat ?? "9x16-720"}
            onChange={(fmt) =>
              updateProject(
                (current) => ({
                  ...current,
                  exportFormat: fmt,
                  width: fmt === "9x16-1080" ? 1080 : 720,
                }),
                "export-format",
                true,
              )
            }
            disabled={exporting}
          />
          <Button
            size="sm"
            className="bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-lg shadow-violet-950/40 hover:from-violet-500 hover:to-cyan-400"
            disabled={!hasMedia || exporting}
            onClick={() => void exportVideo()}
          >
            {exporting ? <Loader2 className="animate-spin" /> : <Download />}
            Exportar
          </Button>
        </div>
      </header>

      <div className="hidden border-b border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs text-amber-100 max-lg:block">
        O editor funciona melhor em computador. Nesta tela você ainda pode visualizar o projeto.
      </div>

      {exporting && (
        <div className="sticky top-32 z-20 mx-4 mt-3 overflow-hidden rounded-xl border border-violet-400/25 bg-[#111420]/95 px-4 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl md:mx-5">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15 text-violet-300">
              <Loader2 className="size-4 animate-spin" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-semibold text-white">
                  {exportProgress || "Preparando exportação..."}
                </span>
                <span className="font-mono text-violet-300">{exportPercent}%</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-[width] duration-300"
                  style={{ width: `${Math.max(2, exportPercent)}%` }}
                />
              </div>
            </div>
          </div>
          <p className="mt-2 pl-12 text-[10px] text-slate-500">
            Mantenha esta aba aberta. A exportação é processada localmente e nenhum vídeo é enviado.
          </p>
        </div>
      )}

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

const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  sub: string;
  icon: "portrait" | "landscape";
}[] = [
  { value: "9x16-720", label: "9:16 · 720p", sub: "720×1280 · TikTok/Reels", icon: "portrait" },
  {
    value: "9x16-1080",
    label: "9:16 · 1080p",
    sub: "1080×1920 · Alta qualidade",
    icon: "portrait",
  },
  { value: "16x9-1080", label: "16:9 · 1080p", sub: "1920×1080 · YouTube/PC", icon: "landscape" },
];

function FormatSelector({
  value,
  onChange,
  disabled,
}: {
  value: ExportFormat;
  onChange: (fmt: ExportFormat) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = FORMAT_OPTIONS.find((opt) => opt.value === value) ?? FORMAT_OPTIONS[0]!;

  return (
    <div className="relative">
      <button
        id="format-selector-trigger"
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:pointer-events-none disabled:opacity-50"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Selecionar formato de exportação"
      >
        {selected.icon === "landscape" ? (
          <Monitor className="size-3.5 shrink-0 text-cyan-400" />
        ) : (
          <Smartphone className="size-3.5 shrink-0 text-primary" />
        )}
        <span>{selected.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`size-3 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <ul
            role="listbox"
            aria-label="Formatos de exportação"
            className="absolute right-0 top-full z-40 mt-1.5 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#131620] shadow-2xl shadow-black/50"
          >
            {FORMAT_OPTIONS.map((opt) => (
              <li key={opt.value} role="option" aria-selected={opt.value === value}>
                <button
                  id={`format-option-${opt.value}`}
                  type="button"
                  className={`flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-white/[0.07] ${
                    opt.value === value ? "bg-white/[0.05]" : ""
                  }`}
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <span
                    className={`flex shrink-0 items-center justify-center rounded-md p-1 ${
                      opt.icon === "landscape"
                        ? "bg-cyan-400/10 text-cyan-400"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    {opt.icon === "landscape" ? (
                      <Monitor className="size-4" />
                    ) : (
                      <Smartphone className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold text-white">{opt.label}</span>
                    <span className="block truncate text-[10px] text-slate-500">{opt.sub}</span>
                  </span>
                  {opt.value === value && (
                    <Check className="ml-auto size-3.5 shrink-0 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
