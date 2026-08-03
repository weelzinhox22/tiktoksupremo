import {
  copyModuleBatchSchema,
  sceneRevisionSchema,
  scriptResultSchema,
  validatedCopyAnalysisSchema,
  type ScriptResult,
} from "@/features/script-generation/schemas";
import {
  buildCopyModulePrompt,
  copyModuleBatchJsonSchema,
} from "@/features/script-generation/prompts/modular-variations";
import {
  buildSceneRevisionPrompt,
  buildValidatedCopyPrompt,
  sceneRevisionJsonSchema,
  validatedCopyJsonSchema,
} from "@/features/validated-copies/prompts";
import {
  TIK_SUPREMO_SYSTEM_PROMPT,
  buildGenerationInput,
} from "@/features/script-generation/prompts/tik-supremo";
import {
  buildReferenceVisualAnalysisPrompt,
  referenceVisualAnalysisJsonSchema,
  referenceVisualAnalysisSchema,
} from "@/features/products/visual-analysis";
import { AIProviderError, type AIProvider, type GenerationContext } from "./provider";

export const scriptJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "product_summary",
    "target_audience",
    "sales_angle",
    "hook",
    "development",
    "demonstration",
    "objection_breaker",
    "urgency",
    "cta",
    "product_diagnosis",
    "copy_analysis",
    "video_analysis",
    "strategy",
    "full_script",
    "headline",
    "caption",
    "hashtags",
    "scenes",
  ],
  properties: {
    product_summary: { type: "string" },
    target_audience: { type: "string" },
    sales_angle: { type: "string" },
    hook: { type: "string" },
    development: { type: "string" },
    demonstration: { type: "string" },
    objection_breaker: { type: "string" },
    urgency: { type: "string" },
    cta: { type: "string" },
    product_diagnosis: {
      type: "object",
      additionalProperties: false,
      required: [
        "content_potential",
        "demonstration_ease",
        "visual_strength",
        "benefit_clarity",
        "curiosity_probability",
        "price_range",
        "commission",
        "objection_level",
        "possible_angles",
        "risks",
        "overall_score",
        "score_explanation",
        "data_scope_warning",
      ],
      properties: {
        content_potential: { type: "string" },
        demonstration_ease: { type: "string" },
        visual_strength: { type: "string" },
        benefit_clarity: { type: "string" },
        curiosity_probability: { type: "string" },
        price_range: { type: "string" },
        commission: { type: "string" },
        objection_level: { type: "string" },
        possible_angles: { type: "array", items: { type: "string" } },
        risks: { type: "array", items: { type: "string" } },
        overall_score: { type: "number", minimum: 0, maximum: 10 },
        score_explanation: { type: "string" },
        data_scope_warning: { type: "string" },
      },
    },
    copy_analysis: {
      type: "object",
      additionalProperties: false,
      required: [
        "hook",
        "curiosity",
        "promise",
        "demonstration",
        "proof",
        "objections",
        "urgency",
        "cta",
        "literal_copy_avoidance",
      ],
      properties: Object.fromEntries(
        [
          "hook",
          "curiosity",
          "promise",
          "demonstration",
          "proof",
          "objections",
          "urgency",
          "cta",
          "literal_copy_avoidance",
        ].map((k) => [k, { type: "string" }]),
      ),
    },
    video_analysis: {
      type: "object",
      additionalProperties: false,
      required: [
        "transcript_summary",
        "temporal_structure",
        "scene_changes",
        "character_movement",
        "camera_and_framing",
        "product_position",
        "expressions_and_gestures",
        "speech_rhythm",
        "on_screen_text",
        "benefits",
        "objections",
        "cta",
        "preserve",
        "modify",
        "limitations",
      ],
      properties: {
        ...Object.fromEntries(
          [
            "transcript_summary",
            "temporal_structure",
            "scene_changes",
            "character_movement",
            "camera_and_framing",
            "product_position",
            "expressions_and_gestures",
            "speech_rhythm",
            "on_screen_text",
            "benefits",
            "objections",
            "cta",
            "limitations",
          ].map((k) => [k, { type: "string" }]),
        ),
        preserve: { type: "array", items: { type: "string" } },
        modify: { type: "array", items: { type: "string" } },
      },
    },
    strategy: {
      type: "object",
      additionalProperties: false,
      required: ["name", "rationale", "strongest_benefits", "objections_to_answer"],
      properties: {
        name: { type: "string" },
        rationale: { type: "string" },
        strongest_benefits: { type: "array", items: { type: "string" } },
        objections_to_answer: { type: "array", items: { type: "string" } },
      },
    },
    full_script: { type: "string" },
    headline: { type: "string" },
    caption: { type: "string" },
    hashtags: { type: "array", minItems: 5, maxItems: 5, items: { type: "string" } },
    scenes: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "scene_number",
          "duration_seconds",
          "spoken_text",
          "speech_direction",
          "visual_action",
          "body_movement",
          "camera_direction",
          "framing",
          "character_direction",
          "product_direction",
          "setting",
          "continuity_rules",
          "veo_prompt",
        ],
        properties: {
          scene_number: { type: "integer", minimum: 1 },
          duration_seconds: { type: "number", enum: [8] },
          ...Object.fromEntries(
            [
              "spoken_text",
              "speech_direction",
              "visual_action",
              "body_movement",
              "camera_direction",
              "framing",
              "character_direction",
              "product_direction",
              "setting",
              "continuity_rules",
              "veo_prompt",
            ].map((k) => [k, { type: "string" }]),
          ),
        },
      },
    },
  },
};

export class OpenAIProvider implements AIProvider {
  private key = process.env["OPENAI_API_KEY"];
  private model = process.env["OPENAI_MODEL"] || "gpt-5-mini";
  private timeout = Number(process.env["AI_TIMEOUT_MS"] || 90000);
  private requireKey() {
    if (!this.key)
      throw new AIProviderError(
        "IA não configurada. Defina OPENAI_API_KEY somente no backend.",
        "not_configured",
      );
    return this.key;
  }
  private async request(url: string, init: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, { ...init, signal: controller.signal });
      if (response.status === 401)
        throw new AIProviderError("A chave da IA foi rejeitada.", "auth");
      if (response.status === 429)
        throw new AIProviderError(
          "O limite do provedor de IA foi atingido. Tente novamente em instantes.",
          "rate_limit",
        );
      if (!response.ok)
        throw new AIProviderError(`O provedor de IA retornou erro ${response.status}.`, "provider");
      return response;
    } catch (e) {
      if (e instanceof AIProviderError) throw e;
      if (e instanceof Error && e.name === "AbortError")
        throw new AIProviderError("A IA excedeu o tempo limite.", "timeout");
      throw new AIProviderError("Não foi possível acessar o provedor de IA.", "provider");
    } finally {
      clearTimeout(timer);
    }
  }
  async generateText(prompt: string, temperature = 0.7): Promise<string> {
    const response = await this.request("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
    });
    const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new AIProviderError("A IA não retornou o texto solicitado.", "invalid_response");
    }
    return text.trim();
  }

  async transcribeMedia(media: Blob, filename: string) {
    const form = new FormData();
    form.append("file", media, filename);
    form.append("model", "gpt-4o-mini-transcribe");
    const response = await this.request("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}` },
      body: form,
    });
    const data = (await response.json()) as { text?: unknown };
    if (typeof data.text !== "string")
      throw new AIProviderError("A transcrição retornou formato inválido.", "invalid_response");
    return data.text;
  }
  private async structuredResponse(name: string, prompt: string, schema: Record<string, unknown>) {
    const response = await this.request("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        input: prompt,
        text: { format: { type: "json_schema", name, strict: true, schema } },
      }),
    });
    const raw = (await response.json()) as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = raw.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    if (!text)
      throw new AIProviderError("A IA não retornou a análise solicitada.", "invalid_response");
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new AIProviderError("A análise retornou um formato inválido.", "invalid_response");
    }
  }
  async analyzeValidatedCopy(transcript: string) {
    const result = await this.structuredResponse(
      "validated_copy_analysis",
      buildValidatedCopyPrompt(transcript),
      validatedCopyJsonSchema as unknown as Record<string, unknown>,
    );
    return validatedCopyAnalysisSchema.parse(result);
  }
  async analyzeReferenceImages(
    imageUrls: string[],
    referenceType: "product" | "avatar",
    context: GenerationContext,
  ) {
    if (!imageUrls.length)
      throw new AIProviderError("Nenhuma imagem foi enviada para análise.", "provider");
    const response = await this.request("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: buildReferenceVisualAnalysisPrompt(referenceType, context),
              },
              ...imageUrls.slice(0, 8).map((image_url) => ({
                type: "input_image",
                image_url,
                detail: "high",
              })),
            ],
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: `${referenceType}_visual_analysis`,
            strict: true,
            schema: referenceVisualAnalysisJsonSchema,
          },
        },
      }),
    });
    const raw = (await response.json()) as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = raw.output
      ?.flatMap((item) => item.content ?? [])
      .find((item) => item.type === "output_text")?.text;
    if (!text)
      throw new AIProviderError("A IA não analisou a imagem de referência.", "invalid_response");
    try {
      return referenceVisualAnalysisSchema.parse(JSON.parse(text));
    } catch {
      throw new AIProviderError("A análise visual retornou formato inválido.", "invalid_response");
    }
  }
  async reviseScenePrompt(context: GenerationContext) {
    const result = await this.structuredResponse(
      "scene_revision",
      buildSceneRevisionPrompt(context),
      sceneRevisionJsonSchema as unknown as Record<string, unknown>,
    );
    return sceneRevisionSchema.parse(result);
  }
  async generateCopyModules(
    context: GenerationContext,
    kind: "hook" | "body" | "cta",
    count: number,
  ) {
    const result = await this.structuredResponse(
      `copy_modules_${kind}`,
      buildCopyModulePrompt(context, kind, count),
      copyModuleBatchJsonSchema as unknown as Record<string, unknown>,
    );
    return copyModuleBatchSchema.parse(result);
  }
  async generateScript(context: GenerationContext): Promise<ScriptResult> {
    const frameUrls = Array.isArray(context["sampled_frame_urls"])
      ? context["sampled_frame_urls"]
          .filter((value): value is string => typeof value === "string")
          .slice(0, 8)
      : [];
    const content = [
      {
        type: "input_text",
        text: buildGenerationInput({
          ...context,
          sampled_frame_urls: frameUrls.length ? "Imagens anexadas a esta solicitação" : [],
        }),
      },
      ...frameUrls.map((image_url) => ({ type: "input_image", image_url, detail: "low" })),
    ];
    const response = await this.request("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: this.model,
        instructions: TIK_SUPREMO_SYSTEM_PROMPT,
        input: [{ role: "user", content }],
        text: {
          format: {
            type: "json_schema",
            name: "tik_supremo_script",
            strict: true,
            schema: scriptJsonSchema,
          },
        },
      }),
    });
    const raw = (await response.json()) as {
      output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    };
    const text = raw.output
      ?.flatMap((i) => i.content ?? [])
      .find((i) => i.type === "output_text")?.text;
    if (!text)
      throw new AIProviderError("A IA não retornou conteúdo estruturado.", "invalid_response");
    try {
      const parsed = scriptResultSchema.parse(JSON.parse(text));
      if (parsed.scenes.some((scene) => !scene.veo_prompt.includes(scene.spoken_text))) {
        throw new Error("O prompt Veo alterou ou omitiu o texto falado.");
      }
      return parsed;
    } catch {
      throw new AIProviderError(
        "A resposta da IA não passou pela validação de segurança.",
        "invalid_response",
      );
    }
  }
  async analyzeVideoFrames(frameUrls: string[], transcript: string) {
    return {
      frame_count: frameUrls.length,
      transcript_available: Boolean(transcript),
      delegatedToStructuredGeneration: true,
    };
  }
  async analyzeProduct(context: GenerationContext) {
    return { context, delegatedToStructuredGeneration: true };
  }
  async analyzeReferenceCopy(copy: string) {
    return { copyLength: copy.length, delegatedToStructuredGeneration: true };
  }
  async generateVariations(context: GenerationContext, count: number) {
    const results: ScriptResult[] = [];
    for (let i = 0; i < count; i++)
      results.push(await this.generateScript({ ...context, variation: i + 1 }));
    return results;
  }
}
