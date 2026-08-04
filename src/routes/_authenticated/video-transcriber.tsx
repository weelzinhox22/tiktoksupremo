import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Clapperboard,
  Copy,
  FileText,
  Globe,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { transcribeMediaUrlServerFn } from "@/features/tiktok-downloader/transcribe-server";

export const Route = createFileRoute("/_authenticated/video-transcriber")({
  component: VideoTranscriberPage,
  head: () => ({ meta: [{ title: "Transcrever Vídeo por URL — Tik Supremo" }] }),
});

function VideoTranscriberPage() {
  const navigate = useNavigate();
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    text: string;
    title?: string;
    author?: string;
  } | null>(null);

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

  const handleTranscribe = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Cole o link de um vídeo do TikTok ou URL de mídia.");
      return;
    }

    setLoading(true);
    setTranscriptResult(null);
    const toastId = toast.loading("Extraindo áudio e transcrevendo com IA na nuvem...");

    try {
      const res = await transcribeMediaUrlServerFn({ data: { url: trimmed } });
      if (res.success && res.transcript) {
        const titleVal = res.videoTitle;
        const authorVal = res.authorName;
        setTranscriptResult({
          text: res.transcript,
          ...(titleVal ? { title: titleVal } : {}),
          ...(authorVal ? { author: authorVal } : {}),
        });
        toast.success("Transcrição concluída com sucesso!", { id: toastId });
      }
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Falha ao transcrever o vídeo.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async () => {
    if (!transcriptResult?.text) return;
    await navigator.clipboard.writeText(transcriptResult.text);
    setCopied(true);
    toast.success("Transcrição copiada!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-background to-cyan-500/10 p-6 shadow-2xl shadow-emerald-500/5 md:p-8">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              Processamento em Nuvem
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Transcrever Vídeo por URL
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Cole qualquer link de vídeo (TikTok, Instagram ou mídia online) para extrair a transcrição completa em português instantaneamente via IA, sem precisar baixar o arquivo no seu dispositivo.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <Zap className="mr-1 size-3.5" /> Sem Download Local
          </Badge>
        </div>
      </header>

      {/* Input Form */}
      <section className="surface-card space-y-4 p-5 md:p-6">
        <label htmlFor="video-url-input" className="block text-sm font-medium">
          Link do Vídeo ou Áudio
        </label>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Input
              id="video-url-input"
              type="url"
              placeholder="https://www.tiktok.com/@usuario/video/73... ou link direto de mídia"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && void handleTranscribe()}
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
            disabled={loading}
            onClick={() => void handleTranscribe()}
            className="h-12 px-6 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="size-4" />}
            {loading ? "Transcrevendo..." : "Transcrever com IA"}
          </Button>
        </div>
      </section>

      {/* Result Section */}
      {transcriptResult && (
        <section className="surface-card animate-in fade-in duration-300 space-y-5 p-6 border-emerald-500/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <FileText className="size-5" />
              <span>Resultado da Transcrição</span>
            </div>
            {transcriptResult.author && (
              <span className="text-xs text-muted-foreground">
                Autor: <strong className="text-foreground">@{transcriptResult.author}</strong>
              </span>
            )}
          </div>

          {transcriptResult.title && (
            <p className="text-xs font-semibold text-muted-foreground">
              Vídeo: <span className="text-foreground">{transcriptResult.title}</span>
            </p>
          )}

          <Textarea
            readOnly
            value={transcriptResult.text}
            rows={10}
            className="font-mono text-sm leading-relaxed border-emerald-500/20 bg-slate-950/60 p-4 focus-visible:ring-emerald-500"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-muted-foreground">
              Total: {transcriptResult.text.split(/\s+/).length} palavras
            </span>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleCopyText}
                className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
              >
                {copied ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
                {copied ? "Copiado!" : "Copiar Transcrição"}
              </Button>

              <Button
                onClick={() =>
                  void navigate({
                    to: "/copy-modeler",
                    search: { text: transcriptResult.text },
                  })
                }
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <Wand2 className="mr-1.5 size-4" /> Modelar no Copy Modeler
              </Button>

              <Button
                variant="secondary"
                onClick={() =>
                  void navigate({
                    to: "/projects/new",
                  })
                }
              >
                <Clapperboard className="mr-1.5 size-4" /> Criar Roteiro
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Info Card */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Zap className="size-4" /> Sem Download
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            O áudio é processado diretamente pelos servidores da IA na nuvem. Você economiza banda e memória do seu dispositivo.
          </p>
        </article>

        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Sparkles className="size-4" /> IA de Alta Precisão
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Transcreve áudios em português com remoção de ruídos e pontuação natural pronta para copiar ou modelar.
          </p>
        </article>

        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Globe className="size-4" /> TikTok e Links Diretos
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Compatível com links públicos do TikTok, Instagram Reels ou URLs diretas de arquivos MP3 e MP4.
          </p>
        </article>
      </section>
    </div>
  );
}
