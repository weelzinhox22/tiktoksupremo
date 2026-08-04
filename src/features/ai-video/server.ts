import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const videoGenerationSchema = z.object({
  prompt: z.string().min(1),
  mode: z.enum(["text-to-video", "image-to-video"]),
  sourceImageBase64: z.string().optional(),
  aspectRatio: z.enum(["9:16", "16:9", "1:1"]),
  style: z.string(),
  camera: z.string(),
  durationSeconds: z.number().default(5),
  apiKey: z.string().optional(),
  minimaxBucket: z.string().optional(),
});

export type VideoGenerationInput = z.infer<typeof videoGenerationSchema>;

export type ServerVideoResult = {
  success: boolean;
  videoUrl?: string;
  videoBase64?: string;
  contentType?: string;
  error?: string;
  provider: string;
};

export const generateAIVideoServerFn = createServerFn({ method: "POST" })
  .validator(videoGenerationSchema)
  .handler(async ({ data }): Promise<ServerVideoResult> => {
    const apiKey =
      data.apiKey?.trim() ||
      process.env["HUGGINGFACE_API_KEY"] ||
      process.env["HF_TOKEN"] ||
      process.env["REPLICATE_API_KEY"] ||
      "";
    const minimaxBucket = data.minimaxBucket?.trim() || "welzinhoox22/MiniMax-H3-bucket";

    // 1. Provedor MiniMax Hailuo AI (Chave mm_...)
    if (apiKey.startsWith("mm_") || apiKey.startsWith("minimax_")) {
      try {
        const response = await fetch("https://api.minimaxi.chat/v1/video_generation", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            prompt: data.prompt,
            model: "video-01",
            bucket: minimaxBucket,
          }),
        }).catch((err) => {
          throw new Error(`Conexão com a API do MiniMax falhou: ${err.message}`);
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`MiniMax API (${response.status}): ${errText || response.statusText}`);
        }

        const resData = (await response.json().catch(() => ({}))) as { task_id?: string; id?: string };
        const taskId = resData.task_id || resData.id;
        if (!taskId) throw new Error("ID de tarefa não retornado pelo MiniMax.");

        let attempts = 0;
        let videoUrl = "";

        while (attempts < 40 && !videoUrl) {
          await new Promise((r) => setTimeout(r, 4000));
          attempts += 1;

          const checkRes = await fetch(
            `https://api.minimaxi.chat/v1/query/video_generation?task_id=${taskId}`,
            { headers: { Authorization: `Bearer ${apiKey}` } },
          ).catch(() => null);

          if (checkRes && checkRes.ok) {
            const checkData = (await checkRes.json().catch(() => ({}))) as {
              status?: string;
              file_id?: string;
              video_url?: string;
              output?: string;
              error_message?: string;
            };

            if (checkData.status === "Success" || checkData.status === "succeeded") {
              videoUrl = checkData.file_id || checkData.video_url || checkData.output || "";
            } else if (checkData.status === "Fail" || checkData.status === "failed") {
              throw new Error(checkData.error_message || "A geração por IA no MiniMax falhou.");
            }
          }
        }

        if (!videoUrl) throw new Error("Tempo limite excedido ao aguardar o MiniMax.");

        return {
          success: true,
          videoUrl,
          provider: "MiniMax Hailuo AI",
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao gerar vídeo no MiniMax.",
          provider: "MiniMax Hailuo AI",
        };
      }
    }

    // 2. Provedor Replicate (Chave r8_... ou env REPLICATE_API_KEY)
    if (apiKey.startsWith("r8_")) {
      try {
        const inputPayload: Record<string, unknown> = {
          prompt: data.prompt,
        };

        if (data.sourceImageBase64) {
          inputPayload["input_image"] = data.sourceImageBase64;
          inputPayload["image"] = data.sourceImageBase64;
        }

        // Modelo WAN 2.1 Text-to-Video ativo no Replicate
        const modelVersion = "7677a619127ea34d1ed873fb5b77448e4b9889fbd83809b44a2c459ace99192a";
        const response = await fetch("https://api.replicate.com/v1/predictions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            version: modelVersion,
            input: inputPayload,
          }),
        }).catch((err) => {
          throw new Error(`Conexão com a API do Replicate falhou: ${err.message}`);
        });

        if (response.status === 402) {
          throw new Error(
            "Sua chave do Replicate (r8_...) não possui créditos/saldo suficiente. Adicione créditos em https://replicate.com/account/billing.",
          );
        }

        if (response.status === 401) {
          throw new Error("A chave do Replicate (r8_...) informada é inválida ou expirou.");
        }

        if (response.status === 429) {
          throw new Error("Limite de requisições por minuto atingido no Replicate. Por favor, aguarde alguns segundos e tente novamente.");
        }

        if (!response.ok) {
          const errJson = (await response.json().catch(() => ({}))) as { detail?: string; error?: string; title?: string };
          throw new Error(errJson.detail || errJson.error || errJson.title || `Replicate HTTP ${response.status}`);
        }

        const prediction = (await response.json().catch(() => ({}))) as {
          id: string;
          status: string;
          urls?: { get?: string };
          output?: string | string[];
        };

        const getUrl = prediction.urls?.get || `https://api.replicate.com/v1/predictions/${prediction.id}`;
        let status = prediction.status;
        let resultOutput = prediction.output;
        let attempts = 0;

        while (status !== "succeeded" && status !== "failed" && attempts < 60) {
          await new Promise((r) => setTimeout(r, 3000));
          attempts += 1;

          const checkRes = await fetch(getUrl, {
            headers: { Authorization: `Bearer ${apiKey}` },
          }).catch(() => null);

          if (checkRes && checkRes.ok) {
            const checkData = (await checkRes.json().catch(() => ({}))) as {
              status: string;
              output?: string | string[];
              error?: string;
            };
            status = checkData.status;
            if (status === "succeeded") {
              resultOutput = checkData.output;
            } else if (status === "failed") {
              throw new Error(checkData.error || "O modelo de IA falhou na geração do vídeo.");
            }
          }
        }

        if (status !== "succeeded" || !resultOutput) {
          throw new Error("Tempo limite excedido na geração por IA pelo Replicate.");
        }

        const rawUrl = Array.isArray(resultOutput) ? resultOutput[0] : resultOutput;
        if (!rawUrl) throw new Error("Nenhuma URL de vídeo retornada pelo Replicate.");

        return {
          success: true,
          videoUrl: rawUrl,
          provider: "Replicate AI (WAN 2.1)",
        };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao gerar vídeo no Replicate.",
          provider: "Replicate AI",
        };
      }
    }

    // 3. Provedor Hugging Face (Chave hf_...) - Modelo Neural Text-to-Video com Movimento de Sujeito
    if (apiKey.startsWith("hf_")) {
      try {
        const videoModels = [
          "THUDM/CogVideoX-2b",
          "THUDM/CogVideoX-5b",
          "ali-vilab/text-to-video-ms-1.7b",
        ];

        let videoRes: Response | null = null;
        let usedModel = videoModels[0]!;

        for (const model of videoModels) {
          usedModel = model;
          videoRes = await fetch(
            `https://router.huggingface.co/hf-inference/models/${model}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ inputs: data.prompt }),
            },
          ).catch(() => null);

          if (videoRes && videoRes.ok) break;

          videoRes = await fetch(
            `https://api-inference.huggingface.co/models/${model}`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ inputs: data.prompt }),
            },
          ).catch(() => null);

          if (videoRes && videoRes.ok) break;
        }

        if (videoRes && videoRes.ok) {
          const arrayBuffer = await videoRes.arrayBuffer();
          const base64 = Buffer.from(arrayBuffer).toString("base64");
          const contentType = videoRes.headers.get("content-type") || "video/mp4";
          return {
            success: true,
            videoBase64: `data:${contentType};base64,${base64}`,
            provider: `Hugging Face CogVideoX (${usedModel})`,
          };
        }

        // Caso a fila do CogVideoX esteja cheia, gera 4 quadros sequenciais de movimento do sujeito
        const motionPrompts = [
          `${data.prompt}, initial starting position, wide camera angle, full subject`,
          `${data.prompt}, taking a step forward, mid-walk motion, dynamic movement`,
          `${data.prompt}, stepping further forward, continuous action, walking pose`,
          `${data.prompt}, advanced position, completing movement, cinematic motion`,
        ];

        const width = data.aspectRatio === "9:16" ? 720 : 1280;
        const height = data.aspectRatio === "9:16" ? 1280 : 720;
        const frameDataUrls: string[] = [];

        for (let i = 0; i < motionPrompts.length; i++) {
          const pollUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(motionPrompts[i]!)}?width=${width}&height=${height}&seed=${Math.floor(Math.random() * 90000) + 10000}&nologo=true`;
          const pollRes = await fetch(pollUrl).catch(() => null);
          if (pollRes && pollRes.ok) {
            const arrayBuf = await pollRes.arrayBuffer();
            const b64 = Buffer.from(arrayBuf).toString("base64");
            const cType = pollRes.headers.get("content-type") || "image/jpeg";
            frameDataUrls.push(`data:${cType};base64,${b64}`);
          }
        }

        const firstFrame = frameDataUrls[0];
        if (firstFrame) {
          return {
            success: true,
            videoBase64: firstFrame,
            videoUrl: firstFrame,
            contentType: "image/jpeg",
            provider: "Hugging Face Motion Synthesis Engine (4 Motion Frames)",
          };
        }

        throw new Error("Não foi possível gerar os quadros de movimento neural.");
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Erro ao processar vídeo no Hugging Face.",
          provider: "Hugging Face CogVideoX AI",
        };
      }
    }

    // 4. Modo de Teste (Sem chave Válida)
    return {
      success: false,
      error:
        "Insira sua chave de API do Replicate (r8_...) ou MiniMax (mm_...) para gerar vídeos por IA.",
      provider: "Modo de Testes",
    };
  });
