import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Download,
  Eye,
  FileAudio,
  Heart,
  Loader2,
  MessageCircle,
  Music,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  fetchTikTokVideoInfo,
  type TikTokVideoMetadata,
} from "@/features/tiktok-downloader/server";

export const Route = createFileRoute("/_authenticated/tiktok-downloader")({
  component: TikTokDownloaderPage,
  head: () => ({ meta: [{ title: "Baixar vídeo do TikTok — Tik Supremo" }] }),
});

function formatNumber(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_-]/gi, "_").slice(0, 50) || "tiktok-video";
}

function TikTokDownloaderPage() {
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoData, setVideoData] = useState<TikTokVideoMetadata | null>(null);
  const [history, setHistory] = useState<TikTokVideoMetadata[]>([]);
  const [downloadingType, setDownloadingType] = useState<"video" | "audio" | null>(null);
  const navigate = useNavigate();

  const handleFetch = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Cole um link válido do TikTok.");
      return;
    }

    if (!trimmed.includes("tiktok.com")) {
      toast.error("O link deve ser do TikTok (ex: https://www.tiktok.com/@user/video/...)");
      return;
    }

    setLoading(true);
    setVideoData(null);
    const toastId = toast.loading("Buscando informações do vídeo do TikTok...");

    try {
      const res = await fetchTikTokVideoInfo({ data: { url: trimmed } });
      if (res?.video) {
        setVideoData(res.video);
        setHistory((prev) => {
          const filtered = prev.filter((item) => item.id !== res.video.id);
          return [res.video, ...filtered].slice(0, 10);
        });
        toast.success("Vídeo encontrado!", { id: toastId });
      }
    } catch (cause) {
      const msg =
        cause instanceof Error ? cause.message : "Não foi possível baixar o vídeo informado.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadMedia = async (mediaUrl: string, filename: string, type: "video" | "audio") => {
    if (!mediaUrl) {
      toast.error("URL de mídia indisponível.");
      return;
    }

    setDownloadingType(type);
    const toastId = toast.loading(
      type === "video" ? "Baixando vídeo sem marca d'água..." : "Baixando áudio MP3...",
    );

    try {
      const response = await fetch(mediaUrl);
      if (!response.ok) throw new Error("Erro no servidor de mídia do TikTok");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 10_000);
      toast.success(
        type === "video"
          ? "Download do vídeo concluído!"
          : "Download do áudio concluído!",
        { id: toastId },
      );
    } catch {
      // Direct fallback
      window.open(mediaUrl, "_blank");
      toast.info("Link de download aberto em nova aba.", { id: toastId });
    } finally {
      setDownloadingType(null);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrlInput(text);
        toast.success("Link colado!");
      }
    } catch {
      toast.error("Não foi possível ler a área de transferência.");
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
              Download de mídias
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Baixar vídeos do TikTok
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cole o link de qualquer vídeo do TikTok para baixar sem marca d'água em HD ou extrair
              o áudio MP3 original instantaneamente.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <Sparkles className="mr-1 size-3.5" /> Sem marca d'água em HD
          </Badge>
        </div>
      </header>

      {/* Input Section */}
      <section className="surface-card space-y-4 p-5 md:p-6">
        <label htmlFor="tiktok-url-input" className="block text-sm font-medium">
          Cole o link do vídeo do TikTok
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="tiktok-url-input"
              type="url"
              placeholder="https://www.tiktok.com/@usuario/video/731234567890..."
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleFetch()}
              className="h-12 border-border/60 bg-secondary/30 pr-20 text-sm focus-visible:ring-emerald-500"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handlePaste}
              className="absolute right-2 top-2 h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Colar
            </Button>
          </div>
          <Button
            id="fetch-tiktok-btn"
            disabled={loading}
            onClick={() => void handleFetch()}
            className="h-12 px-6 font-medium"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Download />}
            {loading ? "Buscando..." : "Baixar vídeo"}
          </Button>
        </div>
      </section>

      {/* Video Preview Section */}
      {videoData && (
        <section className="surface-card animate-in fade-in duration-300 space-y-6 p-6">
          <div className="flex flex-col gap-6 md:flex-row">
            {/* Thumbnail / Preview */}
            <div className="relative aspect-[9/16] w-full max-w-[240px] shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black shadow-xl">
              {videoData.coverUrl ? (
                <img
                  src={videoData.coverUrl}
                  alt={videoData.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Video className="size-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              {videoData.duration > 0 && (
                <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {Math.floor(videoData.duration / 60)}:
                  {String(Math.floor(videoData.duration % 60)).padStart(2, "0")}
                </span>
              )}
            </div>

            {/* Content Details */}
            <div className="flex flex-1 flex-col justify-between space-y-4">
              {/* Author */}
              <div className="flex items-center gap-3">
                {videoData.author.avatarUrl ? (
                  <img
                    src={videoData.author.avatarUrl}
                    alt={videoData.author.nickname}
                    className="size-11 rounded-full border border-emerald-500/30 object-cover"
                  />
                ) : (
                  <div className="flex size-11 items-center justify-center rounded-full bg-secondary text-foreground">
                    {videoData.author.nickname[0] || "@"}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-foreground">{videoData.author.nickname}</h3>
                  <p className="text-xs text-muted-foreground">@{videoData.author.uniqueId}</p>
                </div>
              </div>

              {/* Title */}
              <p className="text-sm leading-relaxed text-foreground/90">{videoData.title}</p>

              {/* Music info */}
              {videoData.musicTitle && (
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-secondary/30 px-3 py-2 text-xs text-muted-foreground">
                  <Music className="size-3.5 text-emerald-400" />
                  <span className="truncate">
                    {videoData.musicTitle} {videoData.musicAuthor ? `— ${videoData.musicAuthor}` : ""}
                  </span>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-4 gap-2 rounded-xl border border-white/[0.06] bg-background/40 p-3 text-center text-xs">
                <div>
                  <span className="flex items-center justify-center gap-1 text-muted-foreground">
                    <Eye className="size-3" />
                  </span>
                  <span className="mt-1 block font-semibold">{formatNumber(videoData.stats.views)}</span>
                </div>
                <div>
                  <span className="flex items-center justify-center gap-1 text-rose-400">
                    <Heart className="size-3" />
                  </span>
                  <span className="mt-1 block font-semibold">{formatNumber(videoData.stats.likes)}</span>
                </div>
                <div>
                  <span className="flex items-center justify-center gap-1 text-cyan-400">
                    <MessageCircle className="size-3" />
                  </span>
                  <span className="mt-1 block font-semibold">{formatNumber(videoData.stats.comments)}</span>
                </div>
                <div>
                  <span className="flex items-center justify-center gap-1 text-emerald-400">
                    <Share2 className="size-3" />
                  </span>
                  <span className="mt-1 block font-semibold">{formatNumber(videoData.stats.shares)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2.5 pt-2">
                <Button
                  disabled={downloadingType !== null}
                  onClick={() =>
                    void handleDownloadMedia(
                      videoData.playUrl,
                      `${sanitizeFilename(videoData.title)}-sem-marca.mp4`,
                      "video",
                    )
                  }
                >
                  {downloadingType === "video" ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Baixar vídeo sem marca (HD)
                </Button>

                {videoData.musicUrl && (
                  <Button
                    variant="outline"
                    disabled={downloadingType !== null}
                    onClick={() =>
                      void handleDownloadMedia(
                        videoData.musicUrl,
                        `${sanitizeFilename(videoData.title)}-audio.mp3`,
                        "audio",
                      )
                    }
                  >
                    {downloadingType === "audio" ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <FileAudio className="size-4 text-emerald-400" />
                    )}
                    Baixar áudio MP3
                  </Button>
                )}

                <Button
                  variant="ghost"
                  onClick={() => void navigate({ to: "/metadata-cleaner" })}
                  className="text-xs text-muted-foreground hover:text-emerald-300"
                >
                  <ShieldCheck className="size-4" />
                  Limpar metadados
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Downloads recentes</h3>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {history.map((item) => (
              <article
                key={item.id}
                className="surface-card flex items-center gap-3 p-3 transition hover:border-emerald-500/30"
              >
                {item.coverUrl ? (
                  <img
                    src={item.coverUrl}
                    alt={item.title}
                    className="size-14 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-14 items-center justify-center rounded-lg bg-secondary">
                    <Video className="size-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-xs font-semibold">{item.title}</h4>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">@{item.author.uniqueId}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-6 px-2 text-[10px] text-emerald-400 hover:text-emerald-300"
                    onClick={() => setVideoData(item)}
                  >
                    <Play className="mr-1 size-2.5" /> Selecionar
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
