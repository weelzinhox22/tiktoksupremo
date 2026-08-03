import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestSchema = z.object({ productName: z.string().min(2).max(300) });

export interface ProductSuggestions {
  description: string;
  benefits: string[];
  problems: string[];
  objections: string[];
  audience: string;
  category: string;
}

export const suggestProductFields = createServerFn({ method: "POST" })
  .validator(requestSchema)
  .handler(async ({ data }) => {
    // Use the same GeminiProvider (with exact model fallback) used for script generation
    const { GeminiProvider } = await import("@/lib/ai/gemini");
    const provider = new GeminiProvider();
    return provider.suggestProductFields(data.productName);
  });
