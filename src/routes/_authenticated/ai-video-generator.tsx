import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Camera,
  Check,
  Clapperboard,
  Clock,
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
  getStoredAIVideoKey,
  getStoredMiniMaxBucket,
  setStoredAIVideoKey,
  setStoredMiniMaxBucket,
  stylePresets,
  type CameraMovement,
  type GeneratedVideoResult,
  type VideoGenerationParams,
  type VideoStylePreset,
} from "@/features/ai-video/video-generator-service";
import { saveEditorProject } from "@/features/video-editor/project-persistence";

export const Route = createFileRoute("/_authenticated/ai-video-generator")({
  component: AIVideoGeneratorPage,
  head: () => ({ meta: [{ title: "Gerador de Vídeos por IA — Tik Supremo" }] }),
});

const examplePrompts = [
  "Mulher elegante andando na cidade e falando: Oi, bom dia!",
  "Robô futurista em uma cidade cyberpunk neon caminhando à noite em 8k",
  "Gato fofo usando óculos de sol caminhando em uma praia tropical ao pôr do sol",
  "Carro esportivo acelerando em uma estrada de montanha ao amanhecer com iluminação dramática",
];

function AIVideoGeneratorPage() {
  const navigate = useNavigate();
  const [isUnlocked, setIsUnlocked] = useState(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("ai_video_unlocked") === "true";
    }
    return false;
  });
  const [passwordInput, setPasswordInput] = useState("");

  const [mode, setMode] = useState<"text-to-video" | "image-to-video">("text-to-video");
  const [prompt, setPrompt] = useState(examplePrompts[0]!);
  const [selectedStyle, setSelectedStyle] = useState<VideoStylePreset["id"]>("cinematic");
  const [aspectRatio, setAspectRatio] = useState<"9:16" | "16:9" | "1:1">("9:16");
  const [camera, setCamera] = useState<CameraMovement>("zoom-in");
  const [duration, setDuration] = useState<5 | 10>(5);
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [apiKey, setApiKey] = useState(getStoredAIVideoKey());
  const [bucket, setBucket] = useState(getStoredMiniMaxBucket());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, label: "" });
  const [history, setHistory] = useState<GeneratedVideoResult[]>([]);
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideoResult | null>(null);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === "S@ntos1805999") {
      sessionStorage.setItem("ai_video_unlocked", "true");
      setIsUnlocked(true);
      toast.success("Acesso liberado com sucesso!");
    } else {
      toast.error("Senha incorreta. Acesso negado.");
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      history.forEach((v) => URL.revokeObjectURL(v.url));
    };
  }, [history, imagePreview]);

  if (!isUnlocked) {
    return (
      <div className="-mx-4 -my-7 flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#07080c] px-4 py-12 text-slate-100 md:-mx-8 md:-my-10">
        <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/10 bg-[#0c0e14]/90 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-rose-500/20">
              <Lock className="size-7" />
            </div>
            <h2 className="mt-4 text-xl font-bold tracking-tight text-white">Acesso Protegido por Senha</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-400">
              Esta área de geração de vídeos é restrita. Digite a senha master para desbloquear o acesso.
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">Senha Master de Acesso</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a senha master..."
                className="w-full rounded-xl border border-white/10 bg-[#07080c] p-3 text-sm text-white placeholder:text-slate-600 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 font-semibold text-white shadow-lg hover:from-violet-500 hover:to-indigo-500"
            >
              <Lock className="mr-2 size-4" /> Desbloquear Acesso
            </Button>
          </form>
        </div>
      </div>
    );
  }

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

  const handleSaveApiKey = (val: string) => {
    setApiKey(val);
    setStoredAIVideoKey(val);
    toast.success(val ? "Chave de API do Motor Neural salva!" : "Chave removida.");
  };

  const handleSaveBucket = (val: string) => {
    setBucket(val);
    setStoredMiniMaxBucket(val);
    toast.success("Bucket MiniMax atualizado!");
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
    setProgress({ percent: 5, label: "Iniciando inteligência artificial..." });

    try {
      const result = await generateAIVideo(
        {
          prompt: prompt.trim(),
          mode,
          sourceImage,
          aspectRatio,
          style: selectedStyle,
          camera,
          durationSeconds: duration,
          apiKey,
          minimaxBucket: bucket,
        },
        (percent, label) => setProgress({ percent, label }),
      );

      setCurrentVideo(result);
      setHistory((prev) => [result, ...prev]);
      toast.success("Vídeo gerado com sucesso pela IA!");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível gerar o vídeo.";
      toast.error(msg);
    } finally {
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
              <Badge variant="outline" className="border-violet-400/20 bg-violet-400/10 text-[9px] text-violet-300">
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
                      <img src={imagePreview} alt="Upload prévia" className="h-full w-full object-cover" />
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
                      <span className="mt-2 text-xs font-semibold text-white">Carregar foto/imagem para animar</span>
                      <span className="mt-1 text-[10px] text-slate-500">PNG, JPG ou WEBP até 10MB</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              )}

              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  {mode === "text-to-video" ? "Descrição da Cena (Prompt)" : "Direção de Animação (Opcional)"}
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
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.025] p-5">
              <h2 className="mb-4 text-sm font-semibold text-white">2. Estilos Visuais & presets</h2>
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
                          <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${st.badgeColor}`}>
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
              <h2 className="mb-4 text-sm font-semibold text-white">3. Configurações de Câmera & Formato</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300">Proporção (Aspect Ratio)</label>
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
                  <label className="text-xs font-semibold text-slate-300">Movimento de Câmera</label>
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
                    <span className="mt-2 font-mono text-xs text-slate-400">{progress.percent}% concluído</span>
                  </div>
                ) : currentVideo ? (
                  <div className="space-y-4">
                    <div className="relative mx-auto aspect-[9/16] max-h-[500px] overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/10">
                      <video src={currentVideo.url} controls autoPlay loop className="h-full w-full object-contain" />
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
                <h2 className="text-sm font-semibold text-white">Chave de API Neural (MiniMax / Replicate / Hugging Face)</h2>
              </div>
              <p className="mt-1.5 text-xs leading-5 text-slate-400">
                Insira seu token do <strong>MiniMax (mm_...)</strong>, <strong>Replicate (r8_...)</strong> ou <strong>Hugging Face (hf_...)</strong>.
              </p>
              <div className="mt-2.5 space-y-2">
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 text-[11px] leading-4 text-purple-300">
                  🔥 <strong>Bucket MiniMax Ativo:</strong> <code>{bucket || "welzinhoox22/MiniMax-H3-bucket"}</code> (MiniMax-H3 / Hailuo 01 Video Generation).
                </div>
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-[11px] leading-4 text-emerald-300">
                  ⚡ <strong>Replicate (r8_...):</strong> Suporte 100% nativo a CORS no navegador sem bloqueios de rede.
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">Chave de API (MiniMax / Replicate / HuggingFace)</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    placeholder="mm_... (MiniMax API) ou r8_... (Replicate API) ou hf_..."
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d13] p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-amber-400/50 focus:ring-amber-400/20"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-[10px] font-medium text-slate-400">Bucket do MiniMax (Seu repositório MiniMax-H3)</label>
                  <input
                    type="text"
                    value={bucket}
                    onChange={(e) => handleSaveBucket(e.target.value)}
                    placeholder="welzinhoox22/MiniMax-H3-bucket"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d13] p-3 text-xs text-slate-200 placeholder:text-slate-600 focus:border-purple-400/50 focus:ring-purple-400/20"
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>{apiKey ? (apiKey.startsWith("mm_") ? "✓ MiniMax API Conectado" : apiKey.startsWith("r8_") ? "✓ Replicate API Conectado" : "✓ Token Salvo") : "Modo Gratuito (Pollinations AI)"}</span>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => handleSaveApiKey("")}
                      className="text-rose-400 hover:underline"
                    >
                      Remover chave
                    </button>
                  )}
                </div>
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
                      <video src={vid.url} className="h-full w-full object-cover opacity-70 group-hover:opacity-100" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-2 flex flex-col justify-end">
                        <span className="truncate text-[10px] font-medium text-white">{vid.style.toUpperCase()}</span>
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
