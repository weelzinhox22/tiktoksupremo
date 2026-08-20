import { useState, useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  Plus,
  Flame,
  ShoppingBag,
  Eye,
  DollarSign,
  Trophy,
  Filter,
  Trash2,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Layers,
  Search,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { listProductLibrary } from "@/features/libraries/queries";

export const Route = createFileRoute("/_authenticated/creative-tracker")({
  component: CreativeTrackerPage,
});

export interface TrackedCreative {
  id: string;
  videoTitle: string;
  tiktokUrl?: string;
  productName: string;
  hookModel: string;
  postedAt: string;
  views: number;
  likes: number;
  cartClicks: number;
  salesCount: number;
  revenue: number;
  status: "scaling" | "testing" | "fatigued" | "saturated";
}

const INITIAL_CREATIVES: TrackedCreative[] = [
  {
    id: "cr-01",
    videoTitle: "Gancho Esticar Roupa - Prova Transparência",
    tiktokUrl: "https://tiktok.com/@sua-loja/video/1",
    productName: "Vestido Midi Canelado Preto",
    hookModel: "Gancho Esticar Roupa (8s)",
    postedAt: "Hoje, 12:30",
    views: 48500,
    likes: 3420,
    cartClicks: 890,
    salesCount: 38,
    revenue: 2656.2,
    status: "scaling",
  },
  {
    id: "cr-02",
    videoTitle: "Unboxing Pacote Oficial TikTok Shop",
    tiktokUrl: "https://tiktok.com/@sua-loja/video/2",
    productName: "Vestido Midi Canelado Preto",
    hookModel: "Gancho Embalagem TikTok Shop (8s)",
    postedAt: "Ontem, 18:00",
    views: 22100,
    likes: 1840,
    cartClicks: 410,
    salesCount: 19,
    revenue: 1328.1,
    status: "scaling",
  },
  {
    id: "cr-03",
    videoTitle: "Mirror Selfie UGC com Gancho da Alça",
    tiktokUrl: "https://tiktok.com/@sua-loja/video/3",
    productName: "Body Regata Modelador",
    hookModel: "Gancho Tapar Câmera com a Mão (5s)",
    postedAt: "Há 2 dias",
    views: 14200,
    likes: 980,
    cartClicks: 210,
    salesCount: 8,
    revenue: 559.2,
    status: "testing",
  },
  {
    id: "cr-04",
    videoTitle: "Vídeo Simples de Vitrine (Sem Gancho Físico)",
    tiktokUrl: "",
    productName: "Vestido Midi Canelado Preto",
    hookModel: "Vídeo Tradicional",
    postedAt: "Há 4 dias",
    views: 1200,
    likes: 45,
    cartClicks: 12,
    salesCount: 0,
    revenue: 0,
    status: "fatigued",
  },
];

const STORAGE_KEY = "tik_creative_tracker_entries";

function CreativeTrackerPage() {
  const navigate = useNavigate();
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });

  const [creatives, setCreatives] = useState<TrackedCreative[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_CREATIVES;
    } catch {
      return INITIAL_CREATIVES;
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterHook, setFilterHook] = useState("all");

  // Form State
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newProduct, setNewProduct] = useState("Vestido Midi Canelado Preto");
  const [newHook, setNewHook] = useState("Gancho Esticar Roupa (8s)");
  const [newViews, setNewViews] = useState("");
  const [newClicks, setNewClicks] = useState("");
  const [newSales, setNewSales] = useState("");
  const [newRevenue, setNewRevenue] = useState("");

  const saveCreatives = (list: TrackedCreative[]) => {
    setCreatives(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {}
  };

  const handleAddCreative = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Informe o título ou identificador do criativo.");
      return;
    }

    const views = Number(newViews) || 0;
    const cartClicks = Number(newClicks) || 0;
    const salesCount = Number(newSales) || 0;
    const revenue = Number(newRevenue) || 0;

    let status: TrackedCreative["status"] = "testing";
    if (salesCount >= 10) status = "scaling";
    else if (views > 5000 && salesCount === 0) status = "fatigued";

    const newEntry: TrackedCreative = {
      id: `cr-${Date.now()}`,
      videoTitle: newTitle.trim(),
      tiktokUrl: newUrl.trim(),
      productName: newProduct.trim(),
      hookModel: newHook,
      postedAt: "Hoje, recém registrado",
      views,
      likes: Math.round(views * 0.07),
      cartClicks,
      salesCount,
      revenue,
      status,
    };

    const updated = [newEntry, ...creatives];
    saveCreatives(updated);
    setShowAddForm(false);
    setNewTitle("");
    setNewUrl("");
    setNewViews("");
    setNewClicks("");
    setNewSales("");
    setNewRevenue("");
    toast.success("Criativo registrado com sucesso no rastreador!");
  };

  const handleDelete = (id: string) => {
    const updated = creatives.filter((c) => c.id !== id);
    saveCreatives(updated);
    toast.success("Criativo removido do rastreador.");
  };

  // Aggregated Analytics
  const metrics = useMemo(() => {
    const totalViews = creatives.reduce((acc, curr) => acc + curr.views, 0);
    const totalClicks = creatives.reduce((acc, curr) => acc + curr.cartClicks, 0);
    const totalSales = creatives.reduce((acc, curr) => acc + curr.salesCount, 0);
    const totalRevenue = creatives.reduce((acc, curr) => acc + curr.revenue, 0);
    const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : "0.0";
    const avgConversion = totalClicks > 0 ? ((totalSales / totalClicks) * 100).toFixed(1) : "0.0";

    // Best Hook Analysis
    const hookSalesMap: Record<string, number> = {};
    creatives.forEach((c) => {
      hookSalesMap[c.hookModel] = (hookSalesMap[c.hookModel] || 0) + c.salesCount;
    });

    let bestHook = "Gancho Esticar Roupa (8s)";
    let maxSales = 0;
    Object.entries(hookSalesMap).forEach(([hook, sales]) => {
      if (sales > maxSales) {
        maxSales = sales;
        bestHook = hook;
      }
    });

    return { totalViews, totalClicks, totalSales, totalRevenue, avgCtr, avgConversion, bestHook };
  }, [creatives]);

  // Filtered List
  const filteredList = creatives.filter((item) => {
    const matchesSearch = `${item.videoTitle} ${item.productName} ${item.hookModel}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesHook = filterHook === "all" || item.hookModel === filterHook;
    return matchesSearch && matchesHook;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-16">
      {/* Header */}
      <header className="bento-hero flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-xs px-2.5 py-0.5 font-semibold flex items-center gap-1.5">
              <TrendingUp className="size-3 text-emerald-400" />
              ROI & Conversão por Gancho
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {creatives.length} Criativos Monitorados
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text">
            Rastreador de Criativos & Vendas
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Monitore quais ganchos da biblioteca estão gerando mais cliques no carrinho amarelo e faturamento real para o seu produto.
          </p>
        </div>

        <Button
          variant="hero"
          className="gap-2"
          onClick={() => setShowAddForm((prev) => !prev)}
        >
          <Plus className="size-4" />
          Registrar Novo Vídeo Postado
        </Button>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bento-card p-4.5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Faturamento Gerado</span>
            <DollarSign className="size-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            R$ {metrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {metrics.totalSales} vendas concretizadas
          </p>
        </div>

        <div className="bento-card p-4.5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Alcance & Visualizações</span>
            <Eye className="size-5 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {metrics.totalViews.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs text-muted-foreground font-medium">
            {metrics.totalClicks.toLocaleString("pt-BR")} cliques na sacolinha ({metrics.avgCtr}% CTR)
          </p>
        </div>

        <div className="bento-card p-4.5 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Conversão de Carrinho</span>
            <ShoppingBag className="size-5 text-pink-400" />
          </div>
          <p className="text-2xl font-bold text-pink-400">{metrics.avgConversion}%</p>
          <p className="text-xs text-muted-foreground font-medium">
            Média de compradores por clique
          </p>
        </div>

        <div className="bento-card p-4.5 space-y-2 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent border-amber-500/30">
          <div className="flex items-center justify-between text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <Trophy className="size-3.5 text-amber-400" /> Gancho Campeão
            </span>
          </div>
          <p className="text-sm font-bold text-amber-200 line-clamp-2 pt-1">
            {metrics.bestHook}
          </p>
          <Button
            size="sm"
            variant="outline"
            className="h-6 text-[10px] px-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/20 w-full mt-1"
            onClick={() => navigate({ to: "/movements" })}
          >
            Gerar Mais Deste Gancho <ArrowUpRight className="size-3 ml-1" />
          </Button>
        </div>
      </section>

      {/* Add Creative Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleAddCreative}
          className="bento-card bento-card-accent p-6 space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-bold text-base flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              Registrar Vídeo Postado no TikTok
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowAddForm(false)}
            >
              Cancelar
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="space-y-1">
              <Label className="text-xs">Identificador / Título do Vídeo</Label>
              <Input
                placeholder="Ex: Gancho Esticar Roupa - Versão 2"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Produto Promovido</Label>
              <Input
                placeholder="Ex: Vestido Midi Canelado Preto"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                className="h-8 text-xs bg-background"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Modelo de Gancho Utilizado</Label>
              <select
                value={newHook}
                onChange={(e) => setNewHook(e.target.value)}
                className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs"
              >
                <option value="Gancho Esticar Roupa (8s)">Gancho Esticar Roupa (8s)</option>
                <option value="Gancho Embalagem TikTok Shop (8s)">Gancho Embalagem TikTok Shop (8s)</option>
                <option value="Gancho Tapar Câmera com a Mão (5s)">Gancho Tapar Câmera com a Mão (5s)</option>
                <option value="Mostrar o Tecido de Perto (8s)">Mostrar o Tecido de Perto (8s)</option>
                <option value="CTA Simpática (4s)">CTA Simpática (4s)</option>
                <option value="Outro Gancho / Vídeo Tradicional">Outro Gancho / Vídeo Tradicional</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Visualizações (Views)</Label>
              <Input
                type="number"
                placeholder="Ex: 12500"
                value={newViews}
                onChange={(e) => setNewViews(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Cliques na Sacolinha Amarela</Label>
              <Input
                type="number"
                placeholder="Ex: 340"
                value={newClicks}
                onChange={(e) => setNewClicks(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Vendas Concretizadas</Label>
              <Input
                type="number"
                placeholder="Ex: 14"
                value={newSales}
                onChange={(e) => setNewSales(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs">Link do Vídeo no TikTok (Opcional)</Label>
              <Input
                placeholder="https://www.tiktok.com/@loja/video/..."
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="h-8 text-xs bg-background"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-emerald-400 font-bold">Faturamento Gerado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ex: 978.60"
                value={newRevenue}
                onChange={(e) => setNewRevenue(e.target.value)}
                className="h-8 text-xs bg-background font-bold text-emerald-300"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="submit" variant="hero" className="h-8 text-xs font-bold">
              Salvar Registro no Rastreador
            </Button>
          </div>
        </form>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-card/40 p-3 rounded-xl border border-border/40 backdrop-blur-md">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título, produto ou gancho..."
            className="pl-10 h-8 bg-background text-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={filterHook}
            onChange={(e) => setFilterHook(e.target.value)}
            className="h-8 rounded-md border border-input bg-background px-2.5 text-xs"
          >
            <option value="all">Todos os ganchos</option>
            <option value="Gancho Esticar Roupa (8s)">Gancho Esticar Roupa</option>
            <option value="Gancho Embalagem TikTok Shop (8s)">Gancho Embalagem TikTok</option>
            <option value="Gancho Tapar Câmera com a Mão (5s)">Gancho Tapar Câmera</option>
            <option value="Mostrar o Tecido de Perto (8s)">Mostrar o Tecido de Perto</option>
          </select>
        </div>
      </div>

      {/* Tracked Creatives Table */}
      <div className="bento-card overflow-hidden border border-border/50 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-card/70 border-b border-border/50 text-muted-foreground uppercase text-[10px] font-semibold tracking-wider">
              <tr>
                <th className="py-3 px-4">Criativo & Produto</th>
                <th className="py-3 px-4">Gancho Utilizado</th>
                <th className="py-3 px-4">Visualizações</th>
                <th className="py-3 px-4">Cliques Sacolinha</th>
                <th className="py-3 px-4">Vendas</th>
                <th className="py-3 px-4">Faturamento</th>
                <th className="py-3 px-4">Status & Ação</th>
                <th className="py-3 px-2 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredList.map((c) => {
                const ctr = c.views > 0 ? ((c.cartClicks / c.views) * 100).toFixed(1) : "0.0";
                return (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-foreground flex items-center gap-1.5">
                        {c.videoTitle}
                        {c.tiktokUrl && (
                          <a
                            href={c.tiktokUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-muted-foreground hover:text-primary"
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">{c.productName}</div>
                    </td>

                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] py-0 border-white/10 bg-white/5">
                        {c.hookModel}
                      </Badge>
                    </td>

                    <td className="py-3 px-4 font-mono font-medium">
                      {c.views.toLocaleString("pt-BR")}
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-pink-400">
                        {c.cartClicks.toLocaleString("pt-BR")}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-1">({ctr}%)</span>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {c.salesCount}
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      R$ {c.revenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>

                    <td className="py-3 px-4">
                      {c.status === "scaling" ? (
                        <Badge className="bg-emerald-500/15 text-emerald-300 border-emerald-500/30 text-[10px] gap-1">
                          <Flame className="size-3 text-emerald-400" /> Escalar Gancho
                        </Badge>
                      ) : c.status === "testing" ? (
                        <Badge className="bg-indigo-500/15 text-indigo-300 border-indigo-500/30 text-[10px]">
                          ⚡ Testando
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          ⚠️ Trocar Gancho
                        </Badge>
                      )}
                    </td>

                    <td className="py-3 px-2 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(c.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
