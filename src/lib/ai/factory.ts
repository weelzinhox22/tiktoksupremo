import type { AIProvider } from "./provider";
import { AIProviderError } from "./provider";
import { GroqProvider } from "./groq";
import { GeminiProvider } from "./gemini";
import { OpenAIProvider } from "./openai";

export type AIProviderName = "gemini" | "groq" | "openai";

export function getAIProvider(): { name: AIProviderName; provider: AIProvider } {
  const configured = process.env["AI_PROVIDER"]?.toLowerCase();
  if (configured === "gemini") return { name: "gemini", provider: new GeminiProvider() };
  if (configured === "groq") return { name: "groq", provider: new GroqProvider() };
  if (configured === "openai") return { name: "openai", provider: new OpenAIProvider() };
  if (process.env["GEMINI_API_KEY"]) return { name: "gemini", provider: new GeminiProvider() };
  if (process.env["GROQ_API_KEY"]) return { name: "groq", provider: new GroqProvider() };
  if (process.env["OPENAI_API_KEY"]) return { name: "openai", provider: new OpenAIProvider() };
  throw new AIProviderError(
    "IA não configurada. Defina a chave de API no backend.",
    "not_configured",
  );
}
