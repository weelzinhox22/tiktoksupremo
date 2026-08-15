import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const statusSchema = z.object({});
const videoSearchSchema = z.object({
  keyword: z.string().trim().max(120).default(""),
  region: z
    .string()
    .trim()
    .regex(/^[A-Z]{2}$/)
    .default("BR"),
  days: z.number().int().min(1).max(30).default(7),
});
const productSearchSchema = z.object({
  shopId: z
    .string()
    .trim()
    .regex(/^\d{4,30}$/),
});

type TikTokError = { code?: string; message?: string; log_id?: string };
type CachedToken = { value: string; expiresAt: number };

let cachedResearchToken: CachedToken | null = null;

async function requireUser() {
  const { getSupabaseServerClient } = await import("@/lib/supabase/server");
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Sessão expirada. Entre novamente.");
  return data.user;
}

function researchConfigured() {
  return Boolean(
    process.env["TIKTOK_RESEARCH_ACCESS_TOKEN"] ||
    (process.env["TIKTOK_RESEARCH_CLIENT_KEY"] && process.env["TIKTOK_RESEARCH_CLIENT_SECRET"]),
  );
}

async function getResearchToken() {
  const fixedToken = process.env["TIKTOK_RESEARCH_ACCESS_TOKEN"];
  if (fixedToken) return fixedToken;
  if (cachedResearchToken && cachedResearchToken.expiresAt > Date.now() + 60_000) {
    return cachedResearchToken.value;
  }
  const clientKey = process.env["TIKTOK_RESEARCH_CLIENT_KEY"];
  const clientSecret = process.env["TIKTOK_RESEARCH_CLIENT_SECRET"];
  if (!clientKey || !clientSecret) {
    throw new Error(
      "O Radar oficial aguarda credenciais aprovadas do TikTok Research API. O radar dos seus próprios dados continua disponível.",
    );
  }
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });
  const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json().catch(() => null)) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  } | null;
  if (!response.ok || !payload?.access_token) {
    throw new Error(
      payload?.error_description ||
        "O TikTok recusou as credenciais do radar. Confira a aprovação e o escopo research.data.basic.",
    );
  }
  cachedResearchToken = {
    value: payload.access_token,
    expiresAt: Date.now() + Math.max(300, payload.expires_in ?? 7_200) * 1_000,
  };
  return cachedResearchToken.value;
}

function compactDate(date: Date) {
  return date.toISOString().slice(0, 10).replaceAll("-", "");
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
}

const shopHashtagFragments = [
  "tiktokshop",
  "tiktokshopbrasil",
  "achadinhosdotiktok",
  "achadinhostiktok",
  "compreinotiktok",
  "tiktokmademebuyit",
];

function hasCommissionTag(value: unknown): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.some(hasCommissionTag);
  if (typeof value !== "object") return Number(value) === 7;
  const tag = value as Record<string, unknown>;
  if (Number(tag["number"] ?? tag["tag_number"] ?? tag["value"]) === 7) return true;
  return Object.values(tag).some((entry) => {
    if (!entry || typeof entry !== "object") return false;
    return hasCommissionTag(entry);
  });
}

function isTikTokShopVideo(video: Record<string, unknown>) {
  if (hasCommissionTag(video["video_tag"])) {
    return { matches: true, reason: "creator_commission_tag" as const };
  }
  const hashtags = Array.isArray(video["hashtag_names"])
    ? video["hashtag_names"].map((value) => String(value).toLowerCase().replace(/^#/, ""))
    : [];
  const description = String(video["video_description"] ?? "").toLowerCase();
  const hashtagMatch = hashtags.some((hashtag) =>
    shopHashtagFragments.some((fragment) => hashtag.includes(fragment)),
  );
  const descriptionMatch = shopHashtagFragments.some((fragment) =>
    description.replaceAll(" ", "").includes(fragment),
  );
  return {
    matches: hashtagMatch || descriptionMatch,
    reason: hashtagMatch || descriptionMatch ? ("shop_hashtag" as const) : null,
  };
}

function apiError(error: TikTokError | undefined) {
  if (!error || error.code === "ok") return null;
  if (error.code === "scope_not_authorized") {
    return "O cliente do TikTok ainda não possui o escopo research.data.basic aprovado.";
  }
  return error.message || `O TikTok retornou o erro ${error.code}.`;
}

export const getViralRadarStatus = createServerFn({ method: "GET" })
  .validator(statusSchema)
  .handler(async () => {
    await requireUser();
    return {
      researchConfigured: researchConfigured(),
      displayConfigured: Boolean(
        process.env["TIKTOK_CLIENT_KEY"] &&
        process.env["TIKTOK_CLIENT_SECRET"] &&
        process.env["TIKTOK_REDIRECT_URI"],
      ),
    };
  });

export const searchViralVideos = createServerFn({ method: "POST" })
  .validator(videoSearchSchema)
  .handler(async ({ data }) => {
    await requireUser();
    const token = await getResearchToken();
    const end = new Date();
    const start = new Date(end);
    start.setUTCDate(start.getUTCDate() - data.days);
    const conditions: Array<Record<string, unknown>> = [
      { operation: "EQ", field_name: "region_code", field_values: [data.region] },
    ];
    if (data.keyword) {
      conditions.push({ operation: "EQ", field_name: "keyword", field_values: [data.keyword] });
    }
    const fields = [
      "id",
      "video_description",
      "create_time",
      "region_code",
      "share_count",
      "view_count",
      "like_count",
      "comment_count",
      "favorites_count",
      "username",
      "hashtag_names",
      "video_duration",
      "video_tag",
      "music_id",
      "effect_ids",
      "voice_to_text",
    ].join(",");
    const response = await fetch(
      `https://open.tiktokapis.com/v2/research/video/query/?fields=${encodeURIComponent(fields)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          query: { and: conditions },
          max_count: 100,
          cursor: 0,
          start_date: compactDate(start),
          end_date: compactDate(end),
          is_random: false,
        }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      data?: { videos?: Array<Record<string, unknown>> };
      error?: TikTokError;
    } | null;
    const error = apiError(payload?.error);
    if (!response.ok || error) {
      throw new Error(error || "Não foi possível consultar os vídeos no TikTok.");
    }
    const videos = (payload?.data?.videos ?? [])
      .map((video) => ({ video, shopMatch: isTikTokShopVideo(video) }))
      .filter(({ shopMatch }) => shopMatch.matches)
      .map(({ video, shopMatch }) => {
        const views = numberValue(video["view_count"]);
        const likes = numberValue(video["like_count"]);
        const comments = numberValue(video["comment_count"]);
        const shares = numberValue(video["share_count"]);
        const favorites = numberValue(video["favorites_count"]);
        const engagementRate = views ? ((likes + comments + shares + favorites) / views) * 100 : 0;
        const viralScore = Math.round(
          Math.log10(Math.max(1, views)) * 18 +
            Math.min(35, engagementRate * 2.5) +
            Math.log10(Math.max(1, shares + favorites)) * 8,
        );
        const id = String(video["id"] ?? "");
        const username = String(video["username"] ?? "");
        return {
          id,
          username,
          description: String(video["video_description"] ?? ""),
          createTime: numberValue(video["create_time"]),
          region: String(video["region_code"] ?? data.region),
          views,
          likes,
          comments,
          shares,
          favorites,
          engagementRate,
          viralScore,
          hashtags: Array.isArray(video["hashtag_names"]) ? video["hashtag_names"].map(String) : [],
          duration: numberValue(video["video_duration"]),
          musicId: String(video["music_id"] ?? ""),
          effects: Array.isArray(video["effect_ids"]) ? video["effect_ids"].map(String) : [],
          transcript: String(video["voice_to_text"] ?? ""),
          shopEvidence: shopMatch.reason,
          url: username && id ? `https://www.tiktok.com/@${username}/video/${id}` : null,
        };
      })
      .sort((a, b) => b.viralScore - a.viralScore || b.views - a.views)
      .slice(0, 24);
    const hashtagCounts = new Map<string, number>();
    const musicCounts = new Map<string, number>();
    const durationBuckets = new Map<string, number>();
    videos.forEach((video) => {
      video.hashtags.forEach((hashtag) =>
        hashtagCounts.set(hashtag, (hashtagCounts.get(hashtag) ?? 0) + 1),
      );
      if (video.musicId) musicCounts.set(video.musicId, (musicCounts.get(video.musicId) ?? 0) + 1);
      const bucket =
        video.duration <= 15 ? "Até 15s" : video.duration <= 30 ? "16–30s" : "Acima de 30s";
      durationBuckets.set(bucket, (durationBuckets.get(bucket) ?? 0) + 1);
    });
    const top = (map: Map<string, number>, count = 8) =>
      [...map.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, count)
        .map(([value, occurrences]) => ({ value, occurrences }));
    return {
      videos,
      insights: {
        hashtags: top(hashtagCounts),
        musicIds: top(musicCounts, 5),
        durations: top(durationBuckets, 3),
        hooks: videos
          .map((video) => video.transcript || video.description)
          .filter(Boolean)
          .map((text) => text.split(/[.!?]/)[0]!.trim())
          .filter((text) => text.length >= 8)
          .slice(0, 8),
      },
      source: "tiktok_research_api" as const,
      archivedMetrics: true,
      shopOnly: true,
      filterMethod: "commission_tag_and_shop_hashtags" as const,
    };
  });

export const searchShopProducts = createServerFn({ method: "POST" })
  .validator(productSearchSchema)
  .handler(async ({ data }) => {
    await requireUser();
    const token = await getResearchToken();
    const fields = [
      "product_id",
      "product_sold_count",
      "product_description",
      "product_price",
      "product_review_count",
      "product_name",
      "product_rating_1_count",
      "product_rating_2_count",
      "product_rating_3_count",
      "product_rating_4_count",
      "product_rating_5_count",
      "shop_name",
    ].join(",");
    const response = await fetch(
      `https://open.tiktokapis.com/v2/research/tts/product/?fields=${encodeURIComponent(fields)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ shop_id: Number(data.shopId), page_start: 1, page_size: 10 }),
      },
    );
    const payload = (await response.json().catch(() => null)) as {
      data?: { product_data?: Array<Record<string, unknown>> };
      error?: TikTokError;
    } | null;
    const error = apiError(payload?.error);
    if (!response.ok || error) {
      throw new Error(error || "Não foi possível consultar os produtos dessa loja.");
    }
    const products = (payload?.data?.product_data ?? [])
      .map((product) => {
        const five = numberValue(product["product_rating_5_count"]);
        const four = numberValue(product["product_rating_4_count"]);
        const three = numberValue(product["product_rating_3_count"]);
        const two = numberValue(product["product_rating_2_count"]);
        const one = numberValue(product["product_rating_1_count"]);
        const ratings = five + four + three + two + one;
        const rating = ratings ? (five * 5 + four * 4 + three * 3 + two * 2 + one) / ratings : 0;
        return {
          id: String(product["product_id"] ?? ""),
          name: String(product["product_name"] ?? "Produto"),
          description: String(product["product_description"] ?? ""),
          shopName: String(product["shop_name"] ?? ""),
          soldCount: numberValue(product["product_sold_count"]),
          reviewCount: numberValue(product["product_review_count"]),
          rating,
          price: Array.isArray(product["product_price"])
            ? product["product_price"].map(String)
            : [],
        };
      })
      .sort((a, b) => b.soldCount - a.soldCount || b.reviewCount - a.reviewCount);
    return { products, source: "tiktok_research_api" as const, euOnly: true };
  });
