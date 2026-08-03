import { SCRIPT_FORMATS } from "./formats-data";
import { trendProvider } from "./trend-radar";
import type {
  FormatRecommendation,
  Market,
  ProductContext,
  ProductionResources,
  ScriptFormatDefinition,
  ScriptFormatId,
} from "./types";

/**
 * Sistema de recomendação determinístico de formatos de roteiro.
 *
 * Pontuação por critério (total: 100 pontos):
 *  - Compatibilidade com categoria:       20 pts
 *  - Força da demonstração visual:        15 pts
 *  - Necessidade de confiança:            15 pts
 *  - Disponibilidade de produto físico:   10 pts
 *  - Disponibilidade de pessoa real:      10 pts
 *  - Quantidade de variações:             10 pts
 *  - Potencial de transformação:          10 pts
 *  - Compatibilidade com IA:               5 pts
 *  - Tendência internacional:              3 pts
 *  - Saturação estimada:                   2 pts
 */

type ScoredFormat = {
  format: ScriptFormatDefinition;
  score: number;
  reasons: string[];
  warnings: string[];
};

// ─── Helpers de categoria ─────────────────────────────────────────────────────
const WEARABLE_KEYWORDS = [
  "moda", "roupa", "vestuário", "calça", "vestido", "camiseta", "conjunto",
  "fitness", "blusa", "jaqueta", "casaco", "bermuda", "short", "saia",
  "calçado", "tênis", "sapato", "sandália", "bolsa", "relógio", "óculos",
  "acessório", "bijuteria", "cinto", "boné",
];

const SUPPLEMENT_KEYWORDS = [
  "suplemento", "vitamina", "colágeno", "proteína", "magnésio", "creatina",
  "omega", "cápsula", "comprimido", "gummies", "whey", "pré-treino",
];

const BEAUTY_KEYWORDS = [
  "beleza", "skincare", "maquiagem", "sérum", "creme", "máscara", "primer",
  "base", "batom", "hidratante", "protetor", "perfume", "fragrância",
  "capilar", "shampoo", "condicionador", "hair", "cabelo",
];

const CLEANING_KEYWORDS = [
  "limpeza", "limpador", "vaporizador", "removedor", "organizador",
  "lavadora", "esponja", "detergente", "desengordurante", "esfregão",
];

const KIT_KEYWORDS = [
  "kit", "combo", "caixa", "pacote", "conjunto de", "rotina",
  "coleção", "pack",
];

const FOOD_KEYWORDS = [
  "alimento", "bebida", "sabor", "lanche", "snack", "proteico", "barra",
  "achocolatado", "café", "chá", "suco",
];

function categorizeProduct(product: ProductContext): ProductContext {
  const cat = product.category.toLowerCase();
  return {
    ...product,
    isWearable: WEARABLE_KEYWORDS.some((k) => cat.includes(k)) || product.isWearable,
    isSupplement: SUPPLEMENT_KEYWORDS.some((k) => cat.includes(k)) || product.isSupplement,
    isTopicalApplication: BEAUTY_KEYWORDS.some((k) => cat.includes(k)) || product.isTopicalApplication,
    hasSatisfyingDemo: CLEANING_KEYWORDS.some((k) => cat.includes(k)) || product.hasSatisfyingDemo,
    isKit: KIT_KEYWORDS.some((k) => cat.includes(k)) || product.isKit,
    isFood: FOOD_KEYWORDS.some((k) => cat.includes(k)) || product.isFood,
    isFragrance: cat.includes("perfume") || cat.includes("fragrância") || product.isFragrance,
    needsTrust:
      SUPPLEMENT_KEYWORDS.some((k) => cat.includes(k)) ||
      product.ticketTier === "high" ||
      product.needsTrust,
    hasRegulation:
      SUPPLEMENT_KEYWORDS.some((k) => cat.includes(k)) ||
      cat.includes("saúde") ||
      product.hasRegulation,
  };
}

// ─── Pontuação por critério ───────────────────────────────────────────────────

/** Critério 1: Compatibilidade com categoria (20 pts) */
function scoreCategoryCompatibility(
  format: ScriptFormatDefinition,
  product: ProductContext,
): { points: number; reason: string | null } {
  const cat = product.category.toLowerCase();

  // Verificar avoidFor
  const shouldAvoid = format.avoidFor.some((avoid) =>
    cat.includes(avoid.toLowerCase()) ||
    (product.isSupplement && avoid.toLowerCase().includes("suplemento")) ||
    (product.isFood && avoid.toLowerCase().includes("alimento")),
  );
  if (shouldAvoid) {
    return { points: 0, reason: null };
  }

  // Verificar bestFor
  const matchBestFor = format.bestFor.some((best) => {
    const bestLow = best.toLowerCase();
    return (
      cat.includes(bestLow) ||
      (product.isWearable && ["roupa", "moda", "calça", "vestido", "camiseta", "conjunto", "fitness", "bolsa", "relógio", "óculos", "acessório", "tênis"].some((k) => bestLow.includes(k))) ||
      (product.isSupplement && bestLow.includes("suplemento")) ||
      (product.isTopicalApplication && (bestLow.includes("skincare") || bestLow.includes("maquiagem") || bestLow.includes("beleza"))) ||
      (product.isKit && bestLow.includes("kit")) ||
      (product.isFood && (bestLow.includes("alimento") || bestLow.includes("bebida") || bestLow.includes("sabor"))) ||
      (product.isFragrance && (bestLow.includes("perfume") || bestLow.includes("fragrância"))) ||
      (product.hasSatisfyingDemo && bestLow.includes("limpeza"))
    );
  });

  if (matchBestFor) {
    return { points: 20, reason: `Formato indicado para produtos de ${product.category}.` };
  }

  return { points: 8, reason: null };
}

/** Critério 2: Força da demonstração visual (15 pts) */
function scoreVisualDemonstration(
  format: ScriptFormatDefinition,
  product: ProductContext,
): { points: number; reason: string | null } {
  if (product.hasSatisfyingDemo && format.id === "satisfying_demo") {
    return { points: 15, reason: "Este produto tem alto potencial de demonstração visual satisfatória." };
  }
  if (product.hasVisualTransformation && format.id === "before_after_proof") {
    return { points: 15, reason: "O produto tem potencial verificável de antes e depois." };
  }
  if (product.isWearable && (format.id === "ai_treadmill_mannequin" || format.id === "real_treadmill_model")) {
    return { points: 13, reason: "Formato de esteira demonstra visualmente o produto vestível." };
  }
  if (format.category === "demonstration") {
    return { points: 10, reason: null };
  }
  if (format.category === "ugc") {
    return { points: 8, reason: null };
  }
  return { points: 5, reason: null };
}

/** Critério 3: Necessidade de confiança (15 pts) */
function scoreTrustNeed(
  format: ScriptFormatDefinition,
  product: ProductContext,
): { points: number; reason: string | null } {
  if (product.needsTrust && format.trustLevel >= 4) {
    return {
      points: 15,
      reason: "Produto com alta necessidade de confiança — formato UGC real é ideal.",
    };
  }
  if (product.needsTrust && format.trustLevel === 3) {
    return { points: 8, reason: null };
  }
  if (product.needsTrust && format.trustLevel <= 2) {
    return { points: 0, reason: null };
  }
  // Produto sem alta necessidade de confiança
  if (format.trustLevel >= 3) {
    return { points: 10, reason: null };
  }
  return { points: 12, reason: null }; // formatos de menor confiança ganham pontos em produtos de baixo risco
}

/** Critério 4: Disponibilidade de produto físico (10 pts) */
function scorePhysicalProduct(
  format: ScriptFormatDefinition,
  resources: ProductionResources,
): { points: number; reason: string | null; warning: string | null } {
  if (!resources.hasPhysicalProduct && format.requiresRealProduct) {
    return {
      points: 0,
      reason: null,
      warning: `Este formato requer o produto físico disponível. Você indicou não ter o produto.`,
    };
  }
  if (resources.hasPhysicalProduct && format.requiresRealProduct) {
    return { points: 10, reason: null, warning: null };
  }
  if (!resources.hasPhysicalProduct && !format.requiresRealProduct) {
    return { points: 8, reason: null, warning: null };
  }
  return { points: 10, reason: null, warning: null };
}

/** Critério 5: Disponibilidade de pessoa real (10 pts) */
function scoreRealPerson(
  format: ScriptFormatDefinition,
  resources: ProductionResources,
): { points: number; reason: string | null; warning: string | null } {
  if (!resources.realPersonAvailable && format.requiresRealPerson) {
    return {
      points: 0,
      reason: null,
      warning: `Este formato exige uma pessoa real. Você indicou não ter ninguém disponível para gravar.`,
    };
  }
  if (resources.realPersonAvailable && format.requiresRealPerson) {
    return { points: 10, reason: null, warning: null };
  }
  if (!resources.realPersonAvailable && !format.requiresRealPerson) {
    return { points: 8, reason: null, warning: null };
  }
  return { points: 10, reason: null, warning: null };
}

/** Critério 6: Quantidade de variações (10 pts) */
function scoreVariations(
  format: ScriptFormatDefinition,
  product: ProductContext,
): { points: number; reason: string | null } {
  if (product.variationCount >= 3 && (format.id === "ai_treadmill_mannequin" || format.id === "comparison_choice")) {
    return { points: 10, reason: `Produto com ${product.variationCount} variações — ideal para comparação ou esteira de looks.` };
  }
  if (product.hasVariations && format.id === "comparison_choice") {
    return { points: 9, reason: null };
  }
  if (!product.hasVariations && format.id === "comparison_choice") {
    return { points: 2, reason: null };
  }
  return { points: 5, reason: null };
}

/** Critério 7: Potencial de transformação (10 pts) */
function scoreTransformation(
  format: ScriptFormatDefinition,
  product: ProductContext,
): { points: number; reason: string | null } {
  if (product.hasVisualTransformation && format.id === "before_after_proof") {
    return { points: 10, reason: null };
  }
  if (product.isWearable && format.id === "ai_outfit_transition") {
    return { points: 10, reason: "Produto vestível com potencial de troca de looks." };
  }
  if (product.hasSatisfyingDemo) {
    return { points: 8, reason: null };
  }
  return { points: 5, reason: null };
}

/** Critério 8: Compatibilidade com IA (5 pts) */
function scoreAICompatibility(
  format: ScriptFormatDefinition,
  resources: ProductionResources,
  product: ProductContext,
): { points: number; reason: string | null; warning: string | null } {
  if (resources.fullyGeneratedByVeo && !format.supportsAI) {
    return {
      points: 0,
      reason: null,
      warning: "Você selecionou geração total por VEO, mas este formato não é otimizado para IA.",
    };
  }
  if (product.hasRegulation && format.supportsAI && format.veoCompatibility === "full") {
    return {
      points: 2,
      reason: null,
      warning: "Produtos regulados perdem pontos em formatos 100% gerados por IA. Prefira UGC real ou híbrido.",
    };
  }
  if (format.supportsAI && resources.useAiCharacter) {
    return { points: 5, reason: null, warning: null };
  }
  if (!format.supportsAI && !resources.useAiCharacter) {
    return { points: 5, reason: null, warning: null };
  }
  return { points: 3, reason: null, warning: null };
}

/** Critério 9: Tendência internacional (3 pts) */
function scoreTrend(
  format: ScriptFormatDefinition,
  market: Market,
): { points: number; reason: string | null } {
  const signals = trendProvider.getSignals(undefined, market);
  const matchingSignal = signals.find((s) => s.recommendedFormats.includes(format.id));

  if (!matchingSignal) {
    return { points: 1, reason: null };
  }

  if (matchingSignal.status === "proven" || matchingSignal.status === "rising") {
    return {
      points: 3,
      reason: `Tendência ${matchingSignal.status === "proven" ? "comprovada" : "crescente"} detectada para este formato no mercado ${market}.`,
    };
  }
  if (matchingSignal.status === "emerging") {
    return { points: 2, reason: null };
  }
  if (matchingSignal.status === "saturated" || matchingSignal.status === "cooling") {
    return { points: 0, reason: null };
  }
  return { points: 1, reason: null };
}

/** Critério 10: Saturação estimada (2 pts) */
function scoreSaturation(format: ScriptFormatDefinition): { points: number; reason: string | null } {
  if (format.trendStatus === "saturated") return { points: 0, reason: null };
  if (format.trendStatus === "cooling") return { points: 1, reason: null };
  if (format.trendStatus === "emerging") return { points: 2, reason: null };
  return { points: 2, reason: null };
}

// ─── Ajustes especiais por regras de negócio ─────────────────────────────────

function applyBusinessRuleAdjustments(
  base: number,
  format: ScriptFormatDefinition,
  product: ProductContext,
  resources: ProductionResources,
  warnings: string[],
): number {
  let score = base;

  // Produtos regulados perdem pontos em formatos 100% IA
  if (product.hasRegulation && format.supportsAI && !format.requiresRealPerson) {
    score -= 10;
    if (!warnings.some((w) => w.includes("regulado"))) {
      warnings.push("Produtos regulados (suplementos, saúde) perdem pontos em formatos totalmente gerados por IA. Prefira UGC real ou híbrido.");
    }
  }

  // Roupas com muitas cores ganham pontos em esteira e troca de looks
  if (product.isWearable && product.variationCount >= 2) {
    if (format.id === "ai_treadmill_mannequin" || format.id === "ai_outfit_transition") {
      score += 8;
    }
  }

  // Limpeza ganha em demonstração satisfatória
  if (product.hasSatisfyingDemo && format.id === "satisfying_demo") {
    score += 7;
  }

  // Kits ganham em rotina e unboxing
  if (product.isKit) {
    if (format.id === "routine_stack" || format.id === "unboxing_discovery") {
      score += 8;
    }
  }

  // Skincare de aplicação ganha em apply_on_camera
  if (product.isTopicalApplication && format.id === "apply_on_camera") {
    score += 8;
  }

  // Perfume ganha em reação, comparação e storytelling
  if (product.isFragrance) {
    if (format.id === "honest_reaction" || format.id === "comparison_choice" || format.id === "discovery_story") {
      score += 6;
    }
  }

  // Suplementos ganham em UGC real e rotina
  if (product.isSupplement) {
    if (format.id === "ugc_real_talking" || format.id === "routine_stack") {
      score += 5;
    }
    // Suplementos perdem em antes e depois (alto risco de compliance)
    if (format.id === "before_after_proof") {
      score -= 15;
      if (!warnings.some((w) => w.includes("antes e depois"))) {
        warnings.push("Formato de antes e depois é de alto risco para suplementos. Evite ou use somente com resultado real e documentado, com aviso de 'resultados podem variar'.");
      }
    }
  }

  // Alimentos ganham em reação e comparação
  if (product.isFood) {
    if (format.id === "honest_reaction" || format.id === "comparison_choice" || format.id === "unboxing_discovery") {
      score += 6;
    }
  }

  // Produtos masculinos ganham bônus em formatos com gap masculino
  if (product.targetGender === "male") {
    if (format.id === "ugc_real_talking" || format.id === "routine_stack" || format.id === "ai_treadmill_mannequin") {
      score += 4;
    }
  }

  // Produtos sem amostra física perdem em reação, resenha e aplicação real
  if (!resources.hasPhysicalProduct) {
    if (format.id === "honest_reaction" || format.id === "apply_on_camera" || format.id === "before_after_proof") {
      score -= 20;
      warnings.push(`O formato "${format.name}" requer produto físico disponível. Script não usará frases de experiência pessoal.`);
    }
  }

  // Ticket alto ganha em UGC real e demonstração detalhada
  if (product.ticketTier === "high") {
    if (format.id === "ugc_real_talking" || format.id === "satisfying_demo" || format.id === "apply_on_camera") {
      score += 5;
    }
  }

  // Ticket baixo ganha em no-speak, comparação e vídeos curtos
  if (product.ticketTier === "low") {
    if (format.id === "silent_visual_demo" || format.id === "comparison_choice") {
      score += 5;
    }
  }

  // Formato de esteira não é tendência comprovada — deixar claro
  if (format.id === "ai_treadmill_mannequin") {
    if (!warnings.some((w) => w.includes("emergente"))) {
      warnings.push("O formato de esteira com manequim de IA é emergente, não tendência comprovada em vendas. Teste antes de escalar.");
    }
  }

  return Math.min(100, Math.max(0, score));
}

// ─── Função principal de recomendação ─────────────────────────────────────────

/**
 * Analisa o produto e os recursos de produção e retorna os formatos mais adequados ordenados por score.
 */
export function recommendScriptFormats(
  productRaw: ProductContext,
  resources: ProductionResources,
  objective: string,
  market: Market,
): FormatRecommendation[] {
  const product = categorizeProduct(productRaw);
  const scored: ScoredFormat[] = [];

  for (const format of SCRIPT_FORMATS) {
    const reasons: string[] = [];
    const warnings: string[] = [];

    const cat = scoreCategoryCompatibility(format, product);
    const visual = scoreVisualDemonstration(format, product);
    const trust = scoreTrustNeed(format, product);
    const physical = scorePhysicalProduct(format, resources);
    const person = scoreRealPerson(format, resources);
    const variations = scoreVariations(format, product);
    const transformation = scoreTransformation(format, product);
    const ai = scoreAICompatibility(format, resources, product);
    const trend = scoreTrend(format, market);
    const saturation = scoreSaturation(format);

    // Coletar warnings
    if (physical.warning) warnings.push(physical.warning);
    if (person.warning) warnings.push(person.warning);
    if (ai.warning) warnings.push(ai.warning);

    // Coletar reasons
    if (cat.reason) reasons.push(cat.reason);
    if (visual.reason) reasons.push(visual.reason);
    if (trust.reason) reasons.push(trust.reason);
    if (variations.reason) reasons.push(variations.reason);
    if (transformation.reason) reasons.push(transformation.reason);
    if (trend.reason) reasons.push(trend.reason);

    const baseScore =
      cat.points +
      visual.points +
      trust.points +
      physical.points +
      person.points +
      variations.points +
      transformation.points +
      ai.points +
      trend.points +
      saturation.points;

    const finalScore = applyBusinessRuleAdjustments(baseScore, format, product, resources, warnings);

    // Razão genérica se não houver específica
    if (reasons.length === 0 && finalScore >= 60) {
      reasons.push(`Formato compatível com ${product.category} e os recursos disponíveis.`);
    }

    // Duração sugerida
    let suggestedDuration = format.defaultDuration;
    if (resources.totalDurationSeconds > 0) {
      suggestedDuration = Math.min(resources.totalDurationSeconds, format.defaultDuration * 1.3);
    }

    // Variação sugerida para esteira
    let suggestedVariation: string | undefined;
    if (format.id === "ai_treadmill_mannequin" && product.variationCount >= 3) {
      suggestedVariation = "color_catalog";
    }

    // Nota de tendência
    const signals = trendProvider.getSignals(product.category, market);
    const matchSignal = signals.find((s) => s.recommendedFormats.includes(format.id));
    const trendNote = matchSignal
      ? `${matchSignal.subcategory}: ${matchSignal.status} no mercado ${market}`
      : undefined;

    // Recursos necessários
    const requiredResources: string[] = [];
    if (format.requiresRealProduct) requiredResources.push("Produto físico");
    if (format.requiresRealPerson) requiredResources.push("Pessoa real para gravar");
    if (format.supportsAI && resources.fullyGeneratedByVeo) requiredResources.push("Geração via Google VEO");
    if (format.id === "ai_treadmill_mannequin") requiredResources.push("Personagem ou manequim de IA");

    scored.push({
      format,
      score: finalScore,
      reasons,
      warnings,
    });

    // Adiciona ao resultado final
    void suggestedVariation;
    void trendNote;
    void requiredResources;
    void suggestedDuration;
  }

  // Ordenar por score
  scored.sort((a, b) => b.score - a.score);

  // Converter para FormatRecommendation
  return scored.map((s) => {
    const product2 = product;
    const resources2 = resources;
    const format = s.format;

    const requiredResources: string[] = [];
    if (format.requiresRealProduct) requiredResources.push("Produto físico");
    if (format.requiresRealPerson) requiredResources.push("Pessoa real para gravar");
    if (format.supportsAI && resources2.fullyGeneratedByVeo) requiredResources.push("Geração via Google VEO");
    if (format.id === "ai_treadmill_mannequin") requiredResources.push("Personagem ou manequim de IA");

    let suggestedDuration = format.defaultDuration;
    if (resources2.totalDurationSeconds > 0) {
      suggestedDuration = Math.round(Math.min(resources2.totalDurationSeconds, format.defaultDuration * 1.3));
    }

    const signals = trendProvider.getSignals(product2.category, market);
    const matchSignal = signals.find((sig) => sig.recommendedFormats.includes(format.id));
    const trendNote = matchSignal
      ? `${matchSignal.subcategory}: ${matchSignal.status} no mercado ${market}`
      : undefined;

    const suggestedVariation =
      format.id === "ai_treadmill_mannequin" && product2.variationCount >= 3 ? "color_catalog" : undefined;

    return {
      formatId: format.id as ScriptFormatId,
      score: s.score,
      reasons: s.reasons,
      warnings: s.warnings,
      requiredResources,
      suggestedDuration,
      ...(suggestedVariation ? { suggestedVariation } : {}),
      ...(trendNote ? { trendNote } : {}),
    };
  });
}


/**
 * Retorna os 3 formatos mais recomendados com scores normalizados para exibição.
 */
export function getTopRecommendations(
  product: ProductContext,
  resources: ProductionResources,
  objective: string,
  market: Market,
): FormatRecommendation[] {
  const all = recommendScriptFormats(product, resources, objective, market);

  // Normalizar scores para que o melhor fique entre 85-99
  const topScore = all[0]?.score ?? 100;
  const normalized = all.map((r) => ({
    ...r,
    score: topScore > 0 ? Math.round((r.score / topScore) * 94) : r.score,
  }));

  return normalized.slice(0, 3);
}

/** Detecta o contexto do produto a partir das strings de formulário. */
export function inferProductContext(
  category: string,
  description: string,
  benefits: string,
  audience: string,
  price: number | null,
  variationCount: number,
): ProductContext {
  const combined = `${category} ${description} ${benefits}`.toLowerCase();
  const audienceLow = audience.toLowerCase();

  const ticketTier =
    price !== null
      ? price >= 150
        ? "high"
        : price >= 40
          ? "medium"
          : "low"
      : "medium";

  return {
    category,
    hasVariations: variationCount > 1,
    variationCount,
    price,
    needsTrust:
      SUPPLEMENT_KEYWORDS.some((k) => combined.includes(k)) ||
      ticketTier === "high" ||
      BEAUTY_KEYWORDS.some((k) => combined.includes(k)),
    hasRegulation:
      SUPPLEMENT_KEYWORDS.some((k) => combined.includes(k)) ||
      combined.includes("saúde"),
    hasVisualTransformation:
      CLEANING_KEYWORDS.some((k) => combined.includes(k)) ||
      combined.includes("antes") ||
      combined.includes("transforma"),
    isWearable: WEARABLE_KEYWORDS.some((k) => combined.includes(k)),
    isKit: KIT_KEYWORDS.some((k) => combined.includes(k)),
    isTopicalApplication: BEAUTY_KEYWORDS.some((k) => combined.includes(k)),
    hasSatisfyingDemo: CLEANING_KEYWORDS.some((k) => combined.includes(k)),
    targetAudience: audience,
    targetGender:
      audienceLow.includes("masculino") || audienceLow.includes("homem")
        ? "male"
        : audienceLow.includes("feminino") || audienceLow.includes("mulher")
          ? "female"
          : "neutral",
    isFragrance:
      combined.includes("perfume") || combined.includes("fragrância"),
    isFood: FOOD_KEYWORDS.some((k) => combined.includes(k)),
    isSupplement: SUPPLEMENT_KEYWORDS.some((k) => combined.includes(k)),
    ticketTier,
  };
}
