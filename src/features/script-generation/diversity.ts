type ModuleScene = { spoken_text?: string };
type Module = { title?: string; strategy?: string; scenes?: ModuleScene[] };

export type ModulePerformance = {
  hook_index?: number | null;
  body_index?: number | null;
  cta_index?: number | null;
  views?: number;
  likes?: number;
  shares?: number;
  clicks?: number;
  orders?: number;
};

export type RankedCombination = {
  number: number;
  label: string;
  hook_index: number;
  body_index: number;
  cta_index: number;
  diversity_score: number;
  performance_score: number;
  recommended_rank: number;
  recommended: boolean;
  difference_summary: string;
};

function tokens(value: string) {
  return new Set(
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2),
  );
}

function jaccardDistance(a: string, b: string) {
  const left = tokens(a);
  const right = tokens(b);
  const union = new Set([...left, ...right]);
  if (!union.size) return 0;
  let intersection = 0;
  for (const token of left) if (right.has(token)) intersection += 1;
  return 1 - intersection / union.size;
}

function moduleText(module: Module | undefined) {
  if (!module) return "";
  return [
    module.title,
    module.strategy,
    ...(module.scenes?.map((scene) => scene.spoken_text ?? "") ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function averageDistance(current: string, peers: string[]) {
  if (peers.length <= 1) return 1;
  return (
    peers.reduce((sum, peer) => sum + (peer === current ? 0 : jaccardDistance(current, peer)), 0) /
    (peers.length - 1)
  );
}

function rawPerformanceScore(
  candidate: Pick<RankedCombination, "hook_index" | "body_index" | "cta_index">,
  records: ModulePerformance[],
) {
  const related = records.filter(
    (record) =>
      record.hook_index === candidate.hook_index ||
      record.body_index === candidate.body_index ||
      record.cta_index === candidate.cta_index,
  );
  if (!related.length) return 0;
  const total = related.reduce(
    (sum, record) =>
      sum +
      (record.orders ?? 0) * 12 +
      (record.clicks ?? 0) * 0.6 +
      (record.shares ?? 0) * 2 +
      (record.likes ?? 0) * 0.05 +
      Math.min(10, (record.views ?? 0) / 1_000),
    0,
  );
  return Math.log1p(total);
}

export function rankDiverseCombinations(
  hooks: Module[],
  bodies: Module[],
  ctas: Module[],
  performance: ModulePerformance[] = [],
  recommendedCount = 12,
): RankedCombination[] {
  const hookTexts = hooks.map(moduleText);
  const bodyTexts = bodies.map(moduleText);
  const ctaTexts = ctas.map(moduleText);
  const candidates = hooks.flatMap((_, hookIndex) =>
    bodies.flatMap((__, bodyIndex) =>
      ctas.map((___, ctaIndex) => ({
        number: hookIndex * bodies.length * ctas.length + bodyIndex * ctas.length + ctaIndex + 1,
        label: `Gancho ${hookIndex + 1} + Corpo ${bodyIndex + 1} + CTA ${ctaIndex + 1}`,
        hook_index: hookIndex,
        body_index: bodyIndex,
        cta_index: ctaIndex,
        text: `${hookTexts[hookIndex]} ${bodyTexts[bodyIndex]} ${ctaTexts[ctaIndex]}`,
        intrinsic:
          (averageDistance(hookTexts[hookIndex] ?? "", hookTexts) +
            averageDistance(bodyTexts[bodyIndex] ?? "", bodyTexts) +
            averageDistance(ctaTexts[ctaIndex] ?? "", ctaTexts)) /
          3,
      })),
    ),
  );
  const rawPerformance = candidates.map((candidate) => rawPerformanceScore(candidate, performance));
  const maxPerformance = Math.max(0, ...rawPerformance);
  const chosen: typeof candidates = [];
  const remaining = [...candidates];

  const pairDistance = (left: (typeof candidates)[number], right: (typeof candidates)[number]) => {
    const changedComponents =
      Number(left.hook_index !== right.hook_index) +
      Number(left.body_index !== right.body_index) +
      Number(left.cta_index !== right.cta_index);
    return changedComponents * 0.18 + jaccardDistance(left.text, right.text) * 0.46;
  };

  while (remaining.length) {
    let bestIndex = 0;
    let bestScore = -1;
    remaining.forEach((candidate, index) => {
      const minDistance = chosen.length
        ? Math.min(...chosen.map((selected) => pairDistance(candidate, selected)))
        : candidate.intrinsic;
      const performanceIndex = candidates.indexOf(candidate);
      const performanceBonus = maxPerformance
        ? (rawPerformance[performanceIndex] ?? 0) / maxPerformance
        : 0;
      const score = minDistance * 0.72 + candidate.intrinsic * 0.2 + performanceBonus * 0.08;
      if (score > bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    });
    chosen.push(remaining.splice(bestIndex, 1)[0]!);
  }

  return chosen.map((candidate, index) => {
    const performanceIndex = candidates.indexOf(candidate);
    const performanceScore = maxPerformance
      ? Math.round(((rawPerformance[performanceIndex] ?? 0) / maxPerformance) * 100)
      : 0;
    const closestPrevious = index
      ? Math.min(...chosen.slice(0, index).map((selected) => pairDistance(candidate, selected)))
      : candidate.intrinsic;
    const diversityScore = Math.max(0, Math.min(100, Math.round(closestPrevious * 100)));
    return {
      number: candidate.number,
      label: candidate.label,
      hook_index: candidate.hook_index,
      body_index: candidate.body_index,
      cta_index: candidate.cta_index,
      diversity_score: diversityScore,
      performance_score: performanceScore,
      recommended_rank: index + 1,
      recommended: index < Math.min(recommendedCount, chosen.length),
      difference_summary:
        index === 0
          ? "Ponto de partida com módulos lexicalmente distintos."
          : diversityScore >= 70
            ? "Combinação muito diferente das anteriores recomendadas."
            : diversityScore >= 45
              ? "Boa troca de estrutura e linguagem."
              : "Variação próxima; publique com mais intervalo ou altere o movimento.",
    };
  });
}
