export type DailyObjective = "sales" | "clicks" | "followers" | "test";
export type VariationPurpose =
  | "aggressive"
  | "emotional"
  | "demonstrative"
  | "price"
  | "social-proof"
  | "short-retention"
  | "long-explanation";
export type DailyJobStatus =
  | "idea"
  | "script"
  | "recording"
  | "editing"
  | "queued"
  | "rendering"
  | "ready"
  | "scheduled"
  | "published"
  | "failed";

export type CreativeTemplate = {
  id: string;
  name: string;
  description: string;
  objective: DailyObjective;
  duration: number;
  hookPattern: string;
  bodyPattern: string;
  ctaPattern: string;
  captionStyle: "creator" | "impact" | "minimal" | "review";
  transition: "cut" | "fade" | "zoom";
  createdAt: number;
};

export type DailyVideoJob = {
  id: string;
  title: string;
  productId: string | null;
  productName: string;
  objective: DailyObjective;
  templateId: string;
  angle: string;
  variationPurpose: VariationPurpose;
  hook: string;
  body: string;
  cta: string;
  duration: number;
  status: DailyJobStatus;
  score: number;
  scoreNotes: string[];
  scheduledFor: string | null;
  outputName: string;
  attempts: number;
  createdAt: number;
  updatedAt: number;
  approvalStatus?: "pending" | "approved" | "changes-requested";
  agentStoryboard?: Array<{
    scene: number;
    purpose: string;
    narration: string;
    visual: string;
    brollQuery: string;
    duration: number;
  }>;
  recommendedMediaIds?: string[];
  agentAudit?: string[];
};

export type MediaCatalogItem = {
  id: string;
  name: string;
  kind: "video" | "audio" | "image";
  tags: string[];
  duration: number;
  orientation: "vertical" | "horizontal" | "square" | "unknown";
  productId: string | null;
  movement: string | null;
  favorite: boolean;
  collections: string[];
  description: string;
  useCount: number;
  lastUsedAt: number | null;
  fingerprint: string;
  createdAt: number;
  file?: File;
};

export type DailyWorkspace = {
  dailyGoal: number;
  selectedProductId: string | null;
  objective: DailyObjective;
  targetDuration: number;
  jobs: DailyVideoJob[];
  templates: CreativeTemplate[];
  media: MediaCatalogItem[];
  updatedAt: number;
};

const DATABASE = "tik-supremo-daily-studio";
const STORE = "workspace";
const ACTIVE = "active";

export const objectiveLabels: Record<DailyObjective, string> = {
  sales: "Vendas",
  clicks: "Cliques",
  followers: "Seguidores",
  test: "Teste criativo",
};

export const variationLabels: Record<VariationPurpose, string> = {
  aggressive: "Agressiva",
  emotional: "Emocional",
  demonstrative: "Demonstrativa",
  price: "Focada em preço",
  "social-proof": "Prova social",
  "short-retention": "Curta para retenção",
  "long-explanation": "Longa para explicação",
};

export const statusLabels: Record<DailyJobStatus, string> = {
  idea: "Ideia",
  script: "Roteiro",
  recording: "Gravação",
  editing: "Edição",
  queued: "Na fila",
  rendering: "Renderizando",
  ready: "Pronto",
  scheduled: "Agendado",
  published: "Publicado",
  failed: "Falhou",
};

export const seededTemplates: CreativeTemplate[] = [
  {
    id: "template-problem-solution",
    name: "Problema → solução",
    description: "Gancho direto, demonstração rápida e CTA de compra.",
    objective: "sales",
    duration: 24,
    hookPattern: "Se você sofre com {problema}, olha isso.",
    bodyPattern: "Mostre {produto} resolvendo o problema em três cenas curtas.",
    ctaPattern: "Toque no carrinho e confira enquanto ainda está disponível.",
    captionStyle: "impact",
    transition: "cut",
    createdAt: 1,
  },
  {
    id: "template-ugc-review",
    name: "Review UGC",
    description: "Depoimento natural com demonstração e prova.",
    objective: "sales",
    duration: 32,
    hookPattern: "Eu não esperava que {produto} fosse tão bom nisso.",
    bodyPattern: "Conte a experiência, mostre o detalhe e apresente o resultado.",
    ctaPattern: "Eu deixei o produto no carrinho para você ver os detalhes.",
    captionStyle: "review",
    transition: "fade",
    createdAt: 2,
  },
  {
    id: "template-curiosity",
    name: "Curiosidade rápida",
    description: "Vídeo curto para retenção e descoberta.",
    objective: "clicks",
    duration: 16,
    hookPattern: "Quase ninguém percebe esse detalhe em {produto}.",
    bodyPattern: "Revele o detalhe em close e mostre o benefício sem enrolação.",
    ctaPattern: "Veja as opções no carrinho antes de escolher.",
    captionStyle: "creator",
    transition: "zoom",
    createdAt: 3,
  },
  {
    id: "template-comparison",
    name: "Comparativo honesto",
    description: "Contraste visual para explicar valor e diferença.",
    objective: "test",
    duration: 28,
    hookPattern: "A diferença entre comprar qualquer um e escolher {produto}.",
    bodyPattern: "Compare textura, uso e resultado com enquadramentos equivalentes.",
    ctaPattern: "Compare as avaliações e escolha a opção certa para você.",
    captionStyle: "minimal",
    transition: "cut",
    createdAt: 4,
  },
];

export function emptyDailyWorkspace(): DailyWorkspace {
  return {
    dailyGoal: 12,
    selectedProductId: null,
    objective: "sales",
    targetDuration: 24,
    jobs: [],
    templates: seededTemplates,
    media: [],
    updatedAt: Date.now(),
  };
}

function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir a fábrica diária."));
  });
}

export async function loadDailyWorkspace() {
  const database = await openDatabase();
  try {
    return await new Promise<DailyWorkspace>((resolve, reject) => {
      const request = database.transaction(STORE, "readonly").objectStore(STORE).get(ACTIVE);
      request.onsuccess = () => {
        const saved = request.result as DailyWorkspace | undefined;
        resolve(saved ? { ...emptyDailyWorkspace(), ...saved } : emptyDailyWorkspace());
      };
      request.onerror = () =>
        reject(request.error ?? new Error("Falha ao restaurar a fábrica diária."));
    });
  } finally {
    database.close();
  }
}

export async function saveDailyWorkspace(workspace: DailyWorkspace) {
  const database = await openDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE, "readwrite");
      transaction.objectStore(STORE).put({ ...workspace, updatedAt: Date.now() }, ACTIVE);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () =>
        reject(transaction.error ?? new Error("Falha ao salvar a fábrica diária."));
    });
  } finally {
    database.close();
  }
}

const variationBlueprints: Array<{
  purpose: VariationPurpose;
  angle: string;
  duration: (base: number) => number;
  hook: (product: string) => string;
  body: (product: string) => string;
  cta: string;
}> = [
  {
    purpose: "aggressive",
    angle: "urgência e dor",
    duration: (base) => Math.min(22, base),
    hook: (product) => `Pare de perder tempo: ${product} resolve isso agora.`,
    body: (product) =>
      `Mostre o problema sem ${product}, corte rápido para a solução e prove o resultado em close.`,
    cta: "Toque no carrinho agora e confira a oferta disponível.",
  },
  {
    purpose: "emotional",
    angle: "transformação emocional",
    duration: (base) => Math.max(24, base),
    hook: () => "Eu queria ter descoberto isso antes.",
    body: (product) =>
      `Conte uma situação real, mostre como ${product} mudou a experiência e termine com a sensação do resultado.`,
    cta: "Veja se essa solução também faz sentido para você.",
  },
  {
    purpose: "demonstrative",
    angle: "demonstração visual",
    duration: (base) => Math.max(20, base),
    hook: (product) => `Olha o que acontece quando eu uso ${product}.`,
    body: () => "Demonstre o uso em três passos, com closes e comparação visual do antes e depois.",
    cta: "Confira os detalhes e as opções no carrinho.",
  },
  {
    purpose: "price",
    angle: "valor e preço",
    duration: (base) => Math.min(28, base),
    hook: () => "Quanto você acha que custa ter esse resultado?",
    body: (product) =>
      `Compare custo por uso, benefício e alternativas antes de revelar o valor de ${product}.`,
    cta: "Toque no carrinho para ver o preço atualizado.",
  },
  {
    purpose: "social-proof",
    angle: "prova social",
    duration: (base) => Math.max(26, base),
    hook: () => "Agora eu entendi por que tanta gente está usando isso.",
    body: (product) =>
      `Apresente avaliação, depoimento ou reação real e valide mostrando ${product} em uso.`,
    cta: "Leia as avaliações e escolha a melhor opção para você.",
  },
  {
    purpose: "short-retention",
    angle: "retenção curta",
    duration: () => 12,
    hook: () => "Você precisa ver isso até o final.",
    body: (product) =>
      `Mostre o melhor detalhe de ${product} primeiro e entregue uma única prova visual sem introdução.`,
    cta: "Veja no carrinho.",
  },
  {
    purpose: "long-explanation",
    angle: "explicação completa",
    duration: (base) => Math.max(42, base),
    hook: (product) => `Tudo o que você precisa saber antes de escolher ${product}.`,
    body: () =>
      "Explique para quem serve, como usar, principais benefícios, objeções, comparação e resultado esperado.",
    cta: "Confira todas as informações e decida com segurança.",
  },
];

export function calculateCreativeScore(
  job: Pick<DailyVideoJob, "hook" | "body" | "cta" | "duration" | "angle">,
) {
  let score = 35;
  const notes: string[] = [];
  const hookWords = job.hook.trim().split(/\s+/).length;
  if (hookWords >= 4 && hookWords <= 16) score += 18;
  else notes.push("Deixe o gancho entre 4 e 16 palavras.");
  if (/[?!]|você|ninguém|olha|diferença|erro/i.test(job.hook)) score += 10;
  else notes.push("Inclua curiosidade, contraste ou fala direta no gancho.");
  if (job.body.length >= 45) score += 12;
  else notes.push("A demonstração ainda está curta.");
  if (/carrinho|toque|confira|veja|compre|escolha/i.test(job.cta)) score += 12;
  else notes.push("Use uma ação clara no CTA.");
  if (job.duration >= 12 && job.duration <= 35) score += 8;
  else notes.push("Para este formato, tente manter entre 12 e 35 segundos.");
  if (job.angle.trim()) score += 5;
  return { score: Math.min(100, score), notes };
}

export function buildDailyJobs(input: {
  count: number;
  productId: string | null;
  productName: string;
  objective: DailyObjective;
  duration: number;
  templates: CreativeTemplate[];
  historicalHooks?: string[];
  suppressedPatterns?: string[];
}) {
  const templates = input.templates.filter((template) => template.objective === input.objective);
  const pool = templates.length ? templates : input.templates;
  return Array.from({ length: input.count }, (_, index): DailyVideoJob => {
    const template = pool[index % Math.max(1, pool.length)] ?? seededTemplates[0]!;
    const blueprint = variationBlueprints[index % variationBlueprints.length]!;
    const angle = blueprint.angle;
    const historicalHook =
      input.historicalHooks?.[index % Math.max(1, input.historicalHooks.length)];
    const product = input.productName || "este produto";
    const learnedHook =
      historicalHook &&
      !input.suppressedPatterns?.some((pattern) =>
        historicalHook.toLowerCase().includes(pattern.toLowerCase()),
      );
    const hook = learnedHook
      ? `${historicalHook.replace(/[.!?]+$/, "")} — agora por outro ângulo.`
      : blueprint.hook(product);
    const body = blueprint.body(product);
    const cta = blueprint.cta;
    const duration = blueprint.duration(input.duration);
    const quality = calculateCreativeScore({ hook, body, cta, duration, angle });
    const now = Date.now() + index;
    return {
      id: `daily-${crypto.randomUUID()}`,
      title: `${product} · ${angle}`,
      productId: input.productId,
      productName: product,
      objective: input.objective,
      templateId: template.id,
      angle,
      variationPurpose: blueprint.purpose,
      hook,
      body,
      cta,
      duration,
      status: "script",
      score: quality.score,
      scoreNotes: quality.notes,
      scheduledFor: null,
      outputName: `${slug(product)}-${String(index + 1).padStart(2, "0")}.mp4`,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    };
  });
}

export type PerformanceLearning = {
  winningHooks: string[];
  losingPatterns: string[];
  remakeRecommendations: Array<{ hook: string; reason: string }>;
  fatigueWarnings: string[];
};

export function learnFromPerformance(
  records: Array<{
    hook_text?: string | null;
    views: number;
    clicks: number;
    orders: number;
    created_at?: string;
  }>,
): PerformanceLearning {
  const ranked = records
    .filter((record) => record.hook_text)
    .map((record) => ({
      ...record,
      efficiency: record.orders * 500 + record.clicks * 8 + Math.min(record.views, 5000) / 20,
    }))
    .sort((a, b) => b.efficiency - a.efficiency);
  const median = ranked.length ? ranked[Math.floor(ranked.length / 2)]!.efficiency : 0;
  const winners = ranked.filter((record) => record.efficiency > median && record.views >= 100);
  const losers = ranked.filter(
    (record) => record.efficiency < median * 0.45 && record.views >= 100,
  );
  const normalizedCounts = new Map<string, number>();
  ranked.forEach((record) => {
    const key = (record.hook_text ?? "").toLowerCase().replace(/\d+/g, "#").slice(0, 42);
    normalizedCounts.set(key, (normalizedCounts.get(key) ?? 0) + 1);
  });
  return {
    winningHooks: winners
      .map((record) => record.hook_text!)
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, 12),
    losingPatterns: losers
      .map((record) => record.hook_text!.split(/\s+/).slice(0, 4).join(" "))
      .slice(0, 8),
    remakeRecommendations: winners.slice(0, 5).map((record) => ({
      hook: record.hook_text!,
      reason: `Vencedor com ${record.views.toLocaleString("pt-BR")} views e ${record.orders} pedido(s); crie novo corpo e CTA.`,
    })),
    fatigueWarnings: [...normalizedCounts.entries()]
      .filter(([, count]) => count >= 3)
      .map(([hook]) => `Estrutura repetida ${normalizedCounts.get(hook)} vezes: “${hook}…”`)
      .slice(0, 5),
  };
}

export function recommendBroll(
  script: string,
  media: MediaCatalogItem[],
  productId: string | null,
) {
  const terms = new Set(
    script
      .toLowerCase()
      .split(/[^a-z0-9à-ÿ]+/i)
      .filter((word) => word.length > 3),
  );
  return media
    .filter(
      (item) =>
        item.kind === "video" && (!productId || !item.productId || item.productId === productId),
    )
    .map((item) => ({
      item,
      relevance:
        item.tags.reduce((score, tag) => score + (terms.has(tag.toLowerCase()) ? 4 : 0), 0) +
        (item.favorite ? 3 : 0) -
        Math.max(0, item.useCount - 4),
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 6);
}

export function publishingCopy(job: DailyVideoJob) {
  const hashtags = ["#tiktokshop", "#achadinhos", `#${slug(job.productName).replaceAll("-", "")}`];
  return `${job.hook}\n\n${job.cta}\n\n${hashtags.join(" ")}`;
}

export function suggestMediaTags(filename: string) {
  return Array.from(
    new Set(
      filename
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .split(/[^a-z0-9à-ÿ]+/i)
        .filter((word) => word.length > 2),
    ),
  ).slice(0, 8);
}

function slug(value: string) {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "video"
  );
}
