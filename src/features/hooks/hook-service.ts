import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface GeneratedHook {
  id: string;
  spokenText: string;
  visualAction: string;
  psychologicalTrigger: string;
  styleName: string;
  retentionScore: number;
}

const generateHooksInputSchema = z.object({
  productName: z.string().min(2),
  niche: z.string().optional(),
  mainPain: z.string().optional(),
  style: z.string().default("all"),
  count: z.number().default(5),
});

export const generateHooksServerFn = createServerFn({ method: "POST" })
  .validator(generateHooksInputSchema)
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const styleInstructions =
      data.style !== "all"
        ? `Foque predominantemente no estilo de gancho: "${data.style}".`
        : "Varie os estilos entre: Quebra de Padrão, Segredo/Revelação, Pergunta Provocativa, Antes vs Depois, Alerta de Erro e Achadinho.";

    const prompt = `Você é o TIK SUPREMO, especialista número 1 em retenção de ganchos nos 3 primeiros segundos para vídeos virais de TikTok Shop e VSLs no Brasil.

SUA MISSÃO:
Gerar exatamente ${data.count} ganchos 100% INÉDITOS, variados e de altíssimo impacto para o seguinte produto:

DADOS DO PRODUTO:
- Nome do Produto: "${data.productName}"
${data.niche ? `- Nicho / Categoria: "${data.niche}"` : ""}
${data.mainPain ? `- Principal Dor ou Desejo que Resolve: "${data.mainPain}"` : ""}

DIRETRIZES OBRIGATÓRIAS DE COPYWRITING & RETENÇÃO:
1. IMPACTO DIRETO NA DOR (PARA QUALQUER CATEGORIA DE PRODUTO):
   - Não importa o tipo de produto (saúde, estética, ferramentas, moda, eletrônicos, casa ou pets), você DEVE IDENTIFICAR A PIOR DOR, VERGONHA, PREJUÍZO OU FRUSTRAÇÃO DO CONSUMIDOR e atacá-la sem rodeios nem linguagem morna no 1º segundo.
   - Confrontar maus hábitos, expor prejuízos com alternativas ruins ou alertar sobre erros cometidos pelo cliente.
2. DIVERSIDADE TOTAL DE GANCHOS (NÃO REPITA A MESMA ESTRUTURA):
   - Cada um dos ${data.count} ganchos DEVE usar um ângulo, tom de voz e vocabulário completamente diferente dos outros (ex: um gancho focado em alerta de perigo/prejuízo, outro em pergunta confrontadora, outro em segredo exclusivo, outro em quebra de expectativa visual, etc.).
   - NUNCA repita bordões fixos ou frases genéricas. Crie textos personalizados para o produto informado.
3. ESTRUTURA DOS CAMPOS:
   - "spokenText": fala curta, direta e provocativa entre 5 e 18 palavras.
   - "visualAction": ação de câmera ou gesto físico dramático para gravar nos primeiros 3s.
   - "psychologicalTrigger": gatilho emocional exato (ex: Aversão à Perda, Confronto de Hábito, Quebra de Tabu).
   - "retentionScore": nota de retenção estimada de 88 a 99.

Retorne ESTRITAMENTE um JSON no seguinte formato:
{
  "hooks": [
    {
      "spokenText": "texto falado exato do gancho",
      "visualAction": "instrução visual precisa para gravação nos primeiros 3 segundos",
      "psychologicalTrigger": "nome do gatilho mental",
      "styleName": "Quebra de Padrão | Segredo | Pergunta Provocativa | Antes vs Depois | Alerta de Erro | Achadinho Viral",
      "retentionScore": 96
    }
  ]
}`;

    try {
      const responseText = await provider.generateText(prompt, 0.8);
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;

      const rawHooks = Array.isArray(parsed["hooks"]) ? parsed["hooks"] : [];
      if (rawHooks.length === 0) throw new Error("No hooks returned from AI");

      const hooks: GeneratedHook[] = rawHooks.map((h, idx) => {
        const item = h as Record<string, unknown>;
        return {
          id: `ai-hook-${Date.now()}-${idx + 1}`,
          spokenText: typeof item["spokenText"] === "string" ? item["spokenText"] : "",
          visualAction: typeof item["visualAction"] === "string" ? item["visualAction"] : "Aproximar o produto rapidamente da câmera com expressão de surpresa.",
          psychologicalTrigger: typeof item["psychologicalTrigger"] === "string" ? item["psychologicalTrigger"] : "Curiosidade extrema",
          styleName: typeof item["styleName"] === "string" ? item["styleName"] : "Gancho Viral",
          retentionScore: typeof item["retentionScore"] === "number" ? item["retentionScore"] : 95,
        };
      });

      return hooks;
    } catch (err) {
      console.error("[generateHooksServerFn] Erro ao gerar ganchos com IA:", err);

      // Heuristic fallback tailored to the product name
      const fallbackHooks: GeneratedHook[] = [
        {
          id: `fallback-hook-1`,
          spokenText: `Para tudo o que você tá fazendo se você usa ${data.productName}!`,
          visualAction: "Bater na câmera com a mão ou fazer sinal de PARE com expressão séria.",
          psychologicalTrigger: "Interrupção de Padrão",
          styleName: "Quebra de Padrão",
          retentionScore: 98,
        },
        {
          id: `fallback-hook-2`,
          spokenText: `As marcas não querem que você descubra esse truque com o ${data.productName}...`,
          visualAction: "Falar em tom de segredo sussurrado perto do microfone com a mão na boca.",
          psychologicalTrigger: "Segredo & Exclusividade",
          styleName: "Segredo & Revelação",
          retentionScore: 96,
        },
        {
          id: `fallback-hook-3`,
          spokenText: `Você ainda sofre com ${data.mainPain || "esse problema"}? Olha a solução!`,
          visualAction: "Exibir o problema e transicionar rapidamente mostrando o produto.",
          psychologicalTrigger: "Conscientização de Dor",
          styleName: "Pergunta Provocativa",
          retentionScore: 94,
        },
        {
          id: `fallback-hook-4`,
          spokenText: `Olha como estava antes e como ficou depois de usar o ${data.productName}!`,
          visualAction: "Mostrar imagem de contraste antes vs depois em corte seco rápido.",
          psychologicalTrigger: "Prova de Resultado",
          styleName: "Antes vs Depois",
          retentionScore: 97,
        },
        {
          id: `fallback-hook-5`,
          spokenText: `Esse é disparado o melhor achadinho do TikTok Shop que eu comprei!`,
          visualAction: "Tirar o produto da caixa correndo com sorriso de empolgação.",
          psychologicalTrigger: "Validação Social",
          styleName: "Achadinho do TikTok",
          retentionScore: 95,
        },
      ];

      return fallbackHooks;
    }
  });
