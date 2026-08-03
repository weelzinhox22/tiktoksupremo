// ─── 1. MODELADOR DE COPY ───────────────────────────────────────────────────

export type CopyTransformationMode =
  | "preserve_structure"
  | "change_audience"
  | "change_product"
  | "more_aggressive"
  | "more_natural"
  | "shorter"
  | "longer"
  | "no_speak"
  | "storytelling"
  | "ugc"
  | "live"
  | "multiple_variations";

export type SegmentType =
  | "hook"
  | "context"
  | "pain"
  | "desire"
  | "product"
  | "benefit"
  | "feature"
  | "demonstration"
  | "proof"
  | "objection"
  | "urgency"
  | "scarcity"
  | "offer"
  | "cta"
  | "other";

export interface CopySegment {
  id: string;
  type: SegmentType;
  text: string;
  startTime?: number;
  endTime?: number;
  notes?: string[];
}

export interface CopyAnalysis {
  segments: CopySegment[];
  audience: string;
  tone: string[];
  persuasionStructure: string[];
  strengths: string[];
  weaknesses: string[];
  sensitiveClaims: string[];
  complianceWarnings: string[];
}

export interface SimilarityRiskResult {
  risk: "low" | "medium" | "high" | "very_high";
  score: number; // 0-100
  reasons: string[];
  similarPhrases: { original: string; generated: string; reason: string }[];
  rewritingSuggestions: string[];
}

export interface CopyVersion {
  id: string;
  projectId: string;
  name: string;
  content: string;
  segments: CopySegment[];
  strategy: string;
  estimatedDurationSeconds: number;
  similarityRisk: "low" | "medium" | "high" | "very_high";
  similarityReasons: string[];
  characterId?: string;
  scenarioId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CopyProject {
  id: string;
  userId: string;
  name: string;
  originalCopy: string;
  originalProduct: string;
  originalAudience: string;
  copySource: string;
  referenceLink?: string | null;
  notes?: string | null;
  language: string;
  market: string;
  durationApprox: number;
  contentType: string;
  isOwnCopy: boolean;
  analysis: CopyAnalysis;
  versions: CopyVersion[];
  createdAt: string;
  updatedAt: string;
}

// ─── 2. ESTÚDIO DE PERSONAGENS ───────────────────────────────────────────────

export type CharacterType =
  | "real_person"
  | "ai_realistic_human"
  | "faceless_mannequin"
  | "ugc_presenter"
  | "fashion_model"
  | "non_expert_spokesperson"
  | "faceless_hands"
  | "stylized_avatar";

export interface CharacterAppearance {
  visualAge: string;
  gender: string;
  height: string;
  bodyType: string;
  skinTone: string;
  faceShape: string;
  eyes: string;
  hairColor: string;
  hairLength: string;
  hairStyle: string;
  makeup: string;
  distinctiveFeatures: string[];
}

export interface CharacterOutfitPreset {
  id: string;
  name: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
  colors: string[];
  fabric: string;
  style: string;
  occasion: string;
  isImmutable: boolean;
}

export interface CharacterVoice {
  language: string;
  regionalVariant: string;
  vocalRange: string;
  timbre: string;
  speed: "slow" | "natural" | "fast" | "very_fast";
  energy: "low" | "moderate" | "high";
  catchphrases: string[];
  avoidedWords: string[];
}

export interface CharacterPersonality {
  traits: string[];
  energyLevel: string;
  persuasiveness: string;
  informality: string;
  preferredHooks: string[];
  preferredCtas: string[];
}

export interface CharacterExpression {
  id: string;
  name: string;
  facialDescription: string;
  intensity: "subtle" | "moderate" | "intense";
  promptSnippet: string;
}

export interface CharacterMovementItem {
  id: string;
  name: string;
  description: string;
  durationSeconds: number;
  bodyParts: string[];
  promptSnippet: string;
  negativePromptSnippet: string;
}

export interface CharacterProfile {
  id: string;
  userId: string;
  name: string;
  internalName: string;
  description: string;
  type: CharacterType;
  appearance: CharacterAppearance;
  outfitPresets: CharacterOutfitPreset[];
  voice: CharacterVoice;
  personality: CharacterPersonality;
  expressions: CharacterExpression[];
  movements: CharacterMovementItem[];
  basePrompt: string;
  voicePrompt: string;
  behaviorPrompt: string;
  continuityPrompt: string;
  negativePrompt: string;
  tags: string[];
  version: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

// ─── 3. BIBLIOTECA DE CENÁRIOS ───────────────────────────────────────────────

export interface ScenarioEnvironment {
  spaceType: string;
  wall: string;
  floor: string;
  ceiling: string;
  furniture: string[];
  decor: string[];
  depth: string;
}

export interface ScenarioLighting {
  mainSource: string;
  temperature: string;
  intensity: string;
  contrast: string;
  shadows: string;
  naturalLight: string;
  preset: string;
}

export interface ScenarioCameraPreset {
  id: string;
  name: string;
  framing: string;
  height: string;
  distance: string;
  angle: string;
  depthOfField: string;
  promptSnippet: string;
}

export interface ScenarioFixedElement {
  id: string;
  name: string;
  description: string;
  position: string;
  color: string;
  isImmutable: boolean;
}

export interface ScenarioActionZone {
  characterZone: string;
  productZone: string;
  demonstrationZone: string;
  textSafeZone: string;
}

export interface ScenarioAudio {
  ambientNoise: string;
  reverberation: string;
  suggestedMusic: string;
  forbiddenSounds: string[];
}

export interface ScenarioProfile {
  id: string;
  userId: string | null;
  name: string;
  description: string;
  category: string;
  environment: ScenarioEnvironment;
  lighting: ScenarioLighting;
  cameraPresets: ScenarioCameraPreset[];
  fixedElements: ScenarioFixedElement[];
  actionZones: ScenarioActionZone;
  audio: ScenarioAudio;
  environmentPrompt: string;
  lightingPrompt: string;
  cameraPrompt: string;
  continuityPrompt: string;
  negativePrompt: string;
  compatibleFormats: string[];
  compatibleCategories: string[];
  tags: string[];
  version: number;
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

// ─── 4. LABORATÓRIO DE CRIATIVOS ─────────────────────────────────────────────

export type ExperimentObjective =
  | "views"
  | "retention"
  | "clicks"
  | "conversions"
  | "orders"
  | "commission"
  | "hook_testing"
  | "duration_testing"
  | "format_testing";

export type ExperimentTestType =
  | "hook"
  | "duration"
  | "format"
  | "cta"
  | "character"
  | "scenario"
  | "copy"
  | "exploratory";

export interface CreativeMetrics {
  collectedAt: string;
  views?: number;
  twoSecondViews?: number;
  sixSecondViews?: number;
  averageWatchTimeSeconds?: number;
  completionRate?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  orders?: number;
  unitsSold?: number;
  revenue?: number;
  commission?: number;
  refunds?: number;
  productionCost?: number;
}

export interface DerivedMetrics {
  retentionRate2s: number | null;
  retentionRate6s: number | null;
  ctrPercent: number | null;
  conversionRatePercent: number | null;
  ordersPer1kViews: number | null;
  revenuePer1kViews: number | null;
  commissionPer1kViews: number | null;
  roiFactor: number | null;
}

export interface CreativeVariant {
  id: string;
  experimentId: string;
  name: string;
  copyVersionId?: string;
  characterId?: string;
  scenarioId?: string;
  formatId?: string;
  hook?: string;
  cta?: string;
  durationSeconds?: number;
  videoAsset?: string;
  publicationDate?: string;
  metrics: CreativeMetrics[];
  derivedMetrics?: DerivedMetrics;
}

export interface ExperimentConclusion {
  winnerVariantId?: string;
  confidence: "very_low" | "low" | "moderate" | "high";
  summary: string;
  findings: string[];
  limitations: string[];
  nextTestRecommendations: string[];
}

export interface CreativeExperiment {
  id: string;
  userId: string;
  name: string;
  productId?: string | undefined;
  objective: ExperimentObjective;
  hypothesis: string;
  primaryMetric: string;
  secondaryMetrics: string[];
  testType: ExperimentTestType;
  variants: CreativeVariant[];
  status: "draft" | "running" | "completed" | "archived";
  startDate?: string | undefined;
  endDate?: string | undefined;
  conclusion?: ExperimentConclusion | undefined;
  createdAt: string;
  updatedAt: string;
}

