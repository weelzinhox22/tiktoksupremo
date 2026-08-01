import tiktokKnowledgeBase from "@/assets/tiktok.md?raw";

export const TIK_SUPREMO_SYSTEM_PROMPT = `${tiktokKnowledgeBase}

REGRAS DE EXECUÇÃO DO APLICATIVO:
1. A resposta externa deve obedecer ao JSON Schema fornecido pelo aplicativo, sem markdown ou texto fora do JSON.
2. Dentro de cada cena, veo_prompt deve ser uma STRING contendo um objeto JSON válido. Não use o antigo formato de seções soltas.
3. O JSON de veo_prompt deve conter, no mínimo: version, aspect_ratio, duration_seconds, format, reference_lock, style, character, environment, product, camera, hands, movement, voice, dialogue, screen e negative_prompt.
4. dialogue deve ser EXATAMENTE igual a spoken_text. As instruções técnicas ficam em inglês e somente dialogue fica em português brasileiro.
5. Trate product_visual_analysis como a fonte visual verificada. Diferencie claramente visible_facts de uncertainties. Nunca transforme uma incerteza visual em fato.
6. Quando selected_avatar existir, use selected_avatar e avatar_visual_analysis como âncora de identidade. Preserve rosto, cabelo, tom de pele, proporções corporais e sinais distintivos em todas as cenas e instrua o VEO a usar a imagem enviada como referência.
7. Quando selected_movements existir, use prompt_instruction e movement_json como biblioteca de direção. Priorize um movimento principal por cena e alterne os movimentos entre versões.
8. Para roupas, calçados e acessórios, use o protocolo FASHION MOTION da base de conhecimento: identidade e peça bloqueadas, anatomia natural, tecido com física realista, poses suaves e enquadramento que mantenha o produto visível.
9. Nunca presuma que o público é feminino. Vocativos, gênero, personagem e linguagem devem seguir o público-alvo e a direção criativa.
10. Cada cena deve ter exatamente 8 segundos e uma única ação principal. settings.scene_count define a quantidade; o padrão é 4 cenas.
11. copy_library_examples servem para estrutura, ritmo, dor, emoção e CTA. Crie texto novo e não copie trechos literalmente.
12. Não invente preço, desconto, estoque, vendas, composição, benefícios médicos, resultados ou garantias.
13. Se uma foto de produto ou avatar estiver disponível, sua análise visual deve aparecer nas regras de preservação do veo_prompt.
14. Em lotes, generation_variant_number identifica a versão atual. Cada nova versão deve mudar de verdade o gancho, o ângulo de venda, o desenvolvimento, a sequência visual e o CTA, sem mudar os fatos visuais do produto nem a identidade do avatar.`;

export function buildGenerationInput(data: unknown) {
  return `Crie o roteiro e os prompts VEO obedecendo integralmente à base TIK SUPREMO. Retorne o objeto externo conforme o schema e escreva cada veo_prompt como uma string JSON válida, pronta para copiar no VEO. Dados verificados do produto, avatar, referências e projeto:\n${JSON.stringify(data)}`;
}

const MAX_REFERENCE_CHARS = 4_000;
const MAX_FIELD_CHARS = 2_000;

function compactText(value: string, limit: number) {
  if (value.length <= limit) return value;
  const half = Math.floor((limit - 90) / 2);
  return `${value.slice(0, half)}\n[trecho intermediário omitido para respeitar o limite da IA]\n${value.slice(-half)}`;
}

/** Mantém os fatos relevantes sem enviar entradas ilimitadas ao provedor. */
export function compactGenerationContext(data: Record<string, unknown>) {
  const visit = (value: unknown, key = "", depth = 0): unknown => {
    if (depth > 6) return "[conteúdo aninhado omitido]";
    if (typeof value === "string") {
      const isReference = key === "copy" || key === "transcript";
      return compactText(value, isReference ? MAX_REFERENCE_CHARS : MAX_FIELD_CHARS);
    }
    if (Array.isArray(value)) return value.slice(0, 20).map((item) => visit(item, key, depth + 1));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
          childKey,
          visit(childValue, childKey, depth + 1),
        ]),
      );
    }
    return value;
  };

  return visit(data) as Record<string, unknown>;
}
