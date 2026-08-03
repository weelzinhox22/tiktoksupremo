import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Layers,
  Package,
  ShieldAlert,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { TREND_LABELS, TREND_COLORS } from "@/features/script-formats/trend-radar";
import { BADGE_CONFIG } from "./FormatCard";
import type { ScriptFormatDefinition } from "@/features/script-formats/types";

const DIFFICULTY_LABELS = {
  low: "Fácil",
  medium: "Moderado",
  high: "Avançado",
};

const DIFFICULTY_COLORS = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-destructive",
};

const VEO_LABELS = {
  full: "Compatível",
  partial: "Parcialmente compatível",
  limited: "Compatibilidade limitada",
  not_recommended: "Não recomendado",
};

const VEO_COLORS = {
  full: "text-emerald-400",
  partial: "text-cyan",
  limited: "text-amber-400",
  not_recommended: "text-destructive",
};

const TRUST_LABELS = ["", "Muito baixa", "Baixa", "Moderada", "Alta", "Muito alta"];

export function FormatDetailPanel({ format }: { format: ScriptFormatDefinition }) {
  return (
    <div className="sticky top-4 space-y-4 rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/[0.06] to-transparent p-5">
      {/* Header */}
      <div>
        <span
          className={`mb-2 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${TREND_COLORS[format.trendStatus]}`}
        >
          <TrendingUp className="size-2.5" />
          {TREND_LABELS[format.trendStatus]}
        </span>
        <h3 className="text-base font-semibold text-foreground">{format.name}</h3>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">{format.fullDescription}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatItem
          icon={<Clock className="size-3.5" />}
          label="Duração"
          value={`${format.defaultDuration}s`}
        />
        <StatItem
          icon={<Zap className="size-3.5" />}
          label="Dificuldade"
          value={DIFFICULTY_LABELS[format.difficulty]}
          valueClass={DIFFICULTY_COLORS[format.difficulty]}
        />
        <StatItem
          icon={<CheckCircle2 className="size-3.5" />}
          label="Confiança"
          value={TRUST_LABELS[format.trustLevel] ?? "Desconhecida"}
        />
        <StatItem
          icon={<Bot className="size-3.5" />}
          label="Google VEO"
          value={VEO_LABELS[format.veoCompatibility]}
          valueClass={VEO_COLORS[format.veoCompatibility]}
        />
      </div>

      {/* Requirements */}
      <div className="flex flex-wrap gap-2">
        {format.requiresRealPerson && (
          <RequirementTag icon={<User className="size-3" />} label="Pessoa real" />
        )}
        {format.requiresRealProduct && (
          <RequirementTag icon={<Package className="size-3" />} label="Produto físico" />
        )}
        {format.supportsAI && (
          <RequirementTag icon={<Bot className="size-3" />} label="Suporte a IA" positive />
        )}
        {format.supportsNoSpeak && (
          <RequirementTag icon={<Layers className="size-3" />} label="No-speak" positive />
        )}
      </div>

      {/* Scene structure */}
      {format.sceneStructure.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Estrutura de cenas
          </p>
          <ol className="space-y-1">
            {format.sceneStructure.map((scene, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-foreground/80">
                <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[9px] font-bold text-primary">
                  {i + 1}
                </span>
                {scene}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Best for */}
      {format.bestFor.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Melhor para
          </p>
          <div className="flex flex-wrap gap-1">
            {format.bestFor.slice(0, 6).map((item) => (
              <span
                key={item}
                className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Avoid for */}
      {format.avoidFor.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Evitar para
          </p>
          <div className="flex flex-wrap gap-1">
            {format.avoidFor.slice(0, 4).map((item) => (
              <span
                key={item}
                className="rounded-full border border-destructive/25 bg-destructive/10 px-2 py-0.5 text-[10px] text-destructive"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Compliance risk */}
      {format.complianceRisk === "high" && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-3">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div>
              <p className="text-xs font-semibold text-amber-300">Atenção às políticas</p>
              <p className="mt-0.5 text-[11px] text-amber-400/80">
                Este formato exige cuidado com alegações de resultado, testemunhos e comparações reguladas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Compliance risk medium */}
      {format.complianceRisk === "medium" && (
        <div className="flex items-start gap-2 rounded-xl border border-border bg-secondary/20 p-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-[11px] text-muted-foreground">
            Verifique as diretrizes do TikTok Shop antes de publicar. Evite promessas não fundamentadas.
          </p>
        </div>
      )}

      {/* Badges */}
      {format.badges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {format.badges.map((badge) => {
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
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
  valueClass = "text-foreground",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/30 p-2.5">
      <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={`text-xs font-semibold ${valueClass}`}>{value}</p>
    </div>
  );
}

function RequirementTag({
  icon,
  label,
  positive = false,
}: {
  icon: React.ReactNode;
  label: string;
  positive?: boolean;
}) {
  return (
    <span
      className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        positive
          ? "border-primary/25 bg-primary/10 text-primary"
          : "border-amber-500/25 bg-amber-500/10 text-amber-400"
      }`}
    >
      {icon}
      {label}
    </span>
  );
}
