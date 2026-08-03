import type {
  CopyModuleBatch,
  SceneRevision,
  ScriptResult,
  ValidatedCopyAnalysis,
} from "@/features/script-generation/schemas";
import type { ReferenceVisualAnalysis } from "@/features/products/visual-analysis";

export type GenerationContext = Record<string, unknown>;
export interface AIProvider {
  generateText(prompt: string, temperature?: number): Promise<string>;
  transcribeMedia(media: Blob, filename: string): Promise<string>;
  transcribeMediaUrl?(signedUrl: string): Promise<string>;
  analyzeVideoFrames(frameUrls: string[], transcript: string): Promise<Record<string, unknown>>;
  analyzeReferenceImages(
    imageUrls: string[],
    referenceType: "product" | "avatar",
    context: GenerationContext,
  ): Promise<ReferenceVisualAnalysis>;
  analyzeProduct(context: GenerationContext): Promise<Record<string, unknown>>;
  analyzeReferenceCopy(copy: string): Promise<Record<string, unknown>>;
  analyzeValidatedCopy(transcript: string): Promise<ValidatedCopyAnalysis>;
  reviseScenePrompt(context: GenerationContext): Promise<SceneRevision>;
  generateCopyModules(
    context: GenerationContext,
    kind: "hook" | "body" | "cta",
    count: number,
  ): Promise<CopyModuleBatch>;
  generateScript(context: GenerationContext): Promise<ScriptResult>;
  generateVariations(context: GenerationContext, count: number): Promise<ScriptResult[]>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      "not_configured" | "auth" | "rate_limit" | "timeout" | "invalid_response" | "provider",
  ) {
    super(message);
  }
}
