import type { Market, ScriptFormatId, TrendProvider, TrendSignal, TrendStatus } from "./types";


/**
 * Radar de tendências internacionais.
 * IMPORTANTE: Os dados são estáticos, curados manualmente.
 * Não são em tempo real. Atualizado em: 2026-08-03.
 * Prepare a interface `TrendProvider` para substituição futura por
 * FastMoss, Kalodata ou TikTok Creative Center.
 */

const UPDATED_AT = "2026-08-03";

const SIGNALS: TrendSignal[] = [
  // ─── Beleza e skincare ────────────────────────────────────────────────────
  {
    id: "balm_facial_bastao",
    market: "INTL",
    category: "Beleza",
    subcategory: "Balm facial em bastão",
    status: "proven",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["apply_on_camera", "ugc_real_talking", "satisfying_demo"],
    notes: "Alta conversão. Aplicação em vídeo é o principal argumento de venda.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "pdrn_skincare",
    market: "US",
    category: "Beleza",
    subcategory: "PDRN",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "apply_on_camera", "routine_stack"],
    notes: "Forte no mercado americano, mas competitivo. Atenção às alegações clínicas.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "pads_poros",
    market: "US",
    category: "Beleza",
    subcategory: "Pads para poros",
    status: "steady",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["apply_on_camera", "satisfying_demo", "before_after_proof"],
    notes: "Estável. Demonstração satisfatória da remoção de impurezas é o formato que mais converte.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "medium",
  },
  {
    id: "glass_skin_kit",
    market: "INTL",
    category: "Beleza",
    subcategory: "Kits de glass skin",
    status: "proven",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["routine_stack", "ugc_hybrid_ai", "apply_on_camera"],
    notes: "Kits de rotina com resultado visual claro. Rotina em etapas é o formato ideal.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "bastao_esfoliante_corporal",
    market: "US",
    category: "Beleza",
    subcategory: "Bastão corporal esfoliante",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["satisfying_demo", "apply_on_camera", "ugc_hybrid_ai"],
    notes: "Crescente. Demonstração satisfatória da esfoliação gera grande engajamento.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "skincare_etapas",
    market: "INTL",
    category: "Beleza",
    subcategory: "Skincare em etapas",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["routine_stack", "apply_on_camera"],
    notes: "Formato educativo de rotina crescendo. Conteúdo de aplicação real é recomendado.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },

  // ─── Suplementos e bem-estar ────────────────────────────────────────────────
  {
    id: "magnesio",
    market: "INTL",
    category: "Suplementos",
    subcategory: "Magnésio",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "routine_stack", "discovery_story"],
    notes: "Crescente. UGC real gera mais confiança que formatos de IA. Evitar alegações sobre sono como garantia.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "rotina_sono",
    market: "INTL",
    category: "Suplementos",
    subcategory: "Rotina de sono",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["routine_stack", "ugc_real_talking", "discovery_story"],
    notes: "Forte. Narrativa de rotina noturna ressoa bem. Cuidado com alegações de cura de insônia.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "colageno",
    market: "INTL",
    category: "Suplementos",
    subcategory: "Colágeno",
    status: "proven",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "routine_stack", "before_after_proof"],
    notes: "Comprovado, mas mercado competitivo. Antes e depois exige resultado real documentado.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "gummies_suplementos",
    market: "US",
    category: "Suplementos",
    subcategory: "Gummies",
    status: "steady",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["honest_reaction", "ugc_real_talking", "comparison_choice"],
    notes: "Estáveis. Reação honesta ao sabor é diferencial. Atenção às alegações de saúde.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "beauty_inside_out",
    market: "INTL",
    category: "Suplementos",
    subcategory: "Beleza de dentro para fora",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "routine_stack", "ugc_hybrid_ai"],
    notes: "Forte. Combinar skincare externo com suplemento interno. Sem promessas de resultado garantido.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "proteina_caixas_variadas",
    market: "US",
    category: "Suplementos",
    subcategory: "Proteína em caixas variadas",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["honest_reaction", "comparison_choice", "unboxing_discovery"],
    notes: "Oportunidade. Ranking de sabores e reação genuína são formatos que funcionam.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "medium",
  },
  {
    id: "recuperacao_muscular",
    market: "INTL",
    category: "Suplementos",
    subcategory: "Recuperação muscular",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "routine_stack", "problem_solution"],
    notes: "Crescente. UGC masculino com rotina de pré e pós treino converte bem.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },

  // ─── Moda ─────────────────────────────────────────────────────────────────
  {
    id: "calca_wide_leg",
    market: "INTL",
    category: "Moda",
    subcategory: "Calça wide leg",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_treadmill_mannequin", "real_treadmill_model", "ai_outfit_transition"],
    notes: "Crescente. Formato de esteira mostra o caimento da calça de forma convincente.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "shapewear",
    market: "US",
    category: "Moda",
    subcategory: "Shapewear",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["real_treadmill_model", "ugc_real_talking", "before_after_proof"],
    notes: "Crescente. Modelo real é preferível para shapewear — IA pode misrepresentar o efeito real.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "medium",
  },
  {
    id: "camiseta_oversized",
    market: "BR",
    category: "Moda",
    subcategory: "Camisetas oversized",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_treadmill_mannequin", "real_treadmill_model", "comparison_choice"],
    notes: "Fortes quando bem posicionadas. Enquetes de cor geram engajamento.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "conjuntos_confortaveis",
    market: "INTL",
    category: "Moda",
    subcategory: "Conjuntos confortáveis",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_treadmill_mannequin", "real_treadmill_model", "ai_outfit_transition"],
    notes: "Fortes. Conjuntos completos vendem melhor que peças separadas neste nicho.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "esteira_ai_moda",
    market: "US",
    category: "Moda",
    subcategory: "Manequim de IA na esteira",
    status: "emerging",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_treadmill_mannequin"],
    notes: "EMERGENTE — não é tendência comprovada em vendas. Formato visualmente atraente mas com fidelidade incerta do produto. Atenção às inconsistências de IA.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "troca_looks_ai",
    market: "US",
    category: "Moda",
    subcategory: "Troca de looks com IA",
    status: "emerging",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_outfit_transition"],
    notes: "EMERGENTE. Alto potencial visual, mas ainda experimental em conversão.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "modelo_real_caimento",
    market: "INTL",
    category: "Moda",
    subcategory: "Modelo real e prova de caimento",
    status: "proven",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["real_treadmill_model", "ugc_real_talking"],
    notes: "Comprovado. Autenticidade do modelo real ainda supera IA em conversão para moda.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },

  // ─── Masculino ──────────────────────────────────────────────────────────────
  {
    id: "perfume_masculino",
    market: "BR",
    category: "Masculino",
    subcategory: "Perfume masculino",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "honest_reaction", "comparison_choice", "discovery_story"],
    notes: "Oportunidade clara. Gap masculino no TikTok Shop Brasil. Formatos que exploram reação e comparação funcionam.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "grooming_masculino",
    market: "BR",
    category: "Masculino",
    subcategory: "Grooming masculino",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["routine_stack", "ugc_real_talking", "apply_on_camera"],
    notes: "Oportunidade. Rotina de barba/cabelo masculino tem baixa saturação no Brasil.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "kits_capilares_masc",
    market: "BR",
    category: "Masculino",
    subcategory: "Kits capilares masculinos",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["routine_stack", "unboxing_discovery", "ugc_real_talking"],
    notes: "Crescente. Kits completos de cuidado capilar masculino têm oportunidade real.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "suplementos_masculinos",
    market: "BR",
    category: "Masculino",
    subcategory: "Suplementos masculinos",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ugc_real_talking", "routine_stack"],
    notes: "Oportunidade, mas com controle rigoroso de alegações. Nunca usar linguagem sobre testosterona ou performance sexual sem base regulatória.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "high",
  },
  {
    id: "moda_masculina_minimalista",
    market: "INTL",
    category: "Masculino",
    subcategory: "Moda masculina minimalista",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["ai_treadmill_mannequin", "real_treadmill_model", "silent_visual_demo"],
    notes: "Oportunidade. Estética masculina limpa combina bem com formato de esteira.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },

  // ─── Casa e utilidades ──────────────────────────────────────────────────────
  {
    id: "lavadora_portatil",
    market: "INTL",
    category: "Casa",
    subcategory: "Lavadora portátil",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["satisfying_demo", "problem_solution", "silent_visual_demo"],
    notes: "Forte. Demonstração satisfatória da limpeza gera alta retenção.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "limpador_vapor",
    market: "INTL",
    category: "Casa",
    subcategory: "Limpador a vapor",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["satisfying_demo", "problem_solution", "before_after_proof"],
    notes: "Forte. Antes e depois real de superfícies é o formato que mais converte.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "organizacao_casa",
    market: "INTL",
    category: "Casa",
    subcategory: "Produtos de organização",
    status: "steady",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["satisfying_demo", "before_after_proof", "silent_visual_demo"],
    notes: "Estável. Transformação visual antes/depois é o formato padrão que funciona.",
    brazilCompatibility: "high",
    seasonality: null,
    complianceRisk: "low",
  },
  {
    id: "ventiladores_resfriamento",
    market: "US",
    category: "Casa",
    subcategory: "Ventiladores e resfriamento",
    status: "seasonal",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["problem_solution", "satisfying_demo", "silent_visual_demo"],
    notes: "SAZONAL — só priorizar no verão brasileiro (nov-mar). Viral nos EUA no verão americano (mai-ago).",
    brazilCompatibility: "medium",
    seasonality: "Verão brasileiro (novembro a março)",
    complianceRisk: "low",
  },
  {
    id: "roupas_cama_conforto",
    market: "INTL",
    category: "Casa",
    subcategory: "Roupas de cama e conforto",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["satisfying_demo", "silent_visual_demo", "discovery_story"],
    notes: "Oportunidade. Texturas de tecido em close geram retenção.",
    brazilCompatibility: "high",
    seasonality: "Inverno brasileiro (maio a agosto)",
    complianceRisk: "low",
  },

  // ─── Alimentação ────────────────────────────────────────────────────────────
  {
    id: "caixas_sabores",
    market: "US",
    category: "Alimentação",
    subcategory: "Caixas de sabores",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["honest_reaction", "unboxing_discovery", "comparison_choice"],
    notes: "Forte. Reação genuína ao primeiro gosto é o formato que mais converte.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "medium",
  },
  {
    id: "snacks_proteicos",
    market: "US",
    category: "Alimentação",
    subcategory: "Snacks proteicos",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["honest_reaction", "comparison_choice"],
    notes: "Oportunidade crescente. Rankings de sabores geram comentários e viralizaram nos EUA.",
    brazilCompatibility: "medium",
    seasonality: null,
    complianceRisk: "medium",
  },
  {
    id: "produtos_presenteaveis",
    market: "INTL",
    category: "Alimentação",
    subcategory: "Produtos presenteáveis",
    status: "rising",
    updatedAt: UPDATED_AT,
    recommendedFormats: ["unboxing_discovery", "comparison_choice"],
    notes: "Oportunidade. Datas comemorativas são pontos de alta conversão.",
    brazilCompatibility: "high",
    seasonality: "Datas comemorativas (Dia das Mães, Natal, Dia dos Namorados)",
    complianceRisk: "low",
  },
];

/**
 * Provider estático de tendências.
 * No futuro, esta interface pode ser implementada por FastMossProvider ou KalodataProvider.
 */
class StaticTrendProvider implements TrendProvider {
  readonly name = "StaticTrendProvider";
  readonly isRealTime = false;
  readonly updatedAt = UPDATED_AT;

  getSignals(category?: string, market?: Market): TrendSignal[] {
    let result = SIGNALS;
    if (category) {
      result = result.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }
    if (market) {
      result = result.filter((s) => s.market === market || s.market === "INTL");
    }
    return result;
  }

  getSignalForSubcategory(subcategory: string): TrendSignal | null {
    return (
      SIGNALS.find((s) => s.subcategory.toLowerCase().includes(subcategory.toLowerCase())) ?? null
    );
  }
}

/** Provider padrão — substitua por FastMoss ou Kalodata quando disponível. */
export const trendProvider: TrendProvider = new StaticTrendProvider();

/**
 * Etiquetas legíveis para status de tendência.
 */
export const TREND_LABELS: Record<TrendStatus, string> = {
  proven: "Tendência comprovada",
  rising: "Crescente",
  emerging: "Emergente",
  seasonal: "Sazonal",
  steady: "Estável",
  cooling: "Desacelerando",
  saturated: "Saturado",
  experimental: "Experimental",
};

/**
 * Cores para cada status de tendência (classes Tailwind).
 */
export const TREND_COLORS: Record<TrendStatus, string> = {
  proven: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  rising: "bg-cyan/15 text-cyan border-cyan/30",
  emerging: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  seasonal: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  steady: "bg-secondary text-muted-foreground border-border",
  cooling: "bg-orange-500/15 text-orange-400 border-orange-500/30",
  saturated: "bg-destructive/15 text-destructive border-destructive/30",
  experimental: "bg-pink/15 text-pink border-pink/30",
};

/**
 * Avalia o potencial de importação de uma tendência americana/europeia para o Brasil.
 * Considera sazonalidade, saturação local, compatibilidade cultural e mercado.
 */
export function evaluateBrazilPotential(signal: TrendSignal): {
  score: "high" | "medium" | "low";
  note: string;
} {
  if (signal.market === "BR") {
    return { score: signal.brazilCompatibility, note: "Tendência nativa do mercado brasileiro." };
  }

  // Sazonalidade invertida entre hemisférios
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const isBrazilWinter = currentMonth >= 5 && currentMonth <= 8;
  const isBrazilSummer = currentMonth >= 11 || currentMonth <= 3;

  if (signal.seasonality) {
    if (
      signal.seasonality.toLowerCase().includes("verão") && !isBrazilSummer
    ) {
      return {
        score: "low",
        note: `Esta tendência é sazonal de verão. No Brasil, o verão ocorre de novembro a março. Atualmente fora do período ideal.`,
      };
    }
    if (
      signal.seasonality.toLowerCase().includes("inverno") && !isBrazilWinter
    ) {
      return {
        score: "low",
        note: `Esta tendência é sazonal de inverno. No Brasil, o inverno ocorre de maio a agosto. Atualmente fora do período ideal.`,
      };
    }
  }

  return {
    score: signal.brazilCompatibility,
    note:
      signal.brazilCompatibility === "high"
        ? "Alta compatibilidade com o mercado brasileiro."
        : signal.brazilCompatibility === "medium"
          ? "Compatibilidade média — pode precisar de adaptação cultural ou de preço."
          : "Baixa compatibilidade — tendência americana/europeia que não se traduz bem para o Brasil.",
  };
}
