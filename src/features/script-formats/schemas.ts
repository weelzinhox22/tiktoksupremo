import { z } from "zod";
import type { Market, ScriptFormatId } from "./types";

// ─── Recursos de produção ─────────────────────────────────────────────────────
export const productionResourcesSchema = z.object({
  hasPhysicalProduct: z.boolean().default(false),
  realPersonAvailable: z.boolean().default(false),
  faceWillAppear: z.boolean().default(false),
  voiceAvailable: z.boolean().default(true),
  isNoSpeak: z.boolean().default(false),
  useAiCharacter: z.boolean().default(false),
  hasCharacterImage: z.boolean().default(false),
  hasSceneImage: z.boolean().default(false),
  hasReferenceVideo: z.boolean().default(false),
  fullyGeneratedByVeo: z.boolean().default(false),
  hybridRecording: z.boolean().default(false),
  variationsCount: z.number().int().min(1).max(6).default(3),
  totalDurationSeconds: z.number().int().min(10).max(1800).default(30),
  targetMarket: z.enum(["BR", "US", "UK", "EU", "INTL"]).default("BR") as z.ZodType<Market>,
});

export type ProductionResourcesInput = z.infer<typeof productionResourcesSchema>;

// ─── Configuração da esteira ──────────────────────────────────────────────────
export const treadmillConfigSchema = z.object({
  characterType: z.enum([
    "ai_dark_mannequin",
    "ai_white_mannequin",
    "ai_realistic_human",
    "real_recorded_model",
    "saved_character",
  ]).default("ai_dark_mannequin"),
  gender: z.enum(["female", "male", "neutral"]).default("female"),
  bodyType: z.string().default(""),
  walkSpeed: z.enum(["slow", "normal", "fast"]).default("normal"),
  scenario: z.string().default(""),
  treadmillColor: z.string().default(""),
  lookCount: z.number().int().min(1).max(6).default(3),
  transitionTiming: z.string().default(""),
  musicStyle: z.string().default(""),
  onScreenText: z.string().default(""),
  ctaType: z.string().default(""),
  loopEnabled: z.boolean().default(true),
  extraClose: z.boolean().default(false),
  selectedVariant: z.string().default("color_catalog"),
});

export type TreadmillConfigInput = z.infer<typeof treadmillConfigSchema>;

// ─── Formato selecionado ──────────────────────────────────────────────────────
const scriptFormatIds: [ScriptFormatId, ...ScriptFormatId[]] = [
  "ugc_real_talking",
  "ugc_hybrid_ai",
  "ai_treadmill_mannequin",
  "real_treadmill_model",
  "ai_outfit_transition",
  "silent_visual_demo",
  "problem_solution",
  "satisfying_demo",
  "apply_on_camera",
  "routine_stack",
  "before_after_proof",
  "comparison_choice",
  "honest_reaction",
  "unboxing_discovery",
  "discovery_story",
  "live_sales_script",
];

export const selectedFormatSchema = z.object({
  formatId: z.enum(scriptFormatIds),
  choiceMode: z.enum(["auto", "manual"]),
  treadmillConfig: treadmillConfigSchema.optional(),
});

export type SelectedFormatInput = z.infer<typeof selectedFormatSchema>;

// ─── Contexto de produto para recomendação ────────────────────────────────────
export const productContextSchema = z.object({
  category: z.string(),
  hasVariations: z.boolean().default(false),
  variationCount: z.number().int().min(0).default(0),
  price: z.number().nullable().default(null),
  needsTrust: z.boolean().default(false),
  hasRegulation: z.boolean().default(false),
  hasVisualTransformation: z.boolean().default(false),
  isWearable: z.boolean().default(false),
  isKit: z.boolean().default(false),
  isTopicalApplication: z.boolean().default(false),
  hasSatisfyingDemo: z.boolean().default(false),
  targetAudience: z.string().default(""),
  targetGender: z.enum(["male", "female", "neutral"]).default("neutral"),
  isFragrance: z.boolean().default(false),
  isFood: z.boolean().default(false),
  isSupplement: z.boolean().default(false),
  ticketTier: z.enum(["low", "medium", "high"]).default("medium"),
});

export type ProductContextInput = z.infer<typeof productContextSchema>;

// ─── Schema do step de formato (estado completo da etapa) ─────────────────────
export const formatStepSchema = z.object({
  selectionMode: z.enum(["auto", "manual"]).default("auto"),
  productContext: productContextSchema,
  productionResources: productionResourcesSchema,
  objective: z.string().default("Conversão para TikTok Shop"),
  selectedFormat: selectedFormatSchema.nullable().default(null),
});

export type FormatStepData = z.infer<typeof formatStepSchema>;
