import type { EditorTextOverlay } from "@/features/video-editor/engine";

export interface Frame0Headline {
  id: string;
  category: "outfit_combo" | "elegance" | "comfort" | "body_fit" | "fabric_proof" | "curiosity";
  categoryLabel: string;
  headline: string;
  productContext?: string;
}

export type HeadlineBgStyle = "transparent_stroke" | "yellow_box" | "purple_box" | "black_box" | "white_box" | "custom";

const SMART_NICHE_HEADLINES: Record<string, string[]> = {
  conjunto: [
    "Look completo e perfeito sem pensar na combinação.",
    "Aquele conjuntinho que veste tão bem que você não vai querer tirar.",
    "A praticidade de estar arrumada e impecável em menos de 2 minutos.",
    "Elegante para sair à noite e confortável para o dia todo.",
    "O caimento que valoriza a cintura sem apertar absolutamente nada.",
    "Duas peças que você usa juntas ou combina com tudo no guarda-roupa.",
  ],
  vestido: [
    "O vestido que veste como uma luva sem marcar nada.",
    "Parece peça cara de shopping, mas direto da confecção de fábrica.",
    "A elegância de colocar uma peça única e estar pronta para qualquer ocasião.",
    "Caimento impecável com tecido encorpado que não fica nada transparente.",
    "Aquele modelo que valoriza o corpo com conforto surreal.",
  ],
  fitness: [
    "Zero transparência mesmo no agachamento mais fundo.",
    "Modela a cintura, disfarça tudo e não enrola durante o treino.",
    "Tecido encorpado de alta compressão que segura tudo no lugar.",
    "A peça fitness que você vai querer uma de cada cor no armário.",
    "Não marca celulite e dá aquela sustentação que a gente ama.",
  ],
  alfaiataria: [
    "Corte de alfaiataria impecável que transforma qualquer look básico.",
    "Aquele caimento elegante que parece feito sob medida para você.",
    "Tecido premium que não amassa e mantém a elegância o dia inteiro.",
    "A peça coringa indispensável para estar arrumada e sofisticada.",
  ],
  geral: [
    "Look completo e perfeito sem pensar na combinação.",
    "A qualidade desse tecido de pertinho vai te surpreender.",
    "O caimento perfeito que valoriza o corpo sem marcar nada.",
    "A praticidade de estar pronta em 2 minutos com estilo impecável.",
    "Zero transparência e um toque aveludado surreal.",
    "A peça que virou a queridinha de quem comprou essa semana.",
  ],
};

export function generateSmartHeadlinesFromContext(
  contextText?: string,
  count = 5,
): Frame0Headline[] {
  const query = (contextText || "").toLowerCase();
  let pool: string[] = [];

  if (query.includes("conjunto") || query.includes("saia") || query.includes("cropped") || query.includes("duas pecas") || query.includes("cetim")) {
    pool = [...SMART_NICHE_HEADLINES["conjunto"]!, ...SMART_NICHE_HEADLINES["geral"]!];
  } else if (query.includes("vestido") || query.includes("midi") || query.includes("longo")) {
    pool = [...SMART_NICHE_HEADLINES["vestido"]!, ...SMART_NICHE_HEADLINES["geral"]!];
  } else if (query.includes("fitness") || query.includes("legging") || query.includes("top") || query.includes("treino")) {
    pool = [...SMART_NICHE_HEADLINES["fitness"]!, ...SMART_NICHE_HEADLINES["geral"]!];
  } else if (query.includes("alfaiataria") || query.includes("calca") || query.includes("blazer") || query.includes("short")) {
    pool = [...SMART_NICHE_HEADLINES["alfaiataria"]!, ...SMART_NICHE_HEADLINES["geral"]!];
  } else {
    pool = [
      ...SMART_NICHE_HEADLINES["conjunto"]!,
      ...SMART_NICHE_HEADLINES["geral"]!,
      ...SMART_NICHE_HEADLINES["vestido"]!,
    ];
  }

  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((headline, index) => {
    const item: Frame0Headline = {
      id: `smart-head-${Date.now()}-${index}`,
      category: "outfit_combo",
      categoryLabel: "👗 Look & Caimento",
      headline,
    };
    if (contextText) item.productContext = contextText;
    return item;
  });
}

export function createNaturalFrame0Overlay(
  headline: string,
  options: {
    bgStyle: HeadlineBgStyle;
    customBgColor?: string;
    fontSize?: number;
    strokeWidth?: number;
    strokeColor?: string;
    textColor?: string;
  },
): EditorTextOverlay {
  const fontSize = options.fontSize ?? 48;
  let backgroundColor = "transparent";
  let color = options.textColor || "#ffffff";
  let strokeColor = options.strokeColor || "#000000";
  let strokeWidth = options.strokeWidth ?? 6;
  let borderRadius = 0;

  if (options.bgStyle === "transparent_stroke") {
    // Exact visual from user photo: Pure white text + heavy smooth black outline
    backgroundColor = "transparent";
    color = "#ffffff";
    strokeColor = "#000000";
    strokeWidth = 6;
    borderRadius = 0;
  } else if (options.bgStyle === "yellow_box") {
    backgroundColor = "#facc15";
    color = "#000000";
    strokeColor = "#000000";
    strokeWidth = 0;
    borderRadius = 14;
  } else if (options.bgStyle === "purple_box") {
    backgroundColor = "#7c3aed";
    color = "#ffffff";
    strokeColor = "#000000";
    strokeWidth = 2;
    borderRadius = 14;
  } else if (options.bgStyle === "black_box") {
    backgroundColor = "rgba(0, 0, 0, 0.78)";
    color = "#ffffff";
    strokeColor = "#000000";
    strokeWidth = 0;
    borderRadius = 12;
  } else if (options.bgStyle === "white_box") {
    backgroundColor = "rgba(255, 255, 255, 0.95)";
    color = "#000000";
    strokeColor = "#000000";
    strokeWidth = 0;
    borderRadius = 12;
  } else if (options.bgStyle === "custom" && options.customBgColor) {
    backgroundColor = options.customBgColor;
    borderRadius = 14;
  }

  return {
    id: `text-frame0-${crypto.randomUUID()}`,
    text: headline,
    start: 0,
    end: 1.2, // Exact 1.2s for psychological pause retention
    x: 50, // Centered horizontally
    y: 32, // Upper-third: highly visible, doesn't cover hands or bottom bag
    fontSize,
    color,
    backgroundColor,
    style: "classic",
    animationIn: "pop",
    animationOut: "fade",
    animationLoop: "none",
    animationDuration: 0.15,
    fontFamily: "system-ui, Montserrat, Nunito, Arial, sans-serif",
    fontWeight: 900,
    strokeColor,
    strokeWidth,
    shadowColor: "rgba(0,0,0,0.6)",
    shadowBlur: 2,
    shadowOffsetX: 0,
    shadowOffsetY: 2,
    rotation: 0,
    letterSpacing: -0.2,
    textTransform: "none", // Retains natural capitalization (Sentence Case like user photo!)
    borderRadius,
  };
}
