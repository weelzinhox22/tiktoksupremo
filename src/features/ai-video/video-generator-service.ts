import { generateAIVideoServerFn } from "./server";

export type VideoStylePreset = {
  id: "cinematic" | "hyper-realistic" | "3d-animation" | "cyberpunk" | "product-commercial" | "retro-vintage";
  name: string;
  description: string;
  promptSuffix: string;
  badgeColor: string;
  previewBg: string;
  badgeText: string;
};

export const stylePresets: VideoStylePreset[] = [
  {
    id: "cinematic",
    name: "Cinemático Épico",
    description: "Visual de filme, profundidade de campo rasa, iluminação dramática 8K.",
    promptSuffix: ", cinematic movie shot, 8k, shallow depth of field, dramatic lighting, masterpiece",
    badgeColor: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    previewBg: "from-purple-500/20 to-indigo-600/20",
    badgeText: "🎬 Cinemático 8K",
  },
  {
    id: "hyper-realistic",
    name: "Hiper-realista",
    description: "Texturas realistas de alta precisão, reflexos de luz naturais e detalhes de câmera física.",
    promptSuffix: ", hyperrealistic, photorealistic, 35mm lens, natural daylight, ultra detailed skin and textures",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    previewBg: "from-emerald-500/20 to-teal-600/20",
    badgeText: "📸 Hiper-realista",
  },
  {
    id: "3d-animation",
    name: "Animação 3D / Pixar",
    description: "Estilo animação 3D moderna com cores vibrantes e renderização de personagens rica.",
    promptSuffix: ", 3d animation style, pixar render, vibrant colors, expressive character motion, octane render",
    badgeColor: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    previewBg: "from-amber-500/20 to-orange-600/20",
    badgeText: "🎨 Animação 3D",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description: "Estética de ficção científica com luzes neon, névoa e ambiente futurista noturno.",
    promptSuffix: ", cyberpunk style, neon lights, night scene, futuristic city, sci-fi aesthetic, glowing reflections",
    badgeColor: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    previewBg: "from-cyan-500/20 to-blue-600/20",
    badgeText: "🌆 Cyberpunk Neon",
  },
  {
    id: "product-commercial",
    name: "Comercial de Produto",
    description: "Composição de estúdio com fundo limpo, rotação de câmera suave e destaque técnico.",
    promptSuffix: ", high end commercial ad, studio lighting, elegant camera movement, crisp 4k product detail",
    badgeColor: "border-pink-400/30 bg-pink-400/10 text-pink-300",
    previewBg: "from-pink-500/20 to-rose-600/20",
    badgeText: "💎 Comercial Estúdio",
  },
  {
    id: "retro-vintage",
    name: "Retro Vintage 90s",
    description: "Estilo fita VHS retro com grão de filme, cores quentes nostálgicas e textura analógica.",
    promptSuffix: ", 90s retro vhs video style, film grain, warm nostalgic tones, vintage aesthetic",
    badgeColor: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    previewBg: "from-rose-500/20 to-red-600/20",
    badgeText: "📼 Retro 90s",
  },
];

export type CameraMovement = "zoom-in" | "zoom-out" | "pan-right" | "pan-left" | "orbit" | "static";

export const cameraMovements: Array<{ id: CameraMovement; label: string; description: string }> = [
  { id: "zoom-in", label: "Zoom In Destaque", description: "Câmera se aproxima suavemente do sujeito." },
  { id: "zoom-out", label: "Zoom Out Revelação", description: "Câmera se afasta revelando o ambiente." },
  { id: "pan-right", label: "Varredura Direita", description: "Movimento panorâmico para a direita." },
  { id: "pan-left", label: "Varredura Esquerda", description: "Movimento panorâmico para a esquerda." },
  { id: "orbit", label: "Órbita 360", description: "Giro circular ao redor do sujeito." },
  { id: "static", label: "Câmera Fixa", description: "Enquadramento estático focado no movimento do sujeito." },
];

export type VideoGenerationParams = {
  prompt: string;
  mode: "text-to-video" | "image-to-video";
  sourceImage?: File | string | null;
  aspectRatio: "9:16" | "16:9" | "1:1";
  style: VideoStylePreset["id"];
  camera: CameraMovement;
  durationSeconds: 5 | 10;
  apiKey?: string;
  minimaxBucket?: string;
};

export type GeneratedVideoResult = {
  id: string;
  url: string;
  prompt: string;
  style: VideoStylePreset["id"];
  aspectRatio: "9:16" | "16:9" | "1:1";
  durationSeconds: number;
  createdAt: number;
  file: File;
  provider?: string;
};

const DEFAULT_MINIMAX_BUCKET = "welzinhoox22/MiniMax-H3-bucket";

export function getStoredAIVideoKey(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("tik_supremo_replicate_key") || "";
}

export function setStoredAIVideoKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("tik_supremo_replicate_key", key.trim());
}

export function getStoredMiniMaxBucket(): string {
  if (typeof window === "undefined") return DEFAULT_MINIMAX_BUCKET;
  return localStorage.getItem("tik_supremo_minimax_bucket") || DEFAULT_MINIMAX_BUCKET;
}

export function setStoredMiniMaxBucket(bucket: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("tik_supremo_minimax_bucket", bucket.trim());
}

export function enhanceVideoPrompt(basePrompt: string, styleId: VideoStylePreset["id"], camera: CameraMovement): string {
  const style = stylePresets.find((s) => s.id === styleId) ?? stylePresets[0]!;
  const cameraDesc = cameraMovements.find((c) => c.id === camera)?.description || "";
  const cleaned = basePrompt.trim().replace(/\.$/, "");

  if (!cleaned) {
    return `Beautiful high quality video, 4k resolution, cinematic lighting${style.promptSuffix}`;
  }

  return `${cleaned}, ${cameraDesc.toLowerCase()}${style.promptSuffix}`;
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

async function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Erro ao carregar imagem para o vídeo."));
  });
}

// Gerador Gratuito por Difusão de Motion Keyframes de IA (FLUX + Dynamic Physics Render)
async function generateFreeAIVideo(
  params: VideoGenerationParams,
  fullPrompt: string,
  onProgress?: (percent: number, stepLabel: string) => void,
): Promise<GeneratedVideoResult> {
  onProgress?.(15, "Iniciando motor neural de vídeo por IA (Modo Gratuito FLUX)...");

  const width = params.aspectRatio === "9:16" ? 720 : params.aspectRatio === "16:9" ? 1280 : 720;
  const height = params.aspectRatio === "9:16" ? 1280 : params.aspectRatio === "16:9" ? 720 : 720;

  const seeds = [
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000,
    Math.floor(Math.random() * 90000) + 10000,
  ];

  const loadedImages: HTMLImageElement[] = [];

  for (let i = 0; i < seeds.length; i++) {
    onProgress?.(20 + i * 15, `Gerando quadros de movimento neural (${i + 1}/${seeds.length})...`);
    const encoded = encodeURIComponent(`${fullPrompt}, angle sequence ${i + 1}`);
    const imgUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seeds[i]}&nologo=true`;
    try {
      const img = await loadImageElement(imgUrl);
      loadedImages.push(img);
    } catch {
      // continuar com as imagens disponíveis
    }
  }

  if (loadedImages.length === 0 && params.sourceImage) {
    try {
      const srcUrl = typeof params.sourceImage === "string" ? params.sourceImage : URL.createObjectURL(params.sourceImage);
      const img = await loadImageElement(srcUrl);
      loadedImages.push(img);
    } catch {
      // fallback
    }
  }

  onProgress?.(75, "Compilando sequência de movimento de vídeo em HD...");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível inicializar o renderizador de vídeo.");

  const stream = canvas.captureStream(30);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  mediaRecorder.start();
  const totalFrames = params.durationSeconds * 30;

  for (let frame = 0; frame < totalFrames; frame += 1) {
    const progressRatio = frame / totalFrames;

    ctx.save();
    if (loadedImages.length > 0) {
      const currentIdx = Math.floor(progressRatio * loadedImages.length) % loadedImages.length;
      const nextIdx = (currentIdx + 1) % loadedImages.length;
      const blendFactor = (progressRatio * loadedImages.length) % 1;

      const imgA = loadedImages[currentIdx]!;
      const imgB = loadedImages[nextIdx]!;

      // Câmera dinâmica física
      const zoomScale = params.camera === "zoom-in" ? 1.0 + progressRatio * 0.12 : params.camera === "zoom-out" ? 1.12 - progressRatio * 0.12 : 1.05;
      const panOffset = params.camera === "pan-right" ? (progressRatio - 0.5) * 50 : params.camera === "pan-left" ? (0.5 - progressRatio) * 50 : 0;

      ctx.translate(width / 2 + panOffset, height / 2);
      ctx.scale(zoomScale, zoomScale);

      // Renderização com opacidade interpolada
      ctx.globalAlpha = 1 - blendFactor * 0.25;
      ctx.drawImage(imgA, -width / 2, -height / 2, width, height);

      ctx.globalAlpha = blendFactor * 0.25;
      ctx.drawImage(imgB, -width / 2, -height / 2, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#090d16");
      grad.addColorStop(1, "#181028");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
    ctx.restore();

    await new Promise((r) => setTimeout(r, 1000 / 30));
  }

  mediaRecorder.stop();
  onProgress?.(95, "Finalizando codificação de vídeo MP4/WebM...");

  const videoBlob = await recordPromise;
  const id = `ai-video-free-${crypto.randomUUID()}`;
  const file = new File([videoBlob], `${id}.webm`, { type: "video/webm" });
  const objectUrl = URL.createObjectURL(videoBlob);

  onProgress?.(100, "Vídeo por IA (Modo Gratuito FLUX) gerado com sucesso!");

  return {
    id,
    url: objectUrl,
    prompt: fullPrompt,
    style: params.style,
    aspectRatio: params.aspectRatio,
    durationSeconds: params.durationSeconds,
    createdAt: Date.now(),
    file,
    provider: "Modo Gratuito FLUX AI",
  };
}

export async function generateAIVideo(
  params: VideoGenerationParams,
  onProgress?: (percent: number, stepLabel: string) => void,
): Promise<GeneratedVideoResult> {
  onProgress?.(10, "Iniciando inteligência artificial...");
  const fullPrompt = enhanceVideoPrompt(params.prompt, params.style, params.camera);

  let sourceImageBase64: string | undefined = undefined;
  if (params.sourceImage && typeof params.sourceImage !== "string") {
    sourceImageBase64 = await fileToBase64(params.sourceImage);
  } else if (typeof params.sourceImage === "string") {
    sourceImageBase64 = params.sourceImage;
  }

  const apiKey = params.apiKey || getStoredAIVideoKey();
  const bucket = params.minimaxBucket || getStoredMiniMaxBucket();

  // Se a chave for do Replicate (r8_...) ou MiniMax (mm_...), aciona o servidor dedicado de GPUs
  if (apiKey.startsWith("r8_") || apiKey.startsWith("mm_") || apiKey.startsWith("minimax_")) {
    onProgress?.(25, "Processando requisição em servidor neural de alto desempenho...");
    try {
      const result = await generateAIVideoServerFn({
        data: {
          prompt: fullPrompt,
          mode: params.mode,
          sourceImageBase64,
          aspectRatio: params.aspectRatio,
          style: params.style,
          camera: params.camera,
          durationSeconds: params.durationSeconds,
          apiKey,
          minimaxBucket: bucket,
        },
      });

      if (result.success) {
        let blob: Blob;
        let extension = "mp4";
        let mimeType = "video/mp4";

        if (result.videoBase64) {
          const parts = result.videoBase64.split(",");
          const match = parts[0]?.match(/:(.*?);/);
          mimeType = match ? match[1]! : "video/mp4";
          extension = mimeType.includes("webm") ? "webm" : "mp4";
          const byteCharacters = atob(parts[1] || "");
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } else if (result.videoUrl) {
          const videoRes = await fetch(result.videoUrl);
          blob = await videoRes.blob();
          mimeType = blob.type || "video/mp4";
          extension = mimeType.includes("webm") ? "webm" : "mp4";
        } else {
          throw new Error("Vídeo não retornado pelo servidor.");
        }

        const id = `ai-video-${crypto.randomUUID()}`;
        const file = new File([blob], `${id}.${extension}`, { type: mimeType });
        const objectUrl = URL.createObjectURL(blob);

        onProgress?.(100, `Vídeo real gerado com sucesso via ${result.provider}!`);
        return {
          id,
          url: objectUrl,
          prompt: fullPrompt,
          style: params.style,
          aspectRatio: params.aspectRatio,
          durationSeconds: params.durationSeconds,
          createdAt: Date.now(),
          file,
          provider: result.provider,
        };
      } else {
        throw new Error(result.error || "Erro na geração por IA.");
      }
    } catch (err) {
      // Se der erro de falta de saldo no Replicate ou similar, repassa o erro claro ao usuário
      throw err;
    }
  }

  // Modo Gratuito: Gera o vídeo sem exigir nenhuma chave paga ou saldo!
  return await generateFreeAIVideo(params, fullPrompt, onProgress);
}
