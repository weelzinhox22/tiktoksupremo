import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CircleAlert,
  Database,
  ExternalLink,
  Eye,
  Heart,
  Link2,
  Loader2,
  PackageSearch,
  Radar,
  Search,
  Share2,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listPerformance, listProductLibrary } from "@/features/libraries/queries";
import { importTikTokPerformance } from "@/features/performance/server";
import {
  getViralRadarStatus,
  searchShopProducts,
  searchViralVideos,
} from "@/features/viral-radar/server";

export const Route = createFileRoute("/_authenticated/radar")({
  component: ViralRadarPage,
  head: () => ({ meta: [{ title: "Radar Viral — Tik Supremo" }] }),
});

function ViralRadarPage() {
  const [mode, setMode] = useState<"videos" | "products">("videos");
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("BR");
  const [days, setDays] = useState("7");
  const [shopId, setShopId] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const queryClient = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ["viral-radar-status"],
    queryFn: () => getViralRadarStatus({ data: {} }),
  });
  const performanceQuery = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });
  const videoMutation = useMutation({
    mutationFn: () =>
      searchViralVideos({
        data: {
          keyword: keyword.trim(),
          region,
          days: Number(days),
        },
      }),
    onError: (error) => toast.error(error.message),
  });
  const productMutation = useMutation({
    mutationFn: () => searchShopProducts({ data: { shopId: shopId.trim() } }),
    onError: (error) => toast.error(error.message),
  });
  const referenceMutation = useMutation({
    mutationFn: () => importTikTokPerformance({ data: { url: referenceUrl.trim() } }),
    onSuccess: async () => {
      setReferenceUrl("");
      await queryClient.invalidateQueries({ queryKey: ["performance"] });
      toast.success("Referência adicionada à sua base de vencedores.");
    },
    onError: (error) => toast.error(error.message),
  });

  const ownWinners = [...(performanceQuery.data ?? [])]
    .filter((item) => item.views > 0)
    .sort(
      (a, b) =>
        b.views +
        b.likes * 4 +
        b.comments * 8 +
        b.shares * 12 +
        b.orders * 500 -
        (a.views + a.likes * 4 + a.comments * 8 + a.shares * 12 + a.orders * 500),
    )
    .slice(0, 5);
  const researchReady = statusQuery.data?.researchConfigured ?? false;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      <header className="bento-hero p-6 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <Badge className="border-cyan/20 bg-cyan/10 text-cyan">
              <Radar className="mr-1 size-3" /> Inteligência de mercado
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
              Radar Viral TikTok Shop
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              Compare seus próprios vencedores, pesquise vídeos por alcance e consulte produtos por
              vendas declaradas quando o acesso oficial do TikTok estiver aprovado.
            </p>
          </div>
          <Button variant="outline" asChild>
            <a
              href="https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en"
              target="_blank"
              rel="noreferrer"
            >
              Creative Center oficial <ExternalLink />
            </a>
          </Button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <SourceCard
          icon={Database}
          title="Seus dados"
          description={`${performanceQuery.data?.length ?? 0} publicações e ${productsQuery.data?.length ?? 0} produtos na sua base.`}
          status="Sempre disponível"
          active
        />
        <SourceCard
          icon={TrendingUp}
          title="Pesquisa oficial"
          description="Vídeos públicos e produtos por loja usando o escopo research.data.basic."
          status={researchReady ? "Conectado" : "Aguardando aprovação"}
          active={researchReady}
        />
        <SourceCard
          icon={Sparkles}
          title="Creative Center"
          description="Tendências e anúncios de alta performance na fonte pública gratuita do TikTok."
          status="Fonte externa oficial"
          active
        />
      </section>

      {!researchReady && (
        <section className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm">
          <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
          <div>
            <p className="font-semibold text-amber-200">O radar global ainda não tem autorização</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              As credenciais comuns do Login Kit mostram apenas os vídeos do próprio usuário. Para
              pesquisar o conjunto público e vendas por loja, o TikTok exige aprovação separada do
              Research API. Nenhum número será inventado enquanto esse acesso não existir.
            </p>
          </div>
        </section>
      )}

      <section className="bento-card overflow-hidden border-primary/20">
        <div className="grid gap-5 p-5 md:grid-cols-[1fr_1.2fr] md:items-end md:p-6">
          <div>
            <Badge className="bg-primary/10 text-primary">
              <Link2 className="mr-1 size-3" /> Funciona sem API de pesquisa
            </Badge>
            <h2 className="mt-3 font-semibold">Monte seu radar com links do TikTok Shop</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Cole um vídeo público de produto. O sistema guarda as métricas disponíveis, compara
              com seus roteiros e passa a usá-lo no ranking da sua própria base.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label>Link de referência TikTok Shop</Label>
              <Input
                value={referenceUrl}
                onChange={(event) => setReferenceUrl(event.target.value)}
                placeholder="https://www.tiktok.com/@criador/video/..."
              />
            </div>
            <Button
              variant="hero"
              disabled={!referenceUrl.includes("tiktok.com/") || referenceMutation.isPending}
              onClick={() => referenceMutation.mutate()}
            >
              {referenceMutation.isPending ? <Loader2 className="animate-spin" /> : <Link2 />}
              Analisar link
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="bento-card bento-card-accent overflow-hidden">
          <div className="flex border-b border-border p-2">
            <ModeButton active={mode === "videos"} onClick={() => setMode("videos")}>
              <Video /> Vídeos virais
            </ModeButton>
            <ModeButton active={mode === "products"} onClick={() => setMode("products")}>
              <PackageSearch /> Produtos por loja
            </ModeButton>
          </div>
          <div className="p-5 md:p-6">
            {mode === "videos" ? (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold">Pesquisar vídeos de TikTok Shop</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Só entram vídeos com marca de comissão do criador ou hashtags explícitas de
                    TikTok Shop. O ranking combina alcance e engajamento; vendas não fazem parte do
                    objeto oficial de vídeo.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_120px_120px_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>Produto, dor ou palavra-chave</Label>
                    <Input
                      value={keyword}
                      onChange={(event) => setKeyword(event.target.value)}
                      placeholder="Ex.: feno grego, camiseta, organização"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Região</Label>
                    <select
                      value={region}
                      onChange={(event) => setRegion(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="BR">Brasil</option>
                      <option value="US">Estados Unidos</option>
                      <option value="GB">Reino Unido</option>
                      <option value="ES">Espanha</option>
                      <option value="FR">França</option>
                      <option value="DE">Alemanha</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Período</Label>
                    <select
                      value={days}
                      onChange={(event) => setDays(event.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="3">3 dias</option>
                      <option value="7">7 dias</option>
                      <option value="14">14 dias</option>
                      <option value="30">30 dias</option>
                    </select>
                  </div>
                  <Button
                    variant="hero"
                    disabled={!researchReady || videoMutation.isPending}
                    onClick={() => videoMutation.mutate()}
                  >
                    {videoMutation.isPending ? <Loader2 className="animate-spin" /> : <Search />}
                    Pesquisar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <h2 className="font-semibold">Consultar produtos de uma loja</h2>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Retorna até 10 produtos ordenados por unidades vendidas. O endpoint de pesquisa
                    documentado pelo TikTok cobre lojas e produtos disponíveis na União Europeia.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                  <div className="space-y-2">
                    <Label>ID numérico da loja TikTok Shop</Label>
                    <Input
                      inputMode="numeric"
                      value={shopId}
                      onChange={(event) => setShopId(event.target.value.replace(/\D/g, ""))}
                      placeholder="Ex.: 127878967"
                    />
                  </div>
                  <Button
                    variant="hero"
                    disabled={!researchReady || shopId.length < 4 || productMutation.isPending}
                    onClick={() => productMutation.mutate()}
                  >
                    {productMutation.isPending ? <Loader2 className="animate-spin" /> : <Search />}
                    Consultar loja
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="bento-card p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Sua base</p>
              <h2 className="mt-1 font-semibold">Vencedores já confirmados</h2>
            </div>
            <Badge className="bg-primary/10 text-primary">Top {ownWinners.length}</Badge>
          </div>
          <div className="mt-5 space-y-3">
            {ownWinners.length ? (
              ownWinners.map((record, index) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-border bg-secondary/20 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold">
                      #{index + 1} {record.projects?.name ?? "Publicação avulsa"}
                    </p>
                    <span className="text-[11px] text-cyan">
                      {record.views.toLocaleString("pt-BR")} views
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                    {record.hook_text || "Gancho ainda não associado a um roteiro."}
                  </p>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Importe links na página de desempenho para formar seu ranking próprio.
              </p>
            )}
          </div>
        </aside>
      </section>

      {mode === "videos" && videoMutation.data && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Resultado oficial
              </p>
              <h2 className="mt-1 text-xl font-semibold">Vídeos com maior sinal viral</h2>
            </div>
            <Badge variant="outline">Métricas de pesquisa podem ter atraso</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {!videoMutation.data.videos.length && (
              <div className="bento-card border-dashed p-8 text-center md:col-span-2 xl:col-span-3">
                <ShoppingBag className="mx-auto size-7 text-muted-foreground" />
                <p className="mt-3 font-semibold">Nenhum vídeo de TikTok Shop confirmado</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Tente ampliar o período ou trocar a palavra-chave. Vídeos comuns foram removidos
                  do resultado de propósito.
                </p>
              </div>
            )}
            {videoMutation.data.videos.map((video, index) => (
              <article key={video.id} className="bento-card interactive-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <Badge className="bg-cyan/10 text-cyan">#{index + 1} viral</Badge>
                  <span className="text-xs font-semibold text-primary">
                    Score {video.viralScore}
                  </span>
                </div>
                <Badge variant="outline" className="mt-3 text-[10px]">
                  {video.shopEvidence === "creator_commission_tag"
                    ? "Comissão de criador confirmada"
                    : "Hashtag TikTok Shop"}
                </Badge>
                <p className="mt-4 line-clamp-4 text-sm leading-6">
                  {video.description || "Vídeo sem descrição."}
                </p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <MiniMetric icon={Eye} value={video.views} label="Views" />
                  <MiniMetric icon={Heart} value={video.likes} label="Curtidas" />
                  <MiniMetric icon={Share2} value={video.shares} label="Shares" />
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">
                    @{video.username} · {video.engagementRate.toFixed(2)}% engajamento
                  </span>
                  {video.url && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={video.url} target="_blank" rel="noreferrer">
                        Abrir <ExternalLink />
                      </a>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {mode === "products" && productMutation.data && (
        <section className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Vendas informadas pelo TikTok
            </p>
            <h2 className="mt-1 text-xl font-semibold">Produtos mais vendidos da loja</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {productMutation.data.products.map((product, index) => (
              <article key={product.id} className="bento-card interactive-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <Badge className="bg-pink/10 text-pink">#{index + 1} em vendas</Badge>
                  <ShoppingBag className="size-5 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">{product.name}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {product.description || "Sem descrição disponível."}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <MetricBox label="Unidades vendidas" value={product.soldCount} />
                  <MetricBox label="Avaliações" value={product.reviewCount} />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Nota estimada: {product.rating ? product.rating.toFixed(1) : "—"} ·{" "}
                  {product.price.join(" a ") || "Preço indisponível"}
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SourceCard({
  icon: Icon,
  title,
  description,
  status,
  active,
}: {
  icon: typeof Radar;
  title: string;
  description: string;
  status: string;
  active?: boolean;
}) {
  return (
    <article className="bento-card interactive-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <Badge
          className={
            active ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"
          }
        >
          {status}
        </Badge>
      </div>
      <h2 className="mt-4 font-semibold">{title}</h2>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </article>
  );
}

function ModeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${active ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function MiniMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Eye;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-lg bg-secondary/35 p-2">
      <Icon className="size-3 text-primary" />
      <p className="mt-1 font-semibold">{value.toLocaleString("pt-BR")}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function MetricBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/30 p-3">
      <p className="text-lg font-semibold">{value.toLocaleString("pt-BR")}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}
