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
  sceneCount: z.number().min(6).max(250).default(24),
  startFromIndex: z.number().optional().default(1),
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

export interface SavedLiveScript {
  id: string;
  title: string;
  productName: string;
  totalScenes: number;
  totalDuration: string;
  summary: string;
  blocks: LiveMicroBlock[];
  created_at: string;
}

function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export const generateLiveScriptServerFn = createServerFn({ method: "POST" })
  .validator(generateLiveScriptSchema)
  .handler(async ({ data }): Promise<{ blocks: LiveMicroBlock[]; summary: string }> => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const targetCount = data.sceneCount || 24;
    const startIndex = data.startFromIndex || 1;
    const startSeconds = (startIndex - 1) * 8;

    const prompt = `Você é o maior especialista em lives de alta conversão do TikTok Shop e vendas ao vivo (live streaming de fábrica e e-commerce de moda/produtos).
Sua missão é criar um ROTEIRO COMPLETO DE LIVE contínuo para o produto abaixo, dividido estritamente em ${targetCount} FALAS PEQUENAS E RÁPIDAS DE ATÉ 8 SEGUNDOS cada.

DADOS DO PRODUTO:
- Nome: ${data.productName}
- Preço de Tabela / Shopping: ${data.price || "R$ 149,90"}
- Preço da Live / Desconto: ${data.discountPrice || "R$ 69,90"}
- Tecido / Material: ${data.fabric || "Tecido premium encorpado com elastano"}
- Principal Benefício / Caimento: ${data.benefit || "Zero transparência, modela a cintura e não amassa"}
- Escassez / Urgência: ${data.urgency || "Últimas unidades com frete grátis liberado"}
- Estilo: ${data.streamerStyle}

REGRAS CRÍTICAS:
1. Crie exatamente ${targetCount} micro-falas numeradas sequencialmente a partir do número ${startIndex}.
2. CADA FALA DEVE DURAR NO MÁXIMO 8 SEGUNDOS (cerca de 15 a 25 palavras por bloco).
3. Cada micro-bloco deve ter uma ação visual clara para o avatar / streamer fazer (ex: esticar o tecido, aproximar da lente, apontar para a sacolinha amarela, responder o chat, provar tamanho, contar estoque).
4. Linguagem 100% natural, humana, persuasiva, com gírias de live ("meninas", "olha isso aqui", "clica na sacolinha", "já garante o seu").
5. Ciclo de Live Completo:
   - Acolhimento e Cidade no chat
   - Revelação da Oferta & Ancoragem de Preço
   - Prova de Tecido, Elasticidade e Gramatura
   - Quebra de Objeções (Transparência, Tamanhos P ao GG, Lavagem)
   - Interação com Comentários Fictícios do Chat ("Mariana perguntou do frete", "Camila garantiu o dela")
   - Alertas de Escassez e Cronômetro de Desconto
   - Chamada Forte para a Sacolinha Amarela e Cupom
   - Reinício Suave de Loop para transmissão 24/7 sem cortes.

Retorne estritamente um JSON no seguinte formato (sem markdown extra):
{
  "summary": "Resumo da estratégia da live",
  "blocks": [
    {
      "stepNumber": ${startIndex},
      "timeframe": "${formatSecondsToTime(startSeconds)} - ${formatSecondsToTime(startSeconds + 8)}",
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
        const blocks: LiveMicroBlock[] = (parsed["blocks"] as Record<string, unknown>[]).map((b: Record<string, unknown>, idx: number) => {
          const actualStep = startIndex + idx;
          const blockStartSec = (actualStep - 1) * 8;
          const blockEndSec = actualStep * 8;
          return {
            id: `micro-block-${actualStep}-${Date.now()}-${idx}`,
            stepNumber: typeof b["stepNumber"] === "number" ? b["stepNumber"] : actualStep,
            timeframe: typeof b["timeframe"] === "string" ? b["timeframe"] : `${formatSecondsToTime(blockStartSec)} - ${formatSecondsToTime(blockEndSec)}`,
            durationSeconds: typeof b["durationSeconds"] === "number" ? b["durationSeconds"] : 8,
            stageName: typeof b["stageName"] === "string" ? b["stageName"] : `Fase ${actualStep}`,
            badge: typeof b["badge"] === "string" ? b["badge"] : "Live",
            badgeColor:
              actualStep % 5 === 0
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                : actualStep % 5 === 1
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                  : actualStep % 5 === 2
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                    : actualStep % 5 === 3
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30",
            actionGuide: typeof b["actionGuide"] === "string" ? b["actionGuide"] : "Gesticular e demonstrar a peça com energia.",
            speech: typeof b["speech"] === "string" ? b["speech"] : "",
            hookTrigger: typeof b["hookTrigger"] === "string" ? b["hookTrigger"] : "Retenção e conversão",
          };
        });
        return {
          blocks,
          summary: typeof parsed["summary"] === "string" ? parsed["summary"] : `Roteiro dinâmico gerado via Gemini com ${blocks.length} falas de até 8s.`,
        };
      }
    } catch (err) {
      console.error("Erro ao gerar roteiro de live via Gemini:", err);
    }

    // Fallback gerador com a quantidade exata de falas requisitada
    const stages = [
      { name: "Acolhimento & Cidade", badge: "Entrada", speech: `Oi meninas! Sejam bem-vindas à nossa live oficial de fábrica! Digita aqui no chat de qual cidade vocês tão assistindo!`, action: "Sorriso aberto, olhando na câmera e gesticulando." },
      { name: "Revelação da Oferta", badge: "Gatilho de Curiosidade", speech: `Hoje conseguimos liberar um lote exclusivo do ${data.productName} direto da confecção por menos da metade do preço de shopping!`, action: "Puxa a peça principal e exibe na frente com entusiasmo." },
      { name: "Textura de Perto", badge: "Prova de Tecido", speech: `Deixa eu aproximar bem da câmera pra vocês verem: olha a gramatura desse ${data.fabric || "tecido premium"}!`, action: "Aproxima o tecido bem perto da lente da câmera." },
      { name: "Teste de Elasticidade", badge: "Elasticidade", speech: `Estou esticando com força aqui na live e vejam: ele não deforma e tem zero transparência!`, action: "Estica o tecido com as duas mãos firmes e solta." },
      { name: "Benefício do Corpo", badge: "Modelagem", speech: `O caimento veste como uma luva porque ${data.benefit || "modela sem marcar nada no corpo"}!`, action: "Aponta para o caimento da cintura e quadril." },
      { name: "Comparativo de Preço", badge: "Ancoragem", speech: `Em loja de shopping vocês pagam fácil ${data.price || "R$ 149,90"}, mas aqui no TikTok Shop hoje tá saindo por apenas ${data.discountPrice || "R$ 69,90"}!`, action: "Balança a cabeça afirmativamente mostrando a etiqueta." },
      { name: "Respondendo Tamanhos", badge: "Chat Ao Vivo", speech: `A Mariana perguntou do tamanho: meninas, a grade vai do P ao GG e o elastano se adapta perfeitamente!`, action: "Olha para baixo simulando ler um comentário e responde rindo." },
      { name: "Frete & Envio Expresso", badge: "Confiança", speech: `O frete é expresso com envio em até 24h e rastreio direto pelo app do TikTok até sua casa!`, action: "Faz sinal de positivo com as mãos." },
      { name: "Alerta de Escassez", badge: "Urgência", speech: `Atenção: o sistema acabou de avisar que restam ${data.urgency || "apenas 12 unidades nesse valor promocional"}!`, action: "Olha para a tela com expressão de surpresa." },
      { name: "Chamada para a Sacolinha", badge: "Clique no Carrinho", speech: `Clica agora na sacolinha amarela aqui embaixo no cantinho e garante a sua antes que encerre o lote!`, action: "Aponta com o dedo para o canto inferior esquerdo onde fica a sacolinha amarela." },
      { name: "Cor e Variação", badge: "Seleção Rápida", speech: `Escolhe sua cor e tamanho na sacolinha, clica em comprar com cupom e volta aqui pra me avisar no chat!`, action: "Mostra as opções de cores ou fita de tecido." },
      { name: "Reinício do Loop 24/7", badge: "Loop Infinito", speech: `Pra você que acabou de cair na nossa live oficial de fábrica, deixa eu te mostrar agora por que essa peça é perfeita...`, action: "Ajeita a peça e saúda quem acabou de entrar." },
    ];

    const fallbackBlocks: LiveMicroBlock[] = Array.from({ length: targetCount }, (_, idx) => {
      const actualStep = startIndex + idx;
      const stage = stages[idx % stages.length]!;
      const blockStartSec = (actualStep - 1) * 8;
      const blockEndSec = actualStep * 8;

      return {
        id: `fb-${actualStep}-${Date.now()}`,
        stepNumber: actualStep,
        timeframe: `${formatSecondsToTime(blockStartSec)} - ${formatSecondsToTime(blockEndSec)}`,
        durationSeconds: 8,
        stageName: `${actualStep}. ${stage.name}`,
        badge: stage.badge,
        badgeColor:
          actualStep % 5 === 0
            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            : actualStep % 5 === 1
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
              : actualStep % 5 === 2
                ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                : actualStep % 5 === 3
                  ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                  : "bg-amber-500/20 text-amber-300 border-amber-500/30",
        actionGuide: stage.action,
        speech: stage.speech,
        hookTrigger: "Retenção e conversão",
      };
    });

    return { blocks: fallbackBlocks, summary: `Roteiro otimizado em ${targetCount} micro-falas de 8 segundos com loop contínuo.` };
  });

const saveLiveScriptSchema = z.object({
  productName: z.string().min(1),
  totalScenes: z.number(),
  totalDuration: z.string(),
  summary: z.string().optional(),
  blocks: z.array(
    z.object({
      id: z.string(),
      stepNumber: z.number(),
      timeframe: z.string(),
      durationSeconds: z.number(),
      stageName: z.string(),
      badge: z.string(),
      badgeColor: z.string(),
      actionGuide: z.string(),
      speech: z.string(),
      hookTrigger: z.string(),
    })
  ),
});

export const saveLiveScriptServerFn = createServerFn({ method: "POST" })
  .validator(saveLiveScriptSchema)
  .handler(async ({ data }): Promise<{ success: boolean; id: string }> => {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Usuário não autenticado.");
    }

    const fullContent = data.blocks
      .map((b) => `[${b.timeframe}] (${b.stageName})\nAção: ${b.actionGuide}\nFala: "${b.speech}"`)
      .join("\n\n---\n\n");

    const hookText = data.blocks[0]?.speech || "";
    const ctaText = data.blocks[data.blocks.length - 1]?.speech || "";

    const { data: inserted, error } = await supabase
      .from("copy_library")
      .insert({
        user_id: user.id,
        title: `Live TikTok Shop (${data.totalScenes} falas) — ${data.productName}`.slice(0, 180),
        content: fullContent,
        hook: hookText,
        body: data.summary || "Roteiro contínuo de Live IA",
        cta: ctaText,
        analysis: {
          blocks: data.blocks,
          totalDuration: data.totalDuration,
          totalScenes: data.totalScenes,
          productName: data.productName,
        },
        language_style: ["live_streaming", "vendas_tiktok"],
        tags: ["live_script", "tiktok_shop_live", data.productName],
        source: "manual",
      })
      .select("id")
      .single();

    if (error || !inserted) {
      throw new Error(`Erro ao salvar no banco de dados: ${error?.message || "Desconhecido"}`);
    }

    return { success: true, id: inserted.id };
  });

export const listSavedLiveScriptsServerFn = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ savedLives: SavedLiveScript[] }> => {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { savedLives: [] };

    const { data: rows, error } = await supabase
      .from("copy_library")
      .select("*")
      .eq("user_id", user.id)
      .contains("tags", ["live_script"])
      .order("created_at", { ascending: false });

    if (error || !rows) return { savedLives: [] };

    const savedLives: SavedLiveScript[] = rows.map((r) => {
      const analysis = (r.analysis as Record<string, unknown>) || {};
      const blocks = Array.isArray(analysis["blocks"]) ? (analysis["blocks"] as LiveMicroBlock[]) : [];
      const totalDuration = typeof analysis["totalDuration"] === "string" ? analysis["totalDuration"] : "";
      const totalScenes = typeof analysis["totalScenes"] === "number" ? analysis["totalScenes"] : blocks.length;
      const productName = typeof analysis["productName"] === "string" ? analysis["productName"] : r.title;

      return {
        id: r.id,
        title: r.title,
        productName,
        totalScenes,
        totalDuration,
        summary: r.body || "",
        blocks,
        created_at: r.created_at,
      };
    });

    return { savedLives };
  });

export const deleteSavedLiveScriptServerFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }): Promise<{ success: boolean }> => {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = await getSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("Usuário não autenticado.");

    const { error } = await supabase
      .from("copy_library")
      .delete()
      .eq("id", data.id)
      .eq("user_id", user.id);

    if (error) throw new Error(`Erro ao deletar: ${error.message}`);
    return { success: true };
  });
