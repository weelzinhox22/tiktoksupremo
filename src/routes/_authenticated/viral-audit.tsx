import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clapperboard,
  Copy,
  FileText,
  FileVideo2,
  Globe,
  Flame,
  Loader2,
  Sparkles,
  TrendingUp,
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
  analyzeViralScoreServerFn,
  type ViralAuditResult,
} from "@/features/viral-audit/server";

export const Route = createFileRoute("/_authenticated/viral-audit")({
  component: ViralAuditPage,
  head: () => ({ meta: [{ title: "Auditoria Viral & Score de Retenção — Tik Supremo" }] }),
});

type Mode = "link" | "upload";

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

function ViralAuditPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Mode>("link");

  // Input states
  const [linkInput, setLinkInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Loading & Result states
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState<ViralAuditResult | null>(null);
  const [copiedHook, setCopiedHook] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setLinkInput(text);
        toast.success("Link colado!");
      }
    } catch {
      toast.error("Não foi possível ler a área de transferência.");
    }
  };

  const handleRunAudit = async (mode: Mode) => {
    setLoading(true);
    setAuditResult(null);
    const toastId = toast.loading(
      mode === "link"
        ? "Obtendo áudio e auditando vídeo via IA..."
        : `Processando "${selectedFile?.name}" e auditando retenção...`,
    );

    try {
      let payload: { url?: string; base64?: string; filename?: string; mimeType?: string } = {};

      if (mode === "link") {
        const trimmed = linkInput.trim();
        if (!trimmed) {
          toast.error("Cole um link válido do TikTok ou vídeo online.");
          setLoading(false);
          return;
        }
        payload.url = trimmed;
      } else {
        if (!selectedFile) {
          toast.error("Selecione um arquivo de vídeo do seu computador.");
          setLoading(false);
          return;
        }
        if (selectedFile.size > 50 * 1024 * 1024) {
          toast.error("O arquivo excede o limite de 50MB para auditoria direta por IA.");
          setLoading(false);
          return;
        }

        const base64 = await fileToBase64(selectedFile);
        payload = {
          base64,
          filename: selectedFile.name,
          mimeType: selectedFile.type,
        };
      }

      const res = await analyzeViralScoreServerFn({ data: payload });
      if (res.success && res.result) {
        setAuditResult(res.result);
        toast.success("Auditoria Viral concluída!", { id: toastId });
      }
    } catch (cause) {
      const msg = cause instanceof Error ? cause.message : "Erro ao auditar o vídeo.";
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHookOption = async (hookText: string) => {
    await navigator.clipboard.writeText(hookText);
    setCopiedHook(hookText);
    toast.success("Gancho copiado!");
    setTimeout(() => setCopiedHook(null), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 60) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-rose-400 border-rose-500/40 bg-rose-500/10";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-16">
      {/* Header */}
      <header className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-background to-cyan-500/10 p-6 shadow-2xl shadow-emerald-500/5 md:p-8">
        <div className="absolute -right-20 -top-24 size-64 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-300">
              Análise Preditiva de Algoritmo
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Auditoria Viral & Score de Retenção
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              A IA simula o comportamento dos usuários e o algoritmo do TikTok/Reels para calcular a pontuação de retenção, avaliar os primeiros 3 segundos (Gancho) e indicar ajustes práticos antes de você postar.
            </p>
          </div>
          <Badge
            variant="outline"
            className="w-fit border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-emerald-200"
          >
            <Flame className="mr-1 size-3.5 text-amber-400" /> Algoritmo Auditor IA
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
          <Globe className="size-4" /> Auditar por Link (TikTok / Redes)
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
          <Upload className="size-4" /> Auditar Arquivo do Computador
        </button>
      </div>

      {/* TAB 1: POR LINK */}
      {activeTab === "link" && (
        <section className="surface-card space-y-4 p-5 md:p-6">
          <label htmlFor="audit-url-input" className="block text-sm font-medium">
            Link do Vídeo do TikTok ou Mídia
          </label>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="relative flex-1">
              <Input
                id="audit-url-input"
                type="url"
                placeholder="https://www.tiktok.com/@usuario/video/731234567890..."
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void handleRunAudit("link")}
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
              onClick={() => void handleRunAudit("link")}
              className="h-12 px-6 font-medium bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Flame className="size-4 text-amber-400" />}
              {loading ? "Auditando..." : "Calcular Score Viral"}
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
                  Selecione ou arraste um vídeo do seu computador
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos aceitos: MP4, MOV, WEBM (até 30 MB)
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*,.mp4,.mov,.webm,.mkv"
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
                <Upload className="mr-2 size-4" /> Escolher Vídeo do PC
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <FileVideo2 className="size-8 text-emerald-400" />
                  <div className="text-left">
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
                  disabled={loading}
                  onClick={() => void handleRunAudit("upload")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 h-11"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Flame className="size-4 text-amber-400" />}
                  {loading ? "Auditando Vídeo..." : "Calcular Score Viral do Arquivo"}
                </Button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* DASHBOARD DE RESULTADOS */}
      {auditResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Main Score Gauge Banner */}
          <div className="surface-card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-emerald-500/30">
            <div className="flex items-center gap-6">
              <div
                className={`flex size-24 shrink-0 flex-col items-center justify-center rounded-3xl border-4 text-3xl font-black shadow-xl ${getScoreColor(
                  auditResult.viralScore,
                )}`}
              >
                <span>{auditResult.viralScore}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Score</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    <TrendingUp className="mr-1 size-3" /> {auditResult.verdict}
                  </Badge>
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">
                  {auditResult.viralScore >= 80
                    ? "Excelente Potencial de Viralização!"
                    : auditResult.viralScore >= 60
                      ? "Vídeo com Boa Estrutura (Necessita pequenos ajustes)"
                      : "Risco de Abandono nos Primeiros Segundos"}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground max-w-xl">
                  Auditoria baseada nas métricas de retenção e relevância de ganchos do algoritmo.
                </p>
              </div>
            </div>

            <Button
              onClick={() =>
                void navigate({
                  to: "/copy-modeler",
                  search: { text: auditResult.transcript },
                })
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium shrink-0"
            >
              <Wand2 className="mr-2 size-4" /> Otimizar no Copy Modeler
            </Button>
          </div>

          {/* Detailed Score Breakdown Grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            <article className="surface-card p-5 space-y-2 border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Gancho (0-3s)</span>
                <span className="text-lg font-black text-emerald-400">{auditResult.hookScore}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-emerald-500" style={{ width: `${auditResult.hookScore}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Força da frase de impacto inicial.</p>
            </article>

            <article className="surface-card p-5 space-y-2 border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Ritmo (Pacing)</span>
                <span className="text-lg font-black text-cyan-400">{auditResult.pacingScore}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-cyan-500" style={{ width: `${auditResult.pacingScore}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Dinâmica da fala e ausência de pausas.</p>
            </article>

            <article className="surface-card p-5 space-y-2 border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">CTA (Conversão)</span>
                <span className="text-lg font-black text-purple-400">{auditResult.ctaScore}/100</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full bg-purple-500" style={{ width: `${auditResult.ctaScore}%` }} />
              </div>
              <p className="text-xs text-muted-foreground">Clareza do direcionamento para ação.</p>
            </article>
          </div>

          {/* Hook Analysis & Alternative Options */}
          <div className="surface-card p-6 space-y-5 border-emerald-500/30">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-400 border-b border-border pb-3">
              <Sparkles className="size-5" /> Análise dos Primeiros 3 Segundos (Gancho)
            </h3>

            <div className="rounded-xl border border-white/[0.08] bg-secondary/30 p-4 space-y-2">
              <span className="text-xs font-semibold uppercase text-muted-foreground">Gancho Identificado:</span>
              <p className="font-mono text-sm font-medium text-foreground">"{auditResult.hookAnalysis.excerpt}"</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-emerald-400 uppercase">Ponto Forte:</span>
                <p className="text-xs text-foreground/90">{auditResult.hookAnalysis.strength}</p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-1">
                <span className="text-xs font-semibold text-amber-400 uppercase">Ponto a Melhorar:</span>
                <p className="text-xs text-foreground/90">{auditResult.hookAnalysis.weakness}</p>
              </div>
            </div>

            {/* AI Generated Alternative Hooks */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Ganchos Alternativos Recomendados pela IA (Copiar & Substituir):
              </h4>
              <div className="space-y-2">
                {auditResult.hookAnalysis.improvedHookOptions.map((hook, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-slate-950/60 p-3 text-xs"
                  >
                    <span className="font-medium text-emerald-200">🔥 "{hook}"</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyHookOption(hook)}
                      className="h-8 text-xs text-emerald-400 hover:bg-emerald-500/10"
                    >
                      {copiedHook === hook ? <Check className="mr-1 size-3" /> : <Copy className="mr-1 size-3" />}
                      {copiedHook === hook ? "Copiado!" : "Copiar"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Retention & Actionable Steps */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Retention Risk */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2 text-cyan-400">
                <BarChart3 className="size-4" /> Diagnóstico de Retenção
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {auditResult.pacingAnalysis.assessment}
              </p>
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-xs text-rose-300 flex items-start gap-2">
                <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                <span>Risco de queda: {auditResult.pacingAnalysis.retentionDropRisk}</span>
              </div>
            </div>

            {/* Actionable Steps */}
            <div className="surface-card p-6 space-y-4">
              <h3 className="font-semibold text-base flex items-center gap-2 text-purple-400">
                <CheckCircle2 className="size-4" /> Ações Práticas de Otimização
              </h3>
              <ul className="space-y-2.5 text-xs text-foreground/90">
                {auditResult.actionableSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-300">
                      {i + 1}
                    </span>
                    <span className="mt-0.5 leading-relaxed">{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
