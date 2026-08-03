import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CharacterProfile, CopyProject, CreativeExperiment, ScenarioProfile } from "./types";

// ─── 1. CHARACTER REPOSITORY ──────────────────────────────────────────────────

export const characterRepository = {
  async list(userId: string): Promise<CharacterProfile[]> {
    const supabase = getSupabaseBrowserClient();
    const result = await supabase
      .from("avatars")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (result.error || !result.data) return [];

    return result.data.map((row) => {
      const meta = (row.metadata ?? {}) as Record<string, unknown>;
      return {
        id: row.id,
        userId: row.user_id,
        name: row.name,
        internalName: (meta["internalName"] as string) ?? row.name,
        description: row.description ?? "",
        type: (meta["type"] as CharacterProfile["type"]) ?? "ai_realistic_human",
        appearance: (meta["appearance"] as CharacterProfile["appearance"]) ?? {
          visualAge: "25-30",
          gender: "feminino",
          height: "1.68m",
          bodyType: "esbelto",
          skinTone: "morena clara",
          faceShape: "oval",
          eyes: "castanhos",
          hairColor: "castanho",
          hairLength: "médio",
          hairStyle: "ondas",
          makeup: "natural",
          distinctiveFeatures: [],
        },
        outfitPresets: (meta["outfitPresets"] as CharacterProfile["outfitPresets"]) ?? [
          {
            id: "default",
            name: "Padrão",
            top: "Camiseta neutra",
            bottom: "Calça jeans",
            footwear: "Tênis",
            accessories: [],
            colors: ["branco", "azul"],
            fabric: "algodão",
            style: "casual",
            occasion: "dia a dia",
            isImmutable: true,
          },
        ],
        voice: (meta["voice"] as CharacterProfile["voice"]) ?? {
          language: "pt-BR",
          regionalVariant: "Neutro",
          vocalRange: "Médio",
          timbre: "Quente",
          speed: "natural",
          energy: "moderate",
          catchphrases: [],
          avoidedWords: [],
        },
        personality: (meta["personality"] as CharacterProfile["personality"]) ?? {
          traits: ["Espontânea", "Confiante"],
          energyLevel: "Média",
          persuasiveness: "Alta",
          informality: "Informal",
          preferredHooks: [],
          preferredCtas: [],
        },
        expressions: (meta["expressions"] as CharacterProfile["expressions"]) ?? [],
        movements: (meta["movements"] as CharacterProfile["movements"]) ?? [],
        basePrompt: (meta["basePrompt"] as string) ?? row.description ?? "",
        voicePrompt: (meta["voicePrompt"] as string) ?? "",
        behaviorPrompt: (meta["behaviorPrompt"] as string) ?? "",
        continuityPrompt: (meta["continuityPrompt"] as string) ?? "",
        negativePrompt: (meta["negativePrompt"] as string) ?? "face change, extra limbs, jitter",
        tags: (meta["tags"] as string[]) ?? ["avatar"],
        version: (meta["version"] as number) ?? 1,
        status: (meta["status"] as "active" | "archived") ?? "active",
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  },

  async getById(id: string, userId: string): Promise<CharacterProfile | null> {
    const all = await this.list(userId);
    return all.find((c) => c.id === id) ?? null;
  },
};

// ─── 2. SCENARIO REPOSITORY ───────────────────────────────────────────────────

export const defaultScenarios: ScenarioProfile[] = [
  {
    id: "sc-quarto-01",
    userId: null,
    name: "Quarto Feminino Contemporâneo",
    description: "Ambiente íntimo e aconchegante com iluminação natural suave vinda da janela lateral.",
    category: "bedroom",
    environment: {
      spaceType: "Quarto contemporâneo minimalista",
      wall: "bege neutro",
      floor: "madeira clara",
      ceiling: "branco gesso",
      furniture: ["cama arrumada com edredom neutro", "cabeceira estofada", "mesa de apoio"],
      decor: ["planta pendente", "espelho redondo", "quadro abstrato"],
      depth: "3 a 4 metros",
    },
    lighting: {
      mainSource: "janela lateral ampla",
      temperature: "5000K natural",
      intensity: "suave e difusa",
      contrast: "baixo",
      shadows: "suaves e graduadas",
      naturalLight: "abundante",
      preset: "natural_soft",
    },
    cameraPresets: [
      {
        id: "cam-med",
        name: "Plano Médio Fixo",
        framing: "cintura para cima",
        height: "altura dos olhos",
        distance: "1.8 metros",
        angle: "frontal direto",
        depthOfField: "fundo suavemente desfoque",
        promptSnippet: "medium shot, eye-level camera, soft background bokeh",
      },
    ],
    fixedElements: [
      {
        id: "fe-1",
        name: "Espelho redondo",
        description: "Espelho redondo de moldura preta fina",
        position: "parede esquerda ao fundo",
        color: "preto",
        isImmutable: true,
      },
    ],
    actionZones: {
      characterZone: "centro da cena a 1.8m da câmera",
      productZone: "altura do peito/mãos",
      demonstrationZone: "área central sem interferência de móveis",
      textSafeZone: "terço superior e terço inferior da tela",
    },
    audio: {
      ambientNoise: "ambiente silencioso",
      reverberation: "mínima",
      suggestedMusic: "pop acústico suave",
      forbiddenSounds: ["eco", "trânsito pesado"],
    },
    environmentPrompt: "contemporary aesthetic bedroom, beige walls, light wood flooring, minimal decor",
    lightingPrompt: "soft natural side daylight from window, 5000K, gentle shadows",
    cameraPrompt: "fixed eye-level framing, medium shot, slight shallow depth of field",
    continuityPrompt: "keep background furniture and round mirror strictly in same position",
    negativePrompt: "camera shake, changing walls, shifting furniture, unwanted zooms",
    compatibleFormats: ["UGC", "NO SPEAK", "FASHION", "STORYTELLING"],
    compatibleCategories: ["Moda", "Beleza", "Casa", "Acessórios"],
    tags: ["quarto", "grwm", "aconchegante", "ugc", "moda", "beleza"],
    version: 1,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "sc-esteira-01",
    userId: null,
    name: "Estúdio Vitrine com Esteira",
    description: "Estúdio minimalista premium com esteira preta centralizada para trocas de looks.",
    category: "studio",
    environment: {
      spaceType: "Vitrine de estúdio contemporâneo",
      wall: "cinza concreto fosco",
      floor: "esteira preta com piso neutro",
      ceiling: "trilho de spots de iluminação",
      furniture: ["esteira ergométrica minimalista preta"],
      decor: ["painel de luz contínua"],
      depth: "5 metros",
    },
    lighting: {
      mainSource: "luz comercial de estúdio",
      temperature: "5600K neutra",
      intensity: "alta clareza",
      contrast: "moderado",
      shadows: "nítidas sob a esteira",
      naturalLight: "nenhuma",
      preset: "studio_commercial",
    },
    cameraPresets: [
      {
        id: "cam-treadmill",
        name: "Corpo Inteiro Fixo na Esteira",
        framing: "corpo inteiro de frente",
        height: "altura da cintura",
        distance: "3 metros",
        angle: "frontal 0 graus",
        depthOfField: "foco total no manequim e nas roupas",
        promptSnippet: "full body shot, fixed front view, waist level camera height",
      },
    ],
    fixedElements: [
      {
        id: "fe-treadmill",
        name: "Esteira preta",
        description: "Esteira preta fosca centralizada",
        position: "centro exato do enquadramento",
        color: "preta",
        isImmutable: true,
      },
    ],
    actionZones: {
      characterZone: "sobre a esteira caminhando em ritmo constante",
      productZone: "corpo inteiro da personagem",
      demonstrationZone: "linha da esteira",
      textSafeZone: "topo da tela e rodapé acima do carrinho",
    },
    audio: {
      ambientNoise: "ritmo leve de caminhada e beat de fundo",
      reverberation: "nenhuma",
      suggestedMusic: "trap instrumental ritmado",
      forbiddenSounds: ["ruídos estridentes"],
    },
    environmentPrompt: "sleek minimalist fashion studio, dark grey background, black treadmill center frame",
    lightingPrompt: "high clarity commercial studio lighting, crisp contrast",
    cameraPrompt: "totally fixed front view camera, zero movement, full body framing",
    continuityPrompt: "never change background, treadmill or lighting setup between steps",
    negativePrompt: "camera movement, camera zoom, flash transitions, smoke, shifting background",
    compatibleFormats: ["MANEQUIM IA", "ESTEIRA", "NO SPEAK", "FASHION"],
    compatibleCategories: ["Moda", "Roupas", "Calçados", "Fitness"],
    tags: ["esteira", "manequim", "vitrine", "moda", "tiktok shop"],
    version: 1,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const scenarioRepository = {
  async list(userId: string): Promise<ScenarioProfile[]> {
    const supabase = getSupabaseBrowserClient();
    const result = await supabase
      .from("scenarios")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false });

    if (result.error || !result.data || result.data.length === 0) {
      return defaultScenarios;
    }

    const fallback = defaultScenarios[0]!;


    const mapped = result.data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      description: row.description ?? "",
      category: row.category ?? "general",
      environment: (row.environment as ScenarioProfile["environment"]) ?? fallback.environment,
      lighting: (row.lighting as ScenarioProfile["lighting"]) ?? fallback.lighting,
      cameraPresets: (row.camera_presets as ScenarioProfile["cameraPresets"]) ?? fallback.cameraPresets,
      fixedElements: (row.fixed_elements as ScenarioProfile["fixedElements"]) ?? fallback.fixedElements,
      actionZones: (row.action_zones as ScenarioProfile["actionZones"]) ?? fallback.actionZones,
      audio: (row.audio as ScenarioProfile["audio"]) ?? fallback.audio,
      environmentPrompt: row.environment_prompt ?? "",
      lightingPrompt: row.lighting_prompt ?? "",
      cameraPrompt: row.camera_prompt ?? "",
      continuityPrompt: row.continuity_prompt ?? "",
      negativePrompt: row.negative_prompt ?? "",
      compatibleFormats: row.compatible_formats ?? [],
      compatibleCategories: row.compatible_categories ?? [],
      tags: row.tags ?? [],
      version: row.version ?? 1,
      status: (row.status as "active" | "archived") ?? "active",
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return [...mapped, ...defaultScenarios.filter((d) => !mapped.some((m) => m.id === d.id))];
  },
};

// ─── 3. COPY PROJECT REPOSITORY ───────────────────────────────────────────────

export const copyProjectRepository = {
  async list(userId: string): Promise<CopyProject[]> {
    const supabase = getSupabaseBrowserClient();
    const result = await supabase
      .from("copy_projects")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (result.error || !result.data) return [];

    return result.data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      originalCopy: row.original_copy,
      originalProduct: row.original_product ?? "",
      originalAudience: row.original_audience ?? "",
      copySource: row.copy_source ?? "user",
      referenceLink: row.reference_link ?? null,
      notes: row.notes ?? null,
      language: row.language ?? "pt-BR",
      market: row.market ?? "BR",
      durationApprox: row.duration_approx ?? 30,
      contentType: row.content_type ?? "ugc",
      isOwnCopy: row.is_own_copy ?? true,
      analysis: (row.analysis as CopyProject["analysis"]) ?? {
        segments: [],
        audience: "",
        tone: [],
        persuasionStructure: [],
        strengths: [],
        weaknesses: [],
        sensitiveClaims: [],
        complianceWarnings: [],
      },
      versions: (row.versions as CopyProject["versions"]) ?? [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};

// ─── 4. CREATIVE EXPERIMENT REPOSITORY ───────────────────────────────────────

export const creativeExperimentRepository = {
  async list(userId: string): Promise<CreativeExperiment[]> {
    const supabase = getSupabaseBrowserClient();
    const result = await supabase
      .from("creative_experiments")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (result.error || !result.data) return [];

    return result.data.map((row) => ({
      id: row.id,
      userId: row.user_id,
      name: row.name,
      productId: row.product_id ?? undefined,
      objective: (row.objective as CreativeExperiment["objective"]) ?? "conversions",
      hypothesis: row.hypothesis ?? "",
      primaryMetric: row.primary_metric ?? "orders",
      secondaryMetrics: row.secondary_metrics ?? [],
      testType: (row.test_type as CreativeExperiment["testType"]) ?? "hook",
      variants: (row.variants as CreativeExperiment["variants"]) ?? [],
      status: (row.status as CreativeExperiment["status"]) ?? "draft",
      startDate: row.start_date ?? undefined,
      endDate: row.end_date ?? undefined,
      conclusion: (row.conclusion as CreativeExperiment["conclusion"]) ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};
