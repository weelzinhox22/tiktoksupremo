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
  compactGenerationContext,
} from "@/features/script-generation/prompts/tik-supremo";
import { scriptJsonSchema } from "./openai";
import { AIProviderError, type AIProvider, type GenerationContext } from "./provider";
import {
  buildReferenceVisualAnalysisPrompt,
  referenceVisualAnalysisJsonSchema,
  referenceVisualAnalysisSchema,
} from "@/features/products/visual-analysis";

type GeminiInteractionResponse = {
  output_text?: string;
  steps?: Array<{
    type?: string;
    content?: Array<{ type?: string; text?: string }>;
  }>;
  outputs?: Array<{ type?: string; text?: string }>;
};

const videoFrameSchema = {
  type: "object",
  required: ["summary", "visual_structure", "camera", "character", "product", "preserve", "modify"],
  properties: {
    summary: { type: "string" },
    visual_structure: { type: "string" },
    camera: { type: "string" },
    character: { type: "string" },
    product: { type: "string" },
    preserve: { type: "array", items: { type: "string" } },
    modify: { type: "array", items: { type: "string" } },
  },
};

// Gemini's responseSchema does not support: additionalProperties, minimum, maximum,
// minItems, maxItems, exclusiveMinimum, exclusiveMaximum. Strip them recursively.
// Gemini also does NOT support numeric enum values — only string enums are allowed.
function sanitizeSchemaForGemini(schema: Record<string, unknown>): Record<string, unknown> {
  const UNSUPPORTED = new Set([
    "additionalProperties",
    "minimum",
    "maximum",
    "minItems",
    "maxItems",
    "exclusiveMinimum",
    "exclusiveMaximum",
  ]);
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(schema)) {
    if (UNSUPPORTED.has(key)) continue;
    // Gemini only supports string enums — drop enum if it contains non-string values
    if (key === "enum" && Array.isArray(value)) {
      if (value.every((v) => typeof v === "string")) {
        result[key] = value;
      }
      // else: skip the enum entirely (Gemini rejects numeric enums)
      continue;
    }
    if (key === "properties" && value && typeof value === "object") {
      const props: Record<string, unknown> = {};
      for (const [pk, pv] of Object.entries(value as Record<string, unknown>)) {
        props[pk] = sanitizeSchemaForGemini(pv as Record<string, unknown>);
      }
      result[key] = props;
    } else if (key === "items" && value && typeof value === "object") {
      result[key] = sanitizeSchemaForGemini(value as Record<string, unknown>);
    } else if ((key === "anyOf" || key === "allOf" || key === "oneOf") && Array.isArray(value)) {
      result[key] = value.map((v) =>
        v && typeof v === "object" ? sanitizeSchemaForGemini(v as Record<string, unknown>) : v,
      );
    } else {
      result[key] = value;
    }
  }
  return result;
}


function parseGoogleError(errText: string): string {
  try {
    const json = JSON.parse(errText) as { error?: { message?: string } };
    if (json?.error?.message) return json.error.message;
  } catch {
    /* fallback */
  }
  return errText.slice(0, 150);
}

export class GeminiProvider implements AIProvider {
  private key = process.env["GEMINI_API_KEY"];
  private model = process.env["GEMINI_MODEL"] || "gemini-3.6-flash";
  private timeout = Number(process.env["AI_TIMEOUT_MS"] || 90_000);

  private requireKey() {
    const rawKey = this.key || process.env["GEMINI_API_KEY"] || "";
    const cleanKey = rawKey.trim().replace(/^["']|["']$/g, "");
    if (!cleanKey) {
      throw new AIProviderError(
        "IA não configurada. Defina a chave de API no backend.",
        "not_configured",
      );
    }
    return cleanKey;
  }

  private async request(body: Record<string, unknown>) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.requireKey(),
            "Api-Revision": "2026-05-20",
          },
          body: JSON.stringify({ ...body, model: this.model, store: false }),
          signal: controller.signal,
        },
      );
      if (response.status === 400) {
        throw new AIProviderError(
          "A IA recusou a solicitação. Verifique se o modelo e a chave de API estão corretos.",
          "provider",
        );
      }
      if (response.status === 401 || response.status === 403) {
        throw new AIProviderError("A chave de API foi rejeitada ou não possui permissão.", "auth");
      }
      if (response.status === 413) {
        throw new AIProviderError(
          "A referência ficou grande demais para o sistema. Tente usar menos frames.",
          "provider",
        );
      }
      if (response.status === 429) {
        throw new AIProviderError(
          "O limite de requisições da IA foi atingido. Aguarde e tente novamente.",
          "rate_limit",
        );
      }
      if (!response.ok) {
        const errorBody = await response.text().catch(() => "(sem corpo)");
        console.error(`[Gemini] erro ${response.status} na interactions API:`, errorBody);
        throw new AIProviderError(
          `A IA retornou erro ${response.status}.`,
          "provider",
        );
      }
      return (await response.json()) as GeminiInteractionResponse;
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIProviderError("A IA excedeu o tempo limite.", "timeout");
      }
      throw new AIProviderError("Não foi possível acessar o serviço de IA.", "provider");
    } finally {
      clearTimeout(timer);
    }
  }

  private safeParseJson(text: string): Record<string, unknown> {
    const attempts = [
      text.trim(),
      text
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/i, "")
        .trim(),
    ];
    for (const attempt of attempts) {
      try {
        return JSON.parse(attempt) as Record<string, unknown>;
      } catch {
        /* try next */
      }
    }
    // Last resort: extract first {...} block from mixed prose+JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as Record<string, unknown>;
      } catch {
        /* fall through */
      }
    }
    throw new SyntaxError("Nenhum JSON válido encontrado na resposta do Gemini.");
  }

  private getText(data: GeminiInteractionResponse) {
    if (typeof data.output_text === "string") return data.output_text;
    const stepText = data.steps
      ?.filter((step) => step.type === "model_output")
      .flatMap((step) => step.content ?? [])
      .find((content) => content.type === "text")?.text;
    if (stepText) return stepText;
    return data.outputs?.find((output) => output.type === "text")?.text;
  }

  private getMimeType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const map: Record<string, string> = {
      mp4: "video/mp4",
      mov: "video/quicktime",
      avi: "video/x-msvideo",
      webm: "video/webm",
      mkv: "video/x-matroska",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      m4a: "audio/mp4",
      ogg: "audio/ogg",
    };
    return map[ext ?? ""] ?? "video/mp4";
  }

  private async requestGenerateContent(
    parts: unknown[],
    options?: {
      systemInstruction?: string;
      generationConfig?: Record<string, unknown>;
    },
    targetModel = this.model,
  ): Promise<{
    candidates?: Array<{
      finishReason?: string;
      content?: { parts?: Array<{ text?: string; thought?: boolean }> };
    }>;
  }> {
    const modelToUse = (targetModel || "gemini-3.6-flash").trim().replace(/^["']|["']$/g, "");
    const apiKey = this.requireKey();
    const body: Record<string, unknown> = { contents: [{ parts }] };
    if (options?.systemInstruction) {
      body["systemInstruction"] = { parts: [{ text: options.systemInstruction }] };
    }
    if (options?.generationConfig) {
      body["generationConfig"] = options.generationConfig;
    }

    const attempts = [
      { version: "v1beta", model: modelToUse },
      { version: "v1beta", model: "gemini-3.6-flash" },
      { version: "v1beta", model: "gemini-flash-latest" },
      { version: "v1beta", model: "gemini-3.5-flash" },
      { version: "v1beta", model: "gemini-2.0-flash" },
      { version: "v1", model: "gemini-1.5-flash" },
    ].filter(
      (item, index, self) =>
        self.findIndex((t) => t.version === item.version && t.model === item.model) === index,
    );

    let lastStatus = 0;
    let lastDetails = "";

    for (const attempt of attempts) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);
      try {
        const url = `https://generativelanguage.googleapis.com/${attempt.version}/models/${attempt.model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (response.ok) {
          return (await response.json()) as {
            candidates?: Array<{
              finishReason?: string;
              content?: { parts?: Array<{ text?: string; thought?: boolean }> };
            }>;
          };
        }

        const errorBody = await response.text().catch(() => "");
        const details = parseGoogleError(errorBody);
        lastStatus = response.status;
        lastDetails = details;
        console.warn(
          `[Gemini] ${attempt.version}/models/${attempt.model} retornou ${response.status}: ${details}`,
        );

        if (response.status === 401 || response.status === 403) {
          throw new AIProviderError(
            `A chave de API de IA foi rejeitada ou não possui permissão (${details || "chave inválida"}).`,
            "auth",
          );
        }
        if (response.status === 429) {
          throw new AIProviderError(
            "O limite de requisições da IA foi atingido. Aguarde e tente novamente.",
            "rate_limit",
          );
        }
      } catch (error) {
        if (error instanceof AIProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new AIProviderError("A IA excedeu o tempo limite.", "timeout");
        }
      } finally {
        clearTimeout(timer);
      }
    }

    throw new AIProviderError(
      `A IA retornou erro ${lastStatus || 404}: ${lastDetails || "modelo ou API indisponível"}.`,
      "provider",
    );
  }

  /** Returns the model's output text, skipping thinking-step parts (gemini-2.5+). */
  private getGeneratedText(
    result: {
      candidates?: Array<{
        finishReason?: string;
        content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      }>;
    },
    context: string,
  ): string {
    const candidate = result.candidates?.[0];
    if (candidate?.finishReason === "MAX_TOKENS") {
      throw new AIProviderError(
        `O Gemini interrompeu a geração por limite de tokens (${context}). Tente reduzir o conteúdo de entrada.`,
        "provider",
      );
    }
    const parts = candidate?.content?.parts ?? [];
    // gemini-2.5-flash returns thinking tokens flagged with { thought: true } — skip them
    const outputPart = parts.find((p) => !p.thought) ?? parts[0];
    return outputPart?.text ?? "";
  }

  async transcribeMedia(media: Blob, filename: string): Promise<string> {
    const maxInlineBytes = 20 * 1024 * 1024; // 20 MB
    if (media.size > maxInlineBytes) {
      throw new AIProviderError(
        "O vídeo excede 20 MB para transcrição direta. Envie um vídeo menor.",
        "provider",
      );
    }
    const base64 = Buffer.from(await media.arrayBuffer()).toString("base64");
    const mimeType = media.type || this.getMimeType(filename);
    const data = await this.requestGenerateContent([
      {
        text: "Transcreva fielmente o áudio deste vídeo em português. Retorne apenas o texto falado, sem timestamps, legendas ou anotações extras.",
      },
      { inline_data: { mime_type: mimeType, data: base64 } },
    ]);
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text)
      throw new AIProviderError("A IA não retornou a transcrição.", "invalid_response");
    return text.trim();
  }

  async transcribeMediaUrl(signedUrl: string): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    let blob: Blob | undefined;
    try {
      const response = await fetch(signedUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new AIProviderError(
          `Falha ao baixar o vídeo para transcrição (${response.status}).`,
          "provider",
        );
      }
      blob = await response.blob();
    } catch (error) {
      if (error instanceof AIProviderError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new AIProviderError("O download do vídeo excedeu o tempo limite.", "timeout");
      }
      throw new AIProviderError("Não foi possível baixar o vídeo para transcrição.", "provider");
    } finally {
      clearTimeout(timer);
    }
    if (!blob) throw new AIProviderError("O vídeo não pôde ser carregado.", "provider");
    const filename = signedUrl.split("?").at(0)?.split("/").pop() ?? "video.mp4";
    return this.transcribeMedia(blob, filename);
  }

  async analyzeVideoFrames(frameUrls: string[], transcript: string) {
    if (!frameUrls.length) return { limitations: "Nenhum frame foi disponibilizado." };

    const runWithUrls = async (urls: string[]) => {
      // Download frames and encode as base64 for the generateContent endpoint
      const imageParts: unknown[] = [];
      for (const url of urls) {
        try {
          const res = await fetch(url);
          if (!res.ok) continue;
          const buf = await res.arrayBuffer();
          const b64 = Buffer.from(buf).toString("base64");
          imageParts.push({ inline_data: { mime_type: "image/jpeg", data: b64 } });
        } catch {
          /* skip failed frames */
        }
      }
      if (!imageParts.length) return { limitations: "Nenhum frame pôde ser baixado para análise." };

      const data = await this.requestGenerateContent(
        [
          {
            text: `Analise os frames deste TikTok Shop brasileiro. Retorne APENAS um objeto JSON válido (sem markdown, sem texto extra) com os campos: summary, visual_structure, camera, character, product, preserve (array), modify (array). Transcrição disponível: ${transcript.slice(0, 3_000)}`,
          },
          ...imageParts,
        ],
        {
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: sanitizeSchemaForGemini(videoFrameSchema as Record<string, unknown>),
            maxOutputTokens: 4_000,
          },
        },
      );

      const text = this.getGeneratedText(data, "analyzeVideoFrames");
      if (!text)
        return { limitations: "A IA não retornou análise visual; roteiro gerado sem ela." };
      try {
        return this.safeParseJson(text);
      } catch {
        console.error("[Gemini] analyzeVideoFrames JSON bruto:", text.slice(0, 500));
        return { limitations: "Análise visual retornou formato inválido; roteiro gerado sem ela." };
      }
    };

    try {
      return await runWithUrls(frameUrls.slice(0, 4));
    } catch (error) {
      // Frame analysis is non-fatal — return limitations so script generation continues
      console.error("[Gemini] analyzeVideoFrames falhou, continuando sem análise visual:", error);
      return {
        limitations:
          "Análise visual não disponível; roteiro gerado com transcrição e dados do produto.",
      };
    }
  }

  async analyzeReferenceImages(
    imageUrls: string[],
    referenceType: "product" | "avatar",
    context: GenerationContext,
  ) {
    if (!imageUrls.length)
      throw new AIProviderError("Nenhuma imagem foi enviada para análise.", "provider");
    const imageParts: unknown[] = [];
    for (const url of imageUrls.slice(0, 6)) {
      const response = await fetch(url);
      if (!response.ok) continue;
      const buffer = await response.arrayBuffer();
      const data = Buffer.from(buffer).toString("base64");
      imageParts.push({
        inline_data: {
          mime_type: response.headers.get("content-type") || "image/jpeg",
          data,
        },
      });
    }
    if (!imageParts.length) {
      throw new AIProviderError("As imagens de referência não puderam ser abertas.", "provider");
    }
    const result = await this.requestGenerateContent(
      [{ text: buildReferenceVisualAnalysisPrompt(referenceType, context) }, ...imageParts],
      {
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: sanitizeSchemaForGemini(
            referenceVisualAnalysisJsonSchema as unknown as Record<string, unknown>,
          ),
          maxOutputTokens: 4_096,
        },
      },
    );
    const text = this.getGeneratedText(result, "analyzeReferenceImages");
    if (!text) throw new AIProviderError("A IA não analisou a imagem.", "invalid_response");
    try {
      return referenceVisualAnalysisSchema.parse(this.safeParseJson(text));
    } catch {
      throw new AIProviderError("A análise visual retornou formato inválido.", "invalid_response");
    }
  }

  private async structuredContent(prompt: string, schema: Record<string, unknown>) {
    const data = await this.requestGenerateContent([{ text: prompt }], {
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: sanitizeSchemaForGemini(schema),
        maxOutputTokens: 8_192,
      },
    });
    const text = this.getGeneratedText(data, "structuredContent");
    if (!text)
      throw new AIProviderError("A IA não retornou a análise solicitada.", "invalid_response");
    try {
      return this.safeParseJson(text);
    } catch {
      throw new AIProviderError("A análise retornou um formato inválido.", "invalid_response");
    }
  }

  async analyzeValidatedCopy(transcript: string) {
    const result = await this.structuredContent(
      buildValidatedCopyPrompt(transcript),
      validatedCopyJsonSchema as unknown as Record<string, unknown>,
    );
    return validatedCopyAnalysisSchema.parse(result);
  }

  async reviseScenePrompt(context: GenerationContext) {
    const result = await this.structuredContent(
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
    const result = await this.structuredContent(
      buildCopyModulePrompt(context, kind, count),
      copyModuleBatchJsonSchema as unknown as Record<string, unknown>,
    );
    return copyModuleBatchSchema.parse(result);
  }

  async generateScript(context: GenerationContext): Promise<ScriptResult> {
    const safeContext = compactGenerationContext({ ...context, sampled_frame_urls: undefined });
    const data = await this.requestGenerateContent([{ text: buildGenerationInput(safeContext) }], {
      systemInstruction: TIK_SUPREMO_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: sanitizeSchemaForGemini(scriptJsonSchema as Record<string, unknown>),
        maxOutputTokens: 32_768,
      },
    });
    const text = this.getGeneratedText(data, "generateScript");
    if (!text) throw new AIProviderError("A IA não retornou o roteiro.", "invalid_response");
    try {
      const raw = this.safeParseJson(text);
      this.coerceGeminiResult(raw);
      const parsed = scriptResultSchema.parse(raw);
      const veoMismatches = parsed.scenes.filter(
        (scene) => !scene.veo_prompt.includes(scene.spoken_text),
      );
      if (veoMismatches.length > 0) {
        console.warn(
          `[Gemini] ${veoMismatches.length} cena(s) com spoken_text ausente do veo_prompt — aceito assim mesmo.`,
        );
      }
      return parsed;
    } catch (err) {
      console.error(
        "[Gemini] generateScript texto bruto (primeiros 2000 chars):",
        text.slice(0, 2_000),
        "\n\nErro:",
        err,
      );
      throw new AIProviderError(
        "O roteiro gerado pela IA não passou pela validação estruturada.",
        "invalid_response",
      );
    }
  }

  /**
   * Post-processes Gemini JSON output to coerce fields that the model ignores
   * due to stripped schema constraints (minItems, maxItems, minimum, maximum).
   */
  private coerceGeminiResult(raw: Record<string, unknown>): void {
    // hashtags: Gemini doesn't enforce minItems=5/maxItems=5 — normalise to exactly 5
    const hashtags = Array.isArray(raw["hashtags"]) ? (raw["hashtags"] as string[]) : [];
    while (hashtags.length < 5) hashtags.push("#tiktokshop");
    raw["hashtags"] = hashtags.slice(0, 5);

    // scenes: clamp numeric fields that Gemini might violate without min/max constraints
    if (Array.isArray(raw["scenes"])) {
      (raw["scenes"] as Record<string, unknown>[]).forEach((scene, i) => {
        if (typeof scene["scene_number"] !== "number" || scene["scene_number"] < 1) {
          scene["scene_number"] = i + 1;
        }
        scene["duration_seconds"] = 8;
      });
    }
  }

  async analyzeProduct(context: GenerationContext) {
    return { context, delegatedToStructuredGeneration: true };
  }

  async analyzeReferenceCopy(copy: string) {
    return { copyLength: copy.length, delegatedToStructuredGeneration: true };
  }

  async generateVariations(context: GenerationContext, count: number) {
    const results: ScriptResult[] = [];
    for (let index = 0; index < count; index++) {
      results.push(await this.generateScript({ ...context, variation: index + 1 }));
    }
    return results;
  }
}
