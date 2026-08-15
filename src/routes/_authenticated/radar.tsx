import { useState, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  CircleAlert,
  ClipboardList,
  Database,
  ExternalLink,
  Eye,
  Heart,
  Link2,
  PackageSearch,
  Plus,
  Radar,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  TrendingUp,
  Loader2,
  Search,
  Bot,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listPerformance, listProductLibrary } from "@/features/libraries/queries";
import {
  getViralRadarStatus,
  searchShopProducts,
  searchViralVideos,
} from "@/features/viral-radar/server";

export const Route = createFileRoute("/_authenticated/radar")({
  component: ViralRadarPage,
  head: () => ({ meta: [{ title: "Radar Viral — Tik Supremo" }] }),
});

/* ─── Types ─────────────────────────────────────────────────── */
type PriorityLevel = "alta" | "média" | "baixa";
interface ManualProduct {
  id: string;
  name: string;
  shopUrl: string;
  price: string;
  estimatedSales: string;
  reviewCount: string;
  rating: string;
  notes: string;
  priority: PriorityLevel;
  addedAt: string;
}

const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  alta: "bg-emerald-500/10 text-emerald-300",
  média: "bg-amber-500/10 text-amber-300",
  baixa: "bg-secondary/60 text-muted-foreground",
};

const STORAGE_KEY = "viral-radar-manual-products";

function loadProducts(): ManualProduct[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}
function saveProducts(products: ManualProduct[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/* ─── Page ───────────────────────────────────────────────────── */
function ViralRadarPage() {
  const [products, setProducts] = useState<ManualProduct[]>(loadProducts);
  const [showGuide, setShowGuide] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [sortBy, setSortBy] = useState<"addedAt" | "priority" | "rating">("addedAt");
  const [keyword, setKeyword] = useState("");
  const [region, setRegion] = useState("BR");
  const [days, setDays] = useState(7);
  const [shopId, setShopId] = useState("");

  // Existing data from user's own base
  const performanceQuery = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });
  const radarStatus = useQuery({
    queryKey: ["viral-radar-status"],
    queryFn: () => getViralRadarStatus({ data: {} }),
  });
  const videoSearch = useMutation({
    mutationFn: () => searchViralVideos({ data: { keyword, region, days } }),
  });
  const shopSearch = useMutation({ mutationFn: () => searchShopProducts({ data: { shopId } }) });

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

  const addProduct = (product: ManualProduct) => {
    const updated = [product, ...products];
    setProducts(updated);
    saveProducts(updated);
    setShowForm(false);
    toast.success("Produto adicionado ao radar.");
  };

  const removeProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    toast.success("Produto removido.");
  };

  const priorityOrder: Record<PriorityLevel, number> = { alta: 0, média: 1, baixa: 2 };
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "priority") return priorityOrder[a.priority] - priorityOrder[b.priority];
    if (sortBy === "rating") return parseFloat(b.rating || "0") - parseFloat(a.rating || "0");
    return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-14">
      {/* Header */}
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
              Pesquise produtos manualmente no TikTok Shop Creative Center, salve os mais
              promissores aqui e organize sua fila de conteúdo sem depender de nenhuma API.
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

      <section className="bento-card overflow-hidden border-cyan/20">
        <header className="flex flex-wrap items-center gap-3 border-b border-border p-5 md:p-6">
          <span className="flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
            <Search className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold">Busca real de oportunidades</h2>
            <p className="text-xs text-muted-foreground">
              Consulta vídeos públicos e sinais de TikTok Shop quando uma fonte oficial autorizada
              estiver disponível.
            </p>
          </div>
          <Badge
            className={`ml-auto ${radarStatus.data?.researchConfigured ? "bg-emerald-500/10 text-emerald-300" : "bg-amber-500/10 text-amber-300"}`}
          >
            {radarStatus.data?.researchConfigured ? "API oficial conectada" : "Modo assistido"}
          </Badge>
        </header>
        <div className="grid gap-5 p-5 xl:grid-cols-[1fr_360px] md:p-6">
          <div>
            <div className="grid gap-3 md:grid-cols-[1fr_100px_110px_auto]">
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Produto ou palavra-chave: cinta modeladora"
              />
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option value="BR">Brasil</option>
                <option value="US">EUA</option>
                <option value="GB">Reino Unido</option>
                <option value="ES">Espanha</option>
                <option value="FR">França</option>
              </select>
              <select
                className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
              >
                <option value={7}>7 dias</option>
                <option value={14}>14 dias</option>
                <option value={30}>30 dias</option>
              </select>
              <Button
                disabled={
                  !keyword.trim() || videoSearch.isPending || !radarStatus.data?.researchConfigured
                }
                onClick={() => videoSearch.mutate()}
              >
                {videoSearch.isPending ? <Loader2 className="animate-spin" /> : <Search />} Buscar
              </Button>
            </div>

            {!radarStatus.data?.researchConfigured && (
              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
                <p className="text-sm font-semibold text-amber-200">
                  Pesquisa automática oficial indisponível para esta conta
                </p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  O TikTok restringe a Research API a projetos aprovados e não a libera normalmente
                  para uso comercial. Use os atalhos abaixo: eles já abrem cada fonte com sua
                  palavra-chave; depois registre somente os campos mostrados no formulário.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ResearchLink
                    href={`https://ads.tiktok.com/business/creativecenter/top-products/mobile/en?keyword=${encodeURIComponent(keyword)}`}
                    label="Top Products"
                  />
                  <ResearchLink
                    href={`https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/en?keyword=${encodeURIComponent(keyword)}`}
                    label="Top Ads"
                  />
                  <ResearchLink
                    href={`https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en?keyword=${encodeURIComponent(keyword)}`}
                    label="Hashtags"
                  />
                  <ResearchLink
                    href={`https://www.tiktok.com/search?q=${encodeURIComponent(keyword)}`}
                    label="Buscar no TikTok"
                  />
                  <ResearchLink
                    href={`https://trends.google.com/trends/explore?geo=${region}&q=${encodeURIComponent(keyword)}`}
                    label="Google Trends"
                  />
                </div>
                <div className="mt-4 border-t border-amber-400/10 pt-3 text-[11px] leading-5 text-muted-foreground">
                  <strong className="text-amber-100">Para ativar a fonte oficial:</strong> confirme
                  a elegibilidade no TikTok Research Tools, obtenha um projeto aprovado, configure
                  <code className="mx-1">TIKTOK_RESEARCH_CLIENT_KEY</code> e
                  <code className="mx-1">TIKTOK_RESEARCH_CLIENT_SECRET</code> somente no backend e
                  faça um novo deploy. Contas comerciais comuns normalmente devem permanecer no
                  fluxo assistido.
                </div>
              </div>
            )}

            {videoSearch.data && (
              <div className="mt-5 space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Insight
                    title="Hashtags"
                    values={videoSearch.data.insights.hashtags.map(
                      (item) => `#${item.value} · ${item.occurrences}x`,
                    )}
                  />
                  <Insight
                    title="Ganchos recorrentes"
                    values={videoSearch.data.insights.hooks.slice(0, 5)}
                  />
                  <Insight
                    title="Durações"
                    values={videoSearch.data.insights.durations.map(
                      (item) => `${item.value} · ${item.occurrences}`,
                    )}
                  />
                  <Insight
                    title="Sons aproveitáveis"
                    values={videoSearch.data.insights.musicIds.map(
                      (item) => `Music ID ${item.value} · ${item.occurrences}x`,
                    )}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {videoSearch.data.videos.slice(0, 10).map((video) => (
                    <a
                      key={video.id}
                      href={video.url ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-border bg-secondary/15 p-4 transition hover:border-cyan/40"
                    >
                      <div className="flex items-center justify-between">
                        <Badge className="bg-cyan/10 text-cyan">Score {video.viralScore}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {video.views.toLocaleString("pt-BR")} views
                        </span>
                      </div>
                      <p className="mt-3 line-clamp-2 text-sm">
                        {video.description || video.transcript}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {video.duration}s · engajamento {video.engagementRate.toFixed(2)}%
                      </p>
                    </a>
                  ))}
                </div>
                <Button
                  asChild
                  onClick={() => {
                    const signals = [
                      ...videoSearch.data.insights.hashtags.map(
                        (item) => `Hashtag #${item.value} apareceu ${item.occurrences}x`,
                      ),
                      ...videoSearch.data.insights.hooks.map((item) => `Gancho: ${item}`),
                      ...videoSearch.data.insights.durations.map(
                        (item) => `Duração: ${item.value} apareceu ${item.occurrences}x`,
                      ),
                    ].join("\n");
                    localStorage.setItem("production-agent-signals", signals);
                  }}
                >
                  <Link to="/production-agent">
                    <Bot /> Usar sinais no Agente <ChevronRight />
                  </Link>
                </Button>
              </div>
            )}
            {videoSearch.error && (
              <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/5 p-4 text-xs text-rose-200">
                {videoSearch.error.message}
              </p>
            )}
          </div>

          <aside className="rounded-xl border border-border bg-secondary/15 p-4">
            <h3 className="font-semibold">Produtos reais por loja</h3>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Com Research API aprovada, informe o Shop ID para consultar nome, vendas, avaliações e
              preço de produtos da loja. O endpoint oficial retorna produtos da UE.
            </p>
            <Input
              className="mt-4"
              value={shopId}
              onChange={(event) => setShopId(event.target.value.replace(/\D/g, ""))}
              placeholder="Shop ID numérico"
            />
            <Button
              className="mt-2 w-full"
              variant="outline"
              disabled={!shopId || shopSearch.isPending || !radarStatus.data?.researchConfigured}
              onClick={() => shopSearch.mutate()}
            >
              {shopSearch.isPending ? <Loader2 className="animate-spin" /> : <PackageSearch />}{" "}
              Consultar loja
            </Button>
            {shopSearch.data?.products.map((product) => (
              <button
                key={product.id}
                type="button"
                className="mt-3 w-full rounded-lg border border-border bg-background/60 p-3 text-left"
                onClick={() =>
                  addProduct({
                    id: crypto.randomUUID(),
                    name: product.name,
                    shopUrl: "",
                    price: product.price.join(" / "),
                    estimatedSales: String(product.soldCount),
                    reviewCount: String(product.reviewCount),
                    rating: product.rating.toFixed(1),
                    notes: `${product.shopName} · importado da fonte oficial`,
                    priority: product.soldCount > 1_000 ? "alta" : "média",
                    addedAt: new Date().toISOString(),
                  })
                }
              >
                <p className="text-xs font-semibold">{product.name}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {product.soldCount.toLocaleString("pt-BR")} vendas · ⭐{" "}
                  {product.rating.toFixed(1)}
                </p>
              </button>
            ))}
          </aside>
        </div>
      </section>

      {/* Status Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        <SourceCard
          icon={Database}
          title="Seus dados"
          description={`${performanceQuery.data?.length ?? 0} publicações e ${productsQuery.data?.length ?? 0} produtos na sua base.`}
          status="Sempre disponível"
          active
        />
        <SourceCard
          icon={ClipboardList}
          title="Pesquisa manual"
          description="Você encontra os produtos no TikTok Shop e registra aqui. Sem limites de API."
          status={`${products.length} produto${products.length !== 1 ? "s" : ""} no radar`}
          active
        />
        <SourceCard
          icon={Sparkles}
          title="Creative Center"
          description="Tendências e anúncios de alta performance na fonte pública gratuita do TikTok."
          status="Fonte externa oficial"
          active
        />
      </section>

      {/* Info Notice about API */}
      <section className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm">
        <CircleAlert className="mt-0.5 size-5 shrink-0 text-amber-300" />
        <div>
          <p className="font-semibold text-amber-200">Modo de pesquisa manual ativo</p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            A integração automática com a API de Research do TikTok exige aprovação oficial e está
            temporariamente desativada. Use o fluxo manual abaixo: pesquise no TikTok Shop, anote os
            produtos mais vendidos e adicione-os ao radar para organizar seu pipeline de conteúdo.
          </p>
        </div>
      </section>

      {/* Step-by-step guide */}
      <section className="bento-card border-primary/20 overflow-hidden">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 p-5 md:p-6 text-left"
          onClick={() => setShowGuide(!showGuide)}
        >
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold">Como pesquisar produtos virais manualmente</h2>
              <p className="text-xs text-muted-foreground">
                Guia passo a passo para encontrar os melhores produtos no TikTok Shop
              </p>
            </div>
          </div>
          {showGuide ? (
            <ChevronUp className="size-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-5 shrink-0 text-muted-foreground" />
          )}
        </button>
        {showGuide && (
          <div className="border-t border-border px-5 pb-6 md:px-6">
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <GuideStep
                step={1}
                title="Acesse o TikTok Shop"
                description="Abra shop.tiktok.com ou o app do TikTok e navegue até a aba de produtos em alta ou lojas populares."
                link="https://shop.tiktok.com"
                linkLabel="Abrir TikTok Shop"
              />
              <GuideStep
                step={2}
                title="Use o Creative Center"
                description='No Creative Center, vá em "Top Products" para ver os itens mais vendidos por categoria, região e período.'
                link="https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/pt"
                linkLabel="Abrir Creative Center"
              />
              <GuideStep
                step={3}
                title="Pesquise hashtags"
                description='Busque #TikTokShop, #ProductReview ou o nicho do produto. Filtre por "Esta semana" para ver o que está viralizado agora.'
                link="https://www.tiktok.com/search?q=%23TikTokShop"
                linkLabel="Buscar no TikTok"
              />
              <GuideStep
                step={4}
                title="Analise a concorrência"
                description="Veja quantos vídeos existem com o produto, quantas curtidas e comentários têm. Alta variação = produto em pico."
              />
              <GuideStep
                step={5}
                title="Verifique as avaliações"
                description="Produtos com 4.5+ estrelas e centenas de avaliações têm prova social. Isso facilita fechar vendas com vídeo UGC."
              />
              <GuideStep
                step={6}
                title="Registre no radar"
                description='Clique em "Adicionar produto" abaixo e preencha o que encontrou. Classifique a prioridade e adicione suas notas de estratégia.'
              />
            </div>
          </div>
        )}
      </section>

      {/* Main Section: Manual product list + own winners */}
      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Product radar */}
        <div className="bento-card bento-card-accent overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5 md:p-6">
            <div>
              <h2 className="font-semibold">Produtos no radar</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {products.length === 0
                  ? "Adicione seu primeiro produto encontrado no TikTok Shop"
                  : `${products.length} produto${products.length !== 1 ? "s" : ""} monitorados`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {products.length > 1 && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="flex h-9 rounded-md border border-input bg-background px-3 text-xs"
                >
                  <option value="addedAt">Mais recentes</option>
                  <option value="priority">Por prioridade</option>
                  <option value="rating">Por avaliação</option>
                </select>
              )}
              <Button variant="hero" size="sm" onClick={() => setShowForm(true)}>
                <Plus className="size-4" /> Adicionar produto
              </Button>
            </div>
          </div>

          {/* Add product form */}
          {showForm && <AddProductForm onAdd={addProduct} onCancel={() => setShowForm(false)} />}

          {/* Product list */}
          <div className="p-5 md:p-6">
            {sortedProducts.length === 0 && !showForm ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
                <PackageSearch className="size-10 text-muted-foreground/50" />
                <p className="mt-4 font-semibold">Nenhum produto no radar ainda</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Siga o guia acima para encontrar produtos virais e adicione-os aqui.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="size-4" /> Adicionar primeiro produto
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onRemove={() => removeProduct(product.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Own winners sidebar */}
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

          {/* Quick links */}
          <div className="mt-6 border-t border-border pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Links úteis para pesquisa
            </p>
            <div className="mt-3 space-y-2">
              <QuickLink href="https://shop.tiktok.com" label="TikTok Shop — produtos em alta" />
              <QuickLink
                href="https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/pt"
                label="Creative Center — top ads"
              />
              <QuickLink
                href="https://www.tiktok.com/search?q=%23TikTokShop"
                label="Busca TikTok: #TikTokShop"
              />
              <QuickLink
                href="https://www.tiktok.com/search?q=%23ProductReview"
                label="Busca TikTok: #ProductReview"
              />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ResearchLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background/60 px-3 py-2 text-xs font-medium hover:border-cyan/40"
    >
      {label}
      <ExternalLink className="size-3" />
    </a>
  );
}

function Insight({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-xl border border-border bg-background/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-cyan">{title}</p>
      <div className="mt-2 space-y-1.5">
        {values.length ? (
          values.map((value) => (
            <p key={value} className="line-clamp-2 text-[10px] leading-4 text-muted-foreground">
              • {value}
            </p>
          ))
        ) : (
          <p className="text-[10px] text-muted-foreground">Sem sinal suficiente.</p>
        )}
      </div>
    </div>
  );
}

/* ─── Add Product Form ───────────────────────────────────────── */
function AddProductForm({
  onAdd,
  onCancel,
}: {
  onAdd: (p: ManualProduct) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [shopUrl, setShopUrl] = useState("");
  const [price, setPrice] = useState("");
  const [estimatedSales, setEstimatedSales] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [rating, setRating] = useState("");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("média");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Informe o nome do produto.");
      return;
    }
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      shopUrl: shopUrl.trim(),
      price: price.trim(),
      estimatedSales: estimatedSales.trim(),
      reviewCount: reviewCount.trim(),
      rating: rating.trim(),
      notes: notes.trim(),
      priority,
      addedAt: new Date().toISOString(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border-b border-border bg-secondary/10 px-5 py-5 md:px-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Plus className="size-4 text-primary" />
        <h3 className="font-semibold text-sm">Novo produto encontrado no TikTok Shop</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Nome do produto *</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Organizador de gaveta magnético"
            required
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Link do produto ou vídeo</Label>
          <Input
            value={shopUrl}
            onChange={(e) => setShopUrl(e.target.value)}
            placeholder="https://www.tiktok.com/... ou https://shop.tiktok.com/..."
          />
        </div>
        <div className="space-y-2">
          <Label>Preço (R$)</Label>
          <Input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Ex.: 39,90"
          />
        </div>
        <div className="space-y-2">
          <Label>Vendas estimadas</Label>
          <Input
            value={estimatedSales}
            onChange={(e) => setEstimatedSales(e.target.value)}
            placeholder="Ex.: 1.200 unidades"
          />
        </div>
        <div className="space-y-2">
          <Label>Nº de avaliações</Label>
          <Input
            value={reviewCount}
            onChange={(e) => setReviewCount(e.target.value)}
            placeholder="Ex.: 342"
          />
        </div>
        <div className="space-y-2">
          <Label>Nota (0–5)</Label>
          <Input
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            placeholder="Ex.: 4.7"
            type="number"
            min="0"
            max="5"
            step="0.1"
          />
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as PriorityLevel)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="alta">🔥 Alta — fazer vídeo logo</option>
            <option value="média">⏳ Média — analisar mais</option>
            <option value="baixa">🧊 Baixa — monitorar</option>
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label>Notas de estratégia</Label>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Ex.: produto viral na semana, concorrentes com pouco conteúdo, boa margem..."
          />
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-3">
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="hero" size="sm">
          <CheckCircle2 className="size-4" /> Salvar no radar
        </Button>
      </div>
    </form>
  );
}

/* ─── Product Card ───────────────────────────────────────────── */
function ProductCard({ product, onRemove }: { product: ManualProduct; onRemove: () => void }) {
  const date = new Date(product.addedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
  return (
    <article className="bento-card interactive-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={PRIORITY_COLORS[product.priority]}>
            {product.priority === "alta" ? "🔥" : product.priority === "média" ? "⏳" : "🧊"}{" "}
            Prioridade {product.priority}
          </Badge>
          {product.rating && (
            <Badge variant="outline" className="text-[10px]">
              <Star className="mr-1 size-2.5 fill-amber-400 text-amber-400" />
              {product.rating}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {product.shopUrl && (
            <Button size="sm" variant="ghost" asChild>
              <a href={product.shopUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="size-3.5" />
              </a>
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive/70 hover:text-destructive"
            onClick={onRemove}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
      <h3 className="mt-3 font-semibold leading-snug">{product.name}</h3>
      {product.notes && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.notes}</p>
      )}
      <div className="mt-4 flex flex-wrap gap-3 text-xs">
        {product.price && (
          <span className="rounded-lg bg-secondary/40 px-2 py-1 font-medium">
            💰 R$ {product.price}
          </span>
        )}
        {product.estimatedSales && (
          <span className="rounded-lg bg-secondary/40 px-2 py-1">
            <TrendingUp className="mr-1 inline size-3 text-emerald-400" />
            {product.estimatedSales}
          </span>
        )}
        {product.reviewCount && (
          <span className="rounded-lg bg-secondary/40 px-2 py-1">
            <Star className="mr-1 inline size-3 text-amber-400" />
            {product.reviewCount} avaliações
          </span>
        )}
      </div>
      <p className="mt-3 text-[10px] text-muted-foreground">Adicionado em {date}</p>
    </article>
  );
}

/* ─── Guide Step ─────────────────────────────────────────────── */
function GuideStep({
  step,
  title,
  description,
  link,
  linkLabel,
}: {
  step: number;
  title: string;
  description: string;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-secondary/10 p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
          {step}
        </span>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
      {link && linkLabel && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
        >
          {linkLabel} <ExternalLink className="size-3" />
        </a>
      )}
    </div>
  );
}

/* ─── Quick Link ─────────────────────────────────────────────── */
function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
    >
      <ExternalLink className="size-3 shrink-0 text-primary/70" />
      {label}
    </a>
  );
}

/* ─── Source Card ────────────────────────────────────────────── */
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
