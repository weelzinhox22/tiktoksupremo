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
  referenceVisualAnalysisSchema,
} from "@/features/products/visual-analysis";
import {
  autoClipResultSchema,
  buildAutoClipPrompt,
  type AutoClipRequest,
} from "@/features/auto-clips/ai-contract";

type GroqChatResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

export class GroqProvider implements AIProvider {
  private key = process.env["GROQ_API_KEY"];
  private model = process.env["GROQ_MODEL"] || "openai/gpt-oss-120b";
  private visionModel = process.env["GROQ_VISION_MODEL"] || "qwen/qwen3.6-27b";
  private transcriptionModel = process.env["GROQ_TRANSCRIPTION_MODEL"] || "whisper-large-v3-turbo";
  private timeout = Number(process.env["AI_TIMEOUT_MS"] || 90000);
  private maxCompletionTokens = Math.min(
    4_096,
    Math.max(512, Number(process.env["GROQ_MAX_COMPLETION_TOKENS"] || 2_048)),
  );

  private requireKey() {
    if (!this.key) {
      throw new AIProviderError(
        "IA não configurada. Defina a chave de API no backend.",
        "not_configured",
      );
    }
    return this.key;
  }

  private async request(path: string, init: RequestInit) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(`https://api.groq.com/openai/v1${path}`, {
        ...init,
        signal: controller.signal,
      });
      if (response.status === 401) {
        throw new AIProviderError("A chave de API foi rejeitada.", "auth");
      }
      if (response.status === 400 && path.includes("audio")) {
        throw new AIProviderError(
          "O serviço de áudio não conseguiu ler este vídeo. Verifique se o arquivo possui fala ou faixa de áudio compatível.",
          "provider",
        );
      }
      if (response.status === 429) {
        throw new AIProviderError(
          "O limite da IA foi atingido. Aguarde e tente novamente.",
          "rate_limit",
        );
      }
      if (response.status === 413) {
        throw new AIProviderError(
          path.includes("audio")
            ? "O vídeo excede o limite de transcrição. Envie um vídeo menor ou use somente a copy."
            : "A solicitação ficou grande demais. Reduza o conteúdo ou os arquivos de referência.",
          "provider",
        );
      }
      if (!response.ok) {
        throw new AIProviderError(`A IA retornou erro ${response.status}.`, "provider");
      }
      return response;
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

  async generateText(prompt: string, temperature = 0.7): Promise<string> {
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature,
        max_completion_tokens: this.maxCompletionTokens,
      }),
    });
    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new AIProviderError("A IA não retornou o texto solicitado.", "invalid_response");
    }
    return text.trim();
  }

  async transcribeMedia(media: Blob, filename: string) {
    const form = new FormData();
    form.append("file", media, filename);
    form.append("model", this.transcriptionModel);
    form.append("response_format", "json");
    const response = await this.request("/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}` },
      body: form,
    });
    const data = (await response.json()) as { text?: unknown };
    if (typeof data.text !== "string") {
      throw new AIProviderError(
        "A transcrição da IA retornou formato inválido.",
        "invalid_response",
      );
    }
    return data.text;
  }

  async transcribeMediaUrl(signedUrl: string) {
    const form = new FormData();
    form.append("url", signedUrl);
    form.append("model", this.transcriptionModel);
    form.append("response_format", "json");
    const response = await this.request("/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${this.requireKey()}` },
      body: form,
    });
    const data = (await response.json()) as { text?: unknown };
    if (typeof data.text !== "string") {
      throw new AIProviderError(
        "A transcrição por URL retornou formato inválido.",
        "invalid_response",
      );
    }
    return data.text;
  }

  private async structuredChat(
    name: string,
    prompt: string,
    schema: Record<string, unknown>,
    maxTokens = this.maxCompletionTokens,
  ) {
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_schema", json_schema: { name, strict: true, schema } },
        temperature: 0.2,
        max_completion_tokens: maxTokens,
      }),
    });
    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text)
      throw new AIProviderError("A IA não retornou a análise solicitada.", "invalid_response");
    try {
      return JSON.parse(text) as unknown;
    } catch {
      throw new AIProviderError("A análise retornou um formato inválido.", "invalid_response");
    }
  }

  async analyzeValidatedCopy(transcript: string) {
    const result = await this.structuredChat(
      "validated_copy_analysis",
      buildValidatedCopyPrompt(transcript),
      validatedCopyJsonSchema as unknown as Record<string, unknown>,
    );
    return validatedCopyAnalysisSchema.parse(result);
  }

  async reviseScenePrompt(context: GenerationContext) {
    const result = await this.structuredChat(
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
    const result = await this.structuredChat(
      `copy_modules_${kind}`,
      buildCopyModulePrompt(context, kind, count),
      copyModuleBatchJsonSchema as unknown as Record<string, unknown>,
      4_096,
    );
    return copyModuleBatchSchema.parse(result);
  }

  async analyzeVideoFrames(frameUrls: string[], transcript: string) {
    if (!frameUrls.length) return { limitations: "Nenhum frame foi disponibilizado." };
    const runAnalysis = async (images: string[]) => {
      const content = [
        {
          type: "text",
          text: `Analise os frames amostrados de um vídeo de TikTok Shop. Considere mudanças de cena, movimentos, câmera, enquadramento, produto, gestos, texto na tela, ritmo visual, elementos a preservar e elementos a modificar para não copiar literalmente. Transcrição: ${transcript.slice(0, 3_000)}. Responda somente JSON conciso.`,
        },
        ...images.map((url) => ({ type: "image_url", image_url: { url } })),
      ];
      const response = await this.request("/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.requireKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.visionModel,
          messages: [{ role: "user", content }],
          response_format: { type: "json_object" },
          temperature: 0.2,
          max_completion_tokens: 800,
        }),
      });
      const data = (await response.json()) as GroqChatResponse;
      const text = data.choices?.[0]?.message?.content;
      if (!text)
        throw new AIProviderError(
          "A análise visual da IA não retornou conteúdo.",
          "invalid_response",
        );
      try {
        return JSON.parse(text) as Record<string, unknown>;
      } catch {
        throw new AIProviderError(
          "A análise visual da IA retornou JSON inválido.",
          "invalid_response",
        );
      }
    };

    try {
      return await runAnalysis(frameUrls.slice(0, 2));
    } catch (error) {
      if (error instanceof AIProviderError && error.message.includes("grande demais")) {
        try {
          return await runAnalysis(frameUrls.slice(0, 1));
        } catch {
          return {
            limitations:
              "Os frames excederam o limite visual; o roteiro foi criado com a transcrição e os dados do produto.",
          };
        }
      }
      throw error;
    }
  }

  async analyzeAutoClips(request: AutoClipRequest) {
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildAutoClipPrompt(request) },
              ...request.videos.map((video) => ({
                type: "image_url",
                image_url: { url: video.contactSheet },
              })),
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_completion_tokens: 2_500,
      }),
    });
    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new AIProviderError("A IA não retornou uma seleção de cortes.", "invalid_response");
    }
    try {
      return autoClipResultSchema.parse(JSON.parse(text));
    } catch {
      throw new AIProviderError(
        "A seleção de cortes retornou um formato inválido.",
        "invalid_response",
      );
    }
  }

  async analyzeReferenceImages(
    imageUrls: string[],
    referenceType: "product" | "avatar",
    context: GenerationContext,
  ) {
    if (!imageUrls.length)
      throw new AIProviderError("Nenhuma imagem foi enviada para análise.", "provider");
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.visionModel,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: buildReferenceVisualAnalysisPrompt(referenceType, context) },
              ...imageUrls.slice(0, 4).map((url) => ({
                type: "image_url",
                image_url: { url },
              })),
            ],
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
        max_completion_tokens: 2_000,
      }),
    });
    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new AIProviderError("A IA não analisou a imagem.", "invalid_response");
    try {
      return referenceVisualAnalysisSchema.parse(JSON.parse(text));
    } catch {
      throw new AIProviderError("A análise visual retornou formato inválido.", "invalid_response");
    }
  }

  async generateScript(context: GenerationContext): Promise<ScriptResult> {
    const safeContext = compactGenerationContext({
      ...context,
      sampled_frame_urls: undefined,
    });
    const response = await this.request("/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.requireKey()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: "system", content: TIK_SUPREMO_SYSTEM_PROMPT },
          { role: "user", content: buildGenerationInput(safeContext) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "tik_supremo_script",
            strict: true,
            schema: scriptJsonSchema,
          },
        },
        temperature: 1,
        top_p: 1,
        reasoning_effort: "medium",
        max_completion_tokens: this.maxCompletionTokens,
      }),
    });
    const data = (await response.json()) as GroqChatResponse;
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new AIProviderError("A IA não retornou o roteiro.", "invalid_response");
    try {
      const parsed = scriptResultSchema.parse(JSON.parse(text));
      if (parsed.scenes.some((scene) => !scene.veo_prompt.includes(scene.spoken_text))) {
        throw new Error("O prompt Veo alterou ou omitiu o texto falado.");
      }
      return parsed;
    } catch {
      throw new AIProviderError(
        "O roteiro não passou pela validação de segurança.",
        "invalid_response",
      );
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
