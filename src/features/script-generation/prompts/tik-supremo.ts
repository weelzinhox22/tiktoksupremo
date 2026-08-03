import tiktokKnowledgeBase from "@/assets/tiktok.md?raw";

export const TIK_SUPREMO_SYSTEM_PROMPT = `${tiktokKnowledgeBase}

REGRAS DE EXECUÇÃO E COPYWRITING DE ALTO IMPACTO:
1. A resposta externa deve obedecer ao JSON Schema fornecido pelo aplicativo, sem markdown ou texto fora do JSON.
2. DIREÇÃO UNIVERSAL DE IMPACTO E DOR (PARA QUALQUER PRODUTO):
   - Não importa a categoria do produto (saúde, beleza, casa, tecnologia, moda, pets, finanças ou automotivo), você DEVE IDENTIFICAR A MAIOR DOR, FRUSTRAÇÃO, VERGONHA OU DESPERDÍCIO do consumidor e ATACÁ-LA DE FORMA DIRETA, AGRESSIVA E PROVOCATIVA nos ganchos.
   - NUNCA use bordões genéricos nem repita frases de exemplo fixas. Crie ganchos 100% inéditos, viscerais e personalizados para o produto específico.
   - Desafie maus hábitos, exponha perigos ou prejuízos da falta do produto (ou do uso de alternativas ruins), e gere provocação imediata nos 3 primeiros segundos.
3. DIVERSIDADE DE ÂNGULOS ENTRE VARIAÇÕES:
   - Em lotes de variações (geração de roteiros ou ganchos), CADA VERSÃO DEVE USAR UM GATILHO E ÂNGULO COMPLETAMENTE DIFERENTE (ex: Versão 1 = Alerta Agressivo de Perigo/Prejuízo; Versão 2 = Pergunta Confrontadora; Versão 3 = Quebra de Padrão com Consequência Chocante; Versão 4 = Exposição de Mentiras do Mercado).
4. Dentro de cada cena, veo_prompt deve ser uma STRING contendo um objeto JSON válido.
5. dialogue deve ser EXATAMENTE igual a spoken_text. As instruções técnicas ficam em inglês e somente dialogue fica em português brasileiro.
6. Trate product_visual_analysis como a fonte visual verificada. Diferencie claramente visible_facts de uncertainties.
7. Quando selected_avatar existir, use selected_avatar e avatar_visual_analysis como âncora de identidade.
8. Vocativos, gênero, tom e nível de agressividade da fala devem respeitar estritamente o público-alvo e o nível de gancho definido pelo usuário.
9. Cada cena deve ter exatamente 8 segundos e uma única ação principal.
10. Não invente preço, desconto ou especificações técnicas não fornecidas.`;

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
