import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { loadEnabledProviderSecrets } from "@/features/video-providers/server";
import type { VideoProviderId } from "@/features/video-providers/types";

const videoGenerationSchema = z.object({
  prompt: z.string().min(1).max(5000),
  mode: z.enum(["text-to-video", "image-to-video"]),
  sourceImageBase64: z.string().max(20_000_000).optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  style: z.string(),
  camera: z.string(),
  durationSeconds: z.number().min(3).max(20).default(5),
  preferredProvider: z
    .enum(["auto", "comfyui", "ltx", "veo", "replicate", "huggingface", "minimax"])
    .default("auto"),
});
export type VideoGenerationInput = z.infer<typeof videoGenerationSchema>;
export type ServerVideoResult = {
  success: boolean;
  videoUrl?: string;
  videoBase64?: string;
  contentType?: string;
  error?: string;
  provider: string;
  attempts?: Array<{ provider: string; error: string }>;
};
type RuntimeProvider = {
  id: VideoProviderId;
  name: string;
  secret: string | null;
  settings: Record<string, unknown>;
};
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const setting = (p: RuntimeProvider, key: string, fallback: string) =>
  String(p.settings[key] || fallback).replace(/\/$/, "");

function dimensions(ratio: VideoGenerationInput["aspectRatio"]) {
  if (ratio === "9:16") return { width: 1080, height: 1920, resolution: "1080x1920" };
  if (ratio === "1:1") return { width: 1080, height: 1080, resolution: "1080x1080" };
  return { width: 1920, height: 1080, resolution: "1920x1080" };
}
async function responseToResult(response: Response, provider: string): Promise<ServerVideoResult> {
  if (!response.ok)
    throw new Error(
      `HTTP ${response.status}: ${(await response.text()).slice(0, 240) || response.statusText}`,
    );
  const contentType = response.headers.get("content-type") || "video/mp4";
  const bytes = Buffer.from(await response.arrayBuffer()).toString("base64");
  return {
    success: true,
    videoBase64: `data:${contentType};base64,${bytes}`,
    contentType,
    provider,
  };
}
async function urlToResult(url: string, provider: RuntimeProvider, headers?: HeadersInit) {
  return responseToResult(
    await fetch(url, headers ? { headers, redirect: "follow" } : { redirect: "follow" }),
    provider.name,
  );
}
function replaceWorkflowTokens(value: unknown, tokens: Record<string, string | number>): unknown {
  if (typeof value === "string") {
    let output = value;
    for (const [key, token] of Object.entries(tokens))
      output = output.replaceAll(`{{${key}}}`, String(token));
    return output;
  }
  if (Array.isArray(value)) return value.map((item) => replaceWorkflowTokens(item, tokens));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, replaceWorkflowTokens(item, tokens)]),
    );
  return value;
}
function findComfyOutput(
  value: unknown,
): { filename: string; subfolder?: string; type?: string } | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findComfyOutput(item);
      if (found) return found;
    }
  } else if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record["filename"] === "string" && /\.(mp4|webm|mov|gif)$/i.test(record["filename"]))
      return {
        filename: record["filename"],
        subfolder: String(record["subfolder"] || ""),
        type: String(record["type"] || "output"),
      };
    for (const item of Object.values(record)) {
      const found = findComfyOutput(item);
      if (found) return found;
    }
  }
  return null;
}

async function generateComfy(provider: RuntimeProvider, data: VideoGenerationInput) {
  const baseUrl = setting(provider, "baseUrl", "http://127.0.0.1:8188");
  const workflow = provider.settings["workflow"];
  if (!workflow || typeof workflow !== "object")
    throw new Error("Cole o workflow JSON em formato API na configuração do ComfyUI.");
  const { width, height } = dimensions(data.aspectRatio);
  const prompt = replaceWorkflowTokens(workflow, {
    PROMPT: data.prompt,
    NEGATIVE_PROMPT: "low quality, blurry, distorted, watermark, text artifacts",
    WIDTH: width,
    HEIGHT: height,
    FRAMES: Math.round(data.durationSeconds * 24),
    SEED: Math.floor(Math.random() * 2_147_483_647),
  });
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(provider.secret ? { Authorization: `Bearer ${provider.secret}` } : {}),
  };
  const submit = await fetch(`${baseUrl}/prompt`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, client_id: crypto.randomUUID() }),
  });
  if (!submit.ok)
    throw new Error(`ComfyUI HTTP ${submit.status}: ${(await submit.text()).slice(0, 240)}`);
  const promptId = String(((await submit.json()) as { prompt_id?: string }).prompt_id || "");
  if (!promptId) throw new Error("O ComfyUI não retornou prompt_id.");
  for (let attempt = 0; attempt < 120; attempt += 1) {
    await wait(3000);
    const history = await fetch(`${baseUrl}/history/${promptId}`, { headers });
    if (!history.ok) continue;
    const json = (await history.json()) as Record<string, unknown>;
    const output = findComfyOutput(json[promptId] || json);
    if (output) {
      const query = new URLSearchParams({
        filename: output.filename,
        subfolder: output.subfolder || "",
        type: output.type || "output",
      });
      return urlToResult(`${baseUrl}/view?${query}`, provider, headers);
    }
  }
  throw new Error("Tempo limite do workflow ComfyUI excedido.");
}
async function generateLtx(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (!provider.secret) throw new Error("Chave LTX não configurada.");
  if (data.mode === "image-to-video")
    throw new Error("O conector LTX precisa de uma URL pública para a imagem; usando fallback.");
  if (data.aspectRatio === "1:1")
    throw new Error("A LTX 2.3 aceita 9:16 ou 16:9; usando fallback para o formato quadrado.");
  const baseUrl = setting(provider, "baseUrl", "https://api.ltx.io");
  const headers = {
    Authorization: `Bearer ${provider.secret}`,
    "Content-Type": "application/json",
  };
  const submit = await fetch(`${baseUrl}/v2/text-to-video`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      prompt: data.prompt,
      model: String(provider.settings["model"] || "ltx-2-3-fast"),
      duration: data.durationSeconds === 5 ? 6 : 10,
      resolution: dimensions(data.aspectRatio).resolution,
      fps: 24,
      generate_audio: provider.settings["generateAudio"] !== false,
    }),
  });
  if (!submit.ok)
    throw new Error(`LTX HTTP ${submit.status}: ${(await submit.text()).slice(0, 240)}`);
  const job = (await submit.json()) as { id?: string };
  if (!job.id) throw new Error("A LTX não retornou o ID do trabalho.");
  for (let attempt = 0; attempt < 100; attempt += 1) {
    await wait(3000);
    const check = await fetch(`${baseUrl}/v2/text-to-video/${job.id}`, { headers });
    if (!check.ok) continue;
    const status = (await check.json()) as {
      status?: string;
      error?: string;
      result?: { video_url?: string };
    };
    if (status.status === "completed" && status.result?.video_url)
      return urlToResult(status.result.video_url, provider);
    if (["failed", "error"].includes(status.status || ""))
      throw new Error(status.error || "A LTX não concluiu o vídeo.");
  }
  throw new Error("Tempo limite da geração LTX excedido.");
}
async function generateVeo(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (!provider.secret) throw new Error("Chave Gemini/Veo não configurada.");
  const baseUrl = setting(provider, "baseUrl", "https://generativelanguage.googleapis.com/v1beta");
  const model = String(provider.settings["model"] || "veo-3.1-fast-generate-preview");
  const instance: Record<string, unknown> = { prompt: data.prompt };
  if (data.sourceImageBase64) {
    const match = data.sourceImageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (match) instance["image"] = { bytesBase64Encoded: match[2], mimeType: match[1] };
  }
  const start = await fetch(`${baseUrl}/models/${model}:predictLongRunning`, {
    method: "POST",
    headers: { "x-goog-api-key": provider.secret, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [instance],
      parameters: {
        aspectRatio: data.aspectRatio === "1:1" ? "16:9" : data.aspectRatio,
        durationSeconds: data.durationSeconds === 5 ? 6 : 8,
      },
    }),
  });
  if (!start.ok) throw new Error(`Veo HTTP ${start.status}: ${(await start.text()).slice(0, 240)}`);
  const operationName = String(((await start.json()) as { name?: string }).name || "");
  if (!operationName) throw new Error("O Veo não retornou o nome da operação.");
  for (let attempt = 0; attempt < 90; attempt += 1) {
    await wait(5000);
    const check = await fetch(`${baseUrl}/${operationName}`, {
      headers: { "x-goog-api-key": provider.secret },
    });
    if (!check.ok) continue;
    const operation = (await check.json()) as {
      done?: boolean;
      error?: { message?: string };
      response?: {
        generateVideoResponse?: { generatedSamples?: Array<{ video?: { uri?: string } }> };
      };
    };
    if (operation.error)
      throw new Error(operation.error.message || "O Veo falhou ao gerar o vídeo.");
    const uri = operation.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (operation.done && uri)
      return urlToResult(uri, provider, { "x-goog-api-key": provider.secret });
  }
  throw new Error("Tempo limite da geração Veo excedido.");
}
async function generateReplicate(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (!provider.secret) throw new Error("Token Replicate não configurado.");
  const baseUrl = setting(provider, "baseUrl", "https://api.replicate.com/v1");
  const input: Record<string, unknown> = { prompt: data.prompt, aspect_ratio: data.aspectRatio };
  if (data.sourceImageBase64) input["image"] = data.sourceImageBase64;
  const headers = {
    Authorization: `Bearer ${provider.secret}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(`${baseUrl}/predictions`, {
    method: "POST",
    headers,
    body: JSON.stringify({ version: provider.settings["version"], input }),
  });
  if (!response.ok)
    throw new Error(`Replicate HTTP ${response.status}: ${(await response.text()).slice(0, 240)}`);
  let prediction = (await response.json()) as {
    id: string;
    status: string;
    output?: string | string[];
    error?: string;
    urls?: { get?: string };
  };
  for (
    let attempt = 0;
    attempt < 100 && !["succeeded", "failed", "canceled"].includes(prediction.status);
    attempt += 1
  ) {
    await wait(3000);
    const check = await fetch(prediction.urls?.get || `${baseUrl}/predictions/${prediction.id}`, {
      headers,
    });
    if (check.ok) prediction = (await check.json()) as typeof prediction;
  }
  if (prediction.status !== "succeeded")
    throw new Error(prediction.error || `Replicate finalizou como ${prediction.status}.`);
  const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
  if (!url) throw new Error("O Replicate não retornou a URL do vídeo.");
  return urlToResult(url, provider);
}
async function generateHuggingFace(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (!provider.secret) throw new Error("Token Hugging Face não configurado.");
  const baseUrl = setting(provider, "baseUrl", "https://router.huggingface.co/hf-inference/models");
  const model = String(provider.settings["model"] || "THUDM/CogVideoX-5b");
  return responseToResult(
    await fetch(`${baseUrl}/${model}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${provider.secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        inputs: data.prompt,
        parameters: { num_frames: Math.round(data.durationSeconds * 8) },
      }),
    }),
    provider.name,
  );
}
async function generateMiniMax(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (!provider.secret) throw new Error("Chave MiniMax não configurada.");
  const baseUrl = setting(provider, "baseUrl", "https://api.minimaxi.chat/v1");
  const headers = {
    Authorization: `Bearer ${provider.secret}`,
    "Content-Type": "application/json",
  };
  const response = await fetch(`${baseUrl}/video_generation`, {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt: data.prompt, model: provider.settings["model"] || "video-01" }),
  });
  if (!response.ok)
    throw new Error(`MiniMax HTTP ${response.status}: ${(await response.text()).slice(0, 240)}`);
  const taskId = String(((await response.json()) as { task_id?: string }).task_id || "");
  if (!taskId) throw new Error("O MiniMax não retornou task_id.");
  for (let attempt = 0; attempt < 80; attempt += 1) {
    await wait(4000);
    const check = await fetch(
      `${baseUrl}/query/video_generation?task_id=${encodeURIComponent(taskId)}`,
      { headers },
    );
    if (!check.ok) continue;
    const job = (await check.json()) as {
      status?: string;
      video_url?: string;
      output?: string;
      error_message?: string;
    };
    if (["Success", "succeeded"].includes(job.status || "")) {
      const url = job.video_url || job.output;
      if (url) return urlToResult(url, provider);
    }
    if (["Fail", "failed"].includes(job.status || ""))
      throw new Error(job.error_message || "O MiniMax falhou.");
  }
  throw new Error("Tempo limite da geração MiniMax excedido.");
}

function environmentProviders(): RuntimeProvider[] {
  const candidates: Array<[VideoProviderId, string, string | undefined]> = [
    ["veo", "Google Veo 3.1", process.env["VEO_API_KEY"] || process.env["GEMINI_API_KEY"]],
    ["ltx", "LTX Video 2.3", process.env["LTX_API_KEY"]],
    ["replicate", "Replicate / WAN", process.env["REPLICATE_API_KEY"]],
    [
      "huggingface",
      "Hugging Face Inference",
      process.env["HUGGINGFACE_API_KEY"] || process.env["HF_TOKEN"],
    ],
    ["minimax", "MiniMax Hailuo", process.env["MINIMAX_API_KEY"]],
  ];
  return candidates
    .filter((item) => Boolean(item[2]))
    .map(([id, name, secret]) => ({ id, name, secret: secret!, settings: {} }));
}
async function runProvider(provider: RuntimeProvider, data: VideoGenerationInput) {
  if (provider.id === "comfyui") return generateComfy(provider, data);
  if (provider.id === "ltx") return generateLtx(provider, data);
  if (provider.id === "veo") return generateVeo(provider, data);
  if (provider.id === "replicate") return generateReplicate(provider, data);
  if (provider.id === "huggingface") return generateHuggingFace(provider, data);
  return generateMiniMax(provider, data);
}
export const generateAIVideoServerFn = createServerFn({ method: "POST" })
  .validator(videoGenerationSchema)
  .handler(async ({ data }): Promise<ServerVideoResult> => {
    const { data: auth } = await (await getSupabaseServerClient()).auth.getUser();
    if (!auth.user)
      return {
        success: false,
        provider: "Autenticação",
        error: "Sessão expirada. Entre novamente.",
      };
    let providers: RuntimeProvider[] = [];
    try {
      providers = await loadEnabledProviderSecrets();
    } catch (error) {
      console.warn("Provider database unavailable; using environment fallback", error);
    }
    if (!providers.length) providers = environmentProviders();
    if (data.preferredProvider !== "auto")
      providers.sort(
        (a, b) => Number(b.id === data.preferredProvider) - Number(a.id === data.preferredProvider),
      );
    if (!providers.length)
      return {
        success: false,
        provider: "Central de provedores",
        error:
          "Nenhum provedor de vídeo está ativo. Peça ao administrador para configurar um motor de IA.",
      };
    const attempts: Array<{ provider: string; error: string }> = [];
    for (const provider of providers) {
      try {
        return { ...(await runProvider(provider, data)), attempts };
      } catch (error) {
        attempts.push({
          provider: provider.name,
          error: error instanceof Error ? error.message : "Falha desconhecida",
        });
      }
    }
    return {
      success: false,
      provider: "Fallback automático",
      error: `Todos os provedores falharam. ${attempts.map((item) => `${item.provider}: ${item.error}`).join(" | ")}`,
      attempts,
    };
  });
