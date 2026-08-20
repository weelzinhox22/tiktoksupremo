import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Wand2,
  Copy as CopyIcon,
  Check,
  FlaskConical,
  Clock,
  Layers,
  AlertTriangle,
  Play,
  Loader2,
  Link,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { CopyAnalysis, CopyVersion } from "@/features/four-modules/types";
import { analyzeCopyServerFn, transformCopyServerFn } from "@/features/four-modules/ai-service";
import { characterRepository, scenarioRepository } from "@/features/four-modules/repositories";
import { estimateSpeechDuration } from "@/features/four-modules/services";
import { SimilarityRiskBadge } from "@/features/four-modules/components/SimilarityRiskBadge";
import { CopyDiffViewer } from "@/features/four-modules/components/CopyDiffViewer";
import { transcribeMediaUrlServerFn } from "@/features/tiktok-downloader/transcribe-server";

export const Route = createFileRoute("/_authenticated/copy-modeler")({
  validateSearch: (search: Record<string, unknown>): { text?: string } => {
    const textVal = search["text"];
    return typeof textVal === "string" && textVal ? { text: textVal } : {};
  },
  component: CopyModelerPage,
});

function CopyModelerPage() {
  const { user } = Route.useRouteContext();
  const searchParams = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState<"input" | "analysis" | "config" | "result">("input");

  // Form State - Input
  const [projectName, setProjectName] = useState("Modelagem de Copy Viral");
  const [originalCopy, setOriginalCopy] = useState(
    searchParams.text ||
      "Gente, por favor não me diga que você ainda tá lavando louça com essa esponja tradicional cheia de bactéria. Eu descobri essa esponja de silicone viral do TikTok Shop que limpa tudo sem arranhar a panela. E o melhor: voltou o estoque com 40% de desconto! Clica no carrinho aqui embaixo antes que acabe tudo.",
  );

  useEffect(() => {
    if (searchParams.text) {
      setOriginalCopy(searchParams.text);
    }
  }, [searchParams.text]);

  const [urlInputModalOpen, setUrlInputModalOpen] = useState(false);
  const [transcribeUrlInput, setTranscribeUrlInput] = useState("");
  const [isTranscribingUrl, setIsTranscribingUrl] = useState(false);

  const handleTranscribeUrlInModeler = async () => {
    const trimmed = transcribeUrlInput.trim();
    if (!trimmed) {
      toast.error("Insira o link de um vídeo do TikTok ou arquivo de mídia.");
      return;
    }

    setIsTranscribingUrl(true);
    const toastId = toast.loading("Transcrevendo vídeo via IA (na nuvem)...");

    try {
      const res = await transcribeMediaUrlServerFn({ data: { url: trimmed } });
      if (res.success && res.transcript) {
        setOriginalCopy(res.transcript);
        if (res.videoTitle) setProjectName(`Modelagem: ${res.videoTitle.slice(0, 30)}`);
        setUrlInputModalOpen(false);
        setTranscribeUrlInput("");
        toast.success("Transcrição do vídeo obtida e preenchida com sucesso!", { id: toastId });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Não foi possível transcrever a URL.";
      toast.error(msg, { id: toastId });
    } finally {
      setIsTranscribingUrl(false);
    }
  };
  const [originalProduct, setOriginalProduct] = useState("Esponja de Silicone Viral");
  const [originalAudience, setOriginalAudience] = useState("Donas de casa e jovens adultos");

  // State - Analysis
  const [analysis, setAnalysis] = useState<CopyAnalysis | null>(null);

  // Form State - Transformation Config
  const [newProduct, setNewProduct] = useState("");
  const [newAudience, setNewAudience] = useState("");
  const [selectedModes, setSelectedModes] = useState<string[]>(["preserve_structure"]);
  const [tone, setTone] = useState("natural");
  const [speechSpeed, setSpeechSpeed] = useState<"slow" | "natural" | "fast" | "very_fast">("natural");
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("");
  const [variationCount, setVariationCount] = useState(3);

  // State - Generated Versions
  const [generatedVersions, setGeneratedVersions] = useState<CopyVersion[]>([]);
  const [activeVersionIndex, setActiveVersionIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  // Load Characters & Scenarios
  const charactersQuery = useQuery({
    queryKey: ["characters", user.id],
    queryFn: () => characterRepository.list(user.id),
  });

  const scenariosQuery = useQuery({
    queryKey: ["scenarios", user.id],
    queryFn: () => scenarioRepository.list(user.id),
  });

  // Analyze Copy Mutation
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      if (originalCopy.trim().length < 10) throw new Error("Insira uma copy com pelo menos 10 caracteres.");
      return await analyzeCopyServerFn({
        data: {
          text: originalCopy,
          product: originalProduct,
          audience: originalAudience,
        },
      });
    },
    onSuccess: (data) => {
      setAnalysis(data);
      setStep("analysis");
      toast.success("Análise estrutural da copy concluída!");
    },
    onError: (err) => toast.error(err.message),
  });

  // Transform Copy Mutation
  const transformMutation = useMutation({
    mutationFn: async () => {
      const selectedCharacter = charactersQuery.data?.find((c) => c.id === selectedCharacterId);
      const selectedScenario = scenariosQuery.data?.find((s) => s.id === selectedScenarioId);

      return await transformCopyServerFn({
        data: {
          projectId: `proj-${Date.now()}`,
          originalCopy,
          modes: selectedModes,
          newProduct: newProduct || originalProduct,
          newAudience: newAudience || originalAudience,
          tone,
          variationCount,
          characterName: selectedCharacter?.name,
          scenarioName: selectedScenario?.name,
        },
      });
    },
    onSuccess: (data) => {
      setGeneratedVersions(data);
      setActiveVersionIndex(0);
      setStep("result");
      toast.success(`${data.length} nova(s) versão(ões) gerada(s) pelo Tik Supremo!`);
    },
    onError: (err) => toast.error(err.message),
  });

  const currentVersion = generatedVersions[activeVersionIndex];
  const estSpeech = currentVersion ? estimateSpeechDuration(currentVersion.content, speechSpeed) : null;

  const handleCopyText = async () => {
    if (!currentVersion) return;
    await navigator.clipboard.writeText(currentVersion.content);
    setCopied(true);
    toast.success("Copy copiada para a área de transferência!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToScriptWizard = () => {
    if (!currentVersion) return;
    const copyTitle = currentVersion.name || newProduct || originalProduct || "Copy Modelada";
    const prodName = newProduct || originalProduct || "Produto";
    navigate({
      to: "/projects/new",
      search: {
        projectName: `Roteiro: ${copyTitle}`,
        productName: prodName,
        copy: currentVersion.content,
        description: currentVersion.content,
        benefits: analysis?.strengths?.join(", ") || "Alta qualidade e praticidade",
        problems: analysis?.weaknesses?.join(", ") || "",
        objections: "",
        audience: newAudience || originalAudience || analysis?.audience || "",
        tone: tone || "Natural, direto e curioso",
        duration: String(estSpeech?.estimatedDurationSeconds || "30"),
      },
    });
    toast.success("Copy e contexto completos enviados para o Criador de Roteiro!");
  };

  const handleSendToCreativeLab = () => {
    if (!currentVersion) return;

    const copyTitle = currentVersion.name || newProduct || originalProduct || "Copy Modelada";
    const prodName = newProduct || originalProduct || "Produto";

    const hookText =
      currentVersion.segments?.find((s) => s.type === "hook")?.text ||
      currentVersion.content.slice(0, 100);
    const bodyText =
      currentVersion.segments
        ?.filter((s) => s.type !== "hook" && s.type !== "cta")
        .map((s) => s.text)
        .join(" ") || "";
    const ctaText = currentVersion.segments?.find((s) => s.type === "cta")?.text || "";

    const savedItem = {
      id: `copy-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      title: copyTitle,
      productName: prodName,
      hook: hookText,
      body: bodyText,
      cta: ctaText,
      fullScript: currentVersion.content,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing: Array<typeof savedItem> = JSON.parse(
        localStorage.getItem("tik_supremo_modeled_copies") || "[]",
      );
      const updated = [savedItem, ...existing.filter((item) => item.fullScript !== savedItem.fullScript)];
      localStorage.setItem("tik_supremo_modeled_copies", JSON.stringify(updated));
    } catch {
      // Fallback
    }

    navigate({
      to: "/creative-lab",
      search: {
        scriptText: currentVersion.content,
        hookText,
        angleName: copyTitle,
        productName: prodName,
      },
    });
    toast.success("Copy salva e enviada ao Laboratório de Criativos!");
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> Tik Supremo AI
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Modelador de Copy
          </h1>
          <p className="text-sm text-muted-foreground">
            Desmonte copies de alta conversão do TikTok Shop e gere versões inéditas mantendo a estrutura de vendas.
          </p>
        </div>

        {/* Wizard Step Indicator */}
        <div className="flex items-center gap-2 self-start rounded-xl border border-border bg-secondary/30 p-1.5 text-xs">
          <button
            type="button"
            onClick={() => setStep("input")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${step === "input" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            1. Copy Original
          </button>
          <button
            type="button"
            disabled={!analysis}
            onClick={() => analysis && setStep("analysis")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${step === "analysis" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground disabled:opacity-40"}`}
          >
            2. Análise
          </button>
          <button
            type="button"
            disabled={!analysis}
            onClick={() => analysis && setStep("config")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${step === "config" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground disabled:opacity-40"}`}
          >
            3. Transformação
          </button>
          <button
            type="button"
            disabled={generatedVersions.length === 0}
            onClick={() => generatedVersions.length > 0 && setStep("result")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${step === "result" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground disabled:opacity-40"}`}
          >
            4. Resultado
          </button>
        </div>
      </div>

      {/* STEP 1: ENTRADA DA COPY ORIGINAL */}
      {step === "input" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold">Inserir Copy Validada de Referência</h2>
                <p className="text-xs text-muted-foreground">
                  Cole a transcrição ou transcreva diretamente um vídeo do TikTok via link (sem baixar nada).
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUrlInputModalOpen(true)}
              className="border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 hover:text-emerald-200"
            >
              <Wand2 className="mr-2 size-4 text-emerald-400" />
              Transcrever de Link de Vídeo
            </Button>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Nome do Projeto">
              <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} />
            </Field>
            <Field label="Produto Original da Copy">
              <Input value={originalProduct} onChange={(e) => setOriginalProduct(e.target.value)} />
            </Field>
          </div>

          <Field label="Texto da Copy Original">
            <Textarea
              rows={6}
              value={originalCopy}
              placeholder="Cole aqui o texto completo da copy ou use o botão de transcrever vídeo por link acima..."
              onChange={(e) => setOriginalCopy(e.target.value)}
            />
          </Field>

          {/* Modal de Transcrição por URL no Modeler */}
          <Dialog open={urlInputModalOpen} onOpenChange={setUrlInputModalOpen}>
            <DialogContent className="max-w-md border-emerald-500/20 bg-slate-950/95 backdrop-blur-xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-400">
                  <Link className="size-5" /> Transcrever Vídeo por URL
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Cole um link do TikTok ou URL de áudio/vídeo. A IA irá extrair a fala em tempo real na nuvem sem precisar baixar o arquivo.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <Input
                  type="url"
                  placeholder="https://www.tiktok.com/@usuario/video/..."
                  value={transcribeUrlInput}
                  onChange={(e) => setTranscribeUrlInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void handleTranscribeUrlInModeler()}
                  className="border-emerald-500/30 bg-slate-900/60 focus-visible:ring-emerald-500"
                />

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setUrlInputModalOpen(false)}
                    disabled={isTranscribingUrl}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => void handleTranscribeUrlInModeler()}
                    disabled={isTranscribingUrl}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                  >
                    {isTranscribingUrl ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" /> Transcrevendo...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 size-4" /> Transcrever
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Field label="Público-Alvo Original (Opcional)">
            <Input value={originalAudience} onChange={(e) => setOriginalAudience(e.target.value)} />
          </Field>

          <div className="flex justify-end pt-4">
            <Button
              type="button"
              variant="hero"
              disabled={analyzeMutation.isPending || originalCopy.trim().length < 10}
              onClick={() => analyzeMutation.mutate()}
            >
              {analyzeMutation.isPending ? "Analisando Estrutura..." : "Analisar Estrutura Persuasiva"}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: ANÁLISE ESTRUTURAL */}
      {step === "analysis" && analysis && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h2 className="font-semibold text-lg">Análise Estrutural do Tik Supremo</h2>
                <p className="text-xs text-muted-foreground">
                  Público identificado: <span className="font-semibold text-foreground">{analysis.audience}</span>
                </p>
              </div>
              <Button type="button" variant="hero" onClick={() => setStep("config")}>
                Configurar Transformação
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </div>

            {/* Badges de Estrutura */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Blocos Persuasivos Classificados
              </h3>
              <div className="space-y-3">
                {analysis.segments.map((seg) => (
                  <div key={seg.id} className="rounded-xl border border-border bg-secondary/20 p-4">
                    <span className="mb-1.5 inline-block rounded bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      [{seg.type}]
                    </span>
                    <p className="text-sm leading-relaxed">{seg.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pontos Fortes & Avisos de Compliance */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-xs space-y-2">
                <h4 className="font-semibold text-emerald-400">Pontos Fortes Identificados:</h4>
                <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                  {analysis.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>

              {analysis.complianceWarnings.length > 0 && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-2">
                  <h4 className="font-semibold text-amber-400">Alertas de Política do TikTok:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    {analysis.complianceWarnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CONFIGURAÇÃO DA TRANSFORMAÇÃO */}
      {step === "config" && (
        <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wand2 className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Configurar Transformação da Copy</h2>
              <p className="text-xs text-muted-foreground">
                Defina o novo produto, tom de voz, personagem e cenário para a inteligência artificial.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Novo Produto (para o qual deseja vender)">
              <Input
                placeholder="Ex.: Blusa Canelada com Ajuste de Alça"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
              />
            </Field>

            <Field label="Novo Público-Alvo">
              <Input
                placeholder="Ex.: Mulheres de 18 a 35 anos interessadas em Moda"
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value)}
              />
            </Field>

            {/* Seleção de Personagem do Estúdio */}
            <Field label="Vincular Personagem do Estúdio">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCharacterId}
                onChange={(e) => setSelectedCharacterId(e.target.value)}
              >
                <option value="">Nenhuma personagem (padrão)</option>
                {charactersQuery.data?.map((char) => (
                  <option key={char.id} value={char.id}>
                    {char.name} ({char.type})
                  </option>
                ))}
              </select>
            </Field>

            {/* Seleção de Cenário da Biblioteca */}
            <Field label="Vincular Cenário da Biblioteca">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
              >
                <option value="">Nenhum cenário (padrão)</option>
                {scenariosQuery.data?.map((scen) => (
                  <option key={scen.id} value={scen.id}>
                    {scen.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tom de Voz">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
              >
                <option value="natural">Natural e Espontâneo (UGC Real)</option>
                <option value="curious">Intrigante e Curioso</option>
                <option value="urgent">Alta Urgência e Escassez</option>
                <option value="emotional">Emocional e História Pessoal</option>
              </select>
            </Field>

            <Field label="Quantidade de Variações Estratégicas">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={variationCount}
                onChange={(e) => setVariationCount(Number(e.target.value))}
              >
                <option value={1}>1 Variação Principal</option>
                <option value={3}>3 Variações Estratégicas</option>
                <option value={5}>5 Variações (Gancho, Dor, Desejo, Prova, Urgência)</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={() => setStep("analysis")}>
              Voltar
            </Button>
            <Button
              type="button"
              variant="hero"
              disabled={transformMutation.isPending}
              onClick={() => transformMutation.mutate()}
            >
              {transformMutation.isPending ? "Gerando Novas Copies..." : "Modelar e Gerar Novas Copies"}
              <Sparkles className="ml-2 size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: RESULTADO E COMPARAÇÃO SIDE-BY-SIDE */}
      {step === "result" && currentVersion && (
        <div className="space-y-6">
          {/* Seletor de Variações se houver mais de 1 */}
          {generatedVersions.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-secondary/30 p-2">
              {generatedVersions.map((v, idx) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setActiveVersionIndex(idx)}
                  className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${activeVersionIndex === idx ? "bg-primary text-primary-foreground shadow" : "bg-background/40 hover:bg-background"}`}
                >
                  {v.name}
                </button>
              ))}
            </div>
          )}

          {/* Cards Principais de Risco de Semelhança & Estimativa de Duração */}
          <div className="grid gap-4 md:grid-cols-2">
            <SimilarityRiskBadge
              risk={currentVersion.similarityRisk}
              reasons={currentVersion.similarityReasons}
              showDetails
            />

            {estSpeech && (
              <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
                  <Clock className="size-5" />
                </span>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Estimativa de Fala (~{estSpeech.wpm} WPM)
                  </h4>
                  <p className="text-sm font-bold text-foreground">
                    {estSpeech.wordCount} palavras ≈ {estSpeech.estimatedDurationSeconds} segundos
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Comparador Side-by-Side */}
          <CopyDiffViewer
            originalText={originalCopy}
            originalSegments={analysis?.segments}
            newText={currentVersion.content}
            newSegments={currentVersion.segments}
          />

          {/* Ações de Saída e Integração com Outros Módulos */}
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleCopyText}>
                {copied ? <Check className="size-4 text-emerald-400" /> : <CopyIcon className="size-4" />}
                {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={handleSendToCreativeLab}>
                <FlaskConical className="mr-2 size-4 text-cyan" />
                Enviar ao Laboratório de Criativos
              </Button>
              <Button type="button" variant="hero" onClick={handleSendToScriptWizard}>
                <Play className="mr-2 size-4" />
                Criar Roteiro / Prompts VEO
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
