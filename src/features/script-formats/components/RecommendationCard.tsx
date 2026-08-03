import { AlertTriangle, Bot, Check, Clock, Package, Sparkles, TrendingUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TREND_LABELS, TREND_COLORS } from "@/features/script-formats/trend-radar";
import { getFormatById } from "@/features/script-formats/formats-data";
import type { FormatRecommendation } from "@/features/script-formats/types";

const RANK_COLORS = [
  "border-primary/40 bg-primary/[0.07] shadow-[0_0_30px_-15px_oklch(0.7_0.16_292_/0.4)]",
  "border-cyan/30 bg-cyan/[0.05]",
  "border-border bg-background/20",
];

const RANK_LABELS = ["🥇 Mais recomendado", "🥈 Segunda opção", "🥉 Terceira opção"];

export function RecommendationCard({
  recommendation,
  rank,
  selected,
  onSelect,
}: {
  recommendation: FormatRecommendation;
  rank: number; // 0, 1, 2
  selected: boolean;
  onSelect: () => void;
}) {
  const format = getFormatById(recommendation.formatId);
  if (!format) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-5 transition-all duration-200 ${RANK_COLORS[rank] ?? RANK_COLORS[2]}`}
    >
      {/* Aurora for top pick */}
      {rank === 0 && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl">
          <div className="absolute -top-8 left-1/2 h-16 w-2/3 -translate-x-1/2 rounded-full bg-primary/10 blur-2xl" />
        </div>
      )}

      {/* Rank label */}
      <p className="mb-3 text-[11px] font-semibold text-muted-foreground">{RANK_LABELS[rank]}</p>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground leading-tight">{format.name}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{format.shortDescription}</p>
        </div>

        {/* Score */}
        <div className="flex-shrink-0 text-right">
          <div
            className={`text-2xl font-bold tabular-nums ${
              recommendation.score >= 80
                ? "text-emerald-400"
                : recommendation.score >= 60
                  ? "text-primary"
                  : "text-amber-400"
            }`}
          >
            {recommendation.score}
          </div>
          <div className="text-[10px] text-muted-foreground">compatibilidade</div>
        </div>
      </div>

      {/* Score bar */}
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 delay-150 ${
            recommendation.score >= 80
              ? "bg-emerald-500"
              : recommendation.score >= 60
                ? "bg-primary"
                : "bg-amber-500"
          }`}
          style={{ width: `${recommendation.score}%` }}
        />
      </div>

      {/* Trend status */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TREND_COLORS[format.trendStatus]}`}
        >
          <TrendingUp className="size-2.5" />
          {TREND_LABELS[format.trendStatus]}
        </span>
        {recommendation.trendNote && (
          <span className="text-[10px] text-muted-foreground">{recommendation.trendNote}</span>
        )}
      </div>

      {/* Why recommended */}
      {recommendation.reasons.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Por que recomendamos
          </p>
          <ul className="space-y-1">
            {recommendation.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                <Sparkles className="mt-0.5 size-3 shrink-0 text-primary" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {recommendation.warnings.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] p-3">
          {recommendation.warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-2 text-[11px] text-amber-300">
              <AlertTriangle className="mt-0.5 size-3 shrink-0" />
              {w}
            </div>
          ))}
        </div>
      )}

      {/* Resources needed */}
      {recommendation.requiredResources.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {recommendation.requiredResources.map((resource) => (
            <span
              key={resource}
              className="flex items-center gap-1 rounded-full border border-border bg-secondary/30 px-2 py-0.5 text-[10px] text-muted-foreground"
            >
              {resource.includes("pessoa") ? (
                <User className="size-2.5" />
              ) : resource.includes("físico") ? (
                <Package className="size-2.5" />
              ) : resource.includes("IA") || resource.includes("VEO") ? (
                <Bot className="size-2.5" />
              ) : (
                <Clock className="size-2.5" />
              )}
              {resource}
            </span>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-4">
        <Button
          type="button"
          variant={selected ? "hero" : "outline"}
          size="sm"
          className="w-full gap-2"
          onClick={onSelect}
        >
          {selected ? (
            <>
              <Check className="size-4" />
              Formato selecionado
            </>
          ) : (
            "Usar este formato"
          )}
        </Button>
      </div>
    </div>
  );
}
