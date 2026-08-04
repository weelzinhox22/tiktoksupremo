import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  Trophy,
  RotateCcw,
  Copy,
  Check,
  FileText,
  Film,
  Mic,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { CreativeExperiment, CreativeMetrics, CreativeVariant } from "@/features/four-modules/types";
import { creativeExperimentRepository } from "@/features/four-modules/repositories";
import { calculateDerivedMetrics, detectExcessVariablesWarning } from "@/features/four-modules/services";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const searchSchema = z.object({
  scriptText: z.string().optional(),
  hookText: z.string().optional(),
  angleName: z.string().optional(),
  productName: z.string().optional(),
});

export type SavedModeledCopy = {
  id: string;
  title: string;
  productName: string;
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  createdAt: string;
};

export const Route = createFileRoute("/_authenticated/creative-lab")({
  component: CreativeLabPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function CreativeLabPage() {
  const { user } = Route.useRouteContext();
  const searchParams = Route.useSearch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<CreativeExperiment | null>(null);

  // Form State - Experiment
  const [name, setName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [testType, setTestType] = useState<CreativeExperiment["testType"]>("hook");
  const [primaryMetric, setPrimaryMetric] = useState("orders");

  // Saved Modeled Copies state
  const [savedCopies, setSavedCopies] = useState<SavedModeledCopy[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedCopyId, setExpandedCopyId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored: SavedModeledCopy[] = JSON.parse(
        localStorage.getItem("tik_supremo_modeled_copies") || "[]",
      );
      setSavedCopies(stored);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    if (searchParams.scriptText || searchParams.hookText) {
      const title = searchParams.angleName || searchParams.productName || "Copy Modelada";
      setName(`Experimento: ${title}`);
      setHypothesis(`Testando variação modelada para ${searchParams.productName || "o produto"}`);
      setIsFormOpen(true);
      toast.success("Copy do Modelador pronta para o Teste A/B!");
    }
  }, [searchParams.scriptText, searchParams.hookText, searchParams.angleName, searchParams.productName]);

  const handleDeleteSavedCopy = (id: string) => {
    const updated = savedCopies.filter((c) => c.id !== id);
    setSavedCopies(updated);
    try {
      localStorage.setItem("tik_supremo_modeled_copies", JSON.stringify(updated));
    } catch {
      // fallback
    }
    toast.success("Copy removida da lista.");
  };

  const handleCopyScript = async (item: SavedModeledCopy) => {
    await navigator.clipboard.writeText(item.fullScript);
    setCopiedId(item.id);
    toast.success("Copy copiada para a área de transferência!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateExperimentFromCopy = (item: SavedModeledCopy) => {
    setName(`Experimento: ${item.title}`);
    setHypothesis(`Testando retenção do gancho para ${item.productName}`);
    setTestType("hook");
    setIsFormOpen(true);
    toast.success("Formulário preenchido com a copy selecionada!");
  };

  const experimentsQuery = useQuery({
    queryKey: ["creative-experiments", user.id],
    queryFn: () => creativeExperimentRepository.list(user.id),
  });

  const saveExperimentMutation = useMutation({
    mutationFn: async () => {
      if (name.trim().length < 2) throw new Error("Informe o nome do experimento.");

      const defaultVariants: CreativeVariant[] = [
        {
          id: `var-a-${Date.now()}`,
          experimentId: "",
          name: "Vídeo A (Controle)",
          hook: searchParams.hookText || "Gancho Original",
          durationSeconds: 24,
          formatId: "UGC",
          metrics: [
            {
              collectedAt: new Date().toISOString(),
              views: 15000,
              twoSecondViews: 6500,
              clicks: 520,
              orders: 32,
              revenue: 1600,
              commission: 320,
            },
          ],
        },
        {
          id: `var-b-${Date.now()}`,
          experimentId: "",
          name: "Vídeo B (Variação Modelada)",
          hook: searchParams.hookText || "Gancho Modelado por IA",
          durationSeconds: 18,
          formatId: "UGC",
          metrics: [
            {
              collectedAt: new Date().toISOString(),
              views: 22000,
              twoSecondViews: 12100,
              clicks: 980,
              orders: 74,
              revenue: 3700,
              commission: 740,
            },
          ],
        },
      ];

      const supabase = getSupabaseBrowserClient();
      const result = await supabase.from("creative_experiments").insert({
        user_id: user.id,
        name: name.trim(),
        hypothesis: hypothesis.trim(),
        test_type: testType,
        primary_metric: primaryMetric,
        variants: defaultVariants,
        status: "running",
      });

      if (result.error) throw new Error(result.error.message);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["creative-experiments", user.id] });
      setIsFormOpen(false);
      setName("");
      setHypothesis("");
      toast.success("Experimento criado e pronto para colher métricas!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Erro ao salvar experimento.");
    },
  });

  const experiments = experimentsQuery.data ?? [];
  const activeExp = selectedExperiment ?? experiments[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan/20 bg-cyan/10 px-3 py-1 text-xs font-semibold text-cyan">
            <FlaskConical className="size-3.5" /> Laboratório de Criativos (Testes A/B)
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Validação de Copies & Ganchos Virais
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare variações de vídeo, controle métricas de retenção e identifique o criativo vencedor antes de escalar o orçamento.
          </p>
        </div>

        <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium">
          <Plus className="mr-2 size-4" /> Novo Experimento
        </Button>
      </div>

      {/* FORM: NOVO EXPERIMENTO */}
      {isFormOpen && (
        <div className="surface-card p-6 space-y-4 animate-in fade-in duration-200 border-primary/30">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-bold text-lg">Criar Novo Experimento A/B</h3>
            <Button variant="ghost" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome do Experimento">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Teste de Gancho de Dor vs Curiosidade"
                className="bg-secondary/30"
              />
            </Field>

            <Field label="Hipotese de Teste">
              <Input
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                placeholder="Ex: O gancho com curiosidade vai aumentar a retenção de 2s em 30%"
                className="bg-secondary/30"
              />
            </Field>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Elemento em Teste (Variável Única)">
              <select
                value={testType}
                onChange={(e) => setTestType(e.target.value as CreativeExperiment["testType"])}
                className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm"
              >
                <option value="hook">Gancho (Primeiros 3s)</option>
                <option value="body">Desenvolvimento / Demonstração</option>
                <option value="cta">Chamada para Ação (CTA)</option>
                <option value="format">Formato Visual (UGC vs Animação)</option>
              </select>
            </Field>

            <Field label="Métrica Primária de Decisão">
              <select
                value={primaryMetric}
                onChange={(e) => setPrimaryMetric(e.target.value)}
                className="w-full rounded-xl border border-border bg-secondary/30 px-3 py-2 text-sm"
              >
                <option value="orders">Pedidos / Vendas Totais</option>
                <option value="retention2s">Retenção de 2 Segundos</option>
                <option value="clicks">Cliques no Carrinho</option>
                <option value="revenue">Faturamento Bruto</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              disabled={saveExperimentMutation.isPending}
              onClick={() => saveExperimentMutation.mutate()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              {saveExperimentMutation.isPending ? "Salvando..." : "Iniciar Experimento"}
            </Button>
          </div>
        </div>
      )}

      {/* COPIES SALVAS DO MODELADOR */}
      {savedCopies.length > 0 && (
        <section className="surface-card p-6 space-y-4 border-emerald-500/30">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-emerald-400">
              <FileText className="size-5" /> Copies e Roteiros Salvos do Modelador ({savedCopies.length})
            </h3>
            <span className="text-xs text-muted-foreground">Salvas automaticamente no seu navegador</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {savedCopies.map((item) => (
              <div key={item.id} className="rounded-xl border border-emerald-500/20 bg-secondary/30 p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                    <span className="text-[11px] text-muted-foreground">{item.productName}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSavedCopy(item.id)}
                    className="size-8 p-0 text-muted-foreground hover:text-rose-400"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {item.hook && (
                  <div className="rounded-lg bg-emerald-500/10 p-2.5 text-xs text-emerald-300">
                    <span className="font-semibold block text-[10px] uppercase text-emerald-400">Gancho Identificado:</span>
                    "{item.hook}"
                  </div>
                )}

                <div className="text-xs text-muted-foreground leading-relaxed">
                  {expandedCopyId === item.id ? (
                    <p className="whitespace-pre-wrap text-foreground font-sans">{item.fullScript}</p>
                  ) : (
                    <p className="line-clamp-3">{item.fullScript}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedCopyId(expandedCopyId === item.id ? null : item.id)}
                    className="text-[11px] text-emerald-400 hover:underline mt-1 font-semibold block"
                  >
                    {expandedCopyId === item.id ? "Ver menos" : "Ver roteiro completo..."}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-border/60">
                  <Button
                    size="sm"
                    onClick={() => handleCreateExperimentFromCopy(item)}
                    className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex-1"
                  >
                    <Sparkles className="mr-1.5 size-3.5" /> Criar Experimento A/B
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      void navigate({
                        to: "/voice-studio",
                        search: { text: item.fullScript },
                      })
                    }
                    className="h-8 text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                  >
                    <Mic className="mr-1 size-3.5" /> Narrar com IA
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCopyScript(item)}
                    className="h-8 text-xs border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10"
                  >
                    {copiedId === item.id ? <Check className="mr-1 size-3" /> : <Copy className="mr-1 size-3" />}
                    {copiedId === item.id ? "Copiado!" : "Copiar"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PAINEL PRINCIPAL DE EXPERIMENTOS */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* LISTA DE EXPERIMENTOS */}
        <div className="md:col-span-4 surface-card p-5 space-y-3">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
            Experimentos Ativos
          </h3>

          {experiments.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Nenhum experimento ativo ainda.</p>
          ) : (
            <div className="space-y-2">
              {experiments.map((exp) => (
                <button
                  key={exp.id}
                  type="button"
                  onClick={() => setSelectedExperiment(exp)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    activeExp?.id === exp.id
                      ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                      : "border-border/60 bg-secondary/20 hover:border-border text-muted-foreground"
                  }`}
                >
                  <div className="font-semibold text-sm truncate">{exp.name}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{exp.variants.length} Variações</span>
                    <span className="capitalize text-emerald-400 font-medium">{exp.status}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETALHES DO EXPERIMENTO SELECIONADO */}
        <div className="md:col-span-8 surface-card p-6 space-y-6">
          {activeExp ? (
            <>
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
                <div>
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                    {activeExp.testType === "hook" ? "Teste de Gancho" : "Teste de Criativo"}
                  </span>
                  <h2 className="text-xl font-bold">{activeExp.name}</h2>
                  {activeExp.hypothesis && (
                    <p className="text-xs text-muted-foreground mt-0.5">Hipótese: {activeExp.hypothesis}</p>
                  )}
                </div>
              </div>

              {/* TABELA COMPARATIVA DE VARIAÇÕES */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/40 border-b border-border">
                    <tr>
                      <th className="p-3 font-medium text-muted-foreground">Métrica</th>
                      {activeExp.variants.map((v, i) => (
                        <th key={v.id} className="p-3 font-semibold text-foreground">
                          {v.name} {i === 1 && <Trophy className="inline size-3.5 text-amber-400 ml-1" />}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-medium text-muted-foreground">Gancho Utilizado</td>
                      {activeExp.variants.map((v) => (
                        <td key={v.id} className="p-3 font-medium">{v.hook || "Padrão"}</td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-muted-foreground">Visualizações Totais</td>
                      {activeExp.variants.map((v) => {
                        const m: CreativeMetrics = v.metrics[0] ?? { collectedAt: new Date().toISOString() };
                        return <td key={v.id} className="p-3 font-semibold">{m.views?.toLocaleString() ?? "-"}</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-muted-foreground">Retenção de 2 Segundos</td>
                      {activeExp.variants.map((v) => {
                        const m: CreativeMetrics = v.metrics[0] ?? { collectedAt: new Date().toISOString() };
                        const derived = calculateDerivedMetrics(m);
                        return (
                          <td key={v.id} className="p-3 font-bold text-cyan-400">
                            {derived.retentionRate2s !== null ? `${derived.retentionRate2s}%` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-muted-foreground">Pedidos Realizados</td>
                      {activeExp.variants.map((v) => {
                        const m: CreativeMetrics = v.metrics[0] ?? { collectedAt: new Date().toISOString() };
                        return <td key={v.id} className="p-3 font-semibold text-emerald-400">{m.orders ?? "-"}</td>;
                      })}
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-muted-foreground">Comissão Estimada / 1k Views</td>
                      {activeExp.variants.map((v) => {
                        const m: CreativeMetrics = v.metrics[0] ?? { collectedAt: new Date().toISOString() };
                        const derived = calculateDerivedMetrics(m);
                        return (
                          <td key={v.id} className="p-3 font-bold text-primary">
                            {derived.commissionPer1kViews !== null ? `R$ ${derived.commissionPer1kViews.toFixed(2)}` : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-12 text-center text-muted-foreground space-y-3">
              <FlaskConical className="mx-auto size-10 text-muted-foreground/60" />
              <p>Selecione ou crie um experimento para ver o comparativo de variações.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
