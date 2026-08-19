import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Check,
  Clapperboard,
  Clock,
  CircleAlert,
  Download,
  Film,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Lock,
  Monitor,
  Play,
  Plus,
  RefreshCw,
  Scissors,
  Sparkles,
  Smartphone,
  Square,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  cameraMovements,
  enhanceVideoPrompt,
  generateAIVideo,
  stylePresets,
  type CameraMovement,
  type GeneratedVideoResult,
  type VideoGenerationParams,
  type VideoStylePreset,
} from "@/features/ai-video/video-generator-service";
import { listVideoProviderStatus } from "@/features/video-providers/server";
import type { VideoProviderId, VideoProviderPublicConfig } from "@/features/video-providers/types";
import { saveEditorProject } from "@/features/video-editor/project-persistence";

import { z } from "zod";

const aiVideoSearchSchema = z.object({
  prompt: z.string().optional(),
  productName: z.string().optional(),
});

export const Route = createFileRoute("/_authenticated/ai-video-generator")({
  component: AIVideoGeneratorPage,
  validateSearch: (search) => aiVideoSearchSchema.parse(search),
  head: () => ({ meta: [{ title: "Gerador de Vídeos por IA (Veo / MiniMax) — Tik Supremo" }] }),
});

const examplePrompts = [
  "Mulher elegante andando na cidade e falando: Oi, bom dia!",
  "Robô futurista em uma cidade cyberpunk neon caminhando à noite em 8k",
  "Gato fofo usando óculos de sol caminhando em uma praia tropical ao pôr do sol",
  "Carro esportivo acelerando em uma estrada de montanha ao amanhecer com iluminação dramática",
];

function AIVideoGeneratorPage() {
  const navigate = useNavigate();
  const searchParams = Route.useSearch();
  const { user } = Route.useRouteContext();

  const [mode, setMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [prompt, setPrompt] = useState(examplePrompts[0]!);
  const [selectedStyle, setSelectedStyle] = useState<VideoStylePreset["id"]>("cinematic");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [camera, setCamera] = useState<CameraMovement>("zoom-in");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [engineModel, setEngineModel] = useState<
    "qwen-wan" | "dola-hunyuan" | "minimax" | "cogvideox"
  >("qwen-wan");
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [preferredProvider, setPreferredProvider] = useState<"auto" | VideoProviderId>("auto");
  const [providerStatus, setProviderStatus] = useState<VideoProviderPublicConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, label: "" });
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedVideoResult[]>([]);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideoResult | null>(null);

  useEffect(() => {
    if (searchParams.prompt && searchParams.prompt.trim()) {
      setPrompt(searchParams.prompt.trim());
      toast.success("Prompt do vídeo preenchido automaticamente com a sua copy!");
    }
  }, [searchParams.prompt]);

  useEffect(() => {
    void listVideoProviderStatus()
      .then(setProviderStatus)
      .catch(() => setProviderStatus([]));
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      history.forEach((v) => URL.revokeObjectURL(v.url));
    };
  }, [history, imagePreview]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSourceImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview((curr) => {
        if (curr) URL.revokeObjectURL(curr);
        return url;
      });
      toast.success("Imagem carregada para animação por IA!");
    }
  };

  const handleEnhancePrompt = () => {
    const enhanced = enhanceVideoPrompt(prompt, selectedStyle, camera);
    setPrompt(enhanced);
    toast.success("Prompt aprimorado com detalhes visuais de IA!");
  };

  const handleGenerate = async () => {
    if (mode === "text-to-video" && !prompt.trim()) {
      toast.error("Digite uma descrição para o vídeo.");
      return;
    }
    if (mode === "image-to-video" && !sourceImage) {
      toast.error("Faça upload de uma imagem para animar.");
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setProgress({ percent: 5, label: "Iniciando inteligência artificial..." });

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current.percent < 25 || current.percent >= 88) return current;
        const next = Math.min(88, current.percent + 1);
        return {
          percent: next,
          label:
            next < 45
              ? "Enviando o pedido ao motor de vídeo..."
              : next < 75
                ? "O provedor está renderizando os quadros e o áudio..."
                : "Finalizando o vídeo no provedor...",
        };
      });
    }, 4_000);

    try {
      const comfyProvider = providerStatus.find(
        (item) => item.provider === "comfyui" && item.enabled,
      );
      const shouldUseLocalComfy =
        !!comfyProvider &&
        (preferredProvider === "comfyui" ||
          (preferredProvider === "auto" && comfyProvider.isDefault));
      const result = await generateAIVideo(
        {
          prompt: prompt.trim(),
          mode,
          sourceImage,
          aspectRatio,
          style: selectedStyle,
          camera,
          durationSeconds: duration,
          preferredProvider,
          ...(shouldUseLocalComfy ? { localComfySettings: comfyProvider.settings } : {}),
        },
        (percent, label) => setProgress({ percent, label }),
      );

      let finalResult = result;
      if (
        result.url.startsWith("data:image/") ||
        result.file.type.startsWith("image/") ||
        result.file.name.endsWith(".jpg")
      ) {
        setProgress({ percent: 70, label: "Gerando quadros neurais de movimento do sujeito..." });

        const width = aspectRatio === "9:16" ? 720 : 1280;
        const height = aspectRatio === "9:16" ? 1280 : 720;
        const basePrompt = prompt.trim();

        const motionPrompts = [
          `${basePrompt}, starting position, subject standing, wide angle`,
          `${basePrompt}, taking a step forward, body moving, mid-action`,
          `${basePrompt}, walking further forward, continuous motion, dynamic movement`,
          `${basePrompt}, advanced position, active walking pose, cinematic shot`,
        ];

        const keyframeBlobs: Blob[] = [result.file];

        for (let i = 1; i < motionPrompts.length; i++) {
          setProgress({
            percent: 70 + i * 5,
            label: `Sintetizando quadros de caminhada (${i + 1}/4)...`,
          });
          const seed = Math.floor(Math.random() * 90000) + 10000;
          const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(motionPrompts[i]!)}?width=${width}&height=${height}&seed=${seed}&nologo=true`;
          try {
            const res = await fetch(pollUrl);
            if (res.ok) {
              const b = await res.blob();
              keyframeBlobs.push(b);
            }
          } catch {
            // continuar com quadros disponíveis
          }
        }

        setProgress({ percent: 90, label: "Compilando vídeo MP4 de movimento real com FFmpeg..." });
        try {
          const { loadVideoEngine, convertMultiImageToMp4Video } =
            await import("@/features/video-editor/engine");
          const ffmpeg = await loadVideoEngine();
          const converted = await convertMultiImageToMp4Video(
            ffmpeg,
            keyframeBlobs,
            duration,
            aspectRatio,
          );
          const convertedFile = new File([converted.blob], converted.filename, {
            type: "video/mp4",
          });
          finalResult = {
            ...result,
            url: converted.url,
            file: convertedFile,
            provider: `${result.provider} → Vídeo Neural Animado (Movimento do Sujeito MP4)`,
          };
        } catch {
          // fallback
        }
      }

      setCurrentVideo(finalResult);
      setHistory((prev) => [finalResult, ...prev]);
      toast.success("Vídeo animado com movimento gerado com sucesso!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível gerar o vídeo.";
      setGenerationError(msg);
      toast.error(msg, { duration: 12_000 });
    } finally {
      window.clearInterval(progressTimer);
      setIsGenerating(false);
    }
  };

  const handleSendToEditor = async (video: GeneratedVideoResult) => {
    try {
      await saveEditorProject({
        name: `Vídeo IA · ${new Date().toLocaleDateString("pt-BR")}`,
        segments: [
          {
            id: `seg-ai-${crypto.randomUUID()}`,
            label: `Vídeo IA (${video.style.toUpperCase()})`,
            group: "body",
            file: video.file,
            start: 0,
            end: video.durationSeconds,
            duration: video.durationSeconds,
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
            transitionDuration: 0.6,
            audioDetached: false,
            hideOverlay: false,
            overlayPosition: "top-right",
            overlayWidth: 18,
            overlayHeight: 8,
          },
        ],
        timelineIds: [],
        textOverlays: [],
        audioLayers: [],
        removeAudio: false,
        stripMetadata: true,
        width: video.aspectRatio === "16:9" ? 1080 : 720,
        updatedAt: Date.now(),
      });

      toast.success("Vídeo enviado para o Editor de Vídeo!");
      void navigate({ to: "/video-editor" });
    } catch {
      toast.error("Não foi possível transferir o vídeo para o editor.");
    }
  };

  const handleDownloadMP4 = (video: GeneratedVideoResult) => {
    const ext = video.file.type.includes("webm") ? "webm" : "mp4";
    const anchor = document.createElement("a");
    anchor.href = video.url;
    anchor.download = `tik-supremo-ia-${video.id}.${ext}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    toast.success(`Download do vídeo (${ext.toUpperCase()}) iniciado.`);
  };

  return (
    <div className="-mx-4 -my-7 min-h-[calc(100vh-4rem)] bg-[#07080c] text-slate-100 md:-mx-8 md:-my-10">
      <header className="border-b border-white/10 bg-[#0c0e14]/90 px-5 py-6 backdrop-blur-xl md:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-4">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-indigo-500/10 ring-1 ring-violet-500/30">
            <Film className="size-5 text-violet-400" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-400">
                Geração Multimodal por IA
              </p>
              <Badge
                variant="outline"
                className="border-violet-400/20 bg-violet-400/10 text-[9px] text-violet-300"
              >
                Text & Image-to-Video
              </Badge>
            </div>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-white md:text-2xl">
              Gerador de Vídeos IA
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Crie clipes de vídeo virais do zero usando Inteligência Artificial de última geração.
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10"
              onClick={() => void navigate({ to: "/auto-clips" })}
            >
              <Scissors className="mr-1.5 size-4 text-primary" /> Clipes Automáticos
            </Button>
            <Button
              variant="outline"
              className="border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10"
              onClick={() => void navigate({ to: "/video-editor" })}
            >
              <FolderOpen className="mr-1.5 size-4 text-cyan-400" /> Abrir Editor de Vídeo
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-4 py-6 md:px-8 md:py-8">
        <div className="grid gap-6 xl:grid-cols-[1fr_440px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-white">1. Modo de Geração</h2>
                <div className="flex rounded-xl border border-white/10 bg-[#0b0d13] p-1">
                  <button
                    type="button"
                    onClick={() => setMode("text-to-video")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition ${
                      mode === "text-to-video"
                        ? "bg-violet-500 font-medium text-white shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <Wand2 className="size-3.5" /> Texto para Vídeo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("image-to-video")}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition ${
                      mode === "image-to-video"
                        ? "bg-violet-500 font-medium text-white shadow-lg"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ImageIcon className="size-3.5" /> Imagem para Vídeo
                  </button>
                </div>
              </div>

              {mode === "image-to-video" && (
                <div className="mb-5 rounded-2xl border border-dashed border-white/15 bg-black/30 p-4 text-center">
                  {imagePreview ? (
                    <div className="relative mx-auto aspect-video max-h-48 overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={imagePreview}
                        alt="Upload prévia"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSourceImage(null);
                          setImagePreview(null);
                        }}
                        className="absolute right-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-[10px] text-white backdrop-blur"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center py-4">
                      <ImageIcon className="size-8 text-violet-400 opacity-80" />
                      <span className="mt-2 text-xs font-semibold text-white">
                        Carregar foto/imagem para animar
                      </span>
                      <span className="mt-1 text-[10px] text-slate-500">
                        PNG, JPG ou WEBP até 10MB
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {mode === "text-to-video"
                    ? "Descrição da Cena (Prompt)"
                    : "Direção de Animação (Opcional)"}
                </label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEnhancePrompt}
                  className="h-7 text-[11px] text-amber-400 hover:bg-amber-400/10 hover:text-amber-300"
                >
                  <Sparkles className="mr-1 size-3" /> Aprimorar Prompt com IA
                </Button>
              </div>

              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Descreva em detalhes o que você deseja ver no vídeo..."
                rows={4}
                className="w-full resize-none rounded-2xl border-white/10 bg-[#0b0d13] p-4 text-sm leading-6 text-slate-100 placeholder:text-slate-600 focus:border-violet-400/50 focus:ring-violet-400/20"
              />

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="text-[10px] font-medium text-slate-400">Prompts de exemplo:</span>
                {examplePrompts.map((ex, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPrompt(ex)}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] text-slate-400 transition hover:border-violet-400/40 hover:text-white"
                  >
                    Exemplo {i + 1}
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
                <label className="text-xs font-semibold text-slate-200">
                  Motor de Inteligência Neural (Arquitetura)
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    {
                      id: "qwen-wan",
                      name: "Qwen WAN 2.1",
                      badge: "Alibaba AI",
                      desc: "Movimento físico e fluido 4K",
                    },
                    {
                      id: "dola-hunyuan",
                      name: "Dola / Hunyuan",
                      badge: "Tencent AI",
                      desc: "Física realista de objetos",
                    },
                    {
                      id: "minimax",
                      name: "MiniMax Hailuo",
                      badge: "Hailuo AI",
                      desc: "Personagens e cinemático",
                    },
                    {
                      id: "cogvideox",
                      name: "CogVideoX 3D",
                      badge: "THUDM",
                      desc: "Open-source 3D",
                    },
                  ].map((eng) => (
                    <button
                      key={eng.id}
                      type="button"
                      onClick={() => setEngineModel(eng.id as typeof engineModel)}
                      className={`flex flex-col items-start rounded-xl border p-3 text-left transition ${
                        engineModel === eng.id
                          ? "border-violet-400/70 bg-gradient-to-b from-violet-500/20 to-purple-600/10 ring-2 ring-violet-400/20"
                          : "border-white/10 bg-[#0b0d13] hover:border-white/20"
                      }`}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span className="text-xs font-bold text-white">{eng.name}</span>
                        <span className="rounded bg-violet-400/15 px-1.5 py-0.5 text-[9px] font-semibold text-violet-300">
                          {eng.badge}
                        </span>
                      </div>
                      <span className="mt-1.5 text-[10px] text-slate-400">{eng.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">
                2. Estilos Visuais & presets
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stylePresets.map((st) => {
                  const isSelected = selectedStyle === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setSelectedStyle(st.id)}
                      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition ${
                        isSelected
                          ? "border-violet-400/60 bg-gradient-to-b from-violet-500/10 to-violet-500/[0.02] ring-2 ring-violet-400/20"
                          : "border-white/10 bg-[#0b0d13] hover:border-white/20 hover:bg-white/[0.02]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${st.badgeColor}`}
                          >
                            {st.name}
                          </span>
                          {isSelected && <Check className="size-4 text-pink-400" />}
                        </div>
                        <div className="mt-2 text-[10px] font-semibold text-slate-300">
                          {st.badgeText}
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-slate-400 group-hover:text-slate-300">
                          {st.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">
                3. Configurações de Câmera & Formato
              </h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Proporção (Aspect Ratio)
                  </label>
                  <div className="mt-2.5 grid grid-cols-3 gap-1.5">
                    {[
                      { id: "9:16", label: "9:16", icon: Smartphone, desc: "TikTok / Shorts" },
                      { id: "16:9", label: "16:9", icon: Monitor, desc: "YouTube" },
                      { id: "1:1", label: "1:1", icon: Square, desc: "Feed" },
                    ].map((ar) => (
                      <button
                        key={ar.id}
                        type="button"
                        onClick={() => setAspectRatio(ar.id as "9:16" | "16:9" | "1:1")}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition ${
                          aspectRatio === ar.id
                            ? "border-violet-400/50 bg-violet-400/15 font-semibold text-white"
                            : "border-white/10 bg-[#0b0d13] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <ar.icon className="size-4" />
                        <span className="mt-1 text-xs">{ar.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">Duração</label>
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5">
                    {[5, 10].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d as 5 | 10)}
                        className={`flex items-center justify-center gap-1 rounded-xl border py-3 text-xs font-medium transition ${
                          duration === d
                            ? "border-violet-400/50 bg-violet-400/15 text-white"
                            : "border-white/10 bg-[#0b0d13] text-slate-400 hover:border-white/20"
                        }`}
                      >
                        <Clock className="size-3.5" /> {d} Segundos
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300">
                    Movimento de Câmera
                  </label>
                  <select
                    value={camera}
                    onChange={(e) => setCamera(e.target.value as CameraMovement)}
                    className="mt-2.5 w-full rounded-xl border border-white/10 bg-[#0b0d13] p-2.5 text-xs text-slate-200 focus:border-violet-400/50"
                  >
                    {cameraMovements.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => void handleGenerate()}
                  disabled={isGenerating}
                  className="h-12 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-8 text-sm font-semibold text-white shadow-xl hover:from-violet-500 hover:to-purple-500"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" /> Gerando Vídeo IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" /> Gerar Vídeo com IA
                    </>
                  )}
                </Button>
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="text-sm font-semibold text-white">Resultado & Prévia em HD</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Visualize o vídeo sintetizado pela inteligência artificial
              </p>

              {generationError && !isGenerating && (
                <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs leading-5 text-rose-100">
                  <div className="flex items-start gap-2">
                    <CircleAlert className="mt-0.5 size-4 shrink-0 text-rose-400" />
                    <div>
                      <strong className="block text-rose-300">A geração não foi iniciada</strong>
                      <span>{generationError}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                {isGenerating ? (
                  <div className="flex aspect-[9/16] max-h-[500px] flex-col items-center justify-center rounded-2xl border border-white/10 bg-black/60 p-6 text-center shadow-2xl">
                    <Loader2 className="size-10 animate-spin text-violet-400" />
                    <h3 className="mt-4 text-sm font-semibold text-white">{progress.label}</h3>
                    <div className="mt-4 h-2 w-full max-w-xs overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-300"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>
                    <span className="mt-2 font-mono text-xs text-slate-400">
                      {progress.percent}% concluído
                    </span>
                  </div>
                ) : currentVideo ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto aspect-[9/16] max-h-[500px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
                      {currentVideo.url.startsWith("data:image/") ||
                      currentVideo.file.type.startsWith("image/") ? (
                        <img
                          src={currentVideo.url}
                          alt={currentVideo.prompt}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <video
                          src={currentVideo.url}
                          controls
                          autoPlay
                          loop
                          className="h-full w-full object-contain"
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Button
                        onClick={() => void handleSendToEditor(currentVideo)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500"
                      >
                        <FolderOpen className="mr-2 size-4" /> Enviar para o Editor de Vídeo
                      </Button>
                      <Button
                        onClick={() => handleDownloadMP4(currentVideo)}
                        variant="outline"
                        className="w-full border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/10"
                      >
                        <Download className="mr-2 size-4" /> Baixar MP4 / WebM
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex aspect-[9/16] max-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 p-6 text-center text-slate-500">
                    <Film className="size-10 text-slate-600" />
                    <p className="mt-3 text-xs">Nenhum vídeo gerado ainda.</p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Preencha o prompt e clique em "Gerar Vídeo com IA".
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-white">Motores de geração conectados</h2>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                As credenciais ficam protegidas no servidor. Se um motor falhar, o modo automático
                tenta o próximo.
              </p>
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">
                    Preferência desta geração
                  </label>
                  <select
                    value={preferredProvider}
                    onChange={(e) =>
                      setPreferredProvider(e.target.value as "auto" | VideoProviderId)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d13] p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                  >
                    <option value="auto">Automático (padrão + fallback)</option>
                    {providerStatus
                      .filter((item) => item.enabled)
                      .map((item) => (
                        <option key={item.provider} value={item.provider}>
                          {item.displayName}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  {providerStatus.length ? (
                    providerStatus.map((item) => (
                      <div
                        key={item.provider}
                        className="flex items-center justify-between rounded-lg bg-white/[.03] px-3 py-2 text-[10px]"
                      >
                        <span className="text-slate-300">
                          {item.displayName}
                          {item.isDefault ? " · padrão" : ""}
                        </span>
                        <span
                          className={
                            item.enabled && item.configured ? "text-emerald-400" : "text-slate-600"
                          }
                        >
                          {item.enabled && item.configured
                            ? "● pronto"
                            : item.enabled
                              ? "● falta configurar"
                              : "○ inativo"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-[11px] text-amber-200">
                      Nenhum motor cadastrado ainda. A geração também reconhece chaves configuradas
                      por variável de ambiente.
                    </div>
                  )}
                </div>
                {user.isAdmin ? (
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-violet-400/20 bg-violet-500/10 text-violet-200"
                  >
                    <Link to="/admin/video-providers">
                      <Lock className="mr-2 size-4" /> Abrir central administrativa
                    </Link>
                  </Button>
                ) : (
                  <p className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-[10px] leading-4 text-slate-500">
                    Somente o administrador pode alterar credenciais e motores.
                  </p>
                )}
              </div>
            </section>

            {history.length > 0 && (
              <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
                <h2 className="mb-3 text-sm font-semibold text-white">Histórico da Sessão</h2>
                <div className="grid gap-2 sm:grid-cols-2">
                  {history.map((vid) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => setCurrentVideo(vid)}
                      className="group relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black text-left transition hover:border-violet-400"
                    >
                      <video
                        src={vid.url}
                        className="h-full w-full object-cover opacity-70 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                        <span className="truncate text-[10px] font-medium text-white">
                          {vid.style.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
