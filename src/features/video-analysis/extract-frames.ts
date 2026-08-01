export async function extractVideoFrames(file: File, count = 6): Promise<Blob[]> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Não foi possível ler o vídeo para amostrar frames."));
    });
    if (!Number.isFinite(video.duration) || video.duration <= 0) return [];
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 960 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) return [];
    const frames: Blob[] = [];
    for (let index = 0; index < count; index++) {
      video.currentTime = Math.min(video.duration - 0.05, (video.duration * (index + 0.5)) / count);
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.78),
      );
      if (blob) frames.push(blob);
    }
    return frames;
  } finally {
    URL.revokeObjectURL(url);
    video.removeAttribute("src");
    video.load();
  }
}
