export type LocalFrameSample = {
  id: string;
  time: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  motion: number;
  quality: number;
  colorTone?: { r: number; g: number; b: number };
  imageDataUrl: string;
};

export type LocalVideoAnalysis = {
  id: string;
  file: File;
  name: string;
  duration: number;
  width: number;
  height: number;
  contactSheet: string;
  samples: LocalFrameSample[];
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function waitForEvent(target: HTMLMediaElement, eventName: "loadedmetadata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("O navegador demorou demais para ler um dos frames."));
    }, 12_000);
    const cleanup = () => {
      window.clearTimeout(timer);
      target.removeEventListener(eventName, handleSuccess);
      target.removeEventListener("error", handleError);
    };
    const handleSuccess = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error("Não foi possível decodificar este vídeo no navegador."));
    };
    target.addEventListener(eventName, handleSuccess, { once: true });
    target.addEventListener("error", handleError, { once: true });
  });
}

function computeMetrics(imageData: ImageData, previousGray?: Uint8Array) {
  const { data, width, height } = imageData;
  const pixels = width * height;
  const gray = new Uint8Array(pixels);
  let sum = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  for (let index = 0; index < pixels; index += 1) {
    const offset = index * 4;
    const r = data[offset] ?? 0;
    const g = data[offset + 1] ?? 0;
    const b = data[offset + 2] ?? 0;
    sumR += r;
    sumG += g;
    sumB += b;
    const value = Math.round(r * 0.2126 + g * 0.7152 + b * 0.0722);
    gray[index] = value;
    sum += value;
  }
  const average = sum / Math.max(1, pixels);
  const colorTone = {
    r: Math.round(sumR / Math.max(1, pixels)),
    g: Math.round(sumG / Math.max(1, pixels)),
    b: Math.round(sumB / Math.max(1, pixels)),
  };
  let variance = 0;
  let edgeSum = 0;
  let motionSum = 0;
  for (let y = 1; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      const index = y * width + x;
      const value = gray[index] ?? 0;
      variance += (value - average) ** 2;
      edgeSum += Math.abs(value - (gray[index - 1] ?? value));
      edgeSum += Math.abs(value - (gray[index - width] ?? value));
      if (previousGray) motionSum += Math.abs(value - (previousGray[index] ?? value));
    }
  }
  const usablePixels = Math.max(1, (width - 1) * (height - 1));
  const brightness = clamp01(average / 255);
  const contrast = clamp01(Math.sqrt(variance / usablePixels) / 92);
  const sharpness = clamp01(edgeSum / usablePixels / 46);
  const motion = previousGray ? clamp01(motionSum / usablePixels / 72) : 0;
  const exposure = clamp01(1 - Math.abs(brightness - 0.54) / 0.54);
  const motionInterest = clamp01(motion / 0.34);
  const quality = clamp01(
    exposure * 0.28 + contrast * 0.2 + sharpness * 0.34 + motionInterest * 0.18,
  );
  return { gray, brightness, contrast, sharpness, motion, quality, colorTone };
}

function drawLetterboxedFrame(
  context: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
) {
  context.fillStyle = "#05070b";
  context.fillRect(0, 0, width, height);
  const scale = Math.min(width / video.videoWidth, height / video.videoHeight);
  const drawWidth = video.videoWidth * scale;
  const drawHeight = video.videoHeight * scale;
  context.drawImage(
    video,
    (width - drawWidth) / 2,
    (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}

function formatTimecode(value: number) {
  const minutes = Math.floor(value / 60);
  const seconds = value - minutes * 60;
  return `${minutes}:${seconds.toFixed(1).padStart(4, "0")}`;
}

function buildContactSheet(
  frames: HTMLCanvasElement[],
  samples: Array<Omit<LocalFrameSample, "imageDataUrl">>,
) {
  const columns = 3;
  const cellWidth = 320;
  const frameHeight = 180;
  const footerHeight = 28;
  const rows = Math.ceil(frames.length / columns);
  const sheet = document.createElement("canvas");
  sheet.width = columns * cellWidth;
  sheet.height = rows * (frameHeight + footerHeight);
  const context = sheet.getContext("2d");
  if (!context) throw new Error("O navegador não conseguiu criar a análise visual.");
  context.fillStyle = "#07090e";
  context.fillRect(0, 0, sheet.width, sheet.height);
  frames.forEach((frame, index) => {
    const x = (index % columns) * cellWidth;
    const y = Math.floor(index / columns) * (frameHeight + footerHeight);
    context.drawImage(frame, x, y, cellWidth, frameHeight);
    context.fillStyle = "rgba(6, 8, 13, 0.96)";
    context.fillRect(x, y + frameHeight, cellWidth, footerHeight);
    context.fillStyle = "#f8fafc";
    context.font = "600 14px Arial, sans-serif";
    context.fillText(
      `${samples[index]?.id ?? `F${index + 1}`}  •  ${formatTimecode(samples[index]?.time ?? 0)}`,
      x + 10,
      y + frameHeight + 19,
    );
  });
  return sheet.toDataURL("image/jpeg", 0.68);
}

export async function analyzeVideoLocally(
  file: File,
  id: string,
  sampleCount = 9,
  onProgress?: (completed: number, total: number) => void,
): Promise<LocalVideoAnalysis> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;
  try {
    if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
      await waitForEvent(video, "loadedmetadata");
    }
    if (!Number.isFinite(video.duration) || video.duration <= 0) {
      throw new Error(`A duração de ${file.name} não pôde ser identificada.`);
    }
    const count = Math.max(4, Math.min(12, sampleCount));
    const analysisCanvas = document.createElement("canvas");
    analysisCanvas.width = 160;
    analysisCanvas.height = 90;
    const analysisContext = analysisCanvas.getContext("2d", { willReadFrequently: true });
    if (!analysisContext)
      throw new Error("A análise de imagem não está disponível neste navegador.");

    const frames: HTMLCanvasElement[] = [];
    const samples: Array<Omit<LocalFrameSample, "imageDataUrl">> = [];
    let previousGray: Uint8Array | undefined;
    for (let index = 0; index < count; index += 1) {
      const safeEnd = Math.max(0, video.duration - 0.08);
      const time = Math.min(safeEnd, Math.max(0, (video.duration * (index + 0.5)) / count));
      if (Math.abs(video.currentTime - time) > 0.02) {
        const seeked = waitForEvent(video, "seeked");
        video.currentTime = time;
        await seeked;
      }
      drawLetterboxedFrame(analysisContext, video, analysisCanvas.width, analysisCanvas.height);
      const metrics = computeMetrics(
        analysisContext.getImageData(0, 0, analysisCanvas.width, analysisCanvas.height),
        previousGray,
      );
      previousGray = metrics.gray;

      const frame = document.createElement("canvas");
      frame.width = 320;
      frame.height = 180;
      const frameContext = frame.getContext("2d");
      if (!frameContext) throw new Error("Não foi possível capturar os frames do vídeo.");
      drawLetterboxedFrame(frameContext, video, frame.width, frame.height);
      frames.push(frame);
      samples.push({
        id: `${id}-F${index + 1}`,
        time: Number(time.toFixed(2)),
        brightness: Number(metrics.brightness.toFixed(3)),
        contrast: Number(metrics.contrast.toFixed(3)),
        sharpness: Number(metrics.sharpness.toFixed(3)),
        motion: Number(metrics.motion.toFixed(3)),
        quality: Number(metrics.quality.toFixed(3)),
        colorTone: metrics.colorTone,
      });
      onProgress?.(index + 1, count);
    }

    return {
      id,
      file,
      name: file.name,
      duration: video.duration,
      width: video.videoWidth,
      height: video.videoHeight,
      contactSheet: buildContactSheet(frames, samples),
      samples: samples.map((sample, index) => ({
        ...sample,
        imageDataUrl: frames[index]?.toDataURL("image/jpeg", 0.7) ?? "",
      })),
    };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
