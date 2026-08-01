import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { GeminiProvider } from "@/lib/ai/gemini";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthorizedTikTokVideo } from "@/features/tiktok/server";

const importPerformanceSchema = z
  .object({
    projectId: z.string().uuid().optional(),
    generationId: z.string().uuid().optional(),
    url: z.string().url().max(1_000),
  })
  .refine((value) => Boolean(value.projectId) === Boolean(value.generationId), {
    message: "Informe projeto e versão juntos ou deixe a IA identificar os dois.",
  });

type JsonObject = Record<string, unknown>;
type ModularModule = {
  title?: string;
  strategy?: string;
  scenes?: Array<{ spoken_text?: string }>;
};
type GenerationRecord = {
  id: string;
  project_id: string;
  user_id: string;
  version: number;
  result: JsonObject | null;
  full_script: string | null;
};

function assertTikTokUrl(value: string) {
  const url = new URL(value);
  const host = url.hostname.toLowerCase();
  if (host !== "tiktok.com" && !host.endsWith(".tiktok.com")) {
    throw new Error("Cole um link público do TikTok.");
  }
  return url;
}

function extractVideoId(value: string) {
  return value.match(/\/video\/(\d+)/)?.[1] ?? null;
}

function parseEmbeddedJson(html: string) {
  const ids = ["__UNIVERSAL_DATA_FOR_REHYDRATION__", "SIGI_STATE"];
  for (const id of ids) {
    const pattern = new RegExp(`<script[^>]+id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i");
    const match = html.match(pattern)?.[1];
    if (!match) continue;
    try {
      return JSON.parse(match) as JsonObject;
    } catch {
      // Tenta o próximo formato conhecido.
    }
  }
  return null;
}

function walkObjects(root: unknown, visit: (value: JsonObject) => boolean): JsonObject | null {
  if (!root || typeof root !== "object") return null;
  if (!Array.isArray(root) && visit(root as JsonObject)) return root as JsonObject;
  for (const value of Object.values(root as JsonObject)) {
    const found = walkObjects(value, visit);
    if (found) return found;
  }
  return null;
}

function numberValue(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

function extractPublicVideoData(data: JsonObject | null, html: string) {
  const item = data
    ? walkObjects(
        data,
        (value) =>
          Boolean(value["stats"] || value["statsV2"]) &&
          Boolean(value["video"] || value["desc"] || value["description"]),
      )
    : null;
  const stats = (item?.["stats"] ?? item?.["statsV2"] ?? {}) as JsonObject;
  const video = (item?.["video"] ?? {}) as JsonObject;
  const regexNumber = (key: string) => {
    const match = html.match(new RegExp(`["']${key}["']\\s*:\\s*["']?(\\d+)`, "i"));
    return match?.[1] ? Number(match[1]) : 0;
  };
  const firstString = (...values: unknown[]) =>
    values.find(
      (value): value is string => typeof value === "string" && value.startsWith("http"),
    ) ?? null;
  return {
    views: numberValue(stats["playCount"] ?? stats["viewCount"]) || regexNumber("playCount"),
    likes: numberValue(stats["diggCount"] ?? stats["likeCount"]) || regexNumber("diggCount"),
    comments: numberValue(stats["commentCount"]) || regexNumber("commentCount"),
    shares: numberValue(stats["shareCount"]) || regexNumber("shareCount"),
    createTime: numberValue(item?.["createTime"]),
    description:
      (typeof item?.["desc"] === "string" && item["desc"]) ||
      (typeof item?.["description"] === "string" && item["description"]) ||
      "",
    mediaUrl: firstString(video["downloadAddr"], video["playAddr"], video["playApi"]),
  };
}

function moduleText(module: ModularModule | undefined) {
  return [
    module?.title,
    module?.strategy,
    ...(module?.scenes?.map((scene) => scene.spoken_text ?? "") ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

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

function bestModule(modules: ModularModule[], transcript: string) {
  const transcriptTokens = tokens(transcript);
  let best = { index: null as number | null, score: 0, text: "" };
  modules.forEach((module, index) => {
    const text = moduleText(module);
    const candidate = tokens(text);
    if (!candidate.size) return;
    let matches = 0;
    candidate.forEach((token) => {
      if (transcriptTokens.has(token)) matches += 1;
    });
    const score = matches / candidate.size;
    if (score > best.score) best = { index, score, text };
  });
  return best;
}

function generationText(generation: GenerationRecord) {
  const result = generation.result ?? {};
  return [
    generation.full_script,
    result["hook"],
    result["development"],
    result["cta"],
    JSON.stringify(result["modular_variations"] ?? {}),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function similarity(candidate: string, publishedText: string) {
  const candidateTokens = tokens(candidate);
  const publishedTokens = tokens(publishedText);
  if (!candidateTokens.size || !publishedTokens.size) return 0;
  let matches = 0;
  candidateTokens.forEach((token) => {
    if (publishedTokens.has(token)) matches += 1;
  });
  return matches / Math.min(candidateTokens.size, publishedTokens.size);
}

export const importTikTokPerformance = createServerFn({ method: "POST" })
  .validator(importPerformanceSchema)
  .handler(async ({ data }) => {
    const requestedUrl = assertTikTokUrl(data.url);
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");

    let generation: GenerationRecord | null = null;
    let generationMatchConfidence = 1;
    if (data.generationId && data.projectId) {
      const selected = await supabase
        .from("script_generations")
        .select("id,project_id,user_id,version,result,full_script")
        .eq("id", data.generationId)
        .eq("project_id", data.projectId)
        .eq("user_id", auth.user.id)
        .single();
      if (selected.error || !selected.data) {
        throw new Error("A versão do roteiro não foi encontrada.");
      }
      generation = selected.data as GenerationRecord;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);
    let canonicalUrl = requestedUrl.toString();
    let html = "";
    try {
      try {
        const page = await fetch(canonicalUrl, {
          redirect: "follow",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36",
            Accept: "text/html,application/xhtml+xml",
          },
          signal: controller.signal,
        });
        if (page.url) canonicalUrl = page.url;
        if (page.ok) html = await page.text();
      } catch {
        // O oEmbed oficial ainda pode reconhecer o link quando a pÃ¡gina pÃºblica bloqueia robÃ´s.
      }
    } finally {
      clearTimeout(timer);
    }

    const oembedResponse = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`,
    );
    if (!oembedResponse.ok) {
      throw new Error("O TikTok não reconheceu esse vídeo. Confirme se ele está público.");
    }
    const oembed = (await oembedResponse.json()) as {
      title?: string;
      author_name?: string;
      author_url?: string;
      thumbnail_url?: string;
    };
    let publicData = extractPublicVideoData(parseEmbeddedJson(html), html);
    const videoId = extractVideoId(canonicalUrl);
    const officialVideo = videoId ? await getAuthorizedTikTokVideo(auth.user.id, videoId) : null;
    if (officialVideo) {
      publicData = {
        ...publicData,
        views: numberValue(officialVideo["view_count"]),
        likes: numberValue(officialVideo["like_count"]),
        comments: numberValue(officialVideo["comment_count"]),
        shares: numberValue(officialVideo["share_count"]),
        createTime: numberValue(officialVideo["create_time"]),
        description:
          String(officialVideo["video_description"] ?? officialVideo["title"] ?? "") ||
          publicData.description,
      };
    }
    let transcript = "";
    let aiAnalysis: unknown = null;
    if (publicData.mediaUrl && process.env["GEMINI_API_KEY"]) {
      const provider = new GeminiProvider();
      try {
        transcript = await provider.transcribeMediaUrl(publicData.mediaUrl);
        if (transcript) aiAnalysis = await provider.analyzeValidatedCopy(transcript);
      } catch {
        // Métricas públicas continuam sendo salvas quando o CDN bloqueia o vídeo.
      }
    }
    const comparisonText = transcript || publicData.description || oembed.title || "";
    if (!generation) {
      const candidates = await supabase
        .from("script_generations")
        .select("id,project_id,user_id,version,result,full_script")
        .eq("user_id", auth.user.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (candidates.error) throw new Error("Não foi possível consultar seus roteiros.");
      const ranked = ((candidates.data ?? []) as GenerationRecord[])
        .map((candidate) => ({
          candidate,
          score: similarity(generationText(candidate), comparisonText),
        }))
        .sort((a, b) => b.score - a.score);
      generationMatchConfidence = ranked[0]?.score ?? 0;
      if (ranked[0] && generationMatchConfidence >= 0.08) {
        generation = ranked[0].candidate;
      }
    }
    const result = (generation?.result ?? {}) as JsonObject;
    const modular = (result["modular_variations"] ?? {}) as JsonObject;
    const hooks = (modular["hook_modules"] ?? []) as ModularModule[];
    const bodies = (modular["body_modules"] ?? []) as ModularModule[];
    const ctas = (modular["cta_modules"] ?? []) as ModularModule[];
    const hook = bestModule(hooks, comparisonText);
    const body = bestModule(bodies, comparisonText);
    const cta = bestModule(ctas, comparisonText);
    const hasModularMatch =
      hook.index !== null && body.index !== null && cta.index !== null && comparisonText.length > 0;
    const combinationNumber = hasModularMatch
      ? hook.index! * Math.max(1, bodies.length) * Math.max(1, ctas.length) +
        body.index! * Math.max(1, ctas.length) +
        cta.index! +
        1
      : null;
    const publishedAt = publicData.createTime
      ? new Date(publicData.createTime * 1_000).toISOString()
      : new Date().toISOString();
    const existing = await supabase
      .from("content_performance")
      .select(
        "project_id,generation_id,combination_number,hook_index,body_index,cta_index,hook_text,body_text,cta_text,clicks,orders,revenue,notes",
      )
      .eq("user_id", auth.user.id)
      .eq("publication_url", canonicalUrl)
      .maybeSingle();
    const resolvedProjectId = generation?.project_id ?? existing.data?.project_id ?? null;
    const resolvedGenerationId = generation?.id ?? existing.data?.generation_id ?? null;
    const hasResolvedMatch = Boolean(resolvedProjectId && resolvedGenerationId);
    const insert = await supabase
      .from("content_performance")
      .upsert(
        {
          user_id: auth.user.id,
          project_id: resolvedProjectId,
          generation_id: resolvedGenerationId,
          combination_number: combinationNumber ?? existing.data?.combination_number ?? null,
          hook_index: hasModularMatch ? hook.index : (existing.data?.hook_index ?? null),
          body_index: hasModularMatch ? body.index : (existing.data?.body_index ?? null),
          cta_index: hasModularMatch ? cta.index : (existing.data?.cta_index ?? null),
          hook_text:
            (hasModularMatch ? hook.text : String(result["hook"] ?? "")) ||
            existing.data?.hook_text ||
            "",
          body_text:
            (hasModularMatch ? body.text : String(result["development"] ?? "")) ||
            existing.data?.body_text ||
            "",
          cta_text:
            (hasModularMatch ? cta.text : String(result["cta"] ?? "")) ||
            existing.data?.cta_text ||
            "",
          platform: "TikTok Shop",
          publication_url: canonicalUrl,
          video_id: videoId,
          match_status: hasResolvedMatch ? "matched" : "pending",
          metrics_source: officialVideo ? "tiktok_display_api" : "public_page",
          published_at: publishedAt,
          views: publicData.views,
          likes: publicData.likes,
          comments: publicData.comments,
          shares: publicData.shares,
          clicks: existing.data?.clicks ?? 0,
          orders: existing.data?.orders ?? 0,
          revenue: existing.data?.revenue ?? 0,
          notes:
            existing.data?.notes || "Importado automaticamente a partir do link público do TikTok.",
          source: "automatic_link",
          analysis: {
            oembed,
            official_video: officialVideo,
            public_metrics_available: publicData.views > 0,
            transcript,
            ai_copy_analysis: aiAnalysis,
            module_match_confidence: {
              hook: hook.score,
              body: body.score,
              cta: cta.score,
            },
            generation_match_confidence: generationMatchConfidence,
          },
        },
        { onConflict: "user_id,publication_url" },
      )
      .select("id,views,likes,comments,shares,combination_number,analysis")
      .single();
    if (insert.error || !insert.data) {
      throw new Error(`Não foi possível salvar a análise: ${insert.error?.message ?? "erro"}`);
    }
    return {
      ...insert.data,
      title: oembed.title ?? "Vídeo do TikTok",
      author: oembed.author_name ?? "",
      projectId: resolvedProjectId,
      generationId: resolvedGenerationId,
      matchStatus: hasResolvedMatch ? ("matched" as const) : ("pending" as const),
      transcriptAvailable: Boolean(transcript),
      publicMetricsAvailable: publicData.views > 0,
    };
  });
