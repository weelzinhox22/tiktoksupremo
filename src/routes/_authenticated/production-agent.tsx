import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bot,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clapperboard,
  Film,
  Link2,
  Loader2,
  PackageSearch,
  Send,
  Sparkles,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateCreativeScore,
  emptyDailyWorkspace,
  loadDailyWorkspace,
  saveDailyWorkspace,
  variationLabels,
  type DailyObjective,
  type DailyVideoJob,
  type DailyWorkspace,
} from "@/features/daily-studio/workspace";
import { listProductLibrary } from "@/features/libraries/queries";
import {
  getProductionAgentStatus,
  runProductionAgent,
  type ProductionAgentResult,
} from "@/features/production-agent/server";
import { importProductFromUrl } from "@/features/products/import-server";

export const Route = createFileRoute("/_authenticated/production-agent")({
  component: ProductionAgentPage,
  head: () => ({ meta: [{ title: "Agente de Produção — Tik Supremo" }] }),
});

type Brief = {
  product: string;
  productUrl: string;
  productDetails: string;
  audience: string;
  offer: string;
  quantity: number;
  objective: DailyObjective;
  duration: number;
  tone: string;
  constraints: string;
  signals: string;
};

const initialBrief: Brief = {
  product: "",
  productUrl: "",
  productDetails: "",
  audience: "",
  offer: "",
  quantity: 7,
  objective: "sales",
  duration: 24,
  tone: "UGC natural, direto e confiável",
  constraints: "Não inventar resultados, avaliações, descontos ou escassez.",
  signals: "",
};

function ProductionAgentPage() {
  const navigate = useNavigate();
  const products = useQuery({ queryKey: ["agent-products"], queryFn: listProductLibrary });
  const agentStatus = useQuery({
    queryKey: ["production-agent-status"],
    queryFn: () => getProductionAgentStatus(),
  });
  const [workspace, setWorkspace] = useState<DailyWorkspace>(emptyDailyWorkspace);
  const [brief, setBrief] = useState(initialBrief);
  const [result, setResult] = useState<ProductionAgentResult | null>(null);
  const [running, setRunning] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    void loadDailyWorkspace()
      .then(setWorkspace)
      .catch(() => undefined);
    const savedSignals = localStorage.getItem("production-agent-signals");
    if (savedSignals) setBrief((current) => ({ ...current, signals: savedSignals }));
  }, []);

  const readiness = useMemo(
    () => [
      { label: "Produto definido", ready: brief.product.trim().length >= 2 },
      { label: "Público descrito", ready: brief.audience.trim().length >= 8 },
      { label: "Oferta informada", ready: brief.offer.trim().length >= 4 },
      {
        label: "Biblioteca de mídia",
        ready: workspace.media.some((item) => item.kind === "video" && item.file),
      },
      { label: "Quantidade e objetivo", ready: brief.quantity > 0 && Boolean(brief.objective) },
      { label: "IA configurada no servidor", ready: Boolean(agentStatus.data?.aiConfigured) },
    ],
    [agentStatus.data?.aiConfigured, brief, workspace.media],
  );
  const readyCount = readiness.filter((item) => item.ready).length;

  const importUrl = async () => {
    if (!brief.productUrl.trim()) return;
    setImporting(true);
    try {
      const product = await importProductFromUrl({ data: { url: brief.productUrl.trim() } });
      setBrief((current) => ({
        ...current,
        product: product.name,
        productDetails: [
          product.description,
          product.category && `Categoria: ${product.category}`,
          product.price && `Preço público encontrado: ${product.price}`,
        ]
          .filter(Boolean)
          .join("\n"),
      }));
      toast.success("Dados públicos do produto importados.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Não foi possível importar o produto.");
    } finally {
      setImporting(false);
    }
  };

  const run = async () => {
    if (!brief.product.trim() || !brief.audience.trim() || !brief.offer.trim()) {
      toast.error("Preencha produto, público e oferta.");
      return;
    }
    setRunning(true);
    setSent(false);
    try {
      const output = await runProductionAgent({
        data: {
          product: brief.product,
          productDetails: brief.productDetails,
          audience: brief.audience,
          offer: brief.offer,
          quantity: brief.quantity,
          dailyObjective: brief.objective,
          targetDuration: brief.duration,
          tone: brief.tone,
          constraints: brief.constraints,
          opportunitySignals: brief.signals
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
          availableMedia: workspace.media.map((item) => ({
            id: item.id,
            name: item.name,
            tags: item.tags,
            description: item.description ?? "",
            duration: item.duration,
            orientation: item.orientation,
            useCount: item.useCount,
          })),
        },
      });
      setResult(output);
      toast.success(`${output.videos.length} vídeos planejados pelo agente.`);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "O agente não conseguiu gerar o lote.");
    } finally {
      setRunning(false);
    }
  };

  const sendToApproval = async () => {
    if (!result) return;
    const now = Date.now();
    const jobs: DailyVideoJob[] = result.videos.map((video, index) => {
      const quality = calculateCreativeScore({
        hook: video.hook,
        body: video.body,
        cta: video.cta,
        duration: video.duration,
        angle: variationLabels[video.variationPurpose],
      });
      return {
        id: `agent-${crypto.randomUUID()}`,
        title: video.title,
        productId: null,
        productName: brief.product,
        objective: brief.objective,
        templateId: "agent-autonomous",
        angle: variationLabels[video.variationPurpose],
        variationPurpose: video.variationPurpose,
        hook: video.hook,
        body: video.body,
        cta: video.cta,
        duration: video.duration,
        status: "editing",
        score: quality.score,
        scoreNotes: [...quality.notes, ...video.audit],
        scheduledFor: null,
        outputName: `agente-${String(index + 1).padStart(2, "0")}.mp4`,
        attempts: 0,
        createdAt: now + index,
        updatedAt: now + index,
        approvalStatus: "pending",
        agentStoryboard: video.storyboard,
        recommendedMediaIds: video.mediaIds,
        agentAudit: video.audit,
      };
    });
    const next = { ...workspace, jobs: [...jobs, ...workspace.jobs], updatedAt: Date.now() };
    await saveDailyWorkspace(next);
    setWorkspace(next);
    setSent(true);
    toast.success("Lote enviado para a fila de aprovação da Fábrica diária.");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-14">
      <header className="bento-hero p-6 md:p-8">
        <Badge className="bg-violet-500/10 text-violet-300">
          <Bot className="mr-1 size-3" /> Produção autônoma
        </Badge>
        <h1 className="mt-4 text-3xl font-semibold md:text-4xl">Do briefing à fila de aprovação</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
          O agente cria estratégias diferentes, roteiros, storyboard, consultas de B-roll, seleciona
          sua mídia, audita riscos e entrega o lote organizado.
        </p>
      </header>

      <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div className="bento-card p-5 md:p-6">
          <div className="flex items-center gap-3">
            <Target className="text-primary" />
            <div>
              <h2 className="font-semibold">Briefing obrigatório</h2>
              <p className="text-xs text-muted-foreground">
                Tudo que o agente precisa está nesta tela.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Field label="Produto *">
              <Input
                value={brief.product}
                onChange={(event) => setBrief({ ...brief, product: event.target.value })}
                placeholder="Nome exato do produto"
              />
            </Field>
            <Field label="Produto da biblioteca">
              <select
                className="dark-control h-10 w-full"
                value=""
                onChange={(event) => {
                  const item = products.data?.find((product) => product.id === event.target.value);
                  if (item)
                    setBrief({ ...brief, product: item.name, productDetails: item.description });
                }}
              >
                <option value="">Selecionar produto salvo</option>
                {products.data?.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Link público do produto" wide>
              <div className="flex gap-2">
                <Input
                  value={brief.productUrl}
                  onChange={(event) => setBrief({ ...brief, productUrl: event.target.value })}
                  placeholder="TikTok Shop ou Kalodata"
                />
                <Button
                  variant="outline"
                  disabled={importing || !brief.productUrl}
                  onClick={() => void importUrl()}
                >
                  {importing ? <Loader2 className="animate-spin" /> : <Link2 />} Importar
                </Button>
              </div>
            </Field>
            <Field label="Detalhes reais do produto" wide>
              <textarea
                className="dark-textarea min-h-24"
                value={brief.productDetails}
                onChange={(event) => setBrief({ ...brief, productDetails: event.target.value })}
                placeholder="Benefícios comprovados, material, medidas, modo de uso, preço..."
              />
            </Field>
            <Field label="Público *">
              <textarea
                className="dark-textarea"
                value={brief.audience}
                onChange={(event) => setBrief({ ...brief, audience: event.target.value })}
                placeholder="Quem compra, dores, desejos e objeções"
              />
            </Field>
            <Field label="Oferta *">
              <textarea
                className="dark-textarea"
                value={brief.offer}
                onChange={(event) => setBrief({ ...brief, offer: event.target.value })}
                placeholder="Preço, condição, bônus e CTA — somente dados reais"
              />
            </Field>
            <Field label="Quantidade">
              <Input
                type="number"
                min={1}
                max={30}
                value={brief.quantity}
                onChange={(event) => setBrief({ ...brief, quantity: Number(event.target.value) })}
              />
            </Field>
            <Field label="Objetivo diário">
              <select
                className="dark-control h-10 w-full"
                value={brief.objective}
                onChange={(event) =>
                  setBrief({ ...brief, objective: event.target.value as DailyObjective })
                }
              >
                <option value="sales">Vendas</option>
                <option value="clicks">Cliques</option>
                <option value="followers">Seguidores</option>
                <option value="test">Teste criativo</option>
              </select>
            </Field>
            <Field label="Duração base">
              <Input
                type="number"
                min={8}
                max={90}
                value={brief.duration}
                onChange={(event) => setBrief({ ...brief, duration: Number(event.target.value) })}
              />
            </Field>
            <Field label="Tom">
              <Input
                value={brief.tone}
                onChange={(event) => setBrief({ ...brief, tone: event.target.value })}
              />
            </Field>
            <Field label="Sinais copiados do Radar" wide>
              <textarea
                className="dark-textarea min-h-24"
                value={brief.signals}
                onChange={(event) => setBrief({ ...brief, signals: event.target.value })}
                placeholder="Um sinal real por linha: hashtag, anúncio, produto, formato, som..."
              />
            </Field>
            <Field label="Restrições e compliance" wide>
              <textarea
                className="dark-textarea"
                value={brief.constraints}
                onChange={(event) => setBrief({ ...brief, constraints: event.target.value })}
              />
            </Field>
          </div>
          <Button
            size="lg"
            className="mt-6 w-full"
            disabled={running || agentStatus.data?.aiConfigured === false}
            onClick={() => void run()}
          >
            {running ? <Loader2 className="animate-spin" /> : <Sparkles />}{" "}
            {running ? "Agente trabalhando..." : `Criar ${brief.quantity} vídeos`}
          </Button>
        </div>

        <aside className="space-y-4">
          <div className="bento-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Prontidão</h2>
              <Badge>
                {readyCount}/{readiness.length}
              </Badge>
            </div>
            <div className="mt-4 space-y-3">
              {readiness.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs">
                  {item.ready ? (
                    <CheckCircle2 className="size-4 text-emerald-400" />
                  ) : (
                    <CircleAlert className="size-4 text-amber-300" />
                  )}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card p-5">
            <h2 className="font-semibold">Mídia disponível</h2>
            <p className="mt-2 text-3xl font-semibold">{workspace.media.length}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              ativos catalogados para busca automática de B-roll.
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => void navigate({ to: "/daily-studio" })}
            >
              <PackageSearch /> Abrir biblioteca
            </Button>
          </div>
        </aside>
      </section>

      {result && (
        <section className="bento-card overflow-hidden">
          <header className="flex flex-wrap items-center gap-3 border-b border-border p-5">
            <Clapperboard className="text-primary" />
            <div>
              <h2 className="font-semibold">Plano produzido</h2>
              <p className="text-xs text-muted-foreground">{result.strategySummary}</p>
            </div>
            <Button className="ml-auto" disabled={sent} onClick={() => void sendToApproval()}>
              {sent ? <CheckCircle2 /> : <Send />} {sent ? "Enviado" : "Enviar tudo para aprovação"}
            </Button>
          </header>
          <div className="grid gap-4 p-5 lg:grid-cols-2">
            {result.videos.map((video, index) => (
              <article
                key={`${video.title}-${index}`}
                className="rounded-xl border border-border bg-secondary/15 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge className="bg-violet-500/10 text-violet-300">
                    {variationLabels[video.variationPurpose]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {video.duration}s · {video.mediaIds.length} mídia(s)
                  </span>
                </div>
                <h3 className="mt-3 font-semibold">{video.title}</h3>
                <p className="mt-2 text-sm font-medium">{video.hook}</p>
                <div className="mt-4 space-y-2">
                  {video.storyboard.map((scene) => (
                    <div key={scene.scene} className="flex gap-3 rounded-lg bg-background/50 p-3">
                      <span className="font-mono text-xs text-primary">
                        {scene.scene.toString().padStart(2, "0")}
                      </span>
                      <div>
                        <p className="text-xs font-medium">{scene.visual}</p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          B-roll: {scene.brollQuery} · {scene.duration}s
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {video.missingShots.length > 0 && (
                  <p className="mt-3 text-xs text-amber-300">
                    Gravar: {video.missingShots.join(" · ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${wide ? "md:col-span-2" : ""}`}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
