import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { CopyAnalysis, CopySegment, CopyVersion } from "./types";
import { calculateSimilarityRisk, estimateSpeechDuration } from "./services";

// ─── Input Schemas ────────────────────────────────────────────────────────────

const analyzeCopyInputSchema = z.object({
  text: z.string().min(10),
  product: z.string().optional(),
  audience: z.string().optional(),
});

const transformCopyInputSchema = z.object({
  projectId: z.string(),
  originalCopy: z.string(),
  modes: z.array(z.string()),
  newProduct: z.string().optional(),
  newAudience: z.string().optional(),
  pains: z.string().optional(),
  desires: z.string().optional(),
  objections: z.string().optional(),
  offer: z.string().optional(),
  cta: z.string().optional(),
  duration: z.number().default(30),
  variationCount: z.number().default(1),
  tone: z.string().default("natural"),
  characterName: z.string().optional(),
  scenarioName: z.string().optional(),
  forbiddenWords: z.string().optional(),
});

// ─── 1. ANALYZE COPY (SERVER FN) ──────────────────────────────────────────────

export const analyzeCopyServerFn = createServerFn({ method: "POST" })
  .validator(analyzeCopyInputSchema)
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const prompt = `Analise a seguinte copy comercial de vídeo do TikTok Shop e decomponha a sua estrutura persuasiva em JSON estruturado.

TEXTO DA COPY ORIGINAL:
"""
${data.text}
"""
PRODUTO INFORMADO: ${data.product || "Não especificado"}
PÚBLICO INFORMADO: ${data.audience || "Não especificado"}

Retorne estritamente um JSON no seguinte formato:
{
  "audience": "público-alvo identificado",
  "tone": ["tom 1", "tom 2"],
  "persuasionStructure": ["Gancho de curiosidade", "Apresentação de dor", "Demonstração do produto", "CTA com escassez"],
  "strengths": ["Ponto forte 1"],
  "weaknesses": ["Ponto fraco 1"],
  "sensitiveClaims": [],
  "complianceWarnings": [],
  "segments": [
    {
      "type": "hook | context | pain | desire | product | benefit | feature | demonstration | proof | objection | urgency | scarcity | offer | cta | other",
      "text": "trecho exato da copy"
    }
  ]
}`;

    try {
      let responseText = "";
      const p = provider as unknown as Record<string, (opts: unknown) => Promise<string>>;
      if (typeof p["generateText"] === "function") {
        responseText = await p["generateText"]({ prompt, temperature: 0.2 });
      } else {
        const res = await provider.analyzeReferenceCopy(data.text);
        responseText = JSON.stringify(res);
      }

      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      const rawSegments = Array.isArray(parsed["segments"]) ? parsed["segments"] : [];
      const segments: CopySegment[] = rawSegments.map((seg, idx) => {
        const item = seg as Record<string, string>;
        return {
          id: `seg-${idx + 1}`,
          type: (item["type"] as CopySegment["type"]) || "context",
          text: item["text"] || "",
        };
      });

      if (segments.length === 0) {
        throw new Error("Segments empty");
      }

      return {
        segments,
        audience: typeof parsed["audience"] === "string" ? parsed["audience"] : "Público geral do TikTok",
        tone: Array.isArray(parsed["tone"]) ? (parsed["tone"] as string[]) : ["Informal"],
        persuasionStructure: Array.isArray(parsed["persuasionStructure"])
          ? (parsed["persuasionStructure"] as string[])
          : ["Gancho", "Apresentação", "CTA"],
        strengths: Array.isArray(parsed["strengths"]) ? (parsed["strengths"] as string[]) : ["Foco direto no produto."],
        weaknesses: Array.isArray(parsed["weaknesses"]) ? (parsed["weaknesses"] as string[]) : [],
        sensitiveClaims: Array.isArray(parsed["sensitiveClaims"]) ? (parsed["sensitiveClaims"] as string[]) : [],
        complianceWarnings: Array.isArray(parsed["complianceWarnings"]) ? (parsed["complianceWarnings"] as string[]) : [],
      } satisfies CopyAnalysis;
    } catch {
      // Fallback heurístico em caso de falha de parsing de IA
      const lines = data.text.split(/\n+/).filter(Boolean);
      const segments: CopySegment[] = lines.map((line, idx) => ({
        id: `seg-${idx + 1}`,
        type: idx === 0 ? "hook" : idx === lines.length - 1 ? "cta" : "benefit",
        text: line.trim(),
      }));

      return {
        segments,
        audience: data.audience || "Público do TikTok Shop",
        tone: ["Natural", "Direto"],
        persuasionStructure: ["Gancho inicial", "Desenvolvimento", "Chamada para Ação"],
        strengths: ["Leitura fluida e direta."],
        weaknesses: [],
        sensitiveClaims: [],
        complianceWarnings: [],
      };
    }
  });

// ─── 2. TRANSFORM COPY (SERVER FN) ────────────────────────────────────────────

export const transformCopyServerFn = createServerFn({ method: "POST" })
  .validator(transformCopyInputSchema)
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const prompt = `Você é o TIK SUPREMO, especialista em copies virais do TikTok Shop.
Transforme a copy original em ${data.variationCount} nova(s) versão(ões) sem copiar o texto literalmente.

COPY ORIGINAL DE REFERÊNCIA:
"""
${data.originalCopy}
"""

PARÂMETROS DE TRANSFORMAÇÃO:
- Modos solicitados: ${data.modes.join(", ")}
- Novo produto: ${data.newProduct || "Mesmo da referência"}
- Novo público: ${data.newAudience || "Mesmo da referência"}
- Tom de voz: ${data.tone}
${data.characterName ? `- Personagem: ${data.characterName}` : ""}
${data.scenarioName ? `- Cenário: ${data.scenarioName}` : ""}

Retorne estritamente um JSON no formato:
{
  "versions": [
    {
      "name": "Versão 1 — Foco em Curiosidade",
      "strategy": "Explora o gancho de quebra de padrão com demonstração direta",
      "content": "texto completo da nova copy",
      "segments": [
        { "type": "hook", "text": "trecho do gancho" },
        { "type": "benefit", "text": "trecho do benefício" },
        { "type": "cta", "text": "trecho do cta" }
      ]
    }
  ]
}`;

    try {
      let responseText = "";
      const p = provider as unknown as Record<string, (opts: unknown) => Promise<string>>;
      if (typeof p["generateText"] === "function") {
        responseText = await p["generateText"]({ prompt, temperature: 0.7 });
      } else {
        const res = await provider.analyzeReferenceCopy(data.originalCopy);
        responseText = JSON.stringify(res);
      }

      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      const rawVersions = Array.isArray(parsed["versions"]) ? parsed["versions"] : [];
      if (rawVersions.length === 0) throw new Error("No versions");

      const versions: CopyVersion[] = rawVersions.map((v, idx) => {
        const item = v as Record<string, unknown>;
        const content = typeof item["content"] === "string" ? item["content"] : "";
        const sim = calculateSimilarityRisk(data.originalCopy, content);
        const est = estimateSpeechDuration(content, "natural");

        const rawSegs = Array.isArray(item["segments"]) ? item["segments"] : [];
        const segments: CopySegment[] = rawSegs.map((s, sIdx) => {
          const segItem = s as Record<string, string>;
          return {
            id: `v-seg-${idx}-${sIdx}`,
            type: (segItem["type"] as CopySegment["type"]) || "context",
            text: segItem["text"] || "",
          };
        });

        return {
          id: `ver-${Date.now()}-${idx + 1}`,
          projectId: data.projectId,
          name: (item["name"] as string) || `Variação ${idx + 1}`,
          content,
          segments,
          strategy: (item["strategy"] as string) || "Modelagem de estrutura persuasiva",
          estimatedDurationSeconds: est.estimatedDurationSeconds,
          similarityRisk: sim.risk,
          similarityReasons: sim.reasons,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return versions;
    } catch {
      // Fallback gracioso
      const fallbackContent = `Gente, por favor não me diga que você ainda tá usando a versão antiga. Dá uma olhada nessa transformação do ${data.newProduct || "nosso produto"}. O link com desconto tá bem aqui no carrinho!`;
      const sim = calculateSimilarityRisk(data.originalCopy, fallbackContent);

      const versions: CopyVersion[] = [
        {
          id: `ver-${Date.now()}-1`,
          projectId: data.projectId,
          name: "Variação 1 — Curiosidade e Recomendação",
          content: fallbackContent,
          segments: [
            { id: "s1", type: "hook", text: "Gente, por favor não me diga que você ainda tá usando a versão antiga." },
            { id: "s2", type: "demonstration", text: `Dá uma olhada nessa transformação do ${data.newProduct || "nosso produto"}.` },
            { id: "s3", type: "cta", text: "O link com desconto tá bem aqui no carrinho!" },
          ],
          strategy: "Gancho de curiosidade com chamada direta ao carrinho",
          estimatedDurationSeconds: 14,
          similarityRisk: sim.risk,
          similarityReasons: sim.reasons,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      return versions;
    }
  });
