import { generateAIVideoServerFn } from "./server";
import type { JsonValue, VideoProviderId } from "@/features/video-providers/types";

export type VideoStylePreset = {
  id:
    | "cinematic"
    | "hyper-realistic"
    | "3d-animation"
    | "cyberpunk"
    | "product-commercial"
    | "retro-vintage";
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
    promptSuffix:
      ", cinematic movie shot, 8k, shallow depth of field, dramatic lighting, masterpiece",
    badgeColor: "border-purple-400/30 bg-purple-400/10 text-purple-300",
    previewBg: "from-purple-500/20 to-indigo-600/20",
    badgeText: "🎬 Cinemático 8K",
  },
  {
    id: "hyper-realistic",
    name: "Hiper-realista",
    description:
      "Texturas realistas de alta precisão, reflexos de luz naturais e detalhes de câmera física.",
    promptSuffix:
      ", hyperrealistic, photorealistic, 35mm lens, natural daylight, ultra detailed skin and textures",
    badgeColor: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    previewBg: "from-emerald-500/20 to-teal-600/20",
    badgeText: "📸 Hiper-realista",
  },
  {
    id: "3d-animation",
    name: "Animação 3D / Pixar",
    description:
      "Estilo animação 3D moderna com cores vibrantes e renderização de personagens rica.",
    promptSuffix:
      ", 3d animation style, pixar render, vibrant colors, expressive character motion, octane render",
    badgeColor: "border-amber-400/30 bg-amber-400/10 text-amber-300",
    previewBg: "from-amber-500/20 to-orange-600/20",
    badgeText: "🎨 Animação 3D",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    description:
      "Estética de ficção científica com luzes neon, névoa e ambiente futurista noturno.",
    promptSuffix:
      ", cyberpunk style, neon lights, night scene, futuristic city, sci-fi aesthetic, glowing reflections",
    badgeColor: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
    previewBg: "from-cyan-500/20 to-blue-600/20",
    badgeText: "🌆 Cyberpunk Neon",
  },
  {
    id: "product-commercial",
    name: "Comercial de Produto",
    description:
      "Composição de estúdio com fundo limpo, rotação de câmera suave e destaque técnico.",
    promptSuffix:
      ", high end commercial ad, studio lighting, elegant camera movement, crisp 4k product detail",
    badgeColor: "border-pink-400/30 bg-pink-400/10 text-pink-300",
    previewBg: "from-pink-500/20 to-rose-600/20",
    badgeText: "💎 Comercial Estúdio",
  },
  {
    id: "retro-vintage",
    name: "Retro Vintage 90s",
    description:
      "Estilo fita VHS retro com grão de filme, cores quentes nostálgicas e textura analógica.",
    promptSuffix:
      ", 90s retro vhs video style, film grain, warm nostalgic tones, vintage aesthetic",
    badgeColor: "border-rose-400/30 bg-rose-400/10 text-rose-300",
    previewBg: "from-rose-500/20 to-red-600/20",
    badgeText: "📼 Retro 90s",
  },
];

export type CameraMovement = "zoom-in" | "zoom-out" | "pan-right" | "pan-left" | "orbit" | "static";

export const cameraMovements: Array<{ id: CameraMovement; label: string; description: string }> = [
  {
    id: "zoom-in",
    label: "Zoom In Destaque",
    description: "Câmera se aproxima suavemente do sujeito.",
  },
  {
    id: "zoom-out",
    label: "Zoom Out Revelação",
    description: "Câmera se afasta revelando o ambiente.",
  },
  {
    id: "pan-right",
    label: "Varredura Direita",
    description: "Movimento panorâmico para a direita.",
  },
  {
    id: "pan-left",
    label: "Varredura Esquerda",
    description: "Movimento panorâmico para a esquerda.",
  },
  { id: "orbit", label: "Órbita 360", description: "Giro circular ao redor do sujeito." },
  {
    id: "static",
    label: "Câmera Fixa",
    description: "Enquadramento estático focado no movimento do sujeito.",
  },
];

export type VideoGenerationParams = {
  prompt: string;
  mode: "text-to-video" | "image-to-video";
  sourceImage?: File | string | null;
  aspectRatio: "9:16" | "16:9" | "1:1";
  style: VideoStylePreset["id"];
  camera: CameraMovement;
  durationSeconds: 5 | 10;
  preferredProvider?: "auto" | VideoProviderId;
  localComfySettings?: Record<string, JsonValue>;
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

export function enhanceVideoPrompt(
  basePrompt: string,
  styleId: VideoStylePreset["id"],
  camera: CameraMovement,
): string {
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

function replaceComfyTokens(value: unknown, tokens: Record<string, string | number>): unknown {
  if (typeof value === "string") {
    let output = value;
    for (const [key, token] of Object.entries(tokens)) {
      output = output.replaceAll(`{{${key}}}`, String(token));
    }
    return output;
  }
  if (Array.isArray(value)) return value.map((item) => replaceComfyTokens(item, tokens));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceComfyTokens(item, tokens)]),
    );
  }
  return value;
}

function findComfyVideo(
  value: unknown,
): { filename: string; subfolder: string; type: string } | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findComfyVideo(item);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (
      typeof record["filename"] === "string" &&
      /\.(mp4|webm|mov|gif)$/i.test(record["filename"])
    ) {
      return {
        filename: record["filename"],
        subfolder: String(record["subfolder"] || ""),
        type: String(record["type"] || "output"),
      };
    }
    for (const item of Object.values(record)) {
      const found = findComfyVideo(item);
      if (found) return found;
    }
  }
  return null;
}

async function generateWithLocalComfy(
  params: VideoGenerationParams,
  fullPrompt: string,
  onProgress?: (percent: number, stepLabel: string) => void,
): Promise<GeneratedVideoResult> {
  const settings = params.localComfySettings!;
  const baseUrl = String(settings["baseUrl"] || "http://127.0.0.1:8188").replace(/\/$/, "");
  const workflow = settings["workflow"];
  if (!workflow || typeof workflow !== "object") {
    throw new Error("O workflow API do ComfyUI ainda não foi colado na Central Administrativa.");
  }
  const width = params.aspectRatio === "9:16" ? 1080 : params.aspectRatio === "1:1" ? 1080 : 1920;
  const height = params.aspectRatio === "9:16" ? 1920 : params.aspectRatio === "1:1" ? 1080 : 1080;
  const prompt = replaceComfyTokens(workflow, {
    PROMPT: fullPrompt,
    NEGATIVE_PROMPT: "low quality, blurry, distorted, watermark, text artifacts",
    WIDTH: width,
    HEIGHT: height,
    FRAMES: params.durationSeconds * 24,
    SEED: Math.floor(Math.random() * 2_147_483_647),
  });
  onProgress?.(30, "Enviando workflow para o ComfyUI deste computador...");
  const submit = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, client_id: crypto.randomUUID() }),
  });
  if (!submit.ok)
    throw new Error(
      `ComfyUI respondeu HTTP ${submit.status}: ${(await submit.text()).slice(0, 180)}`,
    );
  const promptId = String(((await submit.json()) as { prompt_id?: string }).prompt_id || "");
  if (!promptId) throw new Error("O ComfyUI não retornou o identificador da geração.");
  for (let attempt = 0; attempt < 240; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    onProgress?.(
      Math.min(92, 35 + Math.round(attempt / 4)),
      "ComfyUI processando o vídeo na GPU local...",
    );
    const history = await fetch(`${baseUrl}/history/${promptId}`);
    if (!history.ok) continue;
    const json = (await history.json()) as Record<string, unknown>;
    const output = findComfyVideo(json[promptId] || json);
    if (!output) continue;
    const query = new URLSearchParams(output);
    const videoResponse = await fetch(`${baseUrl}/view?${query}`);
    if (!videoResponse.ok)
      throw new Error("O ComfyUI terminou, mas o arquivo de vídeo não pôde ser baixado.");
    const blob = await videoResponse.blob();
    const mimeType = blob.type || (output.filename.endsWith(".webm") ? "video/webm" : "video/mp4");
    const extension = mimeType.includes("webm") ? "webm" : "mp4";
    const id = `ai-video-${crypto.randomUUID()}`;
    const file = new File([blob], `${id}.${extension}`, { type: mimeType });
    onProgress?.(100, "Vídeo gerado na GPU local com ComfyUI!");
    return {
      id,
      url: URL.createObjectURL(blob),
      prompt: fullPrompt,
      style: params.style,
      aspectRatio: params.aspectRatio,
      durationSeconds: params.durationSeconds,
      createdAt: Date.now(),
      file,
      provider: "ComfyUI local",
    };
  }
  throw new Error("O ComfyUI demorou mais de 8 minutos. Verifique a fila e o workflow.");
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

  onProgress?.(25, "Escolhendo o melhor motor disponível e iniciando a geração...");

  try {
    if (params.localComfySettings) {
      try {
        return await generateWithLocalComfy(params, fullPrompt, onProgress);
      } catch (error) {
        if (params.preferredProvider === "comfyui") throw error;
        onProgress?.(28, "ComfyUI local indisponível; tentando o próximo motor ativo...");
      }
    }
    const result = await generateAIVideoServerFn({
      data: {
        prompt: fullPrompt,
        mode: params.mode,
        sourceImageBase64,
        aspectRatio: params.aspectRatio,
        style: params.style,
        camera: params.camera,
        durationSeconds: params.durationSeconds,
        preferredProvider: params.preferredProvider || "auto",
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
        extension = mimeType.includes("webm")
          ? "webm"
          : mimeType.includes("image") || mimeType.includes("jpeg") || mimeType.includes("png")
            ? "jpg"
            : "mp4";
        const byteCharacters = atob(parts[1] || "");
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        blob = new Blob([byteArray], { type: mimeType });
      } else if (result.videoUrl) {
        if (result.videoUrl.startsWith("data:")) {
          const parts = result.videoUrl.split(",");
          const match = parts[0]?.match(/:(.*?);/);
          mimeType = match ? match[1]! : "video/mp4";
          extension = mimeType.includes("webm")
            ? "webm"
            : mimeType.includes("image") || mimeType.includes("jpeg") || mimeType.includes("png")
              ? "jpg"
              : "mp4";
          const byteCharacters = atob(parts[1] || "");
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          blob = new Blob([byteArray], { type: mimeType });
        } else {
          const videoRes = await fetch(result.videoUrl).catch(() => {
            throw new Error("Não foi possível carregar a mídia retornada pelo servidor.");
          });
          blob = await videoRes.blob();
          mimeType = blob.type || "video/mp4";
          extension = mimeType.includes("webm") ? "webm" : "mp4";
        }
      } else {
        throw new Error("Mídia não retornada pelo servidor neural.");
      }

      const id = `ai-video-${crypto.randomUUID()}`;
      const file = new File([blob], `${id}.${extension}`, { type: mimeType });
      const objectUrl = URL.createObjectURL(blob);

      onProgress?.(100, `Vídeo real em HD gerado com sucesso via ${result.provider}!`);
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
    }

    throw new Error(result.error || "Ocorreu uma falha no servidor neural de vídeo.");
  } catch (err) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Falha na geração do vídeo por IA. Verifique os provedores ativos na central administrativa.",
    );
  }
}
