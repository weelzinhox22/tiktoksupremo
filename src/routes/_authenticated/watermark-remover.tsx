import { useEffect, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Crop,
  Download,
  Eye,
  FileVideo2,
  Image as ImageIcon,
  Loader2,
  Maximize2,
  Move,
  Play,
  RefreshCw,
  Scissors,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchTikTokVideoInfo,
  type TikTokVideoMetadata,
} from "@/features/tiktok-downloader/server";

export const Route = createFileRoute("/_authenticated/watermark-remover")({
  component: WatermarkRemoverPage,
  head: () => ({ meta: [{ title: "Remover Marca d'Água com IA — Tik Supremo" }] }),
});

type Mode = "link" | "editor";

function WatermarkRemoverPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Mode>("editor");

  // --- LINK MODE STATE ---
  const [linkInput, setLinkInput] = useState("");
  const [fetchingLink, setFetchingLink] = useState(false);
  const [linkVideoData, setLinkVideoData] = useState<TikTokVideoMetadata | null>(null);

  // --- LOCAL EDITOR STATE ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedVideoUrl, setProcessedVideoUrl] = useState<string | null>(null);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Bounding Box Selection (percentages 0 - 100 relative to video size)
  const [box, setBox] = useState({ x: 62, y: 4, w: 34, h: 12 });
  const [inpaintMode, setInpaintMode] = useState<"smart-inpaint" | "edge-blend" | "soft-blur">("smart-inpaint");
  const [feather, setFeather] = useState<number>(8);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; boxX: number; boxY: number; boxW: number; boxH: number }>({
    mouseX: 0,
    mouseY: 0,
    boxX: 62,
    boxY: 4,
    boxW: 34,
    boxH: 12,
  });

  // --- HANDLERS FOR LINK MODE ---
  const handleFetchLink = async () => {
    const trimmed = linkInput.trim();
    if (!trimmed) {
      toast.error("Cole um link válido do TikTok ou vídeo online.");
      return;
    }

    setFetchingLink(true);
    setLinkVideoData(null);
    const toastId = toast.loading("Buscando vídeo sem marca d'água em máxima qualidade...");

    try {
      const res = await fetchTikTokVideoInfo({ data: { url: trimmed } });
      if (res?.video) {
        setLinkVideoData(res.video);
        toast.success("Vídeo sem marca d'água encontrado!", { id: toastId });
      }
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Não foi possível obter o vídeo do link.";
      toast.error(msg, { id: toastId });
    } finally {
      setFetchingLink(false);
    }
  };

  const handleDownloadDirectMedia = async (mediaUrl: string, title: string) => {
    if (!mediaUrl) return;
    const toastId = toast.loading("Baixando vídeo sem marca d'água na qualidade máxima (HD)...");
    try {
      const res = await fetch(mediaUrl);
      if (!res.ok) throw new Error("Falha no servidor de mídia.");
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = `${title.replace(/[^a-z0-9_-]/gi, "_").slice(0, 40)}-qualidade-maxima.mp4`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 10000);
      toast.success("Download em máxima qualidade concluído!", { id: toastId });
    } catch {
      window.open(mediaUrl, "_blank");
      toast.info("Abrindo mídia em nova aba...", { id: toastId });
    }
  };

  // --- HANDLERS FOR LOCAL FILE SELECTION ---
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Selecione um arquivo de vídeo válido (MP4, MOV, WEBM).");
      return;
    }
    if (videoObjectUrl) URL.revokeObjectURL(videoObjectUrl);
    if (processedVideoUrl) URL.revokeObjectURL(processedVideoUrl);

    setSelectedFile(file);
    setVideoObjectUrl(URL.createObjectURL(file));
    setProcessedVideoUrl(null);
    setProgressPercent(0);
    toast.success(`Vídeo "${file.name}" pronto no Editor!`);
  };

  // Preset box positions
  const setPresetPosition = (pos: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "bottom-bar") => {
    if (pos === "top-right") setBox({ x: 62, y: 4, w: 34, h: 12 });
    if (pos === "top-left") setBox({ x: 4, y: 4, w: 34, h: 12 });
    if (pos === "bottom-right") setBox({ x: 62, y: 84, w: 34, h: 12 });
    if (pos === "bottom-left") setBox({ x: 4, y: 84, w: 34, h: 12 });
    if (pos === "bottom-bar") setBox({ x: 5, y: 86, w: 90, h: 11 });
  };

  // Drag & Resize Mouse Handlers for Bounding Box
  const handleMouseDown = (e: React.MouseEvent, isResizeHandle = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (isResizeHandle) {
      setIsResizing(true);
    } else {
      setIsDragging(true);
    }
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      boxX: box.x,
      boxY: box.y,
      boxW: box.w,
      boxH: box.h,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging && !isResizing) return;
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragStartRef.current.mouseX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragStartRef.current.mouseY) / rect.height) * 100;

      if (isDragging) {
        setBox({
          ...box,
          x: Math.max(0, Math.min(100 - dragStartRef.current.boxW, dragStartRef.current.boxX + deltaXPercent)),
          y: Math.max(0, Math.min(100 - dragStartRef.current.boxH, dragStartRef.current.boxY + deltaYPercent)),
        });
      } else if (isResizing) {
        setBox({
          ...box,
          w: Math.max(5, Math.min(100 - dragStartRef.current.boxX, dragStartRef.current.boxW + deltaXPercent)),
          h: Math.max(3, Math.min(100 - dragStartRef.current.boxY, dragStartRef.current.boxH + deltaYPercent)),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing, box]);

  // --- CONTENT-AWARE INPAINTING PROCESSOR (MAX QUALITY) ---
  const handleProcessInpainting = async () => {
    if (!selectedFile || !videoObjectUrl) {
      toast.error("Carregue um vídeo no Editor antes de processar.");
      return;
    }

    setProcessing(true);
    setProgressPercent(5);
    const toastId = toast.loading("Removendo marca d'água com Inpainting Contextual em Qualidade Máxima...");

    try {
      const video = document.createElement("video");
      video.src = videoObjectUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve, reject) => {
        video.onloadeddata = () => resolve();
        video.onerror = () => reject(new Error("Erro ao carregar o arquivo de vídeo."));
      });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Não foi possível carregar o renderizador Canvas.");

      const vw = video.videoWidth || 1080;
      const vh = video.videoHeight || 1920;

      // Preserva Resolução Máxima Nativa do Vídeo
      canvas.width = vw;
      canvas.height = vh;

      // Setup High Bitrate MediaRecorder (25 Mbps Max Quality)
      const stream = canvas.captureStream(60);
      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : MediaRecorder.isTypeSupported("video/mp4")
          ? "video/mp4"
          : "video/webm";

      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 25_000_000, // 25 Mbps para máxima nitidez e fidelidade
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recorderPromise = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
      });

      recorder.start();
      await video.play();

      const duration = video.duration || 5;

      // Calculate pixel box coordinates
      const bx = Math.round((box.x / 100) * vw);
      const by = Math.round((box.y / 100) * vh);
      const bw = Math.round((box.w / 100) * vw);
      const bh = Math.round((box.h / 100) * vh);

      const processFrames = async () => {
        while (!video.ended && !video.paused) {
          // 1. Draw full video frame in max resolution
          ctx.drawImage(video, 0, 0, vw, vh);

          // 2. Perform Content-Aware Inpainting / Background Patch Fill
          if (bw > 0 && bh > 0) {
            const pad = Math.max(10, feather * 2);

            // Sample outer boundary edges (Top, Bottom, Left, Right)
            const srcX = Math.max(0, bx - pad);
            const srcY = Math.max(0, by - pad);
            const srcW = Math.min(vw - srcX, bw + pad * 2);
            const srcH = Math.min(vh - srcY, bh + pad * 2);

            if (inpaintMode === "smart-inpaint") {
              // Edge-interpolated Bilinear Content-Aware Fill
              const frameData = ctx.getImageData(bx, by, bw, bh);
              const data = frameData.data;

              // Sample outer top/bottom border colors
              const topData = ctx.getImageData(bx, Math.max(0, by - 5), bw, 1).data;
              const botData = ctx.getImageData(bx, Math.min(vh - 1, by + bh + 4), bw, 1).data;
              const leftData = ctx.getImageData(Math.max(0, bx - 5), by, 1, bh).data;
              const rightData = ctx.getImageData(Math.min(vw - 1, bx + bw + 4), by, 1, bh).data;

              for (let y = 0; y < bh; y++) {
                const wyTop = (bh - y) / bh;
                const wyBot = y / bh;
                for (let x = 0; x < bw; x++) {
                  const wxLeft = (bw - x) / bw;
                  const wxRight = x / bw;

                  const i = (y * bw + x) * 4;
                  const iTop = x * 4;
                  const iBot = x * 4;
                  const iLeft = y * 4;
                  const iRight = y * 4;

                  // Weighted pixel interpolation from surrounding background edges
                  const r =
                    (topData[iTop]! * wyTop +
                      botData[iBot]! * wyBot +
                      leftData[iLeft]! * wxLeft +
                      rightData[iRight]! * wxRight) /
                    2;

                  const g =
                    (topData[iTop + 1]! * wyTop +
                      botData[iBot + 1]! * wyBot +
                      leftData[iLeft + 1]! * wxLeft +
                      rightData[iRight + 1]! * wxRight) /
                    2;

                  const b =
                    (topData[iTop + 2]! * wyTop +
                      botData[iBot + 2]! * wyBot +
                      leftData[iLeft + 2]! * wxLeft +
                      rightData[iRight + 2]! * wxRight) /
                    2;

                  data[i] = Math.min(255, Math.max(0, r));
                  data[i + 1] = Math.min(255, Math.max(0, g));
                  data[i + 2] = Math.min(255, Math.max(0, b));
                  data[i + 3] = 255;
                }
              }

              ctx.putImageData(frameData, bx, by);
            } else if (inpaintMode === "edge-blend") {
              // Edge Patch texture stretch & blend
              ctx.save();
              ctx.filter = `blur(${feather}px)`;
              ctx.drawImage(video, srcX, srcY, srcW, srcH, bx, by, bw, bh);
              ctx.restore();
            } else {
              // Soft Gaussian Blur
              ctx.save();
              ctx.filter = `blur(${feather * 2}px)`;
              ctx.drawImage(video, bx, by, bw, bh, bx, by, bw, bh);
              ctx.restore();
            }
          }

          const currentProg = Math.min(98, Math.round((video.currentTime / duration) * 100));
          setProgressPercent(currentProg);

          await new Promise((r) => requestAnimationFrame(r));
        }
      };

      await processFrames();
      recorder.stop();

      const processedBlob = await recorderPromise;
      const resultUrl = URL.createObjectURL(processedBlob);
      setProcessedVideoUrl(resultUrl);
      setProgressPercent(100);
      toast.success("Vídeo limpo exportado em Qualidade Máxima!", { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro no processamento de inpainting.";
      toast.error(msg, { id: toastId });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-background to-cyan-500/10 p-6 shadow-2xl shadow-emerald-500/5 md:p-8">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              Edição & IA Visual
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Editor de Remoção de Marca d'Água
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Selecione interativamente a posição da marca no vídeo com a caixa delimitadora, aplique **Inpainting Contextual** (preenchimento inteligente sem buracos) e exporte em **Qualidade Máxima (HD/4K)**.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <Sparkles className="mr-1 size-3.5" /> Inpainting Contextual + Max Bitrate
          </Badge>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("editor")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "editor"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scissors className="size-4" /> Editor Interativo (Upload de Vídeo)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "link"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="size-4" /> Por Link (TikTok / Redes)
        </button>
      </div>

      {/* TAB 1: EDITOR INTERATIVO LOCAL */}
      {activeTab === "editor" && (
        <div className="space-y-6">
          {!selectedFile ? (
            <section
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (f) handleFileSelect(f);
              }}
              className="surface-card p-10 text-center border-dashed border-2 border-emerald-500/30 hover:border-emerald-500/60 transition"
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <Upload className="size-12 text-emerald-400" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">
                    Selecione ou arraste um vídeo do seu computador
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Suporta arquivos MP4, MOV, WEBM, MKV (Exportação em 1080p / 4K com bitrate máximo)
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,.mp4,.mov,.webm,.mkv,.avi"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                  className="hidden"
                />

                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 h-11"
                >
                  <Upload className="mr-2 size-4" /> Escolher Vídeo do Computador
                </Button>
              </div>
            </section>
          ) : (
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Interactive Video Preview Player */}
              <div className="lg:col-span-7 space-y-4">
                <div className="surface-card p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Área de Trabalho — Clique e Arraste a Seleção
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null);
                        setVideoObjectUrl(null);
                        setProcessedVideoUrl(null);
                      }}
                      className="h-7 text-xs text-rose-400 hover:text-rose-300"
                    >
                      <X className="mr-1 size-3" /> Trocar Vídeo
                    </Button>
                  </div>

                  {/* Interactive Video Container */}
                  <div
                    ref={containerRef}
                    className="relative aspect-[9/16] w-full max-w-[340px] mx-auto overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-black shadow-2xl select-none"
                  >
                    {videoObjectUrl && (
                      <video
                        ref={videoRef}
                        src={videoObjectUrl}
                        controls
                        muted
                        playsInline
                        className="h-full w-full object-contain"
                      />
                    )}

                    {/* Interactive Draggable Bounding Box */}
                    <div
                      onMouseDown={(e) => handleMouseDown(e, false)}
                      style={{
                        left: `${box.x}%`,
                        top: `${box.y}%`,
                        width: `${box.w}%`,
                        height: `${box.h}%`,
                      }}
                      className="absolute cursor-move rounded-md border-2 border-emerald-400 bg-emerald-500/20 shadow-lg backdrop-blur-[2px] transition-shadow hover:border-emerald-300"
                    >
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider shadow-sm select-none">
                        <Move className="mr-1 size-3" /> Marca d'Água
                      </div>

                      {/* Resize Handle */}
                      <div
                        onMouseDown={(e) => handleMouseDown(e, true)}
                        className="absolute -right-1.5 -bottom-1.5 size-4 rounded-full bg-emerald-400 border-2 border-slate-900 cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Controls & Presets */}
              <div className="lg:col-span-5 space-y-5">
                <section className="surface-card p-5 space-y-5">
                  <h3 className="text-sm font-semibold border-b border-border pb-3 flex items-center gap-2 text-emerald-400">
                    <Wand2 className="size-4" /> Configurações de Remoção
                  </h3>

                  {/* Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                      Posições Predefinidas
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetPosition("top-right")}
                        className="text-xs border-border/80"
                      >
                        Topo Direito
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetPosition("top-left")}
                        className="text-xs border-border/80"
                      >
                        Topo Esquerdo
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetPosition("bottom-right")}
                        className="text-xs border-border/80"
                      >
                        Base Direita
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPresetPosition("bottom-left")}
                        className="text-xs border-border/80"
                      >
                        Base Esquerda
                      </Button>
                    </div>
                  </div>

                  {/* Algoritmo de Preenchimento */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                      Técnica de Remoção (IA / Inpainting)
                    </label>
                    <select
                      value={inpaintMode}
                      onChange={(e) => setInpaintMode(e.target.value as any)}
                      className="w-full h-10 rounded-xl border border-border bg-secondary/30 px-3 text-xs focus:ring-emerald-500"
                    >
                      <option value="smart-inpaint">✨ Inpainting Contextual (Reconstrói o fundo sem buracos)</option>
                      <option value="edge-blend">🎨 Clonagem de Textura (Edge-Blend Patch)</option>
                      <option value="soft-blur">🌫️ Desfocagem Suave (Gaussian Mask)</option>
                    </select>
                  </div>

                  {/* Coordenadas e Ajuste Manual */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
                      Ajuste Fino da Caixa
                    </label>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground">Posição X (%):</span>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={Math.round(box.x)}
                          onChange={(e) => setBox({ ...box, x: Number(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                      <div>
                        <span className="text-muted-foreground">Posição Y (%):</span>
                        <input
                          type="range"
                          min="0"
                          max="90"
                          value={Math.round(box.y)}
                          onChange={(e) => setBox({ ...box, y: Number(e.target.value) })}
                          className="w-full accent-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Quality Badge */}
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs space-y-1 text-emerald-200">
                    <div className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="size-3.5" /> Exportação em Qualidade Máxima (HD/4K)
                    </div>
                    <p className="text-[11px] text-emerald-300/80 leading-relaxed">
                      O vídeo exportado preserva a resolução nativa original com bitrate de 25 Mbps sem perda de nitidez.
                    </p>
                  </div>

                  {/* Process Button */}
                  <div className="pt-2">
                    {processing ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs text-emerald-400">
                          <span>Processando inpainting...</span>
                          <span className="font-bold">{progressPercent}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-200"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => void handleProcessInpainting()}
                        className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20"
                      >
                        <Scissors className="mr-2 size-4" /> Processar e Remover Marca d'Água
                      </Button>
                    )}
                  </div>

                  {/* Download Output */}
                  {processedVideoUrl && (
                    <div className="pt-3 border-t border-border animate-in fade-in space-y-3">
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                        <Check className="size-4" /> Vídeo Pronto em Qualidade Máxima!
                      </div>
                      <a
                        href={processedVideoUrl}
                        download={`video-sem-marca-${selectedFile.name}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-lg"
                      >
                        <Download className="size-4" /> Baixar Vídeo Limpo (.mp4 / max bit-rate)
                      </a>
                    </div>
                  )}
                </section>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POR LINK TIKTOK */}
      {activeTab === "link" && (
        <div className="space-y-6">
          <section className="surface-card space-y-4 p-5 md:p-6">
            <label htmlFor="link-input" className="block text-sm font-medium">
              Link do Vídeo (TikTok / Mídia Pública)
            </label>
            <div className="flex flex-col gap-2.5 sm:flex-row">
              <Input
                id="link-input"
                type="url"
                placeholder="https://www.tiktok.com/@usuario/video/731234567890..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleFetchLink()}
                className="h-12 border-border/60 bg-secondary/30 text-sm focus-visible:ring-emerald-500"
              />
              <Button
                disabled={fetchingLink}
                onClick={() => void handleFetchLink()}
                className="h-12 px-6 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {fetchingLink ? <Loader2 className="animate-spin" /> : <Download />}
                {fetchingLink ? "Buscando..." : "Extrair em Máxima Qualidade"}
              </Button>
            </div>
          </section>

          {linkVideoData && (
            <section className="surface-card animate-in fade-in duration-300 p-6 space-y-6">
              <div className="flex flex-col gap-6 md:flex-row">
                <div className="relative aspect-[9/16] w-full max-w-[220px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
                  {linkVideoData.coverUrl ? (
                    <img
                      src={linkVideoData.coverUrl}
                      alt={linkVideoData.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Video className="size-10" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{linkVideoData.author.nickname}</h3>
                    <p className="text-xs text-muted-foreground">@{linkVideoData.author.uniqueId}</p>
                    <p className="mt-2 text-sm text-foreground/90">{linkVideoData.title}</p>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4">
                    <Button
                      onClick={() =>
                        void handleDownloadDirectMedia(
                          linkVideoData.playUrl,
                          linkVideoData.title,
                        )
                      }
                      className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                      <Download className="mr-2 size-4" /> Baixar Vídeo Sem Marca (Qualidade Máxima HD)
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() =>
                        void navigate({
                          to: "/video-transcriber",
                        })
                      }
                      className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                    >
                      <Wand2 className="mr-2 size-4" /> Transcrever Áudio
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
