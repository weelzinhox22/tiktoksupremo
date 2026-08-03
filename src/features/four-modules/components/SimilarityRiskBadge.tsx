import { ShieldAlert, ShieldCheck } from "lucide-react";

interface SimilarityRiskBadgeProps {
  risk: "low" | "medium" | "high" | "very_high";
  reasons?: string[];
  showDetails?: boolean;
}

export function SimilarityRiskBadge({ risk, reasons, showDetails = false }: SimilarityRiskBadgeProps) {
  const badgeConfig = {
    low: {
      label: "Risco de Semelhança: Baixo",
      bgColor: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
      icon: ShieldCheck,
      desc: "Excelente originalidade editorial. Estrutura preservada com vocabulário próprio.",
    },
    medium: {
      label: "Risco de Semelhança: Moderado",
      bgColor: "bg-amber-500/10 border-amber-500/30 text-amber-400",
      icon: ShieldAlert,
      desc: "Algumas frases mantêm termos idênticos à copy de origem.",
    },
    high: {
      label: "Risco de Semelhança: Alto",
      bgColor: "bg-orange-500/10 border-orange-500/30 text-orange-400",
      icon: ShieldAlert,
      desc: "Presença significativa de trechos literais da referência.",
    },
    very_high: {
      label: "Risco de Semelhança: Muito Alto",
      bgColor: "bg-rose-500/10 border-rose-500/30 text-rose-400",
      icon: ShieldAlert,
      desc: "Mais de 50% das frases repetem literalmente a copy original.",
    },
  };

  const config = badgeConfig[risk] ?? badgeConfig.low;
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold ${config.bgColor}`}>
        <Icon className="size-4 shrink-0" />
        <span>{config.label}</span>
      </div>
      {showDetails && (
        <div className="rounded-xl border border-border bg-secondary/20 p-3 text-xs leading-5 text-muted-foreground">
          <p className="font-medium text-foreground">{config.desc}</p>
          {reasons && reasons.length > 0 && (
            <ul className="mt-2 list-disc space-y-1 pl-4 text-[11px]">
              {reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
