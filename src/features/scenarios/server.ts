import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export interface ScenarioComposerResult {
  mode: "extract_clean_scenario" | "compose_clothing_in_scenario";
  scenarioName: string;
  surfaceType: string;
  lightingSetup: string;
  decorElements: string;
  detectedGarment?: {
    type: string;
    color: string;
    fabric: string;
    details: string;
  };
  fluxPrompt: string;
  multiImagePrompt?: string;
  singlePrompt?: string;
  negativePrompt: string;
  placementTips: string[];
}

const scenarioComposerInputSchema = z.object({
  mode: z.enum(["extract_clean_scenario", "compose_clothing_in_scenario"]),
  scenarioImageBase64: z.string().min(10), // Base64 data URL or raw base64
  clothingImageBase64: z.string().optional(), // Base64 data URL or raw base64
  clothingDescription: z.string().optional(),
  placementStyle: z.enum(["flat_lay_carpet", "folded_aesthetic", "wooden_hanger", "bed_drape"]).default("flat_lay_carpet"),
  aspectRatio: z.string().default("9:16"),
});

function parseBase64(input: string): { mimeType: string; base64Data: string } {
  const match = input.match(/^data:([^;]+);base64,(.+)$/);
  if (match && match[1] && match[2]) {
    return { mimeType: match[1], base64Data: match[2] };
  }
  return { mimeType: "image/jpeg", base64Data: input };
}

export const analyzeScenarioComposerServerFn = createServerFn({ method: "POST" })
  .validator(scenarioComposerInputSchema)
  .handler(async ({ data }): Promise<ScenarioComposerResult> => {
    const apiKey = (process.env["GEMINI_API_KEY"] || "").trim().replace(/^["']|["']$/g, "");
    if (!apiKey) {
      throw new Error("Chave GEMINI_API_KEY não configurada no servidor.");
    }

    const scenarioParsed = parseBase64(data.scenarioImageBase64);
    const imageParts: unknown[] = [
      {
        inline_data: {
          mime_type: scenarioParsed.mimeType,
          data: scenarioParsed.base64Data,
        },
      },
    ];

    let promptText = "";

    if (data.mode === "extract_clean_scenario") {
      promptText = `
Você é um diretor de arte e engenheiro de prompts especialista em FLUX 1.1 Pro, Midjourney v6.1 e Recraft.
Analise a imagem enviada (FOTO DO CENÁRIO).
Seu objetivo é extrair e descrever exclusivamente o AMBIENTE / CENÁRIO DE FUNDO para criar um CENÁRIO VAZIO 100% LIMPO E REUTILIZÁVEL para fotos de moda e produtos do TikTok Shop.

IMPORTANTE: Se houver qualquer roupa, produto, calçado ou objeto aleatório na imagem, IGNORE-OS completamente.
Foque em:
1. Superfície do chão ou mesa (tipo de tapete, cor, textura, piso de madeira, mármore, microcimento, etc.).
2. Iluminação (origem da luz, janela natural, golden hour, temperatura da cor, suavidade das sombras).
3. Elementos decorativos de fundo (mesinha, espelho, flores secas, velas, cortina de linho, abajur).
4. Ângulo da câmera (POV smartphone 9:16 vertical, ângulo de cima/flat lay levemente inclinado, enquadramento limpo).

Retorne estritamente um JSON no seguinte formato:
{
  "scenarioName": "Nome descritivo e atraente do cenário (ex: Quarto Minimalista com Tapete Felpudo e Luz de Janela)",
  "surfaceType": "Descrição detalhada da superfície principal",
  "lightingSetup": "Descrição da iluminação (direção, temperatura, suavidade)",
  "decorElements": "Itens decorativos e arquitetura visíveis",
  "fluxPrompt": "Prompt em inglês completo, ultra-realista e otimizado para o FLUX gerar exatamente este cenário vazio e limpo sem nenhuma roupa ou produto. Termine com: shot on iPhone 15 Pro, natural realistic shadows, 8k resolution, unboxing background plate, 9:16 vertical --ar 9:16",
  "negativePrompt": "tiktok logo, ui, icons, clothes, garments, shoes, person, human, text, watermark, blurry, low quality, oversaturated",
  "placementTips": [
    "Dica prática de como usar este cenário com roupas dobradas ou abertas",
    "Sugestão de cor de peça que contrasta melhor com esta superfície"
  ]
}
`;
    } else {
      // compose_clothing_in_scenario
      if (data.clothingImageBase64) {
        const clothingParsed = parseBase64(data.clothingImageBase64);
        imageParts.push({
          inline_data: {
            mime_type: clothingParsed.mimeType,
            data: clothingParsed.base64Data,
          },
        });
      }

      promptText = `
Você é um diretor de arte e engenheiro de prompts especialista em FLUX (Image-to-Image / Multi-Reference LoRA), Midjourney v6.1 (--iw 2), Ideogram e Recraft.
Você recebeu:
- Imagem 1: CENÁRIO DE REFERÊNCIA (o ambiente, piso/tapete, iluminação e atmosfera onde a roupa deve ser colocada).
- Imagem 2 (se fornecida): FOTO DA ROUPA / PEÇA DE VESTUÁRIO (modelo, tecido, cor, corte e detalhes exatos).
${data.clothingDescription ? `Descrição adicional da roupa: "${data.clothingDescription}"` : ""}
Estilo de disposição desejado: ${data.placementStyle}

Sua missão é gerar os prompts perfeitos para INSERIR A ROUPA NO CENÁRIO EXATO mantendo 100% de coerência:
1. Manter a iluminação, sombras de contato naturais e superfície da Imagem 1.
2. Manter a fidelidade absoluta do tecido, cor, estampa e corte da roupa da Imagem 2.
3. Posicionar a roupa organicamente com dobras naturais de tecido (sem parecer colagem 2D).

Retorne estritamente um JSON no seguinte formato:
{
  "scenarioName": "Nome do cenário identificado",
  "surfaceType": "Superfície onde a roupa repousa",
  "lightingSetup": "Iluminação correspondente",
  "decorElements": "Ambiente e decoração ao redor",
  "detectedGarment": {
    "type": "Tipo da peça (ex: Vestido canelado midi)",
    "color": "Cor e tom exato do tecido",
    "fabric": "Textura do tecido identificado (ex: Algodão premium encorpado)",
    "details": "Detalhes de corte, gola, alças ou botões"
  },
  "fluxPrompt": "Prompt em inglês detalhado para FLUX / Midjourney contendo a descrição completa da roupa posicionada organicamente sobre a superfície do cenário, com sombras de contato ultra-realistas, luz natural e acabamento de câmera de smartphone autêntica, 9:16 vertical --ar 9:16 --v 6.1",
  "multiImagePrompt": "Instrução formatada para geradores com suporte a múltiplas referências (ex: [Image 1 as Background Surface & Lighting Reference, Image 2 as Garment Subject Reference]: Seamlessly place the garment from Image 2 neatly laid out on the exact surface of Image 1...)",
  "singlePrompt": "Prompt direto em inglês para gerar a cena inteira em 1 único comando de texto",
  "negativePrompt": "tiktok logo, follow button, icons, cart, text, watermark, bad folds, floating garment, unnatural shadow, deformed cloth, low quality, 3d render",
  "placementTips": [
    "Dica 1 de como aplicar o prompt no Flux/Midjourney",
    "Dica 2 para obter a dobra de tecido perfeita"
  ]
}
`;
    }

    const payload = {
      contents: [
        {
          parts: [{ text: promptText }, ...imageParts],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        maxOutputTokens: 3000,
        temperature: 0.2,
      },
    };

    const modelsToTry = ["gemini-2.5-flash", "gemini-3.6-flash", "gemini-flash-latest", "gemini-1.5-flash"];
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const resData = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };

          const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const cleanJson = rawText
              .replace(/^```(?:json)?\s*/i, "")
              .replace(/\s*```\s*$/i, "")
              .trim();
            const parsed = JSON.parse(cleanJson);
            return {
              mode: data.mode,
              scenarioName: parsed.scenarioName || "Cenário Personalizado",
              surfaceType: parsed.surfaceType || "Superfície estética",
              lightingSetup: parsed.lightingSetup || "Luz natural suave",
              decorElements: parsed.decorElements || "Decoração minimalista",
              detectedGarment: parsed.detectedGarment,
              fluxPrompt: parsed.fluxPrompt || "",
              multiImagePrompt: parsed.multiImagePrompt,
              singlePrompt: parsed.singlePrompt || parsed.fluxPrompt,
              negativePrompt: parsed.negativePrompt || "text, watermark, logo, cartoon, bad quality",
              placementTips: Array.isArray(parsed.placementTips) ? parsed.placementTips : [],
            };
          }
        } else {
          lastError = await res.text();
        }
      } catch (err: unknown) {
        lastError = err instanceof Error ? err.message : String(err);
      }
    }

    throw new Error(`Erro ao analisar com Gemini Vision: ${lastError || "Falha na comunicação"}`);
  });
