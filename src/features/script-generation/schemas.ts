import { z } from "zod";

export const sceneSchema = z.object({
  scene_number: z.number().int().positive(),
  duration_seconds: z.number().positive().max(8),
  spoken_text: z.string(),
  speech_direction: z.string(),
  visual_action: z.string(),
  body_movement: z.string(),
  camera_direction: z.string(),
  framing: z.string(),
  character_direction: z.string(),
  product_direction: z.string(),
  setting: z.string(),
  continuity_rules: z.string(),
  veo_prompt: z.string(),
});

export const scriptResultSchema = z.object({
  product_summary: z.string(),
  target_audience: z.string(),
  sales_angle: z.string(),
  hook: z.string(),
  development: z.string(),
  demonstration: z.string(),
  objection_breaker: z.string(),
  urgency: z.string(),
  cta: z.string(),
  product_diagnosis: z.object({
    content_potential: z.string(),
    demonstration_ease: z.string(),
    visual_strength: z.string(),
    benefit_clarity: z.string(),
    curiosity_probability: z.string(),
    price_range: z.string(),
    commission: z.string(),
    objection_level: z.string(),
    possible_angles: z.array(z.string()),
    risks: z.array(z.string()),
    overall_score: z.number().min(0).max(10),
    score_explanation: z.string(),
    data_scope_warning: z.string(),
  }),
  copy_analysis: z.object({
    hook: z.string(),
    curiosity: z.string(),
    promise: z.string(),
    demonstration: z.string(),
    proof: z.string(),
    objections: z.string(),
    urgency: z.string(),
    cta: z.string(),
    literal_copy_avoidance: z.string(),
  }),
  video_analysis: z.object({
    transcript_summary: z.string(),
    temporal_structure: z.string(),
    scene_changes: z.string(),
    character_movement: z.string(),
    camera_and_framing: z.string(),
    product_position: z.string(),
    expressions_and_gestures: z.string(),
    speech_rhythm: z.string(),
    on_screen_text: z.string(),
    benefits: z.string(),
    objections: z.string(),
    cta: z.string(),
    preserve: z.array(z.string()),
    modify: z.array(z.string()),
    limitations: z.string(),
  }),
  strategy: z.object({
    name: z.string(),
    rationale: z.string(),
    strongest_benefits: z.array(z.string()),
    objections_to_answer: z.array(z.string()),
  }),
  full_script: z.string(),
  headline: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()).length(5),
  scenes: z.array(sceneSchema).min(1),
});
export type ScriptResult = z.infer<typeof scriptResultSchema>;

export const validatedCopyAnalysisSchema = z.object({
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  markings: z.array(
    z.object({
      label: z.enum(["Gancho", "Corpo", "CTA"]),
      excerpt: z.string(),
    }),
  ),
  why_it_worked: z.array(z.string()),
  audience: z.string(),
  tone: z.string(),
});
export type ValidatedCopyAnalysis = z.infer<typeof validatedCopyAnalysisSchema>;

export const sceneRevisionSchema = z.object({
  spoken_text: z.string(),
  speech_direction: z.string(),
  character_direction: z.string(),
  veo_prompt: z.string(),
});
export type SceneRevision = z.infer<typeof sceneRevisionSchema>;

export const copyModuleBatchSchema = z.object({
  kind: z.enum(["hook", "body", "cta"]),
  modules: z.array(
    z.object({
      title: z.string(),
      strategy: z.string(),
      scenes: z.array(
        z.object({
          spoken_text: z.string(),
          veo_prompt: z.string(),
        }),
      ),
    }),
  ),
});
export type CopyModuleBatch = z.infer<typeof copyModuleBatchSchema>;

export const generationRequestSchema = z.object({ projectId: z.string().uuid() });
export const transcriptionRequestSchema = z.object({
  transcriptionId: z.string().uuid(),
});
export const sceneRevisionRequestSchema = z.object({
  projectId: z.string().uuid(),
  sceneId: z.string().uuid(),
  instruction: z.string().trim().min(3).max(2_000),
});
