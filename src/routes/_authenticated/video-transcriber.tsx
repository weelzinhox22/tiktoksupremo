import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Check,
  Clapperboard,
  Copy,
  FileText,
  FileVideo2,
  Globe,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  transcribeLocalFileServerFn,
  transcribeMediaUrlServerFn,
} from "@/features/tiktok-downloader/transcribe-server";

export const Route = createFileRoute("/_authenticated/video-transcriber")({
  component: VideoTranscriberPage,
  head: () => ({ meta: [{ title: "Transcrever Vídeo (Link ou Upload) — Tik Supremo" }] }),
});

type Mode = "link" | "upload";

function VideoTranscriberPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Mode>("link");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Link mode state
  const [urlInput, setUrlInput] = useState("");
  const [loadingUrl, setLoadingUrl] = useState(false);

  // Upload mode state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);

  // Shared result state
  const [copied, setCopied] = useState(false);
  const [transcriptResult, setTranscriptResult] = useState<{
    text: string;
    title?: string;
    author?: string;
    filename?: string;
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

  const handleTranscribeUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      toast.error("Cole o link de um vídeo do TikTok ou URL de mídia.");
      return;
    }

    setLoadingUrl(true);
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
        toast.success("Transcrição por link concluída!", { id: toastId });
      }
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Falha ao transcrever o vídeo.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleTranscribeFile = async () => {
    if (!selectedFile) {
      toast.error("Selecione um arquivo do seu computador.");
      return;
    }

    if (selectedFile.size > 30 * 1024 * 1024) {
      toast.error("O arquivo excede o limite de 30MB para transcrição direta com IA.");
      return;
    }

    setLoadingFile(true);
    setTranscriptResult(null);
    const toastId = toast.loading(`Lendo "${selectedFile.name}" e enviando para transcrição com IA...`);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");

      const res = await transcribeLocalFileServerFn({
        data: {
          base64,
          filename: selectedFile.name,
          mimeType: selectedFile.type,
        },
      });

      if (res.success && res.transcript) {
        setTranscriptResult({
          text: res.transcript,
          filename: res.filename,
        });
        toast.success("Transcrição do arquivo concluída!", { id: toastId });
      }
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Falha ao transcrever o arquivo local.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoadingFile(false);
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
              Transcrição Inteligente com IA
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Transcrever Vídeos e Áudios
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Transcreva vídeos da internet via link ou envie arquivos armazenados no seu computador (MP4, MOV, MP3, WEBM) para extrair o texto de fala completo em poucos segundos.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <Zap className="mr-1 size-3.5" /> Link ou Upload Local
          </Badge>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("link")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "link"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Wand2 className="size-4" /> Transcrever por Link (URL)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition ${
            activeTab === "upload"
              ? "border-emerald-500 text-emerald-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Upload className="size-4" /> Upload do Seu Computador
        </button>
      </div>

      {/* TAB 1: POR LINK */}
      {activeTab === "link" && (
        <section className="surface-card space-y-4 p-5 md:p-6">
          <label htmlFor="video-url-input" className="block text-sm font-medium">
            Link do Vídeo ou Áudio Online
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Input
                id="video-url-input"
                type="url"
                placeholder="https://www.tiktok.com/@usuario/video/73... ou link direto de mídia"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleTranscribeUrl()}
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
              disabled={loadingUrl}
              onClick={() => void handleTranscribeUrl()}
              className="h-12 px-6 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loadingUrl ? <Loader2 className="animate-spin" /> : <Wand2 className="size-4" />}
              {loadingUrl ? "Transcrevendo..." : "Transcrever por Link"}
            </Button>
          </div>
        </section>
      )}

      {/* TAB 2: UPLOAD LOCAL */}
      {activeTab === "upload" && (
        <section
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const f = e.dataTransfer.files?.[0];
            if (f) setSelectedFile(f);
          }}
          className="surface-card p-6 space-y-4 text-center border-dashed border-2 border-emerald-500/30 hover:border-emerald-500/60 transition"
        >
          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center space-y-4 p-6">
              <Upload className="size-12 text-emerald-400" />
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Selecione ou arraste um arquivo de vídeo do seu computador
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: MP4, MOV, WEBM, MP3, M4A (até 30 MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,audio/*,.mp4,.mov,.webm,.mp3,.m4a,.mkv"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setSelectedFile(f);
                }}
                className="hidden"
              />

              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 h-11"
              >
                <Upload className="mr-2 size-4" /> Escolher Arquivo do Computador
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <FileVideo2 className="size-8 text-emerald-400" />
                  <div>
                    <h3 className="font-semibold text-sm">{selectedFile.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  <X className="mr-1 size-3.5" /> Escolher outro
                </Button>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  disabled={loadingFile}
                  onClick={() => void handleTranscribeFile()}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 h-11"
                >
                  {loadingFile ? <Loader2 className="animate-spin" /> : <Wand2 className="size-4" />}
                  {loadingFile ? "Transcrevendo com IA..." : "Transcrever Arquivo Selecionado"}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

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
            {transcriptResult.filename && (
              <span className="text-xs text-muted-foreground">
                Arquivo: <strong className="text-foreground">{transcriptResult.filename}</strong>
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

      {/* Info Cards */}
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
            <Upload className="size-4" /> Envio do Computador
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Selecione arquivos de vídeo ou áudio locais (MP4, MOV, WEBM, MP3) armazenados no seu PC para transcrição instantânea.
          </p>
        </article>

        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
            <Sparkles className="size-4" /> IA Whisper Multilíngue
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            IA de altíssima fidelidade com detecção de idioma e geração de texto contínuo em português limpo.
          </p>
        </article>

        <article className="surface-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
            <Globe className="size-4" /> Links Diretos do TikTok
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Cole links do TikTok ou mídias públicas para transcrever de nuvem para nuvem sem ocupar seu disco.
          </p>
        </article>
      </section>
    </div>
  );
}
