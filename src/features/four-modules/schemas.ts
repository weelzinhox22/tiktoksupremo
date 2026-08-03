import { z } from "zod";

// ─── Modelador de Copy Schemas ────────────────────────────────────────────────

export const copySegmentSchema = z.object({
  id: z.string(),
  type: z.enum([
    "hook",
    "context",
    "pain",
    "desire",
    "product",
    "benefit",
    "feature",
    "demonstration",
    "proof",
    "objection",
    "urgency",
    "scarcity",
    "offer",
    "cta",
    "other",
  ]),
  text: z.string(),
  startTime: z.number().optional(),
  endTime: z.number().optional(),
  notes: z.array(z.string()).optional(),
});

export const copyAnalysisSchema = z.object({
  segments: z.array(copySegmentSchema),
  audience: z.string(),
  tone: z.array(z.string()),
  persuasionStructure: z.array(z.string()),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  sensitiveClaims: z.array(z.string()),
  complianceWarnings: z.array(z.string()),
});

export const copyProjectFormSchema = z.object({
  name: z.string().min(2, "Nome do projeto é obrigatório."),
  originalCopy: z.string().min(10, "A copy original deve ter pelo menos 10 caracteres."),
  originalProduct: z.string().default(""),
  originalAudience: z.string().default(""),
  copySource: z.string().default("user"),
  referenceLink: z.string().optional(),
  notes: z.string().optional(),
  language: z.string().default("pt-BR"),
  market: z.string().default("BR"),
  durationApprox: z.number().min(5).max(180).default(30),
  contentType: z.string().default("ugc"),
  isOwnCopy: z.boolean().default(true),
});

export const transformationConfigSchema = z.object({
  modes: z.array(z.string()).min(1, "Selecione ao menos um modo de transformação."),
  newProduct: z.string().default(""),
  newAudience: z.string().default(""),
  pains: z.string().default(""),
  desires: z.string().default(""),
  objections: z.string().default(""),
  offer: z.string().default(""),
  cta: z.string().default(""),
  duration: z.number().default(30),
  variationCount: z.number().min(1).max(5).default(1),
  tone: z.string().default("natural"),
  salesIntensity: z.enum(["soft", "balanced", "aggressive"]).default("balanced"),
  formality: z.enum(["informal", "neutral", "formal"]).default("informal"),
  useHumor: z.boolean().default(false),
  useUrgency: z.boolean().default(true),
  hasSpeech: z.boolean().default(true),
  videoFormat: z.string().default("UGC"),
  characterId: z.string().optional(),
  scenarioId: z.string().optional(),
  forbiddenWords: z.string().default(""),
  requiredInformation: z.string().default(""),
});

// ─── Estúdio de Personagens Schemas ──────────────────────────────────────────

export const characterFormSchema = z.object({
  name: z.string().min(2, "Nome é obrigatório."),
  internalName: z.string().default(""),
  description: z.string().default(""),
  type: z.enum([
    "real_person",
    "ai_realistic_human",
    "faceless_mannequin",
    "ugc_presenter",
    "fashion_model",
    "non_expert_spokesperson",
    "faceless_hands",
    "stylized_avatar",
  ]).default("ai_realistic_human"),
  visualAge: z.string().default("25-30"),
  gender: z.string().default("feminino"),
  height: z.string().default("1.68m"),
  bodyType: z.string().default("esbelto"),
  skinTone: z.string().default("morena clara"),
  faceShape: z.string().default("oval"),
  eyes: z.string().default("castanhos"),
  hairColor: z.string().default("castanho escuro"),
  hairLength: z.string().default("médio"),
  hairStyle: z.string().default("ondas naturais"),
  makeup: z.string().default("leve e natural"),
  voiceSpeed: z.enum(["slow", "natural", "fast", "very_fast"]).default("natural"),
  voiceEnergy: z.enum(["low", "moderate", "high"]).default("moderate"),
  tags: z.string().default(""),
});

// ─── Biblioteca de Cenários Schemas ──────────────────────────────────────────

export const scenarioFormSchema = z.object({
  name: z.string().min(2, "Nome do cenário é obrigatório."),
  description: z.string().default(""),
  category: z.string().default("bedroom"),
  spaceType: z.string().default("quarto contemporâneo bem iluminado"),
  wall: z.string().default("tom bege neutro"),
  floor: z.string().default("madeira clara"),
  lightingPreset: z.string().default("natural_soft"),
  cameraFraming: z.string().default("medium_shot"),
  ambientNoise: z.string().default("silencioso com leve brisa"),
  tags: z.string().default(""),
});

// ─── Laboratório de Criativos Schemas ────────────────────────────────────────

export const creativeExperimentFormSchema = z.object({
  name: z.string().min(2, "Nome do experimento é obrigatório."),
  productId: z.string().optional(),
  objective: z.enum([
    "views",
    "retention",
    "clicks",
    "conversions",
    "orders",
    "commission",
    "hook_testing",
    "duration_testing",
    "format_testing",
  ]).default("conversions"),
  hypothesis: z.string().default(""),
  primaryMetric: z.string().default("orders"),
  testType: z.enum([
    "hook",
    "duration",
    "format",
    "cta",
    "character",
    "scenario",
    "copy",
    "exploratory",
  ]).default("hook"),
});

export const creativeMetricsFormSchema = z.object({
  views: z.number().min(0).optional(),
  twoSecondViews: z.number().min(0).optional(),
  sixSecondViews: z.number().min(0).optional(),
  averageWatchTimeSeconds: z.number().min(0).optional(),
  completionRate: z.number().min(0).max(100).optional(),
  likes: z.number().min(0).optional(),
  comments: z.number().min(0).optional(),
  shares: z.number().min(0).optional(),
  saves: z.number().min(0).optional(),
  clicks: z.number().min(0).optional(),
  orders: z.number().min(0).optional(),
  unitsSold: z.number().min(0).optional(),
  revenue: z.number().min(0).optional(),
  commission: z.number().min(0).optional(),
  refunds: z.number().min(0).optional(),
  productionCost: z.number().min(0).optional(),
});
