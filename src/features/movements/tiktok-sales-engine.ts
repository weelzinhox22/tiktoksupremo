import type { MovementPreset } from "@/lib/supabase/types";

export interface CustomProductConfig {
  name: string;
  color: string;
  fabric: string;
  benefit: string;
  scenario: string;
  niche?: "vestuario" | "fitness" | "praia" | "calcados" | "acessorios" | "geral";
}

export const PRODUCT_TEMPLATES: { label: string; config: CustomProductConfig }[] = [
  {
    label: "👗 Vestido Midi / Longo",
    config: {
      name: "Vestido Midi Canelado com Fenda",
      color: "Preto Fosco",
      fabric: "Canelado encorpado 320g com elastano premium",
      benefit: "Zero transparência, modela a cintura e não marca a celulite",
      scenario: "Cama posta com lençol bege minimalista e iluminação natural de estúdio",
      niche: "vestuario",
    },
  },
  {
    label: "🧘 Conjunto Fitness / Legging",
    config: {
      name: "Conjunto Fitness Top + Legging Cintura Alta",
      color: "Azul Marinho",
      fabric: "Suplex de poliamida com alta compressão",
      benefit: "À prova de agachamento, não desce na cintura e modela o bumbum",
      scenario: "Tapete felpudo claro com piso de madeira ao fundo e luz clean",
      niche: "fitness",
    },
  },
  {
    label: "👚 Blusa / Cropped / Body",
    config: {
      name: "Body Regata Modelador Alça Larga",
      color: "Off-White / Bege",
      fabric: "Poliamida dupla camada com fecho reforçado",
      benefit: "Dispensa sutiã, sustentação impecável e toque aveludado",
      scenario: "Quarto aconchegante com espelho de corpo inteiro e luz suave",
      niche: "vestuario",
    },
  },
  {
    label: "👖 Shorts / Calça Alfaiataria",
    config: {
      name: "Shorts Alfaiataria Cintura Alta com Cinto",
      color: "Terracota / Bege",
      fabric: "Crepe alfaiataria premium com bolso faca",
      benefit: "Caimento elegante, tecido não amarrota fácil e valoriza o corpo",
      scenario: "Mesa ou cama com decoração boho chic e plantas ao fundo",
      niche: "vestuario",
    },
  },
];

export const DEFAULT_PRODUCT_CONFIG: CustomProductConfig = PRODUCT_TEMPLATES[0]!.config;

/**
 * Automatically adapts prompt instructions to the user's specific product.
 */
export function adaptPromptForProduct(
  basePrompt: string,
  config: CustomProductConfig
): string {
  if (!basePrompt) return "";

  let adapted = basePrompt;

  // Replace clothing items
  adapted = adapted.replace(/the clothing piece/gi, `the ${config.color} ${config.name}`);
  adapted = adapted.replace(/the clothing item/gi, `the ${config.color} ${config.name}`);
  adapted = adapted.replace(/the top\/front piece/gi, `the top ${config.color} ${config.name} (${config.fabric})`);
  adapted = adapted.replace(/the garment/gi, `the ${config.color} ${config.name}`);
  adapted = adapted.replace(/the blouse/gi, `the ${config.color} ${config.name}`);
  adapted = adapted.replace(/peça de roupa/gi, `${config.name} na cor ${config.color}`);
  adapted = adapted.replace(/peças de roupa/gi, `peças do ${config.name} (${config.fabric})`);
  adapted = adapted.replace(/SHORTS PRETO/g, config.name.toUpperCase());
  adapted = adapted.replace(/BLUSA PRETA/g, `${config.name.toUpperCase()} (${config.color.toUpperCase()})`);

  // Tailored Product Constraints
  const extraTailoring = `\n\n[PRODUCT IDENTITY LOCK: Product is "${config.name}" in exact color "${config.color}". Fabric texture must show high-density "${config.fabric}". Highlight fabric elasticity, durability, and smooth premium drape without transparency. Background setting: ${config.scenario}.]`;

  return adapted + extraTailoring;
}

export type PsychologicalHookType =
  | "prova_extrema"
  | "fofoca_confissao"
  | "comparacao_shopping"
  | "alerta_golpe"
  | "bug_cupom";

export interface UgcVoiceScript {
  hookType: PsychologicalHookType;
  hookTitle: string;
  hook: string;
  body: string;
  cta: string;
  fullScript: string;
  retentionTip: string;
}

/**
 * Generates ultra-human, high-converting Brazilian TikTok UGC scripts
 * based on proven psychological retention triggers.
 */
export function generateUgcVoiceScriptsList(
  movement: MovementPreset,
  config: CustomProductConfig
): UgcVoiceScript[] {
  const name = config.name || "essa peça";
  const benefit = config.benefit || "o tecido é super encorpado e não fica transparente";
  const fabric = config.fabric || "tecido premium";
  const color = config.color || "preta";

  return [
    {
      hookType: "prova_extrema",
      hookTitle: "🔥 Prova Extrema (Zero Transparência)",
      hook: `Menina do céu, olha isso aqui! Eu coloquei esse ${name} contra a luz forte só pra tirar a dúvida se era transparente.`,
      body: `Olha como eu puxo e estico esse ${fabric}. Não marca nadinha, o tecido é muito encorpado e modela o corpo na hora sem apertar.`,
      cta: `O link com frete grátis tá na sacolinha amarela aqui embaixo no cantinho. Corre antes que acabe seu tamanho!`,
      fullScript: `[0s-2s GANCHO]: "Menina do céu, olha isso aqui! Eu coloquei esse ${name} contra a luz forte só pra tirar a dúvida se era transparente."\n\n[2s-6s PROVA & DETALHES]: "Olha como eu puxo e estico esse ${fabric}. Não marca nadinha, o tecido é muito encorpado e modela o corpo na hora sem apertar."\n\n[6s-8s CTA SACOLINHA]: "O link com frete grátis tá na sacolinha amarela aqui embaixo no cantinho. Corre antes que acabe seu tamanho!"`,
      retentionTip: "A retenção sobe 72% porque o usuário fica para ver se o tecido realmente não fica transparente.",
    },
    {
      hookType: "fofoca_confissao",
      hookTitle: "😱 Fofoca / Confissão Sincera",
      hook: `Gente, eu quase chorei quando meu pacote do TikTok Shop chegou hoje, juro pra vocês!`,
      body: `Eu não dava nada por causa do valor, mas o acabamento desse ${name} na cor ${color} é surreal. Tecido pesado de loja cara, caimento impecável.`,
      cta: `Clica agora na sacolinha amarela aqui embaixo enquanto o lote promocional ainda tá liberado!`,
      fullScript: `[0s-2s GANCHO]: "Gente, eu quase chorei quando meu pacote do TikTok Shop chegou hoje, juro pra vocês!"\n\n[2s-6s PROVA & DETALHES]: "Eu não dava nada por causa do valor, mas o acabamento desse ${name} na cor ${color} é surreal. Tecido pesado de loja cara, caimento impecável."\n\n[6s-8s CTA SACOLINHA]: "Clica agora na sacolinha amarela aqui embaixo enquanto o lote promocional ainda tá liberado!"`,
      retentionTip: "Quebra de padrão emocional nos primeiros 1.5s faz o espectador parar o scroll instantaneamente.",
    },
    {
      hookType: "comparacao_shopping",
      hookTitle: "🛍️ Comparação (Shopping vs TikTok Shop)",
      hook: `Você pagaria 280 reais num shopping por esse mesmo ${name}, e eu posso te provar!`,
      body: `Olha a costura reforçada e a textura desse ${fabric}. ${benefit}. É direto do fabricante, por isso sai por uma fração do preço de vitrine.`,
      cta: `Aproveita o cupom de primeira compra na sacolinha amarela aqui embaixo antes que volte pro preço normal!`,
      fullScript: `[0s-2s GANCHO]: "Você pagaria 280 reais num shopping por esse mesmo ${name}, e eu posso te provar!"\n\n[2s-6s PROVA & DETALHES]: "Olha a costura reforçada e a textura desse ${fabric}. ${benefit}. É direto do fabricante, por isso sai por uma fração do preço de vitrine."\n\n[6s-8s CTA SACOLINHA]: "Aproveita o cupom de primeira compra na sacolinha amarela aqui embaixo antes que volte pro preço normal!"`,
      retentionTip: "Gera sensação de vantagem e economia financeira imediata no cérebro do comprador.",
    },
    {
      hookType: "alerta_golpe",
      hookTitle: "⚠️ Alerta de Golpe Revertido",
      hook: `Pensei que ia tomar um golpe quando comprei no TikTok Shop por esse preço, mas olha isso:`,
      body: `Chegou em 3 dias, veio super bem embalado e o ${name} é ainda mais lindo ao vivo. O tecido é macio, não amarrota e veste como uma luva.`,
      cta: `O fornecedor oficial tá verificado na sacolinha amarela aqui no vídeo. Garante o seu agora!`,
      fullScript: `[0s-2s GANCHO]: "Pensei que ia tomar um golpe quando comprei no TikTok Shop por esse preço, mas olha isso:"\n\n[2s-6s PROVA & DETALHES]: "Chegou em 3 dias, veio super bem embalado e o ${name} é ainda mais lindo ao vivo. O tecido é macio, não amarrota e veste como uma luva."\n\n[6s-8s CTA SACOLINHA]: "O fornecedor oficial tá verificado na sacolinha amarela aqui no vídeo. Garante o seu agora!"`,
      retentionTip: "A palavra 'golpe' no início dispara o reflexo de perigo no cérebro, travando 80% do público no vídeo.",
    },
    {
      hookType: "bug_cupom",
      hookTitle: "💸 Bug do Cupom / Queima de Lote",
      hook: `Se esse vídeo apareceu pra você, não pula porque o TikTok liberou frete grátis hoje!`,
      body: `O lote desse ${name} tá voando porque quem já comprou tá levando 2 ou 3 peças. ${benefit}.`,
      cta: `Clica rápido na sacolinha amarela aqui embaixo antes que esgote o lote de hoje!`,
      fullScript: `[0s-2s GANCHO]: "Se esse vídeo apareceu pra você, não pula porque o TikTok liberou frete grátis hoje!"\n\n[2s-6s PROVA & DETALHES]: "O lote desse ${name} tá voando porque quem já comprou tá levando 2 ou 3 peças. ${benefit}."\n\n[6s-8s CTA SACOLINHA]: "Clica rápido na sacolinha amarela aqui embaixo antes que esgote o lote de hoje!"`,
      retentionTip: "Gatilho de escassez e exclusividade máxima para cliques imediatos no link do produto.",
    },
  ];
}

export function generateUgcVoiceScript(
  movement: MovementPreset,
  config: CustomProductConfig
): UgcVoiceScript {
  const list = generateUgcVoiceScriptsList(movement, config);
  const tags = movement.tags.map((t) => t.toLowerCase());

  if (tags.some((t) => t.includes("esticar") || t.includes("tecido"))) {
    return list[0]!;
  }
  if (tags.some((t) => t.includes("unboxing") || t.includes("pacote"))) {
    return list[1]!;
  }
  if (movement.category === "cta") {
    return list[4]!;
  }
  return list[2]!;
}

export interface DailyVideoScheduleItem {
  timeSlot: string;
  phase: string;
  presetName: string;
  hookGoal: string;
  presetId: string;
  suggestedAudioHook: string;
  hookTypeBadge: string;
}

/**
 * Generates an Anti-Creative Fatigue 5-Video Daily Plan for a single product.
 */
export function generateDaily5VideoPlan(
  config: CustomProductConfig
): DailyVideoScheduleItem[] {
  return [
    {
      timeSlot: "08:30 - Manhã (Descoberta & Curiosidade)",
      phase: "Unboxing Dopamina",
      presetName: "Gancho Embalagem TikTok Shop (8s)",
      presetId: "10000000-0000-4000-8000-000000000105",
      hookGoal: "Rasgar o pacote oficial do TikTok gerando desejo imediato de recebimento em casa",
      suggestedAudioHook: `Gente, eu quase chorei quando meu pacote de ${config.name} chegou hoje!`,
      hookTypeBadge: "😱 Fofoca / Confissão",
    },
    {
      timeSlot: "12:15 - Almoço (Alta Retenção & Prova)",
      phase: "Quebra de Objeção de Tecido",
      presetName: "Gancho Esticar Roupa (8s)",
      presetId: "10000000-0000-4000-8000-000000000101",
      hookGoal: "Esticar o tecido contra a câmera provando elasticidade e zero transparência",
      suggestedAudioHook: `Coloquei esse ${config.name} na luz forte só pra tirar a dúvida se era transparente...`,
      hookTypeBadge: "🔥 Prova Extrema",
    },
    {
      timeSlot: "15:45 - Tarde (Sensorial & Qualidade)",
      phase: "Close-up de Textura e Toque",
      presetName: "Mostrar o Tecido de Perto (8s)",
      presetId: "10000000-0000-4000-8000-000000000108",
      hookGoal: "Deslizar os dedos sobre a trama comprovando tecido premium de shopping",
      suggestedAudioHook: `Você pagaria R$ 280 num shopping por esse mesmo ${config.name}, olha essa trama:`,
      hookTypeBadge: "🛍️ Comparação Shopping",
    },
    {
      timeSlot: "18:30 - Fim de Tarde (Identificação UGC)",
      phase: "Mirror Selfie & Transição de Mão",
      presetName: "Gancho Tapar Câmera com a Mão (5s)",
      presetId: "10000000-0000-4000-8000-000000000110",
      hookGoal: "Estilo criador autêntico provando a peça com corte de transição perfeito",
      suggestedAudioHook: `Pensei que ia tomar um golpe por esse preço, mas vestiu como uma luva!`,
      hookTypeBadge: "⚠️ Alerta / Surpresa",
    },
    {
      timeSlot: "21:00 - Pico Noturno (Conversão Máxima)",
      phase: "CTA de Urgência & Sacolinha",
      presetName: "CTA Simpática (4s)",
      presetId: "10000000-0000-4000-8000-000000000114",
      hookGoal: "Aviso amigável de que o lote promocional com cupom de frete grátis vai encerrar",
      suggestedAudioHook: `Se esse vídeo apareceu pra você, não pula porque o cupom da sacolinha amarela tá acabando!`,
      hookTypeBadge: "💸 Bug do Cupom",
    },
  ];
}
