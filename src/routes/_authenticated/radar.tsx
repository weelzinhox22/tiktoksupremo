import { useState, type ReactNode } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
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
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listPerformance, listProductLibrary } from "@/features/libraries/queries";

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

  // Existing data from user's own base
  const performanceQuery = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

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
          {showForm && (
            <AddProductForm
              onAdd={addProduct}
              onCancel={() => setShowForm(false)}
            />
          )}

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
              <QuickLink
                href="https://shop.tiktok.com"
                label="TikTok Shop — produtos em alta"
              />
              <QuickLink
                href="https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/pt"
                label="Creative Center — top ads"
              />
              <QuickLink
                href="https://www.tiktok.com/search?q=%23TikTokShop"
                label='Busca TikTok: #TikTokShop'
              />
              <QuickLink
                href="https://www.tiktok.com/search?q=%23ProductReview"
                label='Busca TikTok: #ProductReview'
              />
            </div>
          </div>
        </aside>
      </section>
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
function ProductCard({
  product,
  onRemove,
}: {
  product: ManualProduct;
  onRemove: () => void;
}) {
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
