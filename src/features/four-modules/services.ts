import type {
  CharacterProfile,
  CopyAnalysis,
  CopySegment,
  CreativeMetrics,
  CreativeVariant,
  DerivedMetrics,
  ScenarioProfile,
  SimilarityRiskResult,
} from "./types";

// ─── 1. ESTIMATIVA DE DURAÇÃO DE FALA ───────────────────────────────────────

export function estimateSpeechDuration(
  text: string,
  speed: "slow" | "natural" | "fast" | "very_fast" = "natural",
) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const wpmMap = {
    slow: 110,
    natural: 140,
    fast: 175,
    very_fast: 210,
  };
  const wpm = wpmMap[speed] ?? 140;
  const durationSeconds = Math.round((words / wpm) * 60);

  return {
    wordCount: words,
    speedLabel: speed,
    wpm,
    estimatedDurationSeconds: durationSeconds,
  };
}

// ─── 2. RISCO DE SEMELHANÇA EDITORIAL ───────────────────────────────────────

export function calculateSimilarityRisk(
  originalCopy: string,
  newCopy: string,
): SimilarityRiskResult {
  const origLower = originalCopy.toLowerCase().trim();
  const newLower = newCopy.toLowerCase().trim();

  if (!origLower || !newLower) {
    return {
      risk: "low",
      score: 0,
      reasons: ["Sem conteúdo suficiente para comparação."],
      similarPhrases: [],
      rewritingSuggestions: [],
    };
  }

  const origPhrases = origLower
    .split(/[.!?\n]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 8);
  const newPhrases = newLower
    .split(/[.!?\n]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 8);

  const similarPhrases: { original: string; generated: string; reason: string }[] = [];
  let literalMatches = 0;

  for (const newP of newPhrases) {
    for (const origP of origPhrases) {
      if (newP === origP) {
        literalMatches += 1;
        similarPhrases.push({
          original: origP,
          generated: newP,
          reason: "Frase exatamente idêntica à referência.",
        });
      } else if (newP.includes(origP) || origP.includes(newP)) {
        literalMatches += 0.7;
        similarPhrases.push({
          original: origP,
          generated: newP,
          reason: "Frase contém trecho literal da copy de referência.",
        });
      }
    }
  }

  const matchRatio = newPhrases.length > 0 ? (literalMatches / newPhrases.length) * 100 : 0;

  let risk: "low" | "medium" | "high" | "very_high" = "low";
  const reasons: string[] = [];
  const suggestions: string[] = [];

  if (matchRatio >= 50) {
    risk = "very_high";
    reasons.push("Mais de 50% das frases contêm repetição literal da copy original.");
    suggestions.push("Reescreva os ganchos e CTAs com palavras sinônimas e estilo próprio.");
  } else if (matchRatio >= 30) {
    risk = "high";
    reasons.push("Sobreposição significativa de termos e expressões da referência.");
    suggestions.push("Substitua expressões marcantes da copy de origem por novas metáforas.");
  } else if (matchRatio >= 15) {
    risk = "medium";
    reasons.push("Algumas frases mantêm construções literais similares.");
    suggestions.push("Altere a ordem dos argumentos para diversificar a narrativa.");
  } else {
    risk = "low";
    reasons.push("Nível de semelhança dentro de margem segura e editorialmente original.");
  }

  return {
    risk,
    score: Math.min(100, Math.round(matchRatio * 1.5)),
    reasons,
    similarPhrases,
    rewritingSuggestions: suggestions,
  };
}

// ─── 3. COMPOSITORES DE PROMPTS PARA VEO ────────────────────────────────────

export function buildCharacterConsistencyBlock(character: CharacterProfile): string {
  const app = character.appearance;
  const outfit = character.outfitPresets[0];

  return `CHARACTER CONSISTENCY MANDATE:
Name/Identity: ${character.name} (${character.type})
Visual Age: ${app.visualAge ?? "25-30"} | Height: ${app.height ?? "1.68m"} | Body: ${app.bodyType ?? "slender"}
Face & Hair: ${app.faceShape ?? "oval"} face, ${app.skinTone ?? "fair"} skin, ${app.hairColor ?? "brown"} ${app.hairStyle ?? "natural waves"} hair.
Outfit: ${outfit?.top ?? "white shirt"}, ${outfit?.bottom ?? "pants"}, ${outfit?.footwear ?? "shoes"}.
IMMUTABLE: Maintain exact facial features, body proportions, hair style and outfit across every frame.`;
}

export function buildScenarioConsistencyBlock(scenario: ScenarioProfile): string {
  const env = scenario.environment;
  const light = scenario.lighting;

  return `SCENARIO CONSISTENCY MANDATE:
Environment: ${scenario.name} (${env.spaceType ?? "bedroom"})
Walls/Floor: ${env.wall ?? "neutral"} walls, ${env.floor ?? "wood"} floor.
Lighting: ${light.preset ?? "natural soft"} lighting, main source: ${light.mainSource ?? "window"}.
IMMUTABLE: Keep furniture position, background textures, lighting temperature and camera depth strictly fixed.`;
}

export function buildVeoScenePrompt(params: {
  character?: CharacterProfile | null;
  scenario?: ScenarioProfile | null;
  actionInstruction: string;
  durationSeconds?: number;
  spokenText?: string;
}): string {
  const parts: string[] = [];

  parts.push(`FORMAT: TikTok Shop UGC video, duration: ${params.durationSeconds ?? 8}s.`);

  if (params.character) {
    parts.push(buildCharacterConsistencyBlock(params.character));
  }

  if (params.scenario) {
    parts.push(buildScenarioConsistencyBlock(params.scenario));
  }

  parts.push(`ACTION & TIMELINE:\n${params.actionInstruction}`);

  if (params.spokenText) {
    parts.push(`SPOKEN AUDIO (VOICEOVER / TALKING): "${params.spokenText}"`);
  }

  parts.push(`TECHNICAL QUALITY:\n4K resolution, 60fps, realistic human physics, stable camera framing, shot on iPhone 15 Pro.`);

  const negativeRules: string[] = [
    "no face morphing",
    "no extra limbs",
    "no jitter",
    "no environment shifts",
    "no unprompted camera zoom",
  ];

  if (params.character?.negativePrompt) {
    negativeRules.push(params.character.negativePrompt);
  }
  if (params.scenario?.negativePrompt) {
    negativeRules.push(params.scenario.negativePrompt);
  }

  parts.push(`NEGATIVE PROMPT:\n${negativeRules.join(", ")}`);

  return parts.join("\n\n");
}

// ─── 4. CÁLCULO DE MÉTRICAS DERIVADAS NO LABORATÓRIO ─────────────────────────

export function calculateDerivedMetrics(metrics: CreativeMetrics): DerivedMetrics {
  const views = metrics.views && metrics.views > 0 ? metrics.views : 0;
  const twoSec = metrics.twoSecondViews ?? 0;
  const sixSec = metrics.sixSecondViews ?? 0;
  const clicks = metrics.clicks ?? 0;
  const orders = metrics.orders ?? 0;
  const revenue = metrics.revenue ?? 0;
  const commission = metrics.commission ?? 0;
  const cost = metrics.productionCost ?? 0;

  if (views === 0) {
    return {
      retentionRate2s: null,
      retentionRate6s: null,
      ctrPercent: null,
      conversionRatePercent: null,
      ordersPer1kViews: null,
      revenuePer1kViews: null,
      commissionPer1kViews: null,
      roiFactor: null,
    };
  }

  const retention2s = Math.round((twoSec / views) * 1000) / 10;
  const retention6s = Math.round((sixSec / views) * 1000) / 10;
  const ctr = Math.round((clicks / views) * 1000) / 10;
  const conv = clicks > 0 ? Math.round((orders / clicks) * 1000) / 10 : null;
  const orders1k = Math.round((orders / views) * 1000 * 10) / 10;
  const rev1k = Math.round((revenue / views) * 1000 * 100) / 100;
  const comm1k = Math.round((commission / views) * 1000 * 100) / 100;
  const roi = cost > 0 ? Math.round((revenue / cost) * 100) / 100 : null;

  return {
    retentionRate2s: retention2s,
    retentionRate6s: retention6s,
    ctrPercent: ctr,
    conversionRatePercent: conv,
    ordersPer1kViews: orders1k,
    revenuePer1kViews: rev1k,
    commissionPer1kViews: comm1k,
    roiFactor: roi,
  };
}

// ─── 5. DETECTOR DE EXCESSO DE VARIÁVEIS EM TESTES A/B ────────────────────────

export function detectExcessVariablesWarning(variants: CreativeVariant[] | undefined) {
  if (!variants || variants.length < 2) return null;

  const vA = variants[0];
  const vB = variants[1];
  if (!vA || !vB) return null;

  const changedProps: string[] = [];

  if (vA.hook && vB.hook && vA.hook !== vB.hook) changedProps.push("Gancho");
  if (vA.durationSeconds && vB.durationSeconds && vA.durationSeconds !== vB.durationSeconds)
    changedProps.push("Duração");
  if (vA.formatId && vB.formatId && vA.formatId !== vB.formatId) changedProps.push("Formato de vídeo");
  if (vA.characterId && vB.characterId && vA.characterId !== vB.characterId) changedProps.push("Personagem");
  if (vA.scenarioId && vB.scenarioId && vA.scenarioId !== vB.scenarioId) changedProps.push("Cenário");
  if (vA.cta && vB.cta && vA.cta !== vB.cta) changedProps.push("CTA");

  if (changedProps.length > 2) {
    return {
      hasWarning: true,
      changedProps,
      message: `Este teste alterou ${changedProps.length} dimensões simultaneamente (${changedProps.join(
        ", ",
      )}). Será difícil isolar exatamente qual mudança causou a diferença no desempenho.`,
    };
  }

  return {
    hasWarning: false,
    changedProps,
    message: null,
  };
}
