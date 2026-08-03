import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Calendar,
  ChevronDown,
  ChevronUp,
  Cpu,
  Globe,
  LayoutGrid,
  Loader2,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SCRIPT_FORMATS } from "@/features/script-formats/formats-data";
import { trendProvider } from "@/features/script-formats/trend-radar";
import { getTopRecommendations, inferProductContext } from "@/features/script-formats/recommendation-engine";
import { FormatCard } from "./FormatCard";
import { RecommendationCard } from "./RecommendationCard";
import { FormatDetailPanel } from "./FormatDetailPanel";
import { TreadmillFields } from "./TreadmillFields";
import { ComplianceAlert } from "./ComplianceAlert";
import type {
  FormatRecommendation,
  Market,
  ScriptFormatId,
  SelectedFormat,
  TreadmillConfig,
} from "@/features/script-formats/types";
import type { ScriptFormatDefinition } from "@/features/script-formats/types";

// ─── Props ────────────────────────────────────────────────────────────────────
type FormatStepSelectorProps = {
  // Product context from step 0
  category: string;
  description: string;
  benefits: string;
  audience: string;
  price: number | null;
  productVariation: string;
  // Current selection
  value: SelectedFormat | null;
  onChange: (format: SelectedFormat | null) => void;
  // Production resources (will be configured in step 3, but we provide defaults)
  hasPhysicalProduct?: boolean;
  realPersonAvailable?: boolean;
};

// ─── Category groups for tabs ─────────────────────────────────────────────────
const CATEGORY_TABS = [
  { key: "recommended", label: "Recomendados", icon: <Sparkles className="size-3" /> },
  { key: "ugc", label: "UGC", icon: <Cpu className="size-3" /> },
  { key: "fashion_ai", label: "Moda e IA", icon: <Bot className="size-3" /> },
  { key: "demonstration", label: "Demonstração", icon: <LayoutGrid className="size-3" /> },
  { key: "comparison", label: "Comparação", icon: <LayoutGrid className="size-3" /> },
  { key: "no_speak", label: "No-speak", icon: <LayoutGrid className="size-3" /> },
  { key: "storytelling", label: "Storytelling", icon: <LayoutGrid className="size-3" /> },
  { key: "live", label: "LIVE", icon: <LayoutGrid className="size-3" /> },
] as const;

const DEFAULT_TREADMILL: TreadmillConfig = {
  characterType: "ai_dark_mannequin",
  gender: "female",
  bodyType: "",
  walkSpeed: "normal",
  scenario: "",
  treadmillColor: "preta",
  lookCount: 3,
  transitionTiming: "a cada 8 segundos",
  musicStyle: "",
  onScreenText: "",
  ctaType: "",
  loopEnabled: true,
  extraClose: false,
  selectedVariant: "color_catalog",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export function FormatStepSelector({
  category,
  description,
  benefits,
  audience,
  price,
  productVariation,
  value,
  onChange,
  hasPhysicalProduct = false,
  realPersonAvailable = false,
}: FormatStepSelectorProps) {
  const [selectionMode, setSelectionMode] = useState<"auto" | "manual">("auto");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<FormatRecommendation[]>([]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [hoveredFormat, setHoveredFormat] = useState<ScriptFormatDefinition | null>(null);
  const [treadmillConfig, setTreadmillConfig] = useState<TreadmillConfig>(DEFAULT_TREADMILL);
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  // Infer product context from form fields
  const productContext = useMemo(() => {
    const variationCount =
      productVariation.trim()
        ? productVariation.split(/,|\n/).filter(Boolean).length + 1
        : 1;
    return inferProductContext(category, description, benefits, audience, price, variationCount);
  }, [category, description, benefits, audience, price, productVariation]);

  // Production resources from props (simplified — full config happens in step 3)
  const resources = useMemo(
    () => ({
      hasPhysicalProduct,
      realPersonAvailable,
      faceWillAppear: realPersonAvailable,
      voiceAvailable: realPersonAvailable,
      isNoSpeak: false,
      useAiCharacter: !realPersonAvailable,
      hasCharacterImage: false,
      hasSceneImage: false,
      hasReferenceVideo: false,
      fullyGeneratedByVeo: !realPersonAvailable && !hasPhysicalProduct,
      hybridRecording: realPersonAvailable && hasPhysicalProduct,
      variationsCount: 3,
      totalDurationSeconds: 30,
      targetMarket: "BR" as Market,
    }),
    [hasPhysicalProduct, realPersonAvailable],
  );

  // Analyze and get recommendations
  const analyzeAndRecommend = () => {
    setIsAnalyzing(true);
    // Simulate analysis delay for UX feedback
    setTimeout(() => {
      const recs = getTopRecommendations(productContext, resources, "Conversão para TikTok Shop", "BR");
      setRecommendations(recs);
      setHasAnalyzed(true);
      setIsAnalyzing(false);
    }, 900);
  };

  // Auto-analyze when switching to auto mode
  useEffect(() => {
    if (selectionMode === "auto" && !hasAnalyzed) {
      analyzeAndRecommend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionMode]);

  const handleSelectFormat = (formatId: ScriptFormatId, mode: "auto" | "manual") => {
    const newValue: SelectedFormat = {
      formatId,
      choiceMode: mode,
      ...(formatId === "ai_treadmill_mannequin" ? { treadmillConfig } : {}),
    };
    onChange(newValue);
  };


  const selectedFormat = value ? SCRIPT_FORMATS.find((f) => f.id === value.formatId) ?? null : null;
  const detailFormat = hoveredFormat ?? selectedFormat;

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-lg font-semibold text-foreground">Como você quer apresentar este produto?</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Escolha o formato ideal ou deixe o sistema recomendar os três melhores para{" "}
          <span className="font-medium text-foreground">{category || "este produto"}</span>.
        </p>
      </div>

      {/* ── Mode Toggle ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <ModeButton
          active={selectionMode === "auto"}
          icon={<Wand2 className="size-4" />}
          title="Recomendar o melhor formato"
          description="Sistema analisa o produto e sugere 3 formatos"
          onClick={() => setSelectionMode("auto")}
        />
        <ModeButton
          active={selectionMode === "manual"}
          icon={<LayoutGrid className="size-4" />}
          title="Escolher manualmente"
          description="Navegue por todos os formatos disponíveis"
          onClick={() => setSelectionMode("manual")}
        />
      </div>

      {/* ── Trend radar info ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/15 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Globe className="size-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            Radar de tendências:{" "}
            <span className="font-medium text-foreground">{trendProvider.name}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <Calendar className="size-3" />
          Atualizado em {trendProvider.updatedAt}
        </div>
      </div>

      {/* ── AUTO MODE ─────────────────────────────────────────────────────── */}
      {selectionMode === "auto" && (
        <div className="space-y-4">
          {isAnalyzing ? (
            <AnalyzingSkeleton />
          ) : hasAnalyzed && recommendations.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  3 formatos recomendados para{" "}
                  <span className="text-primary">{category}</span>
                </p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setHasAnalyzed(false);
                    analyzeAndRecommend();
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Sparkles className="size-3" />
                  Reanalisar
                </Button>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {recommendations.map((rec, i) => (
                  <RecommendationCard
                    key={rec.formatId}
                    recommendation={rec}
                    rank={i}
                    selected={value?.formatId === rec.formatId}
                    onSelect={() => handleSelectFormat(rec.formatId, "auto")}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-secondary/10 p-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
                <Wand2 className="size-7 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Analisar produto e recomendar formatos</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  O sistema usa as informações do produto para recomendar os formatos mais eficazes.
                </p>
              </div>
              <Button type="button" variant="hero" onClick={analyzeAndRecommend} className="gap-2">
                <Sparkles className="size-4" />
                Analisar e recomendar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── MANUAL MODE ───────────────────────────────────────────────────── */}
      {selectionMode === "manual" && (
        <div className="space-y-4">
          <Tabs defaultValue="ugc">
            <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-secondary/20 p-1">
              {CATEGORY_TABS.filter((t) => t.key !== "recommended").map((tab) => (
                <TabsTrigger
                  key={tab.key}
                  value={tab.key}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {(["ugc", "fashion_ai", "demonstration", "comparison", "no_speak", "storytelling", "live"] as const).map(
              (cat) => {
                const formats = SCRIPT_FORMATS.filter((f) => f.category === cat);
                return (
                  <TabsContent key={cat} value={cat} className="mt-4">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {formats.map((format) => (
                        <div
                          key={format.id}
                          onMouseEnter={() => setHoveredFormat(format)}
                          onMouseLeave={() => setHoveredFormat(null)}
                        >
                          <FormatCard
                            format={format}
                            selected={value?.formatId === format.id}
                            onSelect={() => handleSelectFormat(format.id, "manual")}
                          />
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                );
              },
            )}
          </Tabs>
        </div>
      )}

      {/* ── Selected format + detail ──────────────────────────────────────── */}
      {selectedFormat && (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Left: config + compliance */}
          <div className="space-y-4">
            {/* Selection summary */}
            <div className="flex items-center gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/20">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary">{selectedFormat.name}</p>
                <p className="text-xs text-muted-foreground">{selectedFormat.shortDescription}</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => onChange(null)}
                className="shrink-0 text-xs text-muted-foreground"
              >
                Trocar
              </Button>
            </div>

            {/* Treadmill extra fields */}
            {value?.formatId === "ai_treadmill_mannequin" && (
              <TreadmillFields
                config={treadmillConfig}
                onChange={(updated) => {
                  const newConfig = { ...treadmillConfig, ...updated };
                  setTreadmillConfig(newConfig);
                  onChange({
                    formatId: "ai_treadmill_mannequin",
                    choiceMode: value.choiceMode,
                    treadmillConfig: newConfig,
                  });
                }}
              />
            )}

            {/* Compliance alerts */}
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Verificações de conformidade
              </p>
              <ComplianceAlert
                format={selectedFormat}
                hasPhysicalProduct={hasPhysicalProduct}
                isSupplement={productContext.isSupplement}
                isRegulated={productContext.hasRegulation}
                useAi={selectedFormat.supportsAI}
              />
            </div>
          </div>

          {/* Right: detail panel (desktop) */}
          <div className="hidden lg:block">
            <FormatDetailPanel format={detailFormat ?? selectedFormat} />
          </div>

          {/* Mobile collapsible detail */}
          <div className="lg:hidden">
            <button
              type="button"
              onClick={() => setShowDetailMobile((v) => !v)}
              className="flex w-full items-center justify-between rounded-xl border border-border bg-secondary/15 px-4 py-3 text-sm font-medium"
            >
              Ver detalhes do formato
              {showDetailMobile ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
            {showDetailMobile && (
              <div className="mt-3">
                <FormatDetailPanel format={selectedFormat} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── No selection prompt ───────────────────────────────────────────── */}
      {!selectedFormat && selectionMode === "manual" && (
        <div className="rounded-xl border border-dashed border-border bg-secondary/10 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            Selecione um formato nas abas acima para continuar.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ModeButton({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all duration-200 ${
        active
          ? "border-primary bg-primary/10 ring-2 ring-primary/20"
          : "border-border bg-background/30 hover:border-primary/30 hover:bg-primary/[0.04]"
      }`}
    >
      <span
        className={`flex size-9 items-center justify-center rounded-xl ${
          active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
        }`}
      >
        {icon}
      </span>
      <div>
        <p className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{title}</p>
        <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>
      </div>
    </button>
  );
}

function AnalyzingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-primary">
        <Loader2 className="size-4 animate-spin" />
        Analisando produto e comparando formatos...
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border border-border p-5">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
