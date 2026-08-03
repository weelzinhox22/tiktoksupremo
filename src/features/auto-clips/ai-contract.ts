import { z } from "zod";

export const autoClipSampleSchema = z.object({
  id: z.string().min(1).max(80),
  time: z.number().min(0).max(21_600),
  brightness: z.number().min(0).max(1),
  contrast: z.number().min(0).max(1),
  sharpness: z.number().min(0).max(1),
  motion: z.number().min(0).max(1),
  quality: z.number().min(0).max(1),
});

export const autoClipVideoSchema = z.object({
  id: z.string().min(1).max(80),
  name: z.string().min(1).max(240),
  duration: z.number().positive().max(21_600),
  width: z.number().int().positive().max(16_384),
  height: z.number().int().positive().max(16_384),
  contactSheet: z
    .string()
    .max(1_500_000)
    .refine((value) => /^data:image\/(?:jpeg|png|webp);base64,/.test(value), {
      message: "A amostra visual enviada é inválida.",
    }),
  samples: z.array(autoClipSampleSchema).min(4).max(12),
});

export const autoClipRequestSchema = z.object({
  videos: z.array(autoClipVideoSchema).min(1).max(6),
  targetDuration: z.number().int().min(10).max(90),
  pacing: z.enum(["energetic", "balanced", "story"]),
});

export const autoClipSchema = z.object({
  videoId: z.string().min(1).max(80),
  start: z.number().min(0),
  end: z.number().positive(),
  score: z.number().min(0).max(100),
  label: z.string().min(1).max(80),
  reason: z.string().min(1).max(280),
});

export const autoClipResultSchema = z.object({
  projectTitle: z.string().min(1).max(120),
  rationale: z.string().min(1).max(600),
  clips: z.array(autoClipSchema).min(1).max(16),
});

export type AutoClipRequest = z.infer<typeof autoClipRequestSchema>;
export type AutoClipResult = z.infer<typeof autoClipResultSchema>;

export const autoClipJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["projectTitle", "rationale", "clips"],
  properties: {
    projectTitle: { type: "string" },
    rationale: { type: "string" },
    clips: {
      type: "array",
      minItems: 1,
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["videoId", "start", "end", "score", "label", "reason"],
        properties: {
          videoId: { type: "string" },
          start: { type: "number" },
          end: { type: "number" },
          score: { type: "number" },
          label: { type: "string" },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

const pacingDescription: Record<AutoClipRequest["pacing"], string> = {
  energetic: "ritmo enérgico, cortes de 1,5 a 3,5 segundos e mudanças visuais frequentes",
  balanced: "ritmo equilibrado, cortes de 2,5 a 5 segundos e boa legibilidade visual",
  story: "ritmo narrativo, cortes de 3,5 a 7 segundos e continuidade de ações",
};

export function buildAutoClipPrompt(request: AutoClipRequest) {
  const metadata = request.videos.map((video, index) => ({
    contact_sheet_order: index + 1,
    video_id: video.id,
    filename: video.name,
    duration_seconds: Number(video.duration.toFixed(2)),
    dimensions: `${video.width}x${video.height}`,
    frames: video.samples.map((sample) => ({
      frame_id: sample.id,
      time_seconds: Number(sample.time.toFixed(2)),
      brightness: Number(sample.brightness.toFixed(2)),
      contrast: Number(sample.contrast.toFixed(2)),
      sharpness: Number(sample.sharpness.toFixed(2)),
      motion: Number(sample.motion.toFixed(2)),
      technical_quality: Number(sample.quality.toFixed(2)),
    })),
  }));

  return `Você é um diretor e editor sênior de vídeos virais especialista em "Match Cuts" e continuidade visual para TikTok, Reels e Shorts.

REGRAS OBRIGATÓRIAS DE CONTINUIDADE E "MATCH CUT" (TÉCNICA DE FRAME PARECIDO):
1. MATCH CUT / FRAME PARECIDO: Toda vez que mudar de um corte (N-1) para o próximo corte (N), o ponto de início (start) do corte N DEVE ter um frame o mais parecido possível com o frame final do corte N-1 em termos de enquadramento, iluminação, paleta de cores ou direção de movimento. Mesmo que os vídeos venham de arquivos/fontes diferentes, o próximo vídeo DEVE dar a impressão visual de ser a continuação imediata da mesma tomada!
2. NARRATIVA E FLUXO NATURAL: Não gere cortes aleatórios. Monte uma sequência fluida: Gancho forte -> Desenvolvimento com continuidade de cena -> Conclusão/CTA.
3. EXPLICAÇÃO DA CONEXÃO: No campo "reason", você DEVE explicar em português como o início deste corte se conecta visualmente (frame parecido, mesma iluminação, ação continuada) com o final do corte anterior.

ESPECIFICAÇÕES TÉCNICAS:
- Duração alvo da timeline: ${request.targetDuration} segundos.
- Direção de ritmo: ${pacingDescription[request.pacing]}.
- Escolha inícios (start) e finais (end) precisos, próximos dos quadros analisados.
- Cada corte deve durar entre 1,2 e 8 segundos.
- Evite trechos repetidos, telas pretas ou vazias e cortes no meio de falas ou ações principais.
- Retorne apenas o JSON exigido (projectTitle, rationale, clips).

Metadados e quadros analisados:
${JSON.stringify(metadata)}`;
}
