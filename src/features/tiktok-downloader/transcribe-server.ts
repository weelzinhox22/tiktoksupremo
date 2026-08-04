import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { fetchTikTokVideoInfo } from "./server";

const transcribeSchema = z.object({
  url: z.string().min(1, "Insira um link válido"),
});

export const transcribeMediaUrlServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => transcribeSchema.parse(data))
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const targetUrl = data.url.trim();

    let mediaUrl = targetUrl;
    let videoTitle: string | undefined;
    let coverUrl: string | undefined;
    let authorName: string | undefined;

    // Check if URL is from TikTok
    if (targetUrl.includes("tiktok.com")) {
      try {
        const info = await fetchTikTokVideoInfo({ data: { url: targetUrl } });
        if (info.success && info.video) {
          // Prefer audio URL or HD/Play URL
          mediaUrl = info.video.musicUrl || info.video.playUrl || info.video.hdPlayUrl;
          videoTitle = info.video.title;
          coverUrl = info.video.coverUrl;
          authorName = info.video.author.nickname;
        }
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? err.message
            : "Não foi possível obter a mídia do link do TikTok fornecido.",
        );
      }
    }

    if (!mediaUrl) {
      throw new Error("Não foi possível extrair um link de áudio ou vídeo válido da URL fornecida.");
    }

    const { provider } = getAIProvider();
    let transcript = "";

    // 1. Try native provider transcribeMediaUrl if available
    if (provider.transcribeMediaUrl) {
      try {
        transcript = await provider.transcribeMediaUrl(mediaUrl);
      } catch {
        // Fallback to in-memory server stream fetch below
      }
    }

    // 2. Fallback: stream fetch media into server RAM buffer (no file saved to disk)
    if (!transcript) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s max
        const res = await fetch(mediaUrl, { signal: controller.signal });
        clearTimeout(timeout);

        if (!res.ok) {
          throw new Error(`Falha ao obter mídia da URL (${res.status})`);
        }

        const arrayBuf = await res.arrayBuffer();
        const blob = new Blob([arrayBuf], { type: res.headers.get("content-type") || "audio/mp3" });
        const filename = mediaUrl.split("?")[0]?.split("/").pop() || "media_audio.mp3";

        transcript = await provider.transcribeMedia(blob, filename);
      } catch (err) {
        throw new Error(
          err instanceof Error
            ? `Erro durante a transcrição por IA: ${err.message}`
            : "Erro inesperado ao transcrever o áudio da mídia.",
        );
      }
    }

    if (!transcript || !transcript.trim()) {
      throw new Error("Nenhuma fala legível foi identificada no vídeo/áudio.");
    }

    return {
      success: true as const,
      transcript: transcript.trim(),
      videoTitle,
      coverUrl,
      authorName,
    };
  });

const transcribeFileSchema = z.object({
  base64: z.string().min(1, "Conteúdo do arquivo não fornecido"),
  filename: z.string().min(1, "Nome do arquivo necessário"),
  mimeType: z.string().optional(),
});

export const transcribeLocalFileServerFn = createServerFn({ method: "POST" })
  .validator((data: unknown) => transcribeFileSchema.parse(data))
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { provider } = getAIProvider();

    const buffer = Buffer.from(data.base64, "base64");
    if (buffer.length > 30 * 1024 * 1024) {
      throw new Error("O vídeo/áudio excede 30 MB. Selecione um arquivo menor.");
    }

    const blob = new Blob([buffer], { type: data.mimeType || "audio/mp3" });
    const transcript = await provider.transcribeMedia(blob, data.filename);

    if (!transcript || !transcript.trim()) {
      throw new Error("Nenhuma fala compreensível foi identificada no arquivo enviado.");
    }

    return {
      success: true as const,
      transcript: transcript.trim(),
      filename: data.filename,
    };
  });
