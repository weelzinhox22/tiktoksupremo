import { createServerFn } from "@tanstack/react-start";
import { autoClipRequestSchema, autoClipResultSchema } from "./ai-contract";

export const analyzeAutomaticClips = createServerFn({ method: "POST" })
  .validator(autoClipRequestSchema)
  .handler(async ({ data }) => {
    const { getAIProvider } = await import("@/lib/ai/factory");
    const { name, provider } = getAIProvider();
    const rawResult = await provider.analyzeAutoClips(data);
    const result = autoClipResultSchema.parse(rawResult);
    const videoMap = new Map(data.videos.map((video) => [video.id, video]));

    const clips = result.clips
      .flatMap((clip) => {
        const video = videoMap.get(clip.videoId);
        if (!video) return [];
        const start = Math.max(0, Math.min(video.duration - 0.4, clip.start));
        const end = Math.max(start + 0.4, Math.min(video.duration, clip.end));
        if (end - start < 0.4) return [];
        return [
          {
            ...clip,
            start: Number(start.toFixed(2)),
            end: Number(end.toFixed(2)),
            score: Math.round(clip.score),
          },
        ];
      })
      .slice(0, 16);

    if (!clips.length) {
      throw new Error("A IA não encontrou cortes válidos nos vídeos enviados.");
    }

    return { ...result, clips, provider: name };
  });
