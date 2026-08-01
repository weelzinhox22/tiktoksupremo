export const validatedCopyJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["hook", "body", "cta", "markings", "why_it_worked", "audience", "tone"],
  properties: {
    hook: { type: "string" },
    body: { type: "string" },
    cta: { type: "string" },
    markings: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "excerpt"],
        properties: {
          label: { type: "string", enum: ["Gancho", "Corpo", "CTA"] },
          excerpt: { type: "string" },
        },
      },
    },
    why_it_worked: { type: "array", items: { type: "string" } },
    audience: { type: "string" },
    tone: { type: "string" },
  },
} as const;

export const sceneRevisionJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["spoken_text", "speech_direction", "character_direction", "veo_prompt"],
  properties: {
    spoken_text: { type: "string" },
    speech_direction: { type: "string" },
    character_direction: { type: "string" },
    veo_prompt: { type: "string" },
  },
} as const;

export function buildValidatedCopyPrompt(transcript: string) {
  return `Analise esta copy validada, transcrita de um vídeo. Preserve o texto original e identifique com precisão o gancho, o corpo e o CTA. Explique em pontos objetivos por que a copy provavelmente funcionou, sem inventar métricas, resultados ou fatos que não estejam no texto. Em markings, devolva trechos literais da transcrição classificados como Gancho, Corpo ou CTA.\n\nTRANSCRIÇÃO:\n${transcript}`;
}

export function buildSceneRevisionPrompt(context: Record<string, unknown>) {
  return `Revise uma cena e seu prompt Google VEO conforme a instrução do usuário. Corrija inconsistências de público, gênero, vocativo, personagem, produto e tom. A instrução do usuário tem prioridade. Preserve o formato estruturado do prompt VEO e mantenha DIALOGUE exatamente igual a spoken_text. Não altere fatos do produto e não inclua explicações fora do JSON.\n\nDADOS:\n${JSON.stringify(context)}`;
}
