import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const requestSchema = z.object({
  product: z.string().trim().min(2).max(300),
  productDetails: z.string().trim().max(4_000).default(""),
  audience: z.string().trim().min(2).max(1_000),
  offer: z.string().trim().min(2).max(1_000),
  quantity: z.number().int().min(1).max(30),
  dailyObjective: z.enum(["sales", "clicks", "followers", "test"]),
  targetDuration: z.number().int().min(8).max(90),
  tone: z.string().trim().max(300).default("UGC natural e direto"),
  constraints: z.string().trim().max(2_000).default(""),
  opportunitySignals: z.array(z.string().trim().max(500)).max(30).default([]),
  availableMedia: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        tags: z.array(z.string()),
        description: z.string(),
        duration: z.number(),
        orientation: z.string(),
        useCount: z.number(),
      }),
    )
    .max(300)
    .default([]),
});

const sceneSchema = z.object({
  scene: z.number().int().positive(),
  purpose: z.string(),
  narration: z.string(),
  visual: z.string(),
  brollQuery: z.string(),
  duration: z.number().positive(),
});

const videoSchema = z.object({
  title: z.string(),
  variationPurpose: z.enum([
    "aggressive",
    "emotional",
    "demonstrative",
    "price",
    "social-proof",
    "short-retention",
    "long-explanation",
  ]),
  hook: z.string(),
  body: z.string(),
  cta: z.string(),
  duration: z.number().min(8).max(90),
  caption: z.string(),
  hashtags: z.array(z.string()).min(3).max(8),
  storyboard: z.array(sceneSchema).min(3).max(12),
  mediaIds: z.array(z.string()),
  missingShots: z.array(z.string()),
  audit: z.array(z.string()),
});

const responseSchema = z.object({
  strategySummary: z.string(),
  productionNotes: z.array(z.string()),
  videos: z.array(videoSchema),
});

export type ProductionAgentResult = z.infer<typeof responseSchema>;

export const getProductionAgentStatus = createServerFn({ method: "GET" }).handler(async () => {
  await requireUser();
  return {
    aiConfigured: Boolean(
      process.env["GEMINI_API_KEY"] || process.env["GROQ_API_KEY"] || process.env["OPENAI_API_KEY"],
    ),
    provider: process.env["AI_PROVIDER"] ?? "auto",
  };
});

async function requireUser() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const { data } = await (await getSupabaseServerClient()).auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
}

function extractJson(value: string) {
  const fenced = value.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const source = fenced ?? value;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("A IA não retornou um plano estruturado.");
  return JSON.parse(source.slice(start, end + 1)) as unknown;
}

export const runProductionAgent = createServerFn({ method: "POST" })
  .validator((input: unknown) => requestSchema.parse(input))
  .handler(async ({ data }) => {
    await requireUser();
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();
    const purposes = [
      "aggressive",
      "emotional",
      "demonstrative",
      "price",
      "social-proof",
      "short-retention",
      "long-explanation",
    ];
    const prompt = `Você é um diretor de performance e editor de vídeos verticais. Crie um plano executável em JSON puro.

PRODUTO: ${data.product}
DETALHES REAIS INFORMADOS: ${data.productDetails || "não informados; não invente especificações"}
PÚBLICO: ${data.audience}
OFERTA: ${data.offer}
OBJETIVO: ${data.dailyObjective}
QUANTIDADE EXATA: ${data.quantity}
DURAÇÃO BASE: ${data.targetDuration}s
TOM: ${data.tone}
RESTRIÇÕES: ${data.constraints || "nenhuma"}
SINAIS REAIS DO RADAR: ${data.opportunitySignals.join(" | ") || "nenhum"}
MÍDIAS DISPONÍVEIS: ${JSON.stringify(data.availableMedia)}

Distribua os vídeos entre estes propósitos: ${purposes.join(", ")}. Não invente prova, preço, avaliação ou resultado. Para cada vídeo, crie hook, body, CTA, caption, 3-8 hashtags, storyboard com duração por cena, consulta de B-roll em linguagem natural, IDs de mídias realmente compatíveis, tomadas faltantes e auditoria de riscos. A soma aproximada das cenas deve bater com a duração.

Formato obrigatório:
{"strategySummary":"...","productionNotes":["..."],"videos":[{"title":"...","variationPurpose":"aggressive","hook":"...","body":"...","cta":"...","duration":20,"caption":"...","hashtags":["#..."],"storyboard":[{"scene":1,"purpose":"gancho","narration":"...","visual":"...","brollQuery":"...","duration":3}],"mediaIds":["id existente"],"missingShots":["..."],"audit":["..."]}]}`;
    const raw = await provider.generateText(prompt, 0.55);
    const parsed = responseSchema.parse(extractJson(raw));
    if (parsed.videos.length !== data.quantity) {
      throw new Error(
        `A IA criou ${parsed.videos.length} vídeos, mas eram necessários ${data.quantity}. Tente novamente.`,
      );
    }
    const allowedMedia = new Set(data.availableMedia.map((item) => item.id));
    return {
      ...parsed,
      videos: parsed.videos.map((video) => ({
        ...video,
        mediaIds: video.mediaIds.filter((id) => allowedMedia.has(id)),
      })),
    };
  });
