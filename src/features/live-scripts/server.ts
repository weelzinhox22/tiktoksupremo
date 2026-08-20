import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const generateLiveScriptSchema = z.object({
  productName: z.string().min(2),
  price: z.string().optional(),
  discountPrice: z.string().optional(),
  fabric: z.string().optional(),
  benefit: z.string().optional(),
  urgency: z.string().optional(),
  tone: z.string().optional().default("energia_alta"),
  streamerStyle: z.string().optional().default("vendedora_amiga"),
});

export interface LiveMicroBlock {
  id: string;
  stepNumber: number;
  timeframe: string;
  durationSeconds: number;
  stageName: string;
  badge: string;
  badgeColor: string;
  actionGuide: string;
  speech: string;
  hookTrigger: string;
}

export const generateLiveScriptServerFn = createServerFn({ method: "POST" })
  .validator(generateLiveScriptSchema)
  .handler(async ({ data }): Promise<{ blocks: LiveMicroBlock[]; summary: string }> => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const prompt = `Você é o maior especialista em lives de alta conversão do TikTok Shop e vendas ao vivo (live streaming de fábrica e e-commerce).
Sua missão é criar um ROTEIRO COMPLETO DE LIVE contínuo para o produto abaixo, dividido estritamente em FALAS PEQUENAS E RÁPIDAS DE ATÉ 8 SEGUNDOS cada.

DADOS DO PRODUTO:
- Nome: ${data.productName}
- Preço de Tabela / Shopping: ${data.price || "R$ 149,90"}
- Preço da Live / Desconto: ${data.discountPrice || "R$ 69,90"}
- Tecido / Material: ${data.fabric || "Tecido premium encorpado com elastano"}
- Principal Benefício / Caimento: ${data.benefit || "Zero transparência, modela a cintura e não amassa"}
- Escassez / Urgência: ${data.urgency || "Últimas unidades com frete grátis liberado"}
- Estilo: ${data.streamerStyle}

REGRAS CRÍTICAS:
1. Divida a transmissão em 12 a 16 micro-falas numeradas sequencialmente.
2. CADA FALA DEVE DURAR NO MÁXIMO 8 SEGUNDOS (cerca de 15 a 25 palavras por bloco).
3. Cada micro-bloco deve ter uma ação visual clara para o avatar / streamer fazer (ex: esticar o tecido na câmera, apontar para a sacolinha, responder o chat, aproximar o tecido).
4. Linguagem 100% natural, humana, persuasiva, com gírias de live ("meninas", "olha isso aqui", "clica no carrinho", "já garante o seu").
5. Alterne entre: Acolhimento, Prova do Tecido, Quebra de Objeção, Resposta ao Chat, Alerta de Escassez e Chamada para o Carrinho.
6. A última fala deve conectar suavemente de volta à primeira para rodar 24/7 em loop infinito sem cortes.

Retorne estritamente um JSON no seguinte formato (sem markdown extra):
{
  "summary": "Resumo da estratégia da live",
  "blocks": [
    {
      "stepNumber": 1,
      "timeframe": "00:00 - 00:08",
      "durationSeconds": 8,
      "stageName": "Acolhimento & Gancho de Entrada",
      "badge": "Entrada",
      "badgeColor": "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      "actionGuide": "Sorriso aberto, olhando direto na câmera com energia alta e acenando.",
      "speech": "Oi meninas! Sejam muito bem-vindas à nossa live oficial de fábrica! Já comenta aqui de qual cidade você tá assistindo!",
      "hookTrigger": "Conexão e retenção nos primeiros segundos"
    }
  ]
}`;

    try {
      const responseText = await provider.generateText(prompt, 0.7);
      const cleaned = responseText.replace(/```json\n?/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned) as Record<string, unknown>;
      if (parsed && Array.isArray(parsed["blocks"]) && parsed["blocks"].length > 0) {
        const blocks: LiveMicroBlock[] = (parsed["blocks"] as Record<string, unknown>[]).map((b: Record<string, unknown>, idx: number) => ({
          id: `micro-block-${idx + 1}-${Date.now()}`,
          stepNumber: typeof b["stepNumber"] === "number" ? b["stepNumber"] : idx + 1,
          timeframe: typeof b["timeframe"] === "string" ? b["timeframe"] : `00:${String(idx * 8).padStart(2, "0")} - 00:${String((idx + 1) * 8).padStart(2, "0")}`,
          durationSeconds: typeof b["durationSeconds"] === "number" ? b["durationSeconds"] : 8,
          stageName: typeof b["stageName"] === "string" ? b["stageName"] : `Fase ${idx + 1}`,
          badge: typeof b["badge"] === "string" ? b["badge"] : "Live",
          badgeColor:
            idx % 5 === 0
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
              : idx % 5 === 1
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                : idx % 5 === 2
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                  : idx % 5 === 3
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30",
          actionGuide: typeof b["actionGuide"] === "string" ? b["actionGuide"] : "Gesticular e demonstrar a peça com energia.",
          speech: typeof b["speech"] === "string" ? b["speech"] : "",
          hookTrigger: typeof b["hookTrigger"] === "string" ? b["hookTrigger"] : "Retenção e conversão",
        }));
        return {
          blocks,
          summary: typeof parsed["summary"] === "string" ? parsed["summary"] : "Roteiro dinâmico gerado via Gemini com falas de até 8s.",
        };
      }
    } catch (err) {
      console.error("Erro ao gerar roteiro de live via Gemini:", err);
    }

    // Fallback inteligente com 12 micro-blocos de até 8s
    const fallbackBlocks: LiveMicroBlock[] = [
      {
        id: "fb-1",
        stepNumber: 1,
        timeframe: "00:00 - 00:08",
        durationSeconds: 8,
        stageName: "1. Acolhimento & Cidade",
        badge: "Entrada",
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        actionGuide: "Sorriso aberto, olhando na câmera e gesticulando.",
        speech: `Oi meninas! Sejam muito bem-vindas à nossa live oficial de fábrica! Já digita aqui no chat de qual cidade vocês tão assistindo!`,
        hookTrigger: "Engajamento imediato no chat",
      },
      {
        id: "fb-2",
        stepNumber: 2,
        timeframe: "00:08 - 00:16",
        durationSeconds: 8,
        stageName: "2. Revelação da Oferta",
        badge: "Gatilho de Curiosidade",
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        actionGuide: "Puxa a peça principal e exibe na frente com entusiasmo.",
        speech: `Hoje conseguimos liberar um lote exclusivo do ${data.productName} direto da confecção por menos da metade do preço de shopping!`,
        hookTrigger: "Âncora de preço e curiosidade",
      },
      {
        id: "fb-3",
        stepNumber: 3,
        timeframe: "00:16 - 00:24",
        durationSeconds: 8,
        stageName: "3. Textura de Perto",
        badge: "Prova de Tecido",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        actionGuide: "Aproxima o tecido bem perto da lente da câmera.",
        speech: `Deixa eu aproximar bem da câmera pra vocês verem: olha a gramatura desse ${data.fabric || "tecido premium"}!`,
        hookTrigger: "Quebra de medo de comprar online",
      },
      {
        id: "fb-4",
        stepNumber: 4,
        timeframe: "00:24 - 00:32",
        durationSeconds: 8,
        stageName: "4. Teste de Elasticidade",
        badge: "Elasticidade",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        actionGuide: "Estica o tecido com as duas mãos firmes e solta.",
        speech: `Estou esticando com força aqui na live e vejam: ele não deforma e tem zero transparência!`,
        hookTrigger: "Demonstração física de qualidade",
      },
      {
        id: "fb-5",
        stepNumber: 5,
        timeframe: "00:32 - 00:40",
        durationSeconds: 8,
        stageName: "5. Benefício do Corpo",
        badge: "Modelagem",
        badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        actionGuide: "Aponta para o caimento da cintura e quadril.",
        speech: `O caimento veste como uma luva porque ${data.benefit || "modela sem marcar nada no corpo"}!`,
        hookTrigger: "Desejo de auto-estima e conforto",
      },
      {
        id: "fb-6",
        stepNumber: 6,
        timeframe: "00:40 - 00:48",
        durationSeconds: 8,
        stageName: "6. Comparativo de Shopping",
        badge: "Ancoragem",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        actionGuide: "Balança a cabeça afirmativamente mostrando a etiqueta.",
        speech: `Em loja de shopping vocês pagam fácil ${data.price || "R$ 149,90"}, mas aqui no TikTok Shop hoje tá saindo por apenas ${data.discountPrice || "R$ 69,90"}!`,
        hookTrigger: "Percepção de ganho financeiro extremo",
      },
      {
        id: "fb-7",
        stepNumber: 7,
        timeframe: "00:48 - 00:56",
        durationSeconds: 8,
        stageName: "7. Respondendo Tamanhos",
        badge: "Chat Ao Vivo",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        actionGuide: "Olha para baixo simulando ler um comentário e responde rindo.",
        speech: `A Mariana perguntou do tamanho: meninas, a grade vai do P ao GG e o elastano se adapta perfeitamente!`,
        hookTrigger: "Humanização e prova social ao vivo",
      },
      {
        id: "fb-8",
        stepNumber: 8,
        timeframe: "00:56 - 01:04",
        durationSeconds: 8,
        stageName: "8. Frete & Envio Expresso",
        badge: "Confiança",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
        actionGuide: "Faz sinal de positivo com as mãos.",
        speech: `O frete é expresso com envio em até 24h e rastreio direto pelo app do TikTok até sua casa!`,
        hookTrigger: "Segurança na entrega rápida",
      },
      {
        id: "fb-9",
        stepNumber: 9,
        timeframe: "01:04 - 01:12",
        durationSeconds: 8,
        stageName: "9. Alerta de Escassez",
        badge: "Urgência",
        badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        actionGuide: "Olha para a tela com expressão de surpresa.",
        speech: `Atenção: o sistema acabou de avisar que restam ${data.urgency || "apenas 12 unidades nesse valor promocional"}!`,
        hookTrigger: "FOMO (medo de ficar sem)",
      },
      {
        id: "fb-10",
        stepNumber: 10,
        timeframe: "01:12 - 01:20",
        durationSeconds: 8,
        stageName: "10. Chamada para a Sacolinha",
        badge: "Clique no Carrinho",
        badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        actionGuide: "Aponta com o dedo para o canto inferior esquerdo onde fica a sacolinha amarela.",
        speech: `Clica agora na sacolinha amarela aqui embaixo no cantinho e garante a sua antes que encerre o lote!`,
        hookTrigger: "CTA clara de conversão",
      },
      {
        id: "fb-11",
        stepNumber: 11,
        timeframe: "01:20 - 01:28",
        durationSeconds: 8,
        stageName: "11. Cor e Variação",
        badge: "Seleção Rápida",
        badgeColor: "bg-pink-500/20 text-pink-300 border-pink-500/30",
        actionGuide: "Mostra as opções de cores ou fita de tecido.",
        speech: `Escolhe sua cor e tamanho na sacolinha, clica em comprar com cupom e volta aqui pra me avisar no chat!`,
        hookTrigger: "Facilitação da jornada de compra",
      },
      {
        id: "fb-12",
        stepNumber: 12,
        timeframe: "01:28 - 01:36",
        durationSeconds: 8,
        stageName: "12. Reinício do Loop 24/7",
        badge: "Loop Infinito",
        badgeColor: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
        actionGuide: "Ajeita a peça e saúda quem acabou de entrar.",
        speech: `Pra você que acabou de cair na nossa live oficial de fábrica, deixa eu te mostrar agora por que essa peça é perfeita...`,
        hookTrigger: "Transição suave para repetição 24h sem quebra",
      },
    ];

    return { blocks: fallbackBlocks, summary: "Roteiro otimizado em 12 micro-falas de 8 segundos com loop contínuo." };
  });
