import { AlertTriangle, Bot, Info, ShieldAlert, ShieldCheck } from "lucide-react";
import type { ScriptFormatDefinition } from "@/features/script-formats/types";

type ComplianceAlertProps = {
  format: ScriptFormatDefinition;
  hasPhysicalProduct: boolean;
  isSupplement: boolean;
  isRegulated: boolean;
  useAi: boolean;
};

export function ComplianceAlert({
  format,
  hasPhysicalProduct,
  isSupplement,
  isRegulated,
  useAi,
}: ComplianceAlertProps) {
  const alerts: { type: "error" | "warning" | "info"; message: string }[] = [];

  // IA marking requirement
  if (useAi && format.supportsAI) {
    alerts.push({
      type: "info",
      message:
        'Marque o conteúdo como gerado ou significativamente editado por IA ao publicar no TikTok.',
    });
  }

  // Supplement compliance
  if (isSupplement || isRegulated) {
    alerts.push({
      type: "warning",
      message:
        'Proibido: "cura", "tratamento garantido", "resultado garantido", "substitui medicamento", promessas cardíacas, hormonais, emagrecimento garantido. Use linguagem como "pode auxiliar", "faz parte de uma rotina", "resultados podem variar".',
    });
  }

  // Before/after compliance
  if (format.id === "before_after_proof") {
    alerts.push({
      type: "error",
      message:
        'Não use filtros ou IA para fabricar o resultado. Adicione obrigatoriamente: "Resultados podem variar." Somente use se houver resultado real e documentado.',
    });
  }

  // No physical product — personal experience
  if (!hasPhysicalProduct && format.warningWhenNoPhysicalProduct) {
    alerts.push({
      type: "warning",
      message:
        'Você indicou não ter o produto físico. O script não usará frases como "eu testei", "eu uso", "funcionou comigo" ou qualquer experiência pessoal que não pôde acontecer.',
    });
  }

  // AI fabrication rules
  if (useAi) {
    alerts.push({
      type: "info",
      message:
        "A IA não pode: alterar características reais do produto, inventar efeitos ou resultados, criar depoimentos falsos, simular médico ou especialista, mudar tamanho/material/cor ou tornar o produto mais potente do que é.",
    });
  }

  // Honest reaction compliance
  if (format.id === "honest_reaction" && !hasPhysicalProduct) {
    alerts.push({
      type: "error",
      message:
        "Formato de reação honesta requer produto físico disponível. Sem o produto, não é possível gerar uma reação genuína.",
    });
  }

  if (alerts.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3">
        <ShieldCheck className="size-4 shrink-0 text-emerald-400" />
        <p className="text-xs text-emerald-400">
          Nenhuma restrição crítica detectada para este formato e produto.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={`flex items-start gap-3 rounded-xl border p-3 ${
            alert.type === "error"
              ? "border-destructive/30 bg-destructive/[0.07]"
              : alert.type === "warning"
                ? "border-amber-500/25 bg-amber-500/[0.06]"
                : "border-primary/20 bg-primary/[0.05]"
          }`}
        >
          {alert.type === "error" ? (
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
          ) : alert.type === "warning" ? (
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-400" />
          ) : (
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          )}
          <p
            className={`text-[11px] leading-5 ${
              alert.type === "error"
                ? "text-destructive"
                : alert.type === "warning"
                  ? "text-amber-300"
                  : "text-primary/90"
            }`}
          >
            {alert.message}
          </p>
        </div>
      ))}
    </div>
  );
}
