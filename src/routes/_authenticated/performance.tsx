import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Eye,
  Loader2,
  MousePointerClick,
  ShoppingCart,
  Sparkles,
  Trophy,
  Unplug,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listPerformance } from "@/features/libraries/queries";
import {
  importTikTokPerformance,
  updateContentPerformanceMetrics,
} from "@/features/performance/server";
import {
  disconnectTikTok,
  getTikTokConnectionStatus,
  startTikTokConnection,
} from "@/features/tiktok/server";

export const Route = createFileRoute("/_authenticated/performance")({
  component: PerformancePage,
  head: () => ({ meta: [{ title: "Desempenho — Tik Supremo" }] }),
});

type ComponentStat = {
  label: string;
  text: string;
  views: number;
  clicks: number;
  orders: number;
  score: number;
};

function PerformancePage() {
  const queryClient = useQueryClient();
  const [publicationUrl, setPublicationUrl] = useState("");
  const query = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const connectionQuery = useQuery({
    queryKey: ["tiktok-connection"],
    queryFn: () => getTikTokConnectionStatus({ data: {} }),
  });
  const connectMutation = useMutation({
    mutationFn: () => startTikTokConnection({ data: {} }),
    onSuccess: ({ authorizationUrl }) => window.location.assign(authorizationUrl),
    onError: (error) => toast.error(error.message),
  });
  const disconnectMutation = useMutation({
    mutationFn: () => disconnectTikTok({ data: {} }),
    onSuccess: async () => {
      toast.success("Conta TikTok desconectada.");
      await queryClient.invalidateQueries({ queryKey: ["tiktok-connection"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const importMutation = useMutation({
    mutationFn: () => importTikTokPerformance({ data: { url: publicationUrl.trim() } }),
    onSuccess: async (data) => {
      setPublicationUrl("");
      const result = data.publicMetricsAvailable
        ? `${data.views.toLocaleString("pt-BR")} visualizações encontradas.`
        : "Vídeo identificado; as métricas públicas não estavam disponíveis.";
      if (data.matchStatus === "pending") {
        toast.success(`Vídeo salvo sem perder os dados. ${result}`);
      } else {
        toast.success(`Desempenho importado e associado ao roteiro. ${result}`);
      }
      await queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ clicks: 0, orders: 0, revenue: 0 });

  const updateMetricsMutation = useMutation({
    mutationFn: (data: { id: string; clicks: number; orders: number; revenue: number }) =>
      updateContentPerformanceMetrics({ data }),
    onSuccess: async () => {
      toast.success("Vendas e métricas salvas com sucesso!");
      setEditingRecordId(null);
      await queryClient.invalidateQueries({ queryKey: ["performance"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const records = query.data ?? [];
  const totals = records.reduce(
    (sum, item) => ({
      views: sum.views + item.views,
      clicks: sum.clicks + item.clicks,
      orders: sum.orders + item.orders,
      revenue: sum.revenue + Number(item.revenue),
    }),
    { views: 0, clicks: 0, orders: 0, revenue: 0 },
  );

  const componentStats = (kind: "hook" | "body" | "cta") => {
    const map = new Map<string, ComponentStat>();
    records.forEach((record) => {
      const text =
        kind === "hook" ? record.hook_text : kind === "body" ? record.body_text : record.cta_text;
      const index =
        kind === "hook"
          ? record.hook_index
          : kind === "body"
            ? record.body_index
            : record.cta_index;
      if (!text) return;
      const key = `${index ?? "standard"}:${text}`;
      const current = map.get(key) ?? {
        label:
          index === null
            ? "Roteiro normal"
            : `${kind === "hook" ? "Gancho" : kind === "body" ? "Corpo" : "CTA"} ${(index ?? 0) + 1}`,
        text,
        views: 0,
        clicks: 0,
        orders: 0,
        score: 0,
      };
      current.views += record.views;
      current.clicks += record.clicks;
      current.orders += record.orders;
      current.score = current.orders * 100 + current.clicks * 3 + Math.min(current.views / 100, 50);
      map.set(key, current);
    });
    return [...map.values()].sort((a, b) => b.score - a.score).slice(0, 5);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      <header className="bento-hero p-6 md:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Aprendizado pós-publicação
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          O que realmente está funcionando
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Cole o link no projeto e deixe a IA organizar visualizações, engajamento e a combinação
          usada. Complete vendas apenas quando quiser.
        </p>
      </header>

      <section className="bento-card bento-card-accent grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-end md:p-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold">Analisar uma publicação nova</p>
          <Input
            type="url"
            value={publicationUrl}
            onChange={(event) => setPublicationUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && publicationUrl.trim() && !importMutation.isPending) {
                importMutation.mutate();
              }
            }}
            placeholder="Cole o link público do vídeo no TikTok"
            className="h-12 bg-background/70"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            A IA procura automaticamente o roteiro correspondente entre seus projetos e registra os
            dados públicos disponíveis. Se não houver certeza, o vídeo é salvo para associação
            posterior — sem exibir erro e sem ligar ao projeto errado.
          </p>
        </div>
        <Button
          variant="hero"
          size="lg"
          disabled={!publicationUrl.trim() || importMutation.isPending}
          onClick={() => importMutation.mutate()}
        >
          {importMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {importMutation.isPending ? "Analisando..." : "Analisar link"}
        </Button>
      </section>

      <section className="bento-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${connectionQuery.data?.connected ? "bg-emerald-500/10 text-emerald-300" : "bg-secondary text-muted-foreground"}`}
          >
            {connectionQuery.data?.connected ? <CheckCircle2 /> : <Unplug />}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">Métricas oficiais dos seus vídeos</h2>
              <Badge
                className={
                  connectionQuery.data?.connected
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-secondary text-muted-foreground"
                }
              >
                {connectionQuery.data?.connected ? "TikTok conectado" : "Não conectado"}
              </Badge>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {connectionQuery.data?.connected
                ? `${connectionQuery.data.profile?.displayName ?? "Sua conta"}: visualizações, curtidas, comentários e compartilhamentos vêm do Display API quando o link pertence a essa conta.`
                : "Conecte uma vez para ler os campos oficiais dos vídeos publicados pela própria conta. Links de terceiros continuam no modo público."}
            </p>
          </div>
        </div>
        {connectionQuery.data?.connected ? (
          <Button
            variant="ghost"
            disabled={disconnectMutation.isPending}
            onClick={() => disconnectMutation.mutate()}
          >
            {disconnectMutation.isPending ? <Loader2 className="animate-spin" /> : <Unplug />}
            Desconectar
          </Button>
        ) : (
          <Button
            variant="outline"
            disabled={!connectionQuery.data?.configured || connectMutation.isPending}
            onClick={() => connectMutation.mutate()}
          >
            {connectMutation.isPending ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {connectionQuery.data?.configured ? "Conectar TikTok" : "Aguardando app aprovado"}
          </Button>
        )}
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Eye} label="Visualizações" value={totals.views.toLocaleString("pt-BR")} />
        <Stat
          icon={MousePointerClick}
          label="Cliques"
          value={totals.clicks.toLocaleString("pt-BR")}
        />
        <Stat icon={ShoppingCart} label="Pedidos" value={totals.orders.toLocaleString("pt-BR")} />
        <Stat
          icon={BarChart3}
          label="Receita informada"
          value={totals.revenue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        />
      </div>

      {query.isLoading ? (
        <div className="surface-card flex justify-center p-14">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : records.length ? (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Ranking title="Melhores ganchos" rows={componentStats("hook")} />
            <Ranking title="Melhores corpos" rows={componentStats("body")} />
            <Ranking title="Melhores CTAs" rows={componentStats("cta")} />
          </div>
          <section className="bento-card overflow-hidden">
            <div className="border-b border-border p-5">
              <h2 className="font-semibold">Publicações registradas</h2>
            </div>
            <div className="divide-y divide-border">
              {records.map((record) => {
                const isEditing = editingRecordId === record.id;
                return (
                  <div key={record.id} className="p-5 space-y-3">
                    <div className="grid gap-3 md:grid-cols-[1.4fr_repeat(4,0.5fr)_auto] md:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">
                            {record.projects?.name ?? "Publicação ainda sem projeto"}
                          </p>
                          {record.source === "automatic_link" && (
                            <Badge className="bg-cyan/10 text-cyan">
                              <Sparkles className="mr-1 size-3" /> Automático
                            </Badge>
                          )}
                          {record.match_status === "pending" && (
                            <Badge className="bg-amber-500/10 text-amber-300">
                              <AlertCircle className="mr-1 size-3" /> Aguardando associação
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {record.combination_number
                            ? `Combinação ${record.combination_number}`
                            : record.match_status === "pending"
                              ? "Roteiro ainda não identificado"
                              : "Roteiro normal"}{" "}
                          · {new Date(record.published_at).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {record.likes.toLocaleString("pt-BR")} curtidas ·{" "}
                          {record.comments.toLocaleString("pt-BR")} comentários ·{" "}
                          {record.shares.toLocaleString("pt-BR")} compartilhamentos
                        </p>
                      </div>
                      <Metric label="Views" value={record.views.toLocaleString("pt-BR")} />
                      <Metric label="Cliques" value={record.clicks.toLocaleString("pt-BR")} />
                      <Metric label="Pedidos" value={record.orders.toLocaleString("pt-BR")} />
                      <Metric
                        label="Receita"
                        value={Number(record.revenue).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      />
                      <div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (isEditing) {
                              setEditingRecordId(null);
                            } else {
                              setEditingRecordId(record.id);
                              setEditForm({
                                clicks: record.clicks,
                                orders: record.orders,
                                revenue: Number(record.revenue),
                              });
                            }
                          }}
                        >
                          <Pencil className="mr-1.5 size-3.5" />
                          {isEditing ? "Fechar" : "Editar vendas"}
                        </Button>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 mt-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Cliques no link</label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.clicks}
                            onChange={(e) => setEditForm({ ...editForm, clicks: Number(e.target.value) })}
                            className="mt-1 h-9 w-28 bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Vendas (Pedidos)</label>
                          <Input
                            type="number"
                            min="0"
                            value={editForm.orders}
                            onChange={(e) => setEditForm({ ...editForm, orders: Number(e.target.value) })}
                            className="mt-1 h-9 w-28 bg-background"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Receita R$ (Faturamento)</label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={editForm.revenue}
                            onChange={(e) => setEditForm({ ...editForm, revenue: Number(e.target.value) })}
                            className="mt-1 h-9 w-32 bg-background"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="hero"
                          disabled={updateMetricsMutation.isPending}
                          onClick={() =>
                            updateMetricsMutation.mutate({
                              id: record.id,
                              clicks: editForm.clicks,
                              orders: editForm.orders,
                              revenue: editForm.revenue,
                            })
                          }
                        >
                          {updateMetricsMutation.isPending ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <Check className="mr-1 size-4" />
                          )}
                          Salvar vendas
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="surface-card flex flex-col items-center p-14 text-center">
          <Sparkles className="size-9 text-primary" />
          <h2 className="mt-3 font-semibold">Ainda não há resultados registrados</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Abra um projeto concluído, vá ao Kit TikTok e informe os números depois da publicação.
          </p>
          <Button className="mt-5" variant="outline" asChild>
            <Link to="/projects">Abrir projetos</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Eye; label: string; value: string }) {
  return (
    <div className="bento-card interactive-card flex items-center gap-4 p-5">
      <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Ranking({ title, rows }: { title: string; rows: ComponentStat[] }) {
  return (
    <section className="bento-card interactive-card p-5">
      <div className="flex items-center gap-2">
        <Trophy className="size-4 text-primary" />
        <h2 className="font-semibold">{title}</h2>
      </div>
      <div className="mt-4 space-y-3">
        {rows.length ? (
          rows.map((row, index) => (
            <div
              key={`${row.label}-${row.text}`}
              className="rounded-xl border border-border bg-secondary/20 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge className="bg-primary/10 text-primary">
                  #{index + 1} {row.label}
                </Badge>
                <span className="text-[11px] text-muted-foreground">
                  {row.orders} pedidos · {row.clicks} cliques
                </span>
              </div>
              <p className="mt-2 line-clamp-3 text-xs leading-5 text-foreground/85">{row.text}</p>
            </div>
          ))
        ) : (
          <p className="py-8 text-center text-xs text-muted-foreground">Sem dados suficientes.</p>
        )}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
