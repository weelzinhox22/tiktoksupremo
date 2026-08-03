import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FlaskConical,
  Plus,
  AlertTriangle,
  Trophy,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { toast } from "sonner";
import type { CreativeExperiment, CreativeMetrics, CreativeVariant } from "@/features/four-modules/types";
import { creativeExperimentRepository } from "@/features/four-modules/repositories";
import { calculateDerivedMetrics, detectExcessVariablesWarning } from "@/features/four-modules/services";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const Route = createFileRoute("/_authenticated/creative-lab")({
  component: CreativeLabPage,
});

function CreativeLabPage() {
  const { user } = Route.useRouteContext();
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
          hook: "Gancho de Dor Original",
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
          name: "Vídeo B (Variação)",
          hook: "Gancho de Curiosidade Inédito",
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
      queryClient.invalidateQueries({ queryKey: ["creative-experiments"] });
      setIsFormOpen(false);
      setName("");
      setHypothesis("");
      toast.success("Experimento criado no Laboratório!");
    },
    onError: (err) => toast.error(err.message),
  });

  const experiments = (experimentsQuery.data ?? []).filter((e) =>
    `${e.name} ${e.hypothesis}`.toLowerCase().includes(search.toLowerCase()),
  );

  const activeExp = selectedExperiment || (experiments.length > 0 ? experiments[0] : null);
  const excessWarning = activeExp ? detectExcessVariablesWarning(activeExp.variants) : null;

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <FlaskConical className="size-3.5" /> Laboratório de Criativos & Testes A/B
          </div>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
            Laboratório de Criativos
          </h1>
          <p className="text-sm text-muted-foreground">
            Compare o desempenho real de vídeos, ganchos e formatos para identificar a variação vencedora.
          </p>
        </div>

        <Button type="button" variant="hero" onClick={() => setIsFormOpen(true)}>
          <Plus className="mr-2 size-4" />
          Criar Novo Experimento
        </Button>
      </div>

      {/* Formulário de Criação de Experimento */}
      {isFormOpen && (
        <div className="space-y-6 rounded-2xl border border-primary/30 bg-card p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-semibold text-lg">Novo Experimento de Teste A/B</h2>
              <p className="text-xs text-muted-foreground">
                Defina o objetivo e a hipótese para comparar diferentes variações de vídeo.
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Nome do Experimento">
              <Input
                placeholder="Ex.: Teste de Gancho: Curiosidade vs Dor"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>

            <Field label="Tipo de Teste">
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                value={testType}
                onChange={(e) => setTestType(e.target.value as CreativeExperiment["testType"])}
              >
                <option value="hook">Teste de Gancho (Mesmo vídeo, início diferente)</option>
                <option value="duration">Teste de Duração (24s vs 16s)</option>
                <option value="format">Falado vs No-Speak</option>
                <option value="character">Teste de Personagem</option>
                <option value="scenario">Teste de Cenário</option>
              </select>
            </Field>

            <Field label="Hipótese do Teste">
              <Input
                placeholder="Ex.: O gancho de curiosidade vai gerar 30% mais retenção inicial..."
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              variant="hero"
              disabled={saveExperimentMutation.isPending}
              onClick={() => saveExperimentMutation.mutate()}
            >
              {saveExperimentMutation.isPending ? "Criando..." : "Iniciar Experimento"}
            </Button>
          </div>
        </div>
      )}

      {/* Painel do Experimento Ativo */}
      {activeExp && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border pb-4">
              <div>
                <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {activeExp.testType}
                </span>
                <h2 className="mt-1 font-display text-xl font-bold">{activeExp.name}</h2>
                <p className="text-xs text-muted-foreground">Hipótese: {activeExp.hypothesis || "Não informada"}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    navigate({ to: "/copy-modeler" });
                    toast.success("Variação promovida de volta ao Modelador de Copy!");
                  }}
                >
                  <RotateCcw className="mr-2 size-4 text-primary" />
                  Abrir Vencedor no Modelador
                </Button>
              </div>
            </div>

            {/* Alerta de Excesso de Variáveis */}
            {excessWarning?.hasWarning && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs flex items-start gap-3">
                <AlertTriangle className="size-5 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-300">Alerta de Controle do Teste A/B</h4>
                  <p className="mt-1 text-muted-foreground leading-relaxed">{excessWarning.message}</p>
                </div>
              </div>
            )}

            {/* Tabela Comparativa Lado a Lado das Variações */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-muted-foreground">
                    <th className="p-3">Métrica / Atributo</th>
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
                      <td key={v.id} className="p-3">{v.hook || "Padrão"}</td>
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
                        <td key={v.id} className="p-3">
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
                    <td className="p-3 font-medium text-muted-foreground">Comissão Estimada por 1k Views</td>
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
          </div>
        </div>
      )}
    </div>
  );
}
