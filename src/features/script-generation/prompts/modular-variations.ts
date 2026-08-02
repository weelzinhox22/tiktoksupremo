import tiktokKnowledgeBase from "@/assets/tiktok.md?raw";

export const copyModuleBatchJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["kind", "modules"],
  properties: {
    kind: { type: "string", enum: ["hook", "body", "cta"] },
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "strategy", "scenes"],
        properties: {
          title: { type: "string" },
          strategy: { type: "string" },
          scenes: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["spoken_text", "veo_prompt"],
              properties: {
                spoken_text: { type: "string" },
                veo_prompt: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
} as const;

export function buildCopyModulePrompt(
  context: Record<string, unknown>,
  kind: "hook" | "body" | "cta",
  count: number,
) {
  const sceneCount = kind === "body" ? 2 : 1;
  const role = kind === "hook" ? "GANCHO" : kind === "body" ? "CORPO" : "CTA";
  return `BASE DE CONHECIMENTO TIK SUPREMO:
${tiktokKnowledgeBase}

TAREFA:
Crie exatamente ${count} módulos diferentes de ${role} para um sistema modular de vídeos TikTok Shop. Cada módulo de ${role} deve conter exatamente ${sceneCount} cena(s), e cada cena deve durar exatamente 8 segundos. Cada combinação final terá 1 gancho + 2 cenas de corpo + 1 CTA, totalizando 4 cenas.

CONTRATO DE CONTINUIDADE OBRIGATÓRIO:
- A fala final precisa soar como um único roteiro ininterrupto nesta ordem exata: GANCHO 1 → CORPO 1 → CORPO 2 → CTA 1.
- Não escreva módulos isolados. Todos os módulos desta etapa devem continuar naturalmente os módulos já presentes em generated_hook_modules e generated_body_modules no CONTEXTO.
- Preserve o mesmo nome do produto, pessoa gramatical, dor, benefício central, tom e linha de raciocínio do começo ao fim.
- A primeira fala do corpo deve responder ou desenvolver a promessa do gancho. A segunda fala do corpo deve completar a primeira, sem trocar de assunto. O CTA deve concluir o benefício apresentado e trazer apenas uma ação clara.
- Evite começar com pronomes ou conectivos sem antecedente compreensível, como “isso”, “ele”, “ela”, “por isso”, “aí” ou “como eu falei”.
- Não introduza no CTA um benefício, desconto ou assunto que não apareceu antes.
- Leia mentalmente cada combinação como quatro falas seguidas e corrija qualquer salto lógico antes de devolver o JSON.

Obedeça rigorosamente às configurações de formato UGC ou POV, personagem, cenário, roupa, aparência, energia, velocidade de voz, mão, interação com frasco, continuidade, câmera e tela. Em POV, a câmera representa os olhos/mãos da pessoa e não deve mostrar um creator falando para a câmera. Em UGC, o creator aparece e fala diretamente com naturalidade.

Cada módulo precisa usar uma estratégia, texto falado e construção visual diferentes. Aprenda o linguajar das referências, mas não copie frases literalmente. Não invente preço, desconto, estoque, composição, venda, benefício médico ou promessa proibida. Use somente dados confirmados do produto.

Quando selected_movements estiver presente, distribua esses movimentos entre os módulos. Use prompt_instruction e movement_json como direção obrigatória, sem misturar ações incompatíveis na mesma cena. Varie também a linguagem corporal para que os vídeos não pareçam duplicados.

veo_prompt deve ser uma STRING contendo JSON válido com as chaves version, aspect_ratio, duration_seconds, format, reference_lock, style, character, environment, product, camera, hands, movement, voice, dialogue, screen e negative_prompt. dialogue deve ser exatamente igual a spoken_text. Para moda, preserve identidade, roupa, estampa, acessórios e cenário e use movimentos naturais de fashion showcase. Use product_visual_analysis e avatar_visual_analysis como fatos visuais verificados.

Retorne somente o JSON solicitado. kind deve ser "${kind}".

CONTEXTO:
${JSON.stringify(context)}`;
}
