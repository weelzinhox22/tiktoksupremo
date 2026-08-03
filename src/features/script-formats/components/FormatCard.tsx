import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Package,
  TrendingUp,
  User,
  Video,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TREND_LABELS, TREND_COLORS } from "@/features/script-formats/trend-radar";
import type { BadgeId, ScriptFormatDefinition } from "@/features/script-formats/types";

const BADGE_CONFIG: Record<BadgeId, { label: string; className: string }> = {
  high_conversion: {
    label: "Alta conversão",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  emerging_international: {
    label: "Emergente na gringa",
    className: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  },
  proven_trend: {
    label: "Tendência comprovada",
    className: "bg-cyan/15 text-cyan border-cyan/30",
  },
  experimental: {
    label: "Experimental",
    className: "bg-pink/15 text-pink border-pink/30",
  },
  requires_physical_product: {
    label: "Exige produto físico",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  ai_compatible: {
    label: "Compatível com IA",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  fashion_recommended: {
    label: "Recomendado para moda",
    className: "bg-pink/15 text-pink border-pink/30",
  },
  beauty_recommended: {
    label: "Recomendado para beleza",
    className: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  },
  male_audience: {
    label: "Para público masculino",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  low_risk: {
    label: "Baixo risco",
    className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  },
  compliance_attention: {
    label: "Atenção às políticas",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  high_trust: {
    label: "Alta confiança",
    className: "bg-cyan/15 text-cyan border-cyan/30",
  },
  no_speak: {
    label: "No-speak",
    className: "bg-secondary text-muted-foreground border-border",
  },
  kit_recommended: {
    label: "Para kits",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
};

export function FormatCard({
  format,
  selected,
  score,
  onSelect,
}: {
  format: ScriptFormatDefinition;
  selected: boolean;
  score?: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
        selected
          ? "border-primary bg-primary/10 ring-2 ring-primary/25 shadow-lg"
          : "border-border bg-background/30 hover:border-primary/35 hover:bg-primary/[0.04]"
      }`}
    >
      {/* Selected indicator */}
      {selected && (
        <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="size-3.5" />
        </span>
      )}

      {/* Trend badge */}
      <span
        className={`mb-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TREND_COLORS[format.trendStatus]}`}
      >
        <TrendingUp className="size-2.5" />
        {TREND_LABELS[format.trendStatus]}
      </span>

      {/* Title */}
      <h3 className={`text-sm font-semibold leading-tight ${selected ? "text-primary" : "text-foreground"}`}>
        {format.name}
      </h3>
      <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{format.shortDescription}</p>

      {/* Compatibility bar */}
      {score !== undefined && (
        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">Compatibilidade</span>
            <span className={`text-[10px] font-bold ${selected ? "text-primary" : "text-foreground"}`}>
              {score}%
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                score >= 80
                  ? "bg-emerald-500"
                  : score >= 60
                    ? "bg-primary"
                    : score >= 40
                      ? "bg-amber-500"
                      : "bg-destructive"
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      )}

      {/* Quick info row */}
      <div className="mt-3 flex flex-wrap gap-2">
        {format.requiresRealPerson && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="size-3" /> Pessoa real
          </span>
        )}
        {format.requiresRealProduct && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Package className="size-3" /> Produto físico
          </span>
        )}
        {format.supportsAI && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Bot className="size-3" /> IA
          </span>
        )}
        {format.supportsNoSpeak && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Video className="size-3" /> No-speak
          </span>
        )}
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Clock className="size-3" /> {format.defaultDuration}s
        </span>
      </div>

      {/* Compliance risk */}
      {format.complianceRisk === "high" && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
          <AlertTriangle className="size-3" />
          Atenção às políticas
        </div>
      )}

      {/* Badges (primeiros 3) */}
      {format.badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {format.badges.slice(0, 3).map((badge) => {
            const config = BADGE_CONFIG[badge];
            if (!config) return null;
            return (
              <span
                key={badge}
                className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${config.className}`}
              >
                {config.label}
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}

export { BADGE_CONFIG };
