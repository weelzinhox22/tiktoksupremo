// ─── Mercados ─────────────────────────────────────────────────────────────────
export type Market = "BR" | "US" | "UK" | "EU" | "INTL";

// ─── Status de tendência ──────────────────────────────────────────────────────
export type TrendStatus =
  | "proven"
  | "rising"
  | "emerging"
  | "seasonal"
  | "steady"
  | "cooling"
  | "saturated"
  | "experimental";

// ─── IDs de formatos ──────────────────────────────────────────────────────────
export type ScriptFormatId =
  | "ugc_real_talking"
  | "ugc_hybrid_ai"
  | "ai_treadmill_mannequin"
  | "real_treadmill_model"
  | "ai_outfit_transition"
  | "silent_visual_demo"
  | "problem_solution"
  | "satisfying_demo"
  | "apply_on_camera"
  | "routine_stack"
  | "before_after_proof"
  | "comparison_choice"
  | "honest_reaction"
  | "unboxing_discovery"
  | "discovery_story"
  | "live_sales_script";

// ─── Categorias de formato ────────────────────────────────────────────────────
export type ScriptFormatCategory =
  | "ugc"
  | "fashion_ai"
  | "demonstration"
  | "comparison"
  | "no_speak"
  | "storytelling"
  | "live";

// ─── Nível de dificuldade ─────────────────────────────────────────────────────
export type DifficultyLevel = "low" | "medium" | "high";

// ─── Nível de risco de compliance ─────────────────────────────────────────────
export type ComplianceRisk = "low" | "medium" | "high";

// ─── Compatibilidade com VEO ──────────────────────────────────────────────────
export type VeoCompatibility = "full" | "partial" | "limited" | "not_recommended";

// ─── Definição completa de um formato ────────────────────────────────────────
export interface ScriptFormatDefinition {
  id: ScriptFormatId;
  name: string;
  shortDescription: string;
  fullDescription: string;
  category: ScriptFormatCategory;
  trendStatus: TrendStatus;
  bestFor: string[];
  avoidFor: string[];
  requiredInputs: string[];
  supportsAI: boolean;
  requiresRealProduct: boolean;
  requiresRealPerson: boolean;
  supportsNoSpeak: boolean;
  difficulty: DifficultyLevel;
  trustLevel: 1 | 2 | 3 | 4 | 5; // 1 = baixo, 5 = muito alto
  complianceRisk: ComplianceRisk;
  veoCompatibility: VeoCompatibility;
  defaultDuration: number; // em segundos
  sceneStructure: string[]; // rótulo de cada cena
  promptRules: string[];
  negativePromptRules: string[];
  badges: BadgeId[];
  treadmillVariants?: TreadmillVariant[]; // apenas para formatos de esteira
  warningWhenNoPhysicalProduct?: boolean;
}

// ─── Badges disponíveis ───────────────────────────────────────────────────────
export type BadgeId =
  | "high_conversion"
  | "emerging_international"
  | "proven_trend"
  | "experimental"
  | "requires_physical_product"
  | "ai_compatible"
  | "fashion_recommended"
  | "beauty_recommended"
  | "male_audience"
  | "low_risk"
  | "compliance_attention"
  | "high_trust"
  | "no_speak"
  | "kit_recommended";

// ─── Variantes da esteira ─────────────────────────────────────────────────────
export interface TreadmillVariant {
  id: string;
  name: string;
  description: string;
}

// ─── Recursos de produção ─────────────────────────────────────────────────────
export interface ProductionResources {
  hasPhysicalProduct: boolean;
  realPersonAvailable: boolean;
  faceWillAppear: boolean;
  voiceAvailable: boolean;
  isNoSpeak: boolean;
  useAiCharacter: boolean;
  hasCharacterImage: boolean;
  hasSceneImage: boolean;
  hasReferenceVideo: boolean;
  fullyGeneratedByVeo: boolean;
  hybridRecording: boolean;
  variationsCount: number;
  totalDurationSeconds: number;
  targetMarket: Market;
}

// ─── Sinal do radar de tendências ────────────────────────────────────────────
export interface TrendSignal {
  id: string;
  market: Market;
  category: string;
  subcategory: string;
  status: TrendStatus;
  updatedAt: string; // ISO date string
  recommendedFormats: ScriptFormatId[];
  notes: string;
  brazilCompatibility: "high" | "medium" | "low";
  seasonality: string | null;
  complianceRisk: ComplianceRisk;
}

// ─── Resultado de recomendação ────────────────────────────────────────────────
export interface FormatRecommendation {
  formatId: ScriptFormatId;
  score: number; // 0–100
  reasons: string[];
  warnings: string[];
  requiredResources: string[];
  suggestedDuration: number;
  suggestedVariation?: string | undefined;
  trendNote?: string | undefined;
}

// ─── Contexto do produto para recomendação ────────────────────────────────────
export interface ProductContext {
  category: string;
  hasVariations: boolean;
  variationCount: number;
  price: number | null;
  needsTrust: boolean; // suplementos, beleza, ticket alto
  hasRegulation: boolean; // saúde, suplementos
  hasVisualTransformation: boolean; // antes/depois possível
  isWearable: boolean; // roupa, calçado, acessório
  isKit: boolean;
  isTopicalApplication: boolean; // skincare, maquiagem
  hasSatisfyingDemo: boolean; // limpadores, vaporizadores
  targetAudience: string;
  targetGender: "male" | "female" | "neutral";
  isFragrance: boolean;
  isFood: boolean;
  isSupplement: boolean;
  ticketTier: "low" | "medium" | "high";
}

// ─── Formato selecionado (state do formulário) ────────────────────────────────
export interface SelectedFormat {
  formatId: ScriptFormatId;
  choiceMode: "auto" | "manual";
  treadmillConfig?: TreadmillConfig | undefined;
}

// ─── Configuração específica da esteira ──────────────────────────────────────
export interface TreadmillConfig {
  characterType:
    | "ai_dark_mannequin"
    | "ai_white_mannequin"
    | "ai_realistic_human"
    | "real_recorded_model"
    | "saved_character";
  gender: "female" | "male" | "neutral";
  bodyType: string;
  walkSpeed: "slow" | "normal" | "fast";
  scenario: string;
  treadmillColor: string;
  lookCount: number;
  transitionTiming: string;
  musicStyle: string;
  onScreenText: string;
  ctaType: string;
  loopEnabled: boolean;
  extraClose: boolean;
  selectedVariant: string;
}

// ─── Provider de tendências (abstração para fontes futuras) ──────────────────
export interface TrendProvider {
  readonly name: string;
  readonly isRealTime: boolean;
  readonly updatedAt: string;
  getSignals(category?: string, market?: Market): TrendSignal[];
  getSignalForSubcategory(subcategory: string): TrendSignal | null;
}
