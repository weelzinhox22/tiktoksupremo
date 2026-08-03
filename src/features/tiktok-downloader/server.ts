import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type TikTokVideoMetadata = {
  id: string;
  title: string;
  coverUrl: string;
  duration: number;
  playUrl: string;
  hdPlayUrl: string;
  wmPlayUrl: string;
  musicUrl: string;
  musicTitle?: string | undefined;
  musicAuthor?: string | undefined;
  author: {
    id: string;
    uniqueId: string;
    nickname: string;
    avatarUrl: string;
  };
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
};

const fetchVideoSchema = z.object({
  url: z.string().url("Insira uma URL válida do TikTok"),
});

export const fetchTikTokVideoInfo = createServerFn({ method: "POST" })
  .validator((data: unknown) => fetchVideoSchema.parse(data))
  .handler(async ({ data }) => {
    const targetUrl = data.url.trim();

    // 1. Try TikWM API
    try {
      const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(targetUrl)}&hd=1`;
      const response = await fetch(apiUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      if (response.ok) {
        const result = (await response.json()) as {
          code: number;
          msg?: string;
          data?: {
            id?: string;
            title?: string;
            cover?: string;
            duration?: number;
            play?: string;
            hdplay?: string;
            wmplay?: string;
            music?: string;
            music_info?: { title?: string; author?: string };
            play_count?: number;
            digg_count?: number;
            comment_count?: number;
            share_count?: number;
            author?: {
              id?: string;
              unique_id?: string;
              nickname?: string;
              avatar?: string;
            };
          };
        };

        if (result.code === 0 && result.data) {
          const item = result.data;
          const playUrl = item.hdplay || item.play || item.wmplay || "";

          if (playUrl) {
            const formatted: TikTokVideoMetadata = {
              id: item.id || crypto.randomUUID(),
              title: item.title || "Vídeo do TikTok sem título",
              coverUrl: item.cover || "",
              duration: item.duration || 0,
              playUrl: playUrl.startsWith("http") ? playUrl : `https://www.tikwm.com${playUrl}`,
              hdPlayUrl: item.hdplay
                ? item.hdplay.startsWith("http")
                  ? item.hdplay
                  : `https://www.tikwm.com${item.hdplay}`
                : "",
              wmPlayUrl: item.wmplay || "",
              musicUrl: item.music
                ? item.music.startsWith("http")
                  ? item.music
                  : `https://www.tikwm.com${item.music}`
                : "",
              musicTitle: item.music_info?.title,
              musicAuthor: item.music_info?.author,
              author: {
                id: item.author?.id || "",
                uniqueId: item.author?.unique_id || "usuario_tiktok",
                nickname: item.author?.nickname || "Criador do TikTok",
                avatarUrl: item.author?.avatar || "",
              },
              stats: {
                views: item.play_count || 0,
                likes: item.digg_count || 0,
                comments: item.comment_count || 0,
                shares: item.share_count || 0,
              },
            };

            return { success: true as const, video: formatted };
          }
        }
      }
    } catch {
      // Fallback below
    }

    // 2. Try Tiklydown Fallback API
    try {
      const tiklyUrl = `https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(tiklyUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        },
      });

      if (response.ok) {
        const result = (await response.json()) as {
          id?: string;
          title?: string;
          cover?: string;
          video?: { noWatermark?: string; watermark?: string };
          music?: { play_url?: string; title?: string; author?: string };
          author?: { id?: string; unique_id?: string; nickname?: string; avatar?: string };
          stats?: { playCount?: number; diggCount?: number; commentCount?: number; shareCount?: number };
        };

        const playUrl = result.video?.noWatermark || result.video?.watermark || "";
        if (playUrl) {
          const formatted: TikTokVideoMetadata = {
            id: result.id || crypto.randomUUID(),
            title: result.title || "Vídeo do TikTok sem título",
            coverUrl: result.cover || "",
            duration: 0,
            playUrl,
            hdPlayUrl: result.video?.noWatermark || "",
            wmPlayUrl: result.video?.watermark || "",
            musicUrl: result.music?.play_url || "",
            musicTitle: result.music?.title,
            musicAuthor: result.music?.author,
            author: {
              id: result.author?.id || "",
              uniqueId: result.author?.unique_id || "usuario_tiktok",
              nickname: result.author?.nickname || "Criador do TikTok",
              avatarUrl: result.author?.avatar || "",
            },
            stats: {
              views: result.stats?.playCount || 0,
              likes: result.stats?.diggCount || 0,
              comments: result.stats?.commentCount || 0,
              shares: result.stats?.shareCount || 0,
            },
          };

          return { success: true as const, video: formatted };
        }
      }
    } catch {
      // Fallback error below
    }

    throw new Error(
      "Não foi possível obter as informações do vídeo do TikTok. Verifique se o link está correto e se o vídeo é público.",
    );
  });
