import { useEffect, useMemo, useRef, useState } from "react";
import {
  Copy,
  Film,
  GripVertical,
  HelpCircle,
  Keyboard,
  Link2Off,
  Music2,
  Pause,
  Play,
  Redo2,
  Save,
  Scissors,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Type,
  Undo2,
  Upload,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  getTimelineLayout,
  type EditorAudioLayer,
  type EditorSegment,
  type EditorTextOverlay,
} from "@/features/video-editor/engine";
import {
  editorShortcuts,
  useEditorKeyboardShortcuts,
} from "@/features/video-editor/keyboard-shortcuts";
import {
  evaluateTextAnimation,
  evaluateTextLoopAnimation,
  textAnimationPresets,
  textLoopAnimationPresets,
} from "@/features/video-editor/presets";
import { TextPresetBrowser } from "@/features/video-editor/text-preset-browser";
import { presetStyleToOverlay, type TextPreset } from "@/features/video-editor/text-presets";
import { getTextVisualStyle } from "@/features/video-editor/text-style";

type VideoStudioProps = {
  segments: EditorSegment[];
  timelineIds: string[];
  selectedSegmentId: string | null;
  disabled: boolean;
  removeAudio: boolean;
  textOverlays: EditorTextOverlay[];
  audioLayers: EditorAudioLayer[];
  canUndo: boolean;
  canRedo: boolean;
  shortcutsOpenRequest: number;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onImportVideos: (files: File[]) => void;
  onSelectSegment: (id: string) => void;
  onSelectFile: (id: string, file: File | null) => void;
  onChangeSegment: (id: string, patch: Partial<EditorSegment>) => void;
  onChangeTextOverlays: (overlays: EditorTextOverlay[]) => void;
  onImportAudio: (file: File) => void;
  onChangeAudioLayers: (layers: EditorAudioLayer[]) => void;
  onReorderTimeline: (ids: string[]) => void;
  onSplitSegment: (id: string, sourceTime: number) => void;
  onRemoveSegment: (id: string) => void;
  onDuplicateSegment: (id: string) => void;
};

const clipColors: Record<EditorSegment["group"], string> = {
  hook: "border-fuchsia-400/60 bg-fuchsia-500/20",
  body: "border-sky-400/60 bg-sky-500/20",
  cta: "border-emerald-400/60 bg-emerald-500/20",
};

export function VideoStudio({
  segments,
  timelineIds,
  selectedSegmentId,
  disabled,
  removeAudio,
  textOverlays,
  audioLayers,
  canUndo,
  canRedo,
  shortcutsOpenRequest,
  onUndo,
  onRedo,
  onSave,
  onImportVideos,
  onSelectSegment,
  onSelectFile,
  onChangeSegment,
  onChangeTextOverlays,
  onImportAudio,
  onChangeAudioLayers,
  onReorderTimeline,
  onSplitSegment,
  onRemoveSegment,
  onDuplicateSegment,
}: VideoStudioProps) {
  const timelineSegments = useMemo(
    () =>
      timelineIds
        .map((id) => segments.find((segment) => segment.id === id))
        .filter((segment): segment is EditorSegment => Boolean(segment)),
    [segments, timelineIds],
  );
  const layout = useMemo(() => getTimelineLayout(timelineSegments), [timelineSegments]);
  const [currentTime, setCurrentTime] = useState(0);
  const currentTimeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(46);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedAudioId, setSelectedAudioId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<"media" | "text" | "audio">("media");
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [shortcutQuery, setShortcutQuery] = useState("");
  const [commandOpen, setCommandOpen] = useState(false);
  const [draggedSegmentId, setDraggedSegmentId] = useState<string | null>(null);
  const [thumbnails, setThumbnails] = useState<Record<string, string[]>>({});
  const mediaLoading = useRef(new Set<File>());
  const fileUrls = useRef(new Map<File, string>());
  const previewRef = useRef<HTMLDivElement>(null);
  const timelineViewportRef = useRef<HTMLDivElement>(null);

  const selectedSegment = segments.find((segment) => segment.id === selectedSegmentId) ?? null;
  const selectedText = textOverlays.find((overlay) => overlay.id === selectedTextId) ?? null;
  const selectedAudio = audioLayers.find((layer) => layer.id === selectedAudioId) ?? null;
  const timelineWidth = Math.max(720, layout.duration * zoom);
  const activeEntries = layout.entries.filter(
    (entry) => currentTime >= entry.start && currentTime < entry.end + 0.015,
  );

  useEffect(() => {
    if (shortcutsOpenRequest > 0) setShortcutsOpen(true);
  }, [shortcutsOpenRequest]);

  const getFileUrl = (file: File) => {
    const cached = fileUrls.current.get(file);
    if (cached) return cached;
    const url = URL.createObjectURL(file);
    fileUrls.current.set(file, url);
    return url;
  };

  useEffect(
    () => () => {
      fileUrls.current.forEach((url) => URL.revokeObjectURL(url));
      fileUrls.current.clear();
    },
    [],
  );

  useEffect(() => {
    for (const segment of timelineSegments) {
      if (!segment.file || thumbnails[segment.id] || mediaLoading.current.has(segment.file))
        continue;
      const file = segment.file;
      mediaLoading.current.add(file);
      void createVideoThumbnails(file, 6).then((images) => {
        setThumbnails((current) => ({ ...current, [segment.id]: images }));
        mediaLoading.current.delete(file);
      });
    }
  }, [timelineSegments, thumbnails]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    if (currentTime <= layout.duration) return;
    setCurrentTime(layout.duration);
    setPlaying(false);
  }, [currentTime, layout.duration]);

  useEffect(() => {
    if (!playing) return;
    const startAt = performance.now() - currentTimeRef.current * 1000;
    let frame = 0;
    let lastUpdate = 0;
    const tick = (now: number) => {
      const next = Math.min(layout.duration, (now - startAt) / 1000);
      currentTimeRef.current = next;
      if (now - lastUpdate >= 33 || next >= layout.duration) {
        lastUpdate = now;
        setCurrentTime(next);
      }
      if (next >= layout.duration) {
        setPlaying(false);
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, layout.duration]);

  useEffect(() => {
    if (selectedSegmentId || !timelineSegments[0]) return;
    onSelectSegment(timelineSegments[0].id);
  }, [onSelectSegment, selectedSegmentId, timelineSegments]);

  const seek = (time: number) => {
    const next = clamp(time, 0, layout.duration);
    currentTimeRef.current = next;
    setCurrentTime(next);
  };

  const beginSeek = (event: React.PointerEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const move = (pointerEvent: Pick<PointerEvent, "clientX">) =>
      seek((pointerEvent.clientX - bounds.left) / zoom);
    move(event);
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const addText = (preset?: TextPreset) => {
    const start = Math.min(currentTime, Math.max(0, layout.duration - 0.25));
    const overlay: EditorTextOverlay = {
      id: `text-${crypto.randomUUID()}`,
      text: preset?.previewText ?? "Seu texto aqui",
      start,
      end: Math.min(layout.duration, start + 3),
      x: 50,
      y: 76,
      fontSize: 44,
      color: "#ffffff",
      backgroundColor: "rgba(0,0,0,0.55)",
      style: "caption",
      animationIn: "fade",
      animationOut: "fade",
      animationLoop: "none",
      animationDuration: 0.35,
      ...(preset ? presetStyleToOverlay(preset) : {}),
    };
    onChangeTextOverlays([...textOverlays, overlay]);
    setSelectedTextId(overlay.id);
    setSelectedAudioId(null);
    setActivePanel("text");
    if (preset) setEditingTextId(overlay.id);
  };

  const applyTextPreset = (preset: TextPreset) => {
    if (!selectedText) {
      addText(preset);
      return;
    }
    updateText(selectedText.id, presetStyleToOverlay(preset));
  };

  const updateText = (id: string, patch: Partial<EditorTextOverlay>) => {
    onChangeTextOverlays(
      textOverlays.map((overlay) => (overlay.id === id ? { ...overlay, ...patch } : overlay)),
    );
  };

  const removeText = (id: string) => {
    onChangeTextOverlays(textOverlays.filter((overlay) => overlay.id !== id));
    setSelectedTextId(null);
  };

  const duplicateText = (overlay: EditorTextOverlay) => {
    const copy = {
      ...overlay,
      id: `text-${crypto.randomUUID()}`,
      text: overlay.text,
      x: clamp(overlay.x + 3, 4, 96),
      y: clamp(overlay.y + 3, 4, 96),
    };
    onChangeTextOverlays([...textOverlays, copy]);
    setSelectedTextId(copy.id);
  };

  const updateAudio = (id: string, patch: Partial<EditorAudioLayer>) => {
    onChangeAudioLayers(
      audioLayers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
    );
  };

  const removeAudioLayer = (id: string) => {
    onChangeAudioLayers(audioLayers.filter((layer) => layer.id !== id));
    setSelectedAudioId(null);
  };

  const duplicateAudio = (layer: EditorAudioLayer) => {
    const duration = layer.trimEnd - layer.trimStart;
    const copy = {
      ...layer,
      id: `audio-${crypto.randomUUID()}`,
      name: `${layer.name} · cópia`,
      start: clamp(
        layer.start + Math.min(0.5, duration),
        0,
        Math.max(0, layout.duration - duration),
      ),
    };
    delete copy.sourceSegmentId;
    onChangeAudioLayers([...audioLayers, copy]);
    setSelectedAudioId(copy.id);
  };

  const toggleDetachedAudio = (segment: EditorSegment) => {
    const existing = audioLayers.find((layer) => layer.sourceSegmentId === segment.id);
    if (existing) {
      onChangeAudioLayers(audioLayers.filter((layer) => layer.id !== existing.id));
      onChangeSegment(segment.id, { audioDetached: false, mute: false });
      setSelectedAudioId(null);
      return;
    }
    if (!segment.file) return;
    const entry = layout.entries.find((candidate) => candidate.segment.id === segment.id);
    const layer: EditorAudioLayer = {
      id: `detached-${segment.id}-${crypto.randomUUID()}`,
      name: `Áudio · ${segment.label}`,
      file: segment.file,
      start: entry?.start ?? 0,
      duration: segment.duration,
      trimStart: segment.start,
      trimEnd: segment.end,
      volume: segment.volume,
      muted: false,
      fadeIn: segment.fadeIn,
      fadeOut: segment.fadeOut,
      sourceSegmentId: segment.id,
    };
    onChangeAudioLayers([...audioLayers, layer]);
    onChangeSegment(segment.id, { audioDetached: true, mute: true });
    setSelectedTextId(null);
    setSelectedAudioId(layer.id);
  };

  const splitSelectedAudio = () => {
    if (!selectedAudio) return;
    const localTime = currentTime - selectedAudio.start;
    const selectedDuration = selectedAudio.trimEnd - selectedAudio.trimStart;
    if (localTime <= 0.05 || localTime >= selectedDuration - 0.05) return;
    const sourceSplit = selectedAudio.trimStart + localTime;
    const right: EditorAudioLayer = {
      ...selectedAudio,
      id: `${selectedAudio.id}-split-${crypto.randomUUID()}`,
      name: `${selectedAudio.name} · parte 2`,
      start: currentTime,
      trimStart: sourceSplit,
    };
    delete right.sourceSegmentId;
    onChangeAudioLayers(
      audioLayers.flatMap((layer) =>
        layer.id === selectedAudio.id ? [{ ...layer, trimEnd: sourceSplit }, right] : [layer],
      ),
    );
    setSelectedAudioId(right.id);
  };

  const beginAudioTrim = (
    event: React.PointerEvent,
    layer: EditorAudioLayer,
    edge: "start" | "end",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const originX = event.clientX;
    const originTrimStart = layer.trimStart;
    const originTrimEnd = layer.trimEnd;
    const originTimelineStart = layer.start;
    const move = (pointerEvent: PointerEvent) => {
      const delta = (pointerEvent.clientX - originX) / zoom;
      if (edge === "start") {
        const trimStart = clamp(originTrimStart + delta, 0, originTrimEnd - 0.1);
        onChangeAudioLayers(
          audioLayers.map((candidate) =>
            candidate.id === layer.id
              ? {
                  ...candidate,
                  trimStart,
                  start: Math.max(0, originTimelineStart + (trimStart - originTrimStart)),
                }
              : candidate,
          ),
        );
      } else {
        const trimEnd = clamp(originTrimEnd + delta, originTrimStart + 0.1, layer.duration);
        onChangeAudioLayers(
          audioLayers.map((candidate) =>
            candidate.id === layer.id ? { ...candidate, trimEnd } : candidate,
          ),
        );
      }
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const beginTextTrim = (
    event: React.PointerEvent,
    overlay: EditorTextOverlay,
    edge: "start" | "end",
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const originX = event.clientX;
    const move = (pointerEvent: PointerEvent) => {
      const delta = (pointerEvent.clientX - originX) / zoom;
      if (edge === "start") {
        updateText(overlay.id, {
          start: clamp(overlay.start + delta, 0, overlay.end - 0.1),
        });
      } else {
        updateText(overlay.id, {
          end: clamp(overlay.end + delta, overlay.start + 0.1, layout.duration),
        });
      }
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const beginTimelineMove = (
    event: React.PointerEvent,
    start: number,
    duration: number,
    onMove: (nextStart: number) => void,
  ) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const originX = event.clientX;
    const move = (pointerEvent: PointerEvent) => {
      const delta = (pointerEvent.clientX - originX) / zoom;
      onMove(
        clamp(start + delta, 0, Math.max(0, layout.duration - Math.min(duration, layout.duration))),
      );
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const reorderSegment = (targetId: string) => {
    if (!draggedSegmentId || draggedSegmentId === targetId) return;
    const next = [...timelineIds];
    const from = next.indexOf(draggedSegmentId);
    const to = next.indexOf(targetId);
    if (from < 0 || to < 0) return;
    next.splice(from, 1);
    next.splice(to, 0, draggedSegmentId);
    onReorderTimeline(next);
    setDraggedSegmentId(null);
  };

  const handleTimelineWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    if (!event.ctrlKey) return;
    event.preventDefault();
    const direction = event.deltaY > 0 ? -1 : 1;
    setZoom((current) => clamp(current + direction * 6, 24, 120));
  };

  const trimAtPlayhead = (edge: "start" | "end") => {
    const entry = layout.entries.find((candidate) => candidate.segment.id === selectedSegmentId);
    if (!entry) return;
    const local = clamp(currentTime - entry.start, 0, entry.duration);
    const sourceTime = entry.segment.start + local * entry.segment.playbackRate;
    if (edge === "start" && sourceTime < entry.segment.end - 0.1) {
      onChangeSegment(entry.segment.id, { start: sourceTime });
    }
    if (edge === "end" && sourceTime > entry.segment.start + 0.1) {
      onChangeSegment(entry.segment.id, { end: sourceTime });
    }
  };

  const beginTrim = (event: React.PointerEvent, segment: EditorSegment, edge: "start" | "end") => {
    event.preventDefault();
    event.stopPropagation();
    const originX = event.clientX;
    const originStart = segment.start;
    const originEnd = segment.end;
    const move = (pointerEvent: PointerEvent) => {
      const sourceDelta = ((pointerEvent.clientX - originX) / zoom) * segment.playbackRate;
      if (edge === "start") {
        onChangeSegment(segment.id, {
          start: clamp(originStart + sourceDelta, 0, originEnd - 0.1),
        });
      } else {
        onChangeSegment(segment.id, {
          end: clamp(originEnd + sourceDelta, originStart + 0.1, segment.duration),
        });
      }
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const beginTextDrag = (event: React.PointerEvent, overlay: EditorTextOverlay) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = previewRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const originX = event.clientX;
    const originY = event.clientY;
    const move = (pointerEvent: PointerEvent) => {
      updateText(overlay.id, {
        x: clamp(overlay.x + ((pointerEvent.clientX - originX) / bounds.width) * 100, 4, 96),
        y: clamp(overlay.y + ((pointerEvent.clientY - originY) / bounds.height) * 100, 4, 96),
      });
    };
    const finish = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", finish);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", finish, { once: true });
  };

  const splitCurrentSelection = () => {
    if (selectedAudio) {
      splitSelectedAudio();
      return;
    }
    const entry = layout.entries.find((candidate) => candidate.segment.id === selectedSegmentId);
    if (!entry) return;
    const local = clamp(currentTime - entry.start, 0, entry.duration);
    const sourceTime = entry.segment.start + local * entry.segment.playbackRate;
    onSplitSegment(entry.segment.id, sourceTime);
  };

  const duplicateSelection = () => {
    if (selectedText) duplicateText(selectedText);
    else if (selectedAudio) duplicateAudio(selectedAudio);
    else if (selectedSegment) onDuplicateSegment(selectedSegment.id);
  };

  const removeSelection = () => {
    if (selectedText) removeText(selectedText.id);
    else if (selectedAudio) removeAudioLayer(selectedAudio.id);
    else if (selectedSegment) onRemoveSegment(selectedSegment.id);
  };

  const muteSelection = () => {
    if (selectedAudio) updateAudio(selectedAudio.id, { muted: !selectedAudio.muted });
    else if (selectedSegment) onChangeSegment(selectedSegment.id, { mute: !selectedSegment.mute });
  };

  const clearSelection = () => {
    setSelectedTextId(null);
    setSelectedAudioId(null);
    setEditingTextId(null);
    setCommandOpen(false);
  };

  const zoomToFit = () => {
    const available = Math.max(360, (timelineViewportRef.current?.clientWidth ?? 820) - 110);
    setZoom(clamp(available / Math.max(layout.duration, 1), 24, 120));
  };

  useEditorKeyboardShortcuts({
    undo: onUndo,
    redo: onRedo,
    save: onSave,
    openCommands: () => setCommandOpen(true),
    openHelp: () => setShortcutsOpen(true),
    duplicate: duplicateSelection,
    remove: removeSelection,
    clearSelection,
    togglePlayback: () => {
      if (currentTime >= layout.duration) seek(0);
      setPlaying((current) => !current);
    },
    pause: () => setPlaying(false),
    seekBy: (seconds) => seek(currentTimeRef.current + seconds),
    seekStart: () => seek(0),
    seekEnd: () => seek(layout.duration),
    split: splitCurrentSelection,
    trimStart: () => trimAtPlayhead("start"),
    trimEnd: () => trimAtPlayhead("end"),
    zoomBy: (amount) => setZoom((current) => clamp(current + amount, 24, 120)),
    zoomFit: zoomToFit,
    addText: () => addText(),
    mute: muteSelection,
  });

  return (
    <section
      id="video-studio"
      className="overflow-hidden rounded-3xl border border-border bg-[#090b11] shadow-2xl shadow-black/20"
    >
      <div className="flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#11141d] px-3 py-2">
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          title="Desfazer (Ctrl + Z)"
          aria-label="Desfazer"
        >
          <Undo2 />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          onClick={onRedo}
          disabled={!canRedo || disabled}
          title="Refazer (Ctrl + Shift + Z)"
          aria-label="Refazer"
        >
          <Redo2 />
        </Button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          disabled={(!selectedSegment && !selectedAudio) || disabled}
          onClick={splitCurrentSelection}
          title="Dividir no cursor (S)"
        >
          <Scissors /> Dividir <kbd className="rounded bg-white/10 px-1 text-[9px]">S</kbd>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          disabled={!selectedSegment || disabled}
          onClick={() => trimAtPlayhead("start")}
          title="Aparar início no cursor ([)"
        >
          <span className="font-mono text-xs">[</span> Aparar início
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          disabled={!selectedSegment || disabled}
          onClick={() => trimAtPlayhead("end")}
          title="Aparar fim no cursor (])"
        >
          <span className="font-mono text-xs">]</span> Aparar fim
        </Button>
        <div className="mx-1 h-5 w-px bg-white/10" />
        <Button
          size="icon"
          variant="ghost"
          className="text-white hover:bg-white/10 hover:text-white"
          disabled={(!selectedSegment && !selectedText && !selectedAudio) || disabled}
          onClick={duplicateSelection}
          title="Duplicar seleção (Ctrl + D)"
          aria-label="Duplicar seleção"
        >
          <Copy />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          disabled={(!selectedSegment && !selectedText && !selectedAudio) || disabled}
          onClick={removeSelection}
          title="Excluir seleção (Delete)"
          aria-label="Excluir seleção"
        >
          <Trash2 />
        </Button>
        <div className="ml-auto flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={onSave}
            title="Salvar projeto (Ctrl + S)"
            aria-label="Salvar projeto"
          >
            <Save />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setCommandOpen(true)}
            title="Buscar comandos (Ctrl + K)"
            aria-label="Buscar comandos"
          >
            <Keyboard />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setShortcutsOpen(true)}
            title="Atalhos de teclado (?)"
            aria-label="Atalhos de teclado"
          >
            <HelpCircle />
          </Button>
        </div>
      </div>

      <div className="grid min-h-[610px] xl:grid-cols-[280px_minmax(420px,1fr)_310px]">
        <EditorResourcePanel
          activePanel={activePanel}
          onPanelChange={setActivePanel}
          segments={timelineSegments}
          audioLayers={audioLayers}
          disabled={disabled}
          onAddText={() => addText()}
          onApplyPreset={applyTextPreset}
          onImportVideos={onImportVideos}
          onImportAudio={onImportAudio}
          onSelectSegment={(id) => {
            onSelectSegment(id);
            setSelectedTextId(null);
            setSelectedAudioId(null);
          }}
          onSelectAudio={(id) => {
            setSelectedAudioId(id);
            setSelectedTextId(null);
          }}
        />
        <div className="flex min-w-0 flex-col items-center justify-center bg-[#050609] p-5">
          <div
            ref={previewRef}
            className="relative aspect-[9/16] max-h-[510px] w-full max-w-[287px] overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10"
          >
            {activeEntries.some((entry) => entry.segment.file) ? (
              activeEntries.map((entry, activeIndex) => {
                if (!entry.segment.file) return null;
                const entryIndex = layout.entries.indexOf(entry);
                const previous = layout.entries[entryIndex - 1];
                return (
                  <SyncedPreviewVideo
                    key={entry.segment.id}
                    url={getFileUrl(entry.segment.file)}
                    segment={entry.segment}
                    localTime={clamp(currentTime - entry.start, 0, entry.duration)}
                    playing={playing}
                    muted={removeAudio || entry.segment.mute}
                    layer={activeIndex}
                    transitionIn={previous?.segment.transition ?? "none"}
                    transitionInDuration={previous?.transitionDuration ?? 0}
                    transitionOut={entry.segment.transition}
                    transitionOutDuration={entry.transitionDuration}
                  />
                );
              })
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-slate-900 to-black text-slate-500">
                <Film className="size-9" />
                <p className="max-w-44 text-center text-xs leading-5">
                  Envie um clipe e mova o cursor para visualizar cada corte.
                </p>
              </div>
            )}

            {audioLayers.map((layer) => (
              <SyncedAudioLayer
                key={layer.id}
                url={getFileUrl(layer.file)}
                layer={layer}
                timelineTime={currentTime}
                playing={playing}
              />
            ))}

            {textOverlays
              .filter((overlay) => currentTime >= overlay.start && currentTime <= overlay.end)
              .map((overlay) => {
                const local = currentTime - overlay.start;
                const remaining = overlay.end - currentTime;
                const inProgress = clamp(local / overlay.animationDuration, 0, 1);
                const outProgress = clamp(remaining / overlay.animationDuration, 0, 1);
                const animationIn = evaluateTextAnimation(overlay.animationIn, inProgress);
                const animationOut = evaluateTextAnimation(overlay.animationOut, outProgress);
                const animationLoop = evaluateTextLoopAnimation(overlay.animationLoop, local);
                const opacity = animationIn.opacity * animationOut.opacity * animationLoop.opacity;
                const animationX = animationIn.x + animationOut.x + animationLoop.x;
                const animationY = animationIn.y + animationOut.y + animationLoop.y;
                const animationScale = animationIn.scale * animationOut.scale * animationLoop.scale;
                const animationRotate =
                  animationIn.rotate + animationOut.rotate + animationLoop.rotate;
                return (
                  <TextCanvasElement
                    key={overlay.id}
                    overlay={overlay}
                    selected={selectedTextId === overlay.id}
                    editing={editingTextId === overlay.id}
                    opacity={opacity}
                    animationX={animationX}
                    animationY={animationY}
                    animationScale={animationScale}
                    animationRotate={animationRotate}
                    onSelect={() => {
                      setSelectedTextId(overlay.id);
                      setSelectedAudioId(null);
                      setActivePanel("text");
                    }}
                    onEdit={() => setEditingTextId(overlay.id)}
                    onFinishEditing={() => setEditingTextId(null)}
                    onChange={(text) => updateText(overlay.id, { text })}
                    onPointerDown={(event) => beginTextDrag(event, overlay)}
                    onDuplicate={() => duplicateText(overlay)}
                    onRemove={() => removeText(overlay.id)}
                  />
                );
              })}
          </div>

          <div className="mt-4 flex items-center gap-2 text-white">
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 hover:text-white"
              onClick={() => seek(0)}
            >
              <SkipBack />
            </Button>
            <Button
              size="icon"
              className="size-11 rounded-full"
              onClick={() => {
                if (currentTime >= layout.duration) seek(0);
                setPlaying((current) => !current);
              }}
            >
              {playing ? <Pause /> : <Play className="ml-0.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-white/10 hover:text-white"
              onClick={() => seek(layout.duration)}
            >
              <SkipForward />
            </Button>
            <span className="ml-2 min-w-28 font-mono text-xs text-slate-300">
              {formatTime(currentTime)} / {formatTime(layout.duration)}
            </span>
          </div>
        </div>

        <aside className="border-l border-white/10 bg-[#11141d] p-4 text-slate-100">
          {selectedText ? (
            <TextInspector
              overlay={selectedText}
              duration={layout.duration}
              disabled={disabled}
              onChange={(patch) => updateText(selectedText.id, patch)}
              onRemove={() => removeText(selectedText.id)}
            />
          ) : selectedAudio ? (
            <AudioInspector
              layer={selectedAudio}
              timelineDuration={layout.duration}
              disabled={disabled}
              onChange={(patch) => updateAudio(selectedAudio.id, patch)}
              onRemove={() => removeAudioLayer(selectedAudio.id)}
              onSplit={splitSelectedAudio}
            />
          ) : selectedSegment ? (
            <ClipInspector
              segment={selectedSegment}
              disabled={disabled}
              removeAudio={removeAudio}
              onFile={(file) => onSelectFile(selectedSegment.id, file)}
              onChange={(patch) => onChangeSegment(selectedSegment.id, patch)}
              onToggleDetached={() => toggleDetachedAudio(selectedSegment)}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-slate-500">
              <Sparkles className="size-8" />
              <p className="max-w-48 text-xs leading-5">
                Selecione um clipe ou texto para editar suas propriedades.
              </p>
            </div>
          )}
        </aside>
      </div>

      <div className="border-t border-white/10 bg-[#0d1017]">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2 text-slate-300">
          <span className="text-[11px] font-medium">Timeline</span>
          <span className="hidden text-[10px] text-slate-500 sm:inline">
            Arraste os blocos · Ctrl + scroll muda o zoom
          </span>
          <div className="ml-auto flex items-center gap-1">
            <ZoomOut className="size-3.5" />
            <input
              aria-label="Zoom da timeline"
              className="w-28 accent-primary"
              type="range"
              min="24"
              max="120"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
            />
            <ZoomIn className="size-3.5" />
          </div>
        </div>
        <div
          ref={timelineViewportRef}
          className="overflow-x-auto pb-3"
          onWheel={handleTimelineWheel}
        >
          <div className="relative min-w-max" style={{ width: timelineWidth + 100 }}>
            <div className="grid h-7 grid-cols-[100px_1fr] border-b border-white/5 text-[9px] text-slate-500">
              <div className="border-r border-white/10 px-3 py-2">TEMPO</div>
              <div
                className="relative cursor-crosshair"
                style={{ width: timelineWidth }}
                onPointerDown={beginSeek}
              >
                {Array.from({ length: Math.ceil(layout.duration) + 1 }, (_, second) => (
                  <span
                    key={second}
                    className="absolute top-1.5 border-l border-white/15 pl-1"
                    style={{ left: second * zoom }}
                  >
                    {formatRuler(second)}
                  </span>
                ))}
              </div>
            </div>

            <TimelineRow
              label={
                <>
                  <Film className="size-3.5" /> Vídeo
                </>
              }
              width={timelineWidth}
              onSeek={beginSeek}
            >
              {layout.entries.map((entry) => (
                <ContextMenu key={entry.segment.id}>
                  <ContextMenuTrigger asChild>
                    <button
                      type="button"
                      draggable={!disabled}
                      className={`absolute top-1 h-16 overflow-hidden rounded-md border text-left shadow-lg transition ${clipColors[entry.segment.group]} ${selectedSegmentId === entry.segment.id && !selectedTextId ? "ring-2 ring-white ring-offset-1 ring-offset-[#0d1017]" : ""}`}
                      style={{
                        left: entry.start * zoom,
                        width: Math.max(28, entry.duration * zoom),
                        zIndex: layout.entries.indexOf(entry) + 1,
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedTextId(null);
                        setSelectedAudioId(null);
                        onSelectSegment(entry.segment.id);
                        seek(entry.start + Math.min(entry.duration / 2, 0.2));
                      }}
                      onDragStart={(event) => {
                        setDraggedSegmentId(entry.segment.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(event) => {
                        event.preventDefault();
                        event.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        reorderSegment(entry.segment.id);
                      }}
                      onDragEnd={() => setDraggedSegmentId(null)}
                    >
                      <span
                        className="absolute inset-y-0 left-0 z-20 w-2 cursor-ew-resize border-r border-white/50 bg-black/35"
                        onPointerDown={(event) => beginTrim(event, entry.segment, "start")}
                      />
                      <span className="absolute inset-0 flex opacity-55">
                        {(thumbnails[entry.segment.id] ?? []).map((image, index) => (
                          <span
                            key={index}
                            className="h-full min-w-0 flex-1 bg-cover bg-center"
                            style={{ backgroundImage: `url(${image})` }}
                          />
                        ))}
                      </span>
                      <GripVertical className="absolute left-2 top-2 z-10 size-3.5 text-white/80" />
                      <span className="absolute inset-x-2 bottom-1 z-10 flex items-center justify-between gap-2 text-[10px] font-semibold text-white drop-shadow">
                        <span className="truncate">{entry.segment.label}</span>
                        <span>{entry.duration.toFixed(1)}s</span>
                      </span>
                      <span
                        className="absolute inset-y-0 right-0 z-20 w-2 cursor-ew-resize border-l border-white/50 bg-black/35"
                        onPointerDown={(event) => beginTrim(event, entry.segment, "end")}
                      />
                    </button>
                  </ContextMenuTrigger>
                  <ContextMenuContent className="w-52">
                    <ContextMenuItem
                      onSelect={() => {
                        const local = clamp(currentTime - entry.start, 0, entry.duration);
                        onSplitSegment(
                          entry.segment.id,
                          entry.segment.start + local * entry.segment.playbackRate,
                        );
                      }}
                    >
                      <Scissors /> Dividir <ContextMenuShortcut>S</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => onDuplicateSegment(entry.segment.id)}>
                      <Copy /> Duplicar <ContextMenuShortcut>⌘D</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem
                      onSelect={() =>
                        onChangeSegment(entry.segment.id, { mute: !entry.segment.mute })
                      }
                    >
                      {entry.segment.mute ? <Volume2 /> : <VolumeX />}
                      {entry.segment.mute ? "Restaurar áudio" : "Silenciar"}
                      <ContextMenuShortcut>M</ContextMenuShortcut>
                    </ContextMenuItem>
                    <ContextMenuItem onSelect={() => toggleDetachedAudio(entry.segment)}>
                      <Link2Off />
                      {entry.segment.audioDetached ? "Vincular áudio" : "Separar áudio"}
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => onRemoveSegment(entry.segment.id)}
                    >
                      <Trash2 /> Excluir <ContextMenuShortcut>Delete</ContextMenuShortcut>
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              ))}
              {layout.entries.slice(0, -1).map((entry) =>
                entry.transitionDuration > 0 ? (
                  <button
                    key={`transition-${entry.segment.id}`}
                    type="button"
                    className="absolute top-[27px] z-30 flex size-5 -translate-x-1/2 rotate-45 items-center justify-center rounded-sm border border-violet-200 bg-violet-500 shadow"
                    style={{ left: (entry.end - entry.transitionDuration / 2) * zoom }}
                    title={`Transição: ${transitionNames[entry.segment.transition]}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedTextId(null);
                      setSelectedAudioId(null);
                      onSelectSegment(entry.segment.id);
                    }}
                  >
                    <Sparkles className="size-3 -rotate-45 text-white" />
                  </button>
                ) : null,
              )}
            </TimelineRow>

            <TimelineRow
              label={
                <>
                  <Type className="size-3.5" /> Texto
                </>
              }
              width={timelineWidth}
              onSeek={beginSeek}
              compact
            >
              {textOverlays.map((overlay) => (
                <button
                  key={overlay.id}
                  type="button"
                  className={`absolute top-1 h-9 overflow-hidden rounded border border-amber-300/70 bg-amber-400/25 px-2 text-left text-[10px] font-medium text-amber-50 ${selectedTextId === overlay.id ? "ring-2 ring-white" : ""}`}
                  style={{
                    left: overlay.start * zoom,
                    width: Math.max(34, (overlay.end - overlay.start) * zoom),
                  }}
                  onPointerDown={(event) => {
                    setSelectedTextId(overlay.id);
                    setSelectedAudioId(null);
                    const duration = overlay.end - overlay.start;
                    beginTimelineMove(event, overlay.start, duration, (start) =>
                      updateText(overlay.id, { start, end: start + duration }),
                    );
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedTextId(overlay.id);
                    setSelectedAudioId(null);
                    seek(overlay.start + 0.01);
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0 z-10 w-2 cursor-ew-resize border-r border-amber-100/70 bg-black/25"
                    onPointerDown={(event) => beginTextTrim(event, overlay, "start")}
                  />
                  <span className="block truncate">{overlay.text}</span>
                  <span
                    className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize border-l border-amber-100/70 bg-black/25"
                    onPointerDown={(event) => beginTextTrim(event, overlay, "end")}
                  />
                </button>
              ))}
              {!textOverlays.length && <EmptyTrack label="Clique em Adicionar texto" />}
            </TimelineRow>

            <TimelineRow
              label={
                <>
                  <Music2 className="size-3.5" /> Áudio
                </>
              }
              width={timelineWidth}
              onSeek={beginSeek}
              compact
            >
              {audioLayers.map((layer) => {
                const duration = layer.trimEnd - layer.trimStart;
                return (
                  <button
                    key={layer.id}
                    type="button"
                    className={`absolute top-1 flex h-9 cursor-grab items-center overflow-hidden rounded border border-cyan-300/60 bg-cyan-500/25 px-2 text-left text-[10px] text-cyan-50 active:cursor-grabbing ${selectedAudioId === layer.id ? "ring-2 ring-white" : ""}`}
                    style={{ left: layer.start * zoom, width: Math.max(42, duration * zoom) }}
                    onPointerDown={(event) => {
                      setSelectedAudioId(layer.id);
                      setSelectedTextId(null);
                      beginTimelineMove(event, layer.start, duration, (start) =>
                        updateAudio(layer.id, { start }),
                      );
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedAudioId(layer.id);
                      setSelectedTextId(null);
                      seek(layer.start + 0.01);
                    }}
                  >
                    <span
                      className="absolute inset-y-0 left-0 z-10 w-2 cursor-ew-resize border-r border-cyan-100/60 bg-black/30"
                      onPointerDown={(event) => beginAudioTrim(event, layer, "start")}
                    />
                    <Music2 className="mr-1 size-3 shrink-0" />
                    <span className="truncate">{layer.name}</span>
                    <span
                      className="absolute inset-y-0 right-0 z-10 w-2 cursor-ew-resize border-l border-cyan-100/60 bg-black/30"
                      onPointerDown={(event) => beginAudioTrim(event, layer, "end")}
                    />
                  </button>
                );
              })}
              {!audioLayers.length && (
                <EmptyTrack label="Separe o áudio de um clipe ou importe uma música" />
              )}
            </TimelineRow>

            <div
              className="pointer-events-none absolute bottom-0 top-0 z-50 w-px bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,.8)]"
              style={{ left: 100 + currentTime * zoom }}
            >
              <span className="absolute -left-1.5 top-0 h-0 w-0 border-x-[6px] border-t-[8px] border-x-transparent border-t-rose-400" />
            </div>
          </div>
        </div>
      </div>

      <Dialog open={shortcutsOpen} onOpenChange={setShortcutsOpen}>
        <DialogContent className="max-w-2xl border-white/10 bg-[#11141d] text-white">
          <DialogHeader>
            <DialogTitle>Atalhos de teclado</DialogTitle>
            <DialogDescription>
              Os atalhos ficam desativados enquanto você digita em um campo de texto.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={shortcutQuery}
            onChange={(event) => setShortcutQuery(event.target.value)}
            className="border-white/10 bg-black/25 text-white"
            placeholder="Buscar atalho"
            autoFocus
          />
          <div className="max-h-[55vh] space-y-5 overflow-y-auto pr-1">
            {(["Geral", "Reprodução", "Timeline"] as const).map((category) => {
              const items = editorShortcuts.filter(
                (shortcut) =>
                  shortcut.category === category &&
                  `${shortcut.label} ${shortcut.keys}`
                    .toLocaleLowerCase("pt-BR")
                    .includes(shortcutQuery.toLocaleLowerCase("pt-BR")),
              );
              if (!items.length) return null;
              return (
                <section key={category}>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {category}
                  </p>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {items.map((shortcut) => (
                      <div
                        key={shortcut.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2"
                      >
                        <span className="text-xs text-slate-300">{shortcut.label}</span>
                        <kbd className="shrink-0 rounded-md border border-white/10 bg-black/30 px-2 py-1 font-mono text-[9px] text-slate-300">
                          {shortcut.keys}
                        </kbd>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Digite uma ação ou ferramenta..." />
        <CommandList>
          <CommandEmpty>Nenhuma ação encontrada.</CommandEmpty>
          <CommandGroup heading="Criar">
            <CommandItem
              onSelect={() => {
                addText();
                setCommandOpen(false);
              }}
            >
              <Type /> Adicionar texto <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setActivePanel("media");
                setCommandOpen(false);
              }}
            >
              <Upload /> Abrir importação de mídia
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setActivePanel("audio");
                setCommandOpen(false);
              }}
            >
              <Music2 /> Abrir painel de áudio
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Editar seleção">
            <CommandItem
              disabled={!selectedSegment && !selectedAudio}
              onSelect={() => {
                splitCurrentSelection();
                setCommandOpen(false);
              }}
            >
              <Scissors /> Dividir no cursor <CommandShortcut>S</CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={!selectedSegment && !selectedText && !selectedAudio}
              onSelect={() => {
                duplicateSelection();
                setCommandOpen(false);
              }}
            >
              <Copy /> Duplicar seleção <CommandShortcut>⌘D</CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={!selectedSegment && !selectedAudio}
              onSelect={() => {
                muteSelection();
                setCommandOpen(false);
              }}
            >
              <VolumeX /> Silenciar seleção <CommandShortcut>M</CommandShortcut>
            </CommandItem>
            <CommandItem
              disabled={!selectedSegment && !selectedText && !selectedAudio}
              onSelect={() => {
                removeSelection();
                setCommandOpen(false);
              }}
            >
              <Trash2 /> Excluir seleção <CommandShortcut>Delete</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Projeto">
            <CommandItem
              onSelect={() => {
                onSave();
                setCommandOpen(false);
              }}
            >
              <Save /> Salvar projeto <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                setCommandOpen(false);
                setShortcutsOpen(true);
              }}
            >
              <HelpCircle /> Ver atalhos <CommandShortcut>?</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </section>
  );
}

function EditorResourcePanel({
  activePanel,
  onPanelChange,
  segments,
  audioLayers,
  disabled,
  onAddText,
  onApplyPreset,
  onImportVideos,
  onImportAudio,
  onSelectSegment,
  onSelectAudio,
}: {
  activePanel: "media" | "text" | "audio";
  onPanelChange: (panel: "media" | "text" | "audio") => void;
  segments: EditorSegment[];
  audioLayers: EditorAudioLayer[];
  disabled: boolean;
  onAddText: () => void;
  onApplyPreset: (preset: TextPreset) => void;
  onImportVideos: (files: File[]) => void;
  onImportAudio: (file: File) => void;
  onSelectSegment: (id: string) => void;
  onSelectAudio: (id: string) => void;
}) {
  const tabs = [
    { id: "media" as const, label: "Mídia", icon: Film },
    { id: "text" as const, label: "Texto", icon: Type },
    { id: "audio" as const, label: "Áudio", icon: Music2 },
  ];
  return (
    <aside className="min-h-0 border-r border-white/10 bg-[#11141d] text-slate-100">
      <div className="grid grid-cols-3 border-b border-white/10 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activePanel === tab.id}
            className={`flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[10px] transition ${
              activePanel === tab.id
                ? "bg-primary/15 text-primary"
                : "text-slate-500 hover:bg-white/[0.05] hover:text-slate-200"
            }`}
            onClick={() => onPanelChange(tab.id)}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>
      <div className="max-h-[610px] overflow-y-auto p-3">
        {activePanel === "media" && (
          <div className="space-y-4">
            <Button className="w-full" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload /> Importar vídeos
                <input
                  className="sr-only"
                  type="file"
                  multiple
                  accept="video/*"
                  disabled={disabled}
                  onChange={(event) => {
                    onImportVideos(Array.from(event.target.files ?? []));
                    event.target.value = "";
                  }}
                />
              </label>
            </Button>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  No projeto
                </p>
                <span className="text-[10px] text-slate-600">{segments.length}</span>
              </div>
              <div className="space-y-1.5">
                {segments.map((segment, index) => (
                  <button
                    key={segment.id}
                    type="button"
                    className="flex w-full items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] p-2 text-left transition hover:border-primary/30 hover:bg-primary/[0.06]"
                    onClick={() => onSelectSegment(segment.id)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sky-500/15 text-sky-300">
                      <Film className="size-3.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[11px] font-medium text-slate-200">
                        {segment.label}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        Clipe {index + 1} ·{" "}
                        {((segment.end - segment.start) / segment.playbackRate).toFixed(1)}s
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <p className="rounded-lg border border-white/[0.06] bg-black/20 p-3 text-[10px] leading-4 text-slate-500">
              Dica: selecione um clipe e pressione <kbd className="text-slate-300">S</kbd> para
              dividir exatamente no cursor vermelho.
            </p>
          </div>
        )}

        {activePanel === "text" && (
          <div className="space-y-4">
            <Button className="w-full" size="sm" onClick={onAddText} disabled={disabled}>
              <Type /> Adicionar texto{" "}
              <kbd className="ml-auto rounded bg-black/20 px-1 text-[9px]">T</kbd>
            </Button>
            <TextPresetBrowser onApply={onApplyPreset} />
          </div>
        )}

        {activePanel === "audio" && (
          <div className="space-y-4">
            <Button className="w-full" size="sm" asChild>
              <label className="cursor-pointer">
                <Upload /> Importar áudio
                <input
                  className="sr-only"
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg"
                  disabled={disabled}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) onImportAudio(file);
                    event.target.value = "";
                  }}
                />
              </label>
            </Button>
            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Camadas de áudio
                </p>
                <span className="text-[10px] text-slate-600">{audioLayers.length}</span>
              </div>
              {audioLayers.length ? (
                <div className="space-y-1.5">
                  {audioLayers.map((layer) => (
                    <button
                      key={layer.id}
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg border border-cyan-400/10 bg-cyan-400/[0.04] p-2 text-left transition hover:border-cyan-300/30"
                      onClick={() => onSelectAudio(layer.id)}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300">
                        <Music2 className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-[11px] text-slate-200">
                          {layer.name}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {(layer.trimEnd - layer.trimStart).toFixed(1)}s · {layer.volume}%
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 px-3 py-7 text-center text-[10px] leading-4 text-slate-500">
                  Importe uma música ou separe o áudio de um clipe.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function TextCanvasElement({
  overlay,
  selected,
  editing,
  opacity,
  animationX,
  animationY,
  animationScale,
  animationRotate,
  onSelect,
  onEdit,
  onFinishEditing,
  onChange,
  onPointerDown,
  onDuplicate,
  onRemove,
}: {
  overlay: EditorTextOverlay;
  selected: boolean;
  editing: boolean;
  opacity: number;
  animationX: number;
  animationY: number;
  animationScale: number;
  animationRotate: number;
  onSelect: () => void;
  onEdit: () => void;
  onFinishEditing: () => void;
  onChange: (text: string) => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onDuplicate: () => void;
  onRemove: () => void;
}) {
  const visualStyle = getTextVisualStyle(overlay, 0.4);
  const elementStyle = {
    ...visualStyle,
    left: `${overlay.x}%`,
    top: `${overlay.y}%`,
    fontSize: `${Math.max(12, overlay.fontSize * 0.4)}px`,
    opacity,
    transform: `translate(calc(-50% + ${animationX}px), calc(-50% + ${animationY}px)) scale(${animationScale}) rotate(${(overlay.rotation ?? 0) + animationRotate}deg)`,
  };
  return (
    <>
      {selected && !editing && (
        <div
          className="absolute z-40 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border border-white/10 bg-[#151924]/95 p-1 shadow-xl backdrop-blur"
          style={{ left: `${overlay.x}%`, top: `calc(${overlay.y}% - 46px)` }}
          onPointerDown={(event) => event.stopPropagation()}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-[10px] text-white hover:bg-white/10"
            onClick={onEdit}
          >
            <Type className="size-3" /> Editar
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-white hover:bg-white/10"
            onClick={onDuplicate}
            title="Duplicar (Ctrl + D)"
          >
            <Copy className="size-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-7 text-rose-300 hover:bg-rose-500/10"
            onClick={onRemove}
            title="Excluir (Delete)"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      )}
      {editing ? (
        <textarea
          autoFocus
          value={overlay.text}
          aria-label="Editar texto no vídeo"
          className="absolute z-40 max-w-[84%] resize-none overflow-hidden border border-primary bg-transparent text-center leading-tight outline-none ring-2 ring-primary/35"
          style={elementStyle}
          rows={Math.max(1, overlay.text.split("\n").length)}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onFinishEditing}
          onKeyDown={(event) => {
            if (
              event.key === "Escape" ||
              ((event.ctrlKey || event.metaKey) && event.key === "Enter")
            ) {
              event.preventDefault();
              onFinishEditing();
            }
          }}
        />
      ) : (
        <button
          type="button"
          onPointerDown={onPointerDown}
          onClick={onSelect}
          onDoubleClick={onEdit}
          className={`absolute z-30 max-w-[84%] cursor-move whitespace-pre-wrap text-center leading-tight ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-transparent" : ""}`}
          style={elementStyle}
          title="Arraste para mover · duplo clique para editar"
        >
          {(overlay.decorations ?? []).map((decoration, index) => (
            <span
              key={`${decoration.type}-${index}`}
              className="pointer-events-none absolute font-black"
              style={{
                color: decoration.color,
                left: `${decoration.x}%`,
                top: `${decoration.y}%`,
                fontSize: decoration.size * 0.4,
                transform: `translate(-50%, -50%) rotate(${decoration.rotation ?? 0}deg)`,
              }}
            >
              {decoration.type === "sparkle"
                ? "✦"
                : decoration.type === "star"
                  ? "★"
                  : decoration.type === "bolt"
                    ? "ϟ"
                    : "●"}
            </span>
          ))}
          {overlay.text}
        </button>
      )}
    </>
  );
}

function SyncedAudioLayer({
  url,
  layer,
  timelineTime,
  playing,
}: {
  url: string;
  layer: EditorAudioLayer;
  timelineTime: number;
  playing: boolean;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const localTime = timelineTime - layer.start;
  const duration = layer.trimEnd - layer.trimStart;
  const active = localTime >= 0 && localTime <= duration && !layer.muted;
  const fadeInVolume = layer.fadeIn > 0 ? clamp(localTime / layer.fadeIn, 0, 1) : 1;
  const fadeOutVolume = layer.fadeOut > 0 ? clamp((duration - localTime) / layer.fadeOut, 0, 1) : 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!active) {
      audio.pause();
      return;
    }
    const sourceTime = layer.trimStart + localTime;
    if (Math.abs(audio.currentTime - sourceTime) > 0.18) audio.currentTime = sourceTime;
    audio.volume = clamp((layer.volume / 100) * fadeInVolume * fadeOutVolume, 0, 1);
    if (playing) void audio.play().catch(() => undefined);
    else audio.pause();
  }, [active, fadeInVolume, fadeOutVolume, layer.trimStart, layer.volume, localTime, playing]);

  return <audio ref={audioRef} src={url} preload="auto" />;
}

function SyncedPreviewVideo({
  url,
  segment,
  localTime,
  playing,
  muted,
  layer,
  transitionIn,
  transitionInDuration,
  transitionOut,
  transitionOutDuration,
}: {
  url: string;
  segment: EditorSegment;
  localTime: number;
  playing: boolean;
  muted: boolean;
  layer: number;
  transitionIn: EditorSegment["transition"];
  transitionInDuration: number;
  transitionOut: EditorSegment["transition"];
  transitionOutDuration: number;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const duration = Math.max(0.1, (segment.end - segment.start) / segment.playbackRate);
  const sourceTime = segment.start + localTime * segment.playbackRate;
  const entryProgress = transitionInDuration ? clamp(localTime / transitionInDuration, 0, 1) : 1;
  const exitProgress = transitionOutDuration
    ? clamp((duration - localTime) / transitionOutDuration, 0, 1)
    : 1;
  const animationInProgress = clamp(localTime / segment.animationDuration, 0, 1);
  const animationOutProgress = clamp((duration - localTime) / segment.animationDuration, 0, 1);
  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;
  let clipPath = "none";
  let whiteOpacity = 0;
  let blur = 0;

  if (transitionIn === "fade") opacity *= entryProgress;
  if (transitionOut === "fade") opacity *= exitProgress;
  if (transitionIn === "slideleft") translateX += (1 - entryProgress) * 100;
  if (transitionIn === "wipeleft" || transitionIn === "smoothleft") {
    clipPath = `inset(0 ${100 - entryProgress * 100}% 0 0)`;
  }
  if (transitionIn === "circleopen") clipPath = `circle(${entryProgress * 75}% at 50% 50%)`;
  if (segment.animationIn === "fade") opacity *= animationInProgress;
  if (segment.animationOut === "fade") opacity *= animationOutProgress;
  if (segment.animationIn === "fade-white")
    whiteOpacity = Math.max(whiteOpacity, 1 - animationInProgress);
  if (segment.animationOut === "fade-white")
    whiteOpacity = Math.max(whiteOpacity, 1 - animationOutProgress);
  if (segment.animationIn === "none" && segment.fadeIn > 0) {
    opacity *= clamp(localTime / segment.fadeIn, 0, 1);
  }
  if (segment.animationOut === "none" && segment.fadeOut > 0) {
    opacity *= clamp((duration - localTime) / segment.fadeOut, 0, 1);
  }
  if (segment.animationIn === "zoom") scale *= 1.16 - animationInProgress * 0.16;
  if (segment.animationOut === "zoom") scale *= 1.16 - animationOutProgress * 0.16;
  if (segment.animationIn === "pulse") scale *= 1.1 - animationInProgress * 0.1;
  if (segment.animationOut === "pulse") scale *= 1.1 - animationOutProgress * 0.1;
  if (segment.animationIn === "blur") blur = Math.max(blur, (1 - animationInProgress) * 12);
  if (segment.animationOut === "blur") blur = Math.max(blur, (1 - animationOutProgress) * 12);
  if (segment.animationIn === "shake") {
    translateX += Math.sin(localTime * 48) * (1 - animationInProgress) * 2.2;
    translateY += Math.cos(localTime * 42) * (1 - animationInProgress) * 1.2;
  }
  if (segment.animationOut === "shake") {
    translateX += Math.sin(localTime * 48) * (1 - animationOutProgress) * 2.2;
    translateY += Math.cos(localTime * 42) * (1 - animationOutProgress) * 1.2;
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
    video.playbackRate = segment.playbackRate;
    video.volume = clamp((segment.volume / 100) * Math.min(entryProgress, exitProgress), 0, 1);
    if (Math.abs(video.currentTime - sourceTime) > (playing ? 0.22 : 0.035)) {
      video.currentTime = clamp(sourceTime, 0, segment.duration);
    }
    if (playing) void video.play().catch(() => undefined);
    else video.pause();
  }, [
    entryProgress,
    exitProgress,
    muted,
    playing,
    segment.duration,
    segment.playbackRate,
    segment.volume,
    sourceTime,
  ]);

  return (
    <>
      <video
        ref={videoRef}
        src={url}
        muted={muted}
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-contain"
        style={{
          zIndex: 5 + layer * 2,
          opacity,
          clipPath,
          transform: `translate(${translateX}%, ${translateY}%) scale(${scale}) scaleX(${segment.mirror ? -1 : 1})`,
          filter: `brightness(${1 + segment.brightness}) contrast(${segment.contrast}) saturate(${segment.saturation}) blur(${blur}px)`,
        }}
      />
      {whiteOpacity > 0 && (
        <span
          className="pointer-events-none absolute inset-0 bg-white"
          style={{ zIndex: 6 + layer * 2, opacity: whiteOpacity }}
        />
      )}
    </>
  );
}

function ClipInspector({
  segment,
  disabled,
  removeAudio,
  onFile,
  onChange,
  onToggleDetached,
}: {
  segment: EditorSegment;
  disabled: boolean;
  removeAudio: boolean;
  onFile: (file: File | null) => void;
  onChange: (patch: Partial<EditorSegment>) => void;
  onToggleDetached: () => void;
}) {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">
          Clipe selecionado
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold">{segment.label}</h3>
        <p className="mt-1 truncate text-[11px] text-slate-500">
          {segment.file?.name ?? "Aguardando mídia"}
        </p>
        <Input
          className="mt-3 h-9 border-white/10 bg-black/20 text-[10px] text-slate-300 file:text-slate-200"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          disabled={disabled}
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
        />
      </div>
      <InspectorGroup title="Corte e velocidade">
        <div className="grid grid-cols-2 gap-2">
          <DarkNumber
            label="Início"
            value={segment.start}
            min={0}
            max={segment.end - 0.1}
            disabled={disabled || !segment.file}
            onChange={(start) => onChange({ start })}
          />
          <DarkNumber
            label="Fim"
            value={segment.end}
            min={segment.start + 0.1}
            max={segment.duration}
            disabled={disabled || !segment.file}
            onChange={(end) => onChange({ end })}
          />
        </div>
        <div>
          <p className="mb-1 text-[10px] text-slate-400">
            Duração final: {((segment.end - segment.start) / segment.playbackRate).toFixed(1)}s
          </p>
          <div className="grid grid-cols-4 gap-1">
            {[1, 3, 5, 8].map((seconds) => (
              <button
                key={seconds}
                type="button"
                className="rounded-md border border-white/10 bg-black/20 py-1.5 text-[10px] text-slate-300 hover:border-primary/50"
                disabled={disabled || !segment.file}
                onClick={() =>
                  onChange({
                    end: Math.min(segment.duration, segment.start + seconds * segment.playbackRate),
                  })
                }
              >
                {seconds}s
              </button>
            ))}
          </div>
        </div>
        <DarkSelect
          label="Velocidade"
          value={segment.playbackRate}
          disabled={disabled}
          onChange={(value) => onChange({ playbackRate: Number(value) })}
        >
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <option key={rate} value={rate}>
              {rate}×
            </option>
          ))}
        </DarkSelect>
      </InspectorGroup>
      <InspectorGroup title="Áudio">
        <Range
          label="Volume"
          value={segment.volume}
          min={0}
          max={200}
          suffix="%"
          disabled={disabled || removeAudio || segment.mute}
          onChange={(volume) => onChange({ volume })}
        />
        <div className="grid grid-cols-2 gap-2">
          <SmallAction
            active={segment.mute}
            icon={segment.mute ? VolumeX : Volume2}
            label={segment.mute ? "Silenciado" : "Com áudio"}
            onClick={() => onChange({ mute: !segment.mute })}
          />
          <SmallAction
            active={segment.audioDetached}
            icon={Link2Off}
            label={segment.audioDetached ? "Separado" : "Vinculado"}
            onClick={onToggleDetached}
          />
        </div>
      </InspectorGroup>
      <InspectorGroup title="Animação do clipe">
        <DarkSelect
          label="Entrada"
          value={segment.animationIn}
          disabled={disabled}
          onChange={(value) => onChange({ animationIn: value as EditorSegment["animationIn"] })}
        >
          <option value="none">Nenhuma</option>
          <option value="fade">Desvanecer</option>
          <option value="fade-white">Flash branco</option>
          <option value="zoom">Zoom suave</option>
          <option value="pulse">Pulso de impacto</option>
          <option value="blur">Desfoque revelando</option>
          <option value="shake">Shake de impacto</option>
        </DarkSelect>
        <DarkSelect
          label="Saída"
          value={segment.animationOut}
          disabled={disabled}
          onChange={(value) => onChange({ animationOut: value as EditorSegment["animationOut"] })}
        >
          <option value="none">Nenhuma</option>
          <option value="fade">Desvanecer</option>
          <option value="fade-white">Flash branco</option>
          <option value="zoom">Zoom suave</option>
          <option value="pulse">Pulso de impacto</option>
          <option value="blur">Desfoque de saída</option>
          <option value="shake">Shake de saída</option>
        </DarkSelect>
        <Range
          label="Duração"
          value={segment.animationDuration}
          min={0.15}
          max={1.5}
          step={0.05}
          suffix="s"
          disabled={disabled}
          onChange={(animationDuration) => onChange({ animationDuration })}
        />
      </InspectorGroup>
      <InspectorGroup title="Transição para o próximo">
        <DarkSelect
          label="Efeito"
          value={segment.transition}
          disabled={disabled}
          onChange={(value) => onChange({ transition: value as EditorSegment["transition"] })}
        >
          {Object.entries(transitionNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </DarkSelect>
        <Range
          label="Duração"
          value={segment.transitionDuration}
          min={0.15}
          max={1.5}
          step={0.05}
          suffix="s"
          disabled={disabled || segment.transition === "none"}
          onChange={(transitionDuration) => onChange({ transitionDuration })}
        />
      </InspectorGroup>
    </div>
  );
}

function AudioInspector({
  layer,
  timelineDuration,
  disabled,
  onChange,
  onRemove,
  onSplit,
}: {
  layer: EditorAudioLayer;
  timelineDuration: number;
  disabled: boolean;
  onChange: (patch: Partial<EditorAudioLayer>) => void;
  onRemove: () => void;
  onSplit: () => void;
}) {
  const selectedDuration = Math.max(0.1, layer.trimEnd - layer.trimStart);
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-300">
            Camada de áudio
          </p>
          <h3 className="mt-1 truncate text-sm font-semibold">{layer.name}</h3>
          <p className="mt-1 text-[11px] text-slate-500">{selectedDuration.toFixed(1)}s usados</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <AudioWaveformEditor layer={layer} onChange={onChange} />
      <Button variant="outline" size="sm" className="w-full" disabled={disabled} onClick={onSplit}>
        <Scissors /> Dividir exatamente no cursor vermelho
      </Button>
      <InspectorGroup title="Posição e corte">
        <DarkNumber
          label="Começa na timeline"
          value={layer.start}
          min={0}
          max={timelineDuration}
          disabled={disabled}
          onChange={(start) => onChange({ start })}
        />
        <div className="grid grid-cols-2 gap-2">
          <DarkNumber
            label="Cortar início"
            value={layer.trimStart}
            min={0}
            max={layer.trimEnd - 0.1}
            disabled={disabled}
            onChange={(trimStart) => onChange({ trimStart })}
          />
          <DarkNumber
            label="Cortar fim"
            value={layer.trimEnd}
            min={layer.trimStart + 0.1}
            max={layer.duration}
            disabled={disabled}
            onChange={(trimEnd) => onChange({ trimEnd })}
          />
        </div>
      </InspectorGroup>
      <InspectorGroup title="Mixagem">
        <Range
          label="Volume"
          value={layer.volume}
          min={0}
          max={150}
          suffix="%"
          disabled={disabled || layer.muted}
          onChange={(volume) => onChange({ volume })}
        />
        <div className="grid grid-cols-2 gap-2">
          <Range
            label="Fade entrada"
            value={layer.fadeIn}
            min={0}
            max={Math.min(4, selectedDuration / 2)}
            step={0.1}
            suffix="s"
            disabled={disabled}
            onChange={(fadeIn) => onChange({ fadeIn })}
          />
          <Range
            label="Fade saída"
            value={layer.fadeOut}
            min={0}
            max={Math.min(4, selectedDuration / 2)}
            step={0.1}
            suffix="s"
            disabled={disabled}
            onChange={(fadeOut) => onChange({ fadeOut })}
          />
        </div>
        <SmallAction
          active={layer.muted}
          icon={layer.muted ? VolumeX : Volume2}
          label={layer.muted ? "Camada silenciada" : "Camada com áudio"}
          onClick={() => onChange({ muted: !layer.muted })}
        />
      </InspectorGroup>
      <p className="text-[10px] leading-4 text-slate-500">
        Arraste o bloco azul na timeline para sincronizar a música com o corte.
      </p>
    </div>
  );
}

function AudioWaveformEditor({
  layer,
  onChange,
}: {
  layer: EditorAudioLayer;
  onChange: (patch: Partial<EditorAudioLayer>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const regionRef = useRef<{
    start: number;
    end: number;
    setOptions: (options: { start?: number; end?: number }) => void;
  } | null>(null);
  const onChangeRef = useRef(onChange);
  const layerRef = useRef(layer);
  layerRef.current = layer;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const url = URL.createObjectURL(layer.file);
    let destroyed = false;
    let destroy = () => undefined;
    void Promise.all([
      import("wavesurfer.js"),
      import("wavesurfer.js/dist/plugins/regions.esm.js"),
    ]).then(([waveSurferModule, regionsModule]) => {
      if (destroyed) return;
      const regions = regionsModule.default.create();
      const waveSurfer = waveSurferModule.default.create({
        container,
        url,
        height: 76,
        waveColor: "#334155",
        progressColor: "#22d3ee",
        cursorColor: "#fb7185",
        cursorWidth: 2,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        dragToSeek: true,
        plugins: [regions],
      });
      const region = regions.addRegion({
        id: `selection-${layer.id}`,
        start: layerRef.current.trimStart,
        end: layerRef.current.trimEnd,
        minLength: 0.1,
        color: "rgba(34,211,238,.18)",
        drag: true,
        resize: true,
      });
      regionRef.current = region;
      const unsubscribe = regions.on("region-updated", (updated) => {
        onChangeRef.current({
          trimStart: Number(updated.start.toFixed(3)),
          trimEnd: Number(updated.end.toFixed(3)),
        });
      });
      destroy = () => {
        unsubscribe();
        regionRef.current = null;
        waveSurfer.destroy();
      };
    });
    return () => {
      destroyed = true;
      destroy();
      URL.revokeObjectURL(url);
      container.replaceChildren();
    };
  }, [layer.file, layer.id]);

  useEffect(() => {
    const region = regionRef.current;
    if (!region) return;
    if (
      Math.abs(region.start - layer.trimStart) > 0.01 ||
      Math.abs(region.end - layer.trimEnd) > 0.01
    ) {
      region.setOptions({ start: layer.trimStart, end: layer.trimEnd });
    }
  }, [layer.trimEnd, layer.trimStart]);

  return (
    <div>
      <div
        ref={containerRef}
        className="overflow-hidden rounded-lg border border-cyan-400/20 bg-black/30 p-1"
      />
      <p className="mt-1.5 text-[10px] leading-4 text-slate-500">
        WaveSurfer: arraste a região azul ou suas bordas para escolher qualquer trecho do áudio.
      </p>
    </div>
  );
}

function TextInspector({
  overlay,
  duration,
  disabled,
  onChange,
  onRemove,
}: {
  overlay: EditorTextOverlay;
  duration: number;
  disabled: boolean;
  onChange: (patch: Partial<EditorTextOverlay>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-300">
            Camada de texto
          </p>
          <h3 className="mt-1 text-sm font-semibold">Editar texto</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
          onClick={onRemove}
        >
          <Trash2 />
        </Button>
      </div>
      <textarea
        className="min-h-24 w-full resize-none rounded-lg border border-white/10 bg-black/25 p-3 text-sm outline-none focus:border-primary"
        value={overlay.text}
        disabled={disabled}
        onChange={(event) => onChange({ text: event.target.value })}
      />
      <InspectorGroup title="Aparência">
        <DarkSelect
          label="Efeito de texto"
          value={overlay.style}
          disabled={disabled}
          onChange={(value) => onChange({ style: value as EditorTextOverlay["style"] })}
        >
          <option value="caption">Legenda TikTok</option>
          <option value="impact">Impacto / oferta</option>
          <option value="neon">Neon creator</option>
          <option value="classic">Clássico com contorno</option>
          <option value="minimal">Minimalista</option>
        </DarkSelect>
        <Range
          label="Tamanho"
          value={overlay.fontSize}
          min={18}
          max={96}
          suffix="px"
          disabled={disabled}
          onChange={(fontSize) => onChange({ fontSize })}
        />
        <DarkSelect
          label="Fonte"
          value={overlay.fontFamily ?? "Arial Black, Arial, sans-serif"}
          disabled={disabled}
          onChange={(fontFamily) => onChange({ fontFamily })}
        >
          <option value="Arial Black, Arial, sans-serif">Impacto moderno</option>
          <option value="Impact, Arial Black, sans-serif">Impact</option>
          <option value="Trebuchet MS, Arial, sans-serif">Trebuchet</option>
          <option value="Georgia, serif">Editorial</option>
          <option value="Times New Roman, Georgia, serif">Serif clássico</option>
          <option value="Verdana, Arial, sans-serif">Legenda legível</option>
        </DarkSelect>
        <div className="grid grid-cols-2 gap-2">
          <ColorControl
            label="Texto"
            value={overlay.color}
            onChange={(color) => onChange({ color })}
          />
          <label className="text-[10px] text-slate-400">
            Fundo
            <select
              className="mt-1 h-9 w-full rounded-md border border-white/10 bg-[#090b11] px-2 text-xs text-white"
              value={overlay.backgroundColor}
              onChange={(event) => onChange({ backgroundColor: event.target.value })}
            >
              <option value="transparent">Sem fundo</option>
              <option value="rgba(0,0,0,0.55)">Preto</option>
              <option value="rgba(255,255,255,0.88)">Branco</option>
              <option value="rgba(124,58,237,0.85)">Roxo</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <ColorControl
            label="Contorno"
            value={overlay.strokeColor ?? "#111827"}
            onChange={(strokeColor) => onChange({ strokeColor })}
          />
          <DarkNumber
            label="Espessura"
            value={overlay.strokeWidth ?? 3}
            min={0}
            max={12}
            disabled={disabled}
            onChange={(strokeWidth) => onChange({ strokeWidth })}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <DarkNumber
            label="Rotação"
            value={overlay.rotation ?? 0}
            min={-30}
            max={30}
            disabled={disabled}
            onChange={(rotation) => onChange({ rotation })}
          />
          <DarkNumber
            label="Espaçamento"
            value={overlay.letterSpacing ?? 0}
            min={-3}
            max={12}
            disabled={disabled}
            onChange={(letterSpacing) => onChange({ letterSpacing })}
          />
        </div>
      </InspectorGroup>
      <InspectorGroup title="Tempo na tela">
        <div className="grid grid-cols-2 gap-2">
          <DarkNumber
            label="Entrada"
            value={overlay.start}
            min={0}
            max={overlay.end - 0.1}
            disabled={disabled}
            onChange={(start) => onChange({ start })}
          />
          <DarkNumber
            label="Saída"
            value={overlay.end}
            min={overlay.start + 0.1}
            max={duration}
            disabled={disabled}
            onChange={(end) => onChange({ end })}
          />
        </div>
      </InspectorGroup>
      <InspectorGroup title="Animação">
        <AnimationPresetChooser overlay={overlay} disabled={disabled} onChange={onChange} />
        <Range
          label="Duração"
          value={overlay.animationDuration}
          min={0.1}
          max={1.2}
          step={0.05}
          suffix="s"
          disabled={disabled}
          onChange={(animationDuration) => onChange({ animationDuration })}
        />
      </InspectorGroup>
      <p className="text-[10px] leading-4 text-slate-500">
        Arraste o texto diretamente sobre o vídeo para posicioná-lo.
      </p>
    </div>
  );
}

function AnimationPresetChooser({
  overlay,
  disabled,
  onChange,
}: {
  overlay: EditorTextOverlay;
  disabled: boolean;
  onChange: (patch: Partial<EditorTextOverlay>) => void;
}) {
  const [tab, setTab] = useState<"entrance" | "exit" | "loop">("entrance");
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-3 rounded-lg bg-black/25 p-1">
        {(
          [
            ["entrance", "Entrada"],
            ["exit", "Saída"],
            ["loop", "Loop"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`rounded-md px-2 py-1.5 text-[10px] transition ${tab === id ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        {tab === "loop"
          ? textLoopAnimationPresets.map((preset) => (
              <AnimationOptionCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                mode="loop"
                selected={(overlay.animationLoop ?? "none") === preset.id}
                disabled={disabled}
                onSelect={() => onChange({ animationLoop: preset.id })}
              />
            ))
          : textAnimationPresets.map((preset) => (
              <AnimationOptionCard
                key={preset.id}
                id={preset.id}
                name={preset.name}
                mode={tab}
                selected={
                  (tab === "entrance" ? overlay.animationIn : overlay.animationOut) === preset.id
                }
                disabled={disabled}
                onSelect={() =>
                  onChange(
                    tab === "entrance" ? { animationIn: preset.id } : { animationOut: preset.id },
                  )
                }
              />
            ))}
      </div>
      <p className="text-[9px] leading-4 text-slate-500">
        Passe o mouse para pré-visualizar sem alterar o projeto.
      </p>
    </div>
  );
}

function AnimationOptionCard({
  id,
  name,
  mode,
  selected,
  disabled,
  onSelect,
}: {
  id: EditorTextOverlay["animationIn"] | EditorTextOverlay["animationLoop"];
  name: string;
  mode: "entrance" | "exit" | "loop";
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const frameRef = useRef<number | null>(null);
  const [motion, setMotion] = useState({ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
  const stop = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    setMotion({ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 });
  };
  const preview = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    stop();
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      if (mode === "loop") {
        setMotion(evaluateTextLoopAnimation(id as EditorTextOverlay["animationLoop"], elapsed));
        if (elapsed < 1.4) frameRef.current = requestAnimationFrame(tick);
        else stop();
        return;
      }
      const rawProgress = Math.min(1, elapsed / 0.75);
      const progress = mode === "exit" ? 1 - rawProgress : rawProgress;
      setMotion(evaluateTextAnimation(id as EditorTextOverlay["animationIn"], progress));
      if (rawProgress < 1) frameRef.current = requestAnimationFrame(tick);
      else stop();
    };
    frameRef.current = requestAnimationFrame(tick);
  };
  useEffect(() => stop, []);
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={`overflow-hidden rounded-lg border px-1.5 py-2 text-center transition ${selected ? "border-primary/60 bg-primary/15 text-primary" : "border-white/[0.07] bg-black/20 text-slate-400 hover:border-white/20 hover:text-white"}`}
      onMouseEnter={preview}
      onMouseLeave={stop}
      onFocus={preview}
      onBlur={stop}
      onClick={onSelect}
      title={`Prévia: ${name}`}
    >
      <span
        className="mx-auto block w-fit rounded bg-white/10 px-1.5 py-0.5 text-[11px] font-black"
        style={{
          opacity: motion.opacity,
          transform: `translate(${motion.x * 0.18}px, ${motion.y * 0.18}px) scale(${motion.scale}) rotate(${motion.rotate}deg)`,
        }}
      >
        Aa
      </span>
      <span className="mt-1.5 block truncate text-[9px]">{name}</span>
    </button>
  );
}

function TimelineRow({
  label,
  width,
  onSeek,
  compact = false,
  children,
}: {
  label: React.ReactNode;
  width: number;
  onSeek: (event: React.PointerEvent<HTMLElement>) => void;
  compact?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-[100px_1fr] border-b border-white/5 ${compact ? "h-12" : "h-[74px]"}`}
    >
      <div className="flex items-center gap-2 border-r border-white/10 px-3 text-[10px] font-medium text-slate-400">
        {label}
      </div>
      <div className="relative cursor-crosshair" style={{ width }} onPointerDown={onSeek}>
        {children}
      </div>
    </div>
  );
}

function EmptyTrack({ label }: { label: string }) {
  return (
    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-600">
      {label}
    </span>
  );
}

function InspectorGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border-t border-white/10 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      {children}
    </div>
  );
}

function DarkSelect({
  label,
  value,
  disabled,
  onChange,
  children,
}: {
  label: string;
  value: string | number;
  disabled: boolean;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-[10px] text-slate-400">
      {label}
      <select
        className="mt-1 h-9 w-full rounded-md border border-white/10 bg-[#090b11] px-2 text-xs text-white outline-none focus:border-primary"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  );
}

function DarkNumber({
  label,
  value,
  min,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="text-[10px] text-slate-400">
      {label}
      <Input
        className="mt-1 h-9 border-white/10 bg-[#090b11] text-xs text-white"
        type="number"
        step="0.05"
        value={Number(value.toFixed(2))}
        min={min}
        max={max}
        disabled={disabled}
        onChange={(event) => onChange(clamp(Number(event.target.value), min, max))}
      />
    </label>
  );
}

function Range({
  label,
  value,
  min,
  max,
  step = 1,
  suffix,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block text-[10px] text-slate-400">
      <span className="flex justify-between">
        <span>{label}</span>
        <span className="text-slate-200">
          {Number(value.toFixed(2))}
          {suffix}
        </span>
      </span>
      <input
        className="mt-2 w-full accent-primary"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function SmallAction({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof Volume2;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-[10px] ${active ? "border-primary/50 bg-primary/15 text-primary" : "border-white/10 bg-black/20 text-slate-300"}`}
      onClick={onClick}
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[10px] text-slate-400">
      {label}
      <span className="mt-1 flex h-9 items-center gap-2 rounded-md border border-white/10 bg-[#090b11] px-2">
        <input
          type="color"
          className="size-5 border-0 bg-transparent p-0"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        <span className="font-mono text-[10px] text-slate-300">{value}</span>
      </span>
    </label>
  );
}

const transitionNames: Record<EditorSegment["transition"], string> = {
  none: "Sem transição",
  fade: "Dissolver (Fade)",
  fadeblacks: "Fade em Preto",
  fadewhites: "Fade em Branco",
  wipeleft: "Varredura Esquerda",
  wiperight: "Varredura Direita",
  wipeup: "Varredura Cima",
  wipedown: "Varredura Baixo",
  slideleft: "Deslizar Esquerda",
  slideright: "Deslizar Direita",
  slideup: "Deslizar Cima",
  slidedown: "Deslizar Baixo",
  smoothleft: "Deslizar Suave Esquerda",
  smoothright: "Deslizar Suave Direita",
  circleopen: "Círculo Abrindo",
  circleclose: "Círculo Fechando",
  pixelize: "Pixelizar",
  zoomin: "Zoom In",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function formatTime(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60);
  const hundredths = Math.floor((value % 1) * 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

function formatRuler(value: number) {
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
}

async function createVideoThumbnails(file: File, count: number) {
  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.preload = "auto";
    await waitFor(video, "loadedmetadata");
    const canvas = document.createElement("canvas");
    canvas.width = 120;
    canvas.height = 180;
    const context = canvas.getContext("2d");
    if (!context) return [];
    const images: string[] = [];
    for (let index = 0; index < count; index += 1) {
      video.currentTime = Math.min(video.duration - 0.03, ((index + 0.5) / count) * video.duration);
      await waitFor(video, "seeked");
      const scale = Math.max(canvas.width / video.videoWidth, canvas.height / video.videoHeight);
      const width = video.videoWidth * scale;
      const height = video.videoHeight * scale;
      context.drawImage(
        video,
        (canvas.width - width) / 2,
        (canvas.height - height) / 2,
        width,
        height,
      );
      images.push(canvas.toDataURL("image/jpeg", 0.62));
    }
    return images;
  } catch {
    return [];
  } finally {
    URL.revokeObjectURL(url);
  }
}

function waitFor(target: HTMLVideoElement, eventName: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const done = () => {
      cleanup();
      resolve();
    };
    const fail = () => {
      cleanup();
      reject(new Error("Não foi possível preparar a prévia."));
    };
    const cleanup = () => {
      target.removeEventListener(eventName, done);
      target.removeEventListener("error", fail);
    };
    target.addEventListener(eventName, done, { once: true });
    target.addEventListener("error", fail, { once: true });
  });
}
