import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const avatarBriefSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(20).max(1_500),
});

const generatedBriefSchema = z.object({
  visual_description: z.string(),
  image_prompt: z.string(),
  preservation_rules: z.array(z.string()),
});

const cloudflareAvatarSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().min(20).max(1_500),
});

export const generateAvatarImage = createServerFn({ method: "POST" })
  .validator(cloudflareAvatarSchema)
  .handler(async ({ data }) => {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");

    const accountId = process.env["CLOUDFLARE_ACCOUNT_ID"];
    const token = process.env["CLOUDFLARE_AI_API_TOKEN"];
    if (!accountId || !token) {
      throw new Error(
        "Configure CLOUDFLARE_ACCOUNT_ID e CLOUDFLARE_AI_API_TOKEN para gerar avatares com o FLUX gratuito.",
      );
    }

    const dailyLimit = Math.max(
      1,
      Math.min(20, Number(process.env["CLOUDFLARE_AVATAR_DAILY_LIMIT"] || 10)),
    );
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const generatedToday = await supabase
      .from("avatars")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .eq("source", "generated")
      .gte("created_at", startOfDay.toISOString());
    if ((generatedToday.count ?? 0) >= dailyLimit) {
      throw new Error(
        `O limite gratuito de segurança de ${dailyLimit} avatares por dia foi atingido. Tente novamente amanhã.`,
      );
    }

    const model = "@cf/black-forest-labs/flux-1-schnell";
    const prompt =
      `Photorealistic original fictional adult UGC creator, age 25 or older. ${data.description}

Natural Brazilian social-commerce creator aesthetic, realistic face and skin texture, anatomically correct hands and body, relaxed confident pose, complete outfit visible, clean warm home environment, soft natural window lighting, premium smartphone photo, identity reference suitable for consistent vertical 9:16 videos. No real public figure, no celebrity likeness, no child, no text, no subtitles, no logos, no watermark, no collage, no duplicated person, no plastic skin, no anatomy deformation.`.slice(
        0,
        2_048,
      );
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          steps: 4,
          seed: Math.floor(Math.random() * 2_147_483_647),
        }),
      },
    );
    const result = (await response.json().catch(() => null)) as {
      success?: boolean;
      result?: { image?: string };
      errors?: Array<{ code?: number; message?: string }>;
    } | null;
    if (response.status === 429 || result?.errors?.some((error) => error.code === 3036)) {
      throw new Error(
        "A franquia gratuita diária do Cloudflare Workers AI terminou. Tente novamente amanhã.",
      );
    }
    if (!response.ok || !result?.success || !result.result?.image) {
      const message = result?.errors?.[0]?.message;
      throw new Error(
        message
          ? `O Cloudflare não conseguiu gerar o avatar: ${message}`
          : "O Cloudflare não conseguiu gerar o avatar.",
      );
    }

    const binary = atob(result.result.image);
    const bytes = Uint8Array.from(binary, (character) => character.codePointAt(0) ?? 0);
    const imagePath = `${auth.user.id}/avatars/generated/${crypto.randomUUID()}.jpg`;
    const upload = await supabase.storage
      .from("product-images")
      .upload(imagePath, bytes, { contentType: "image/jpeg", upsert: false });
    if (upload.error) {
      throw new Error("O avatar foi criado, mas não pôde ser salvo na biblioteca.");
    }

    const avatar = await supabase
      .from("avatars")
      .insert({
        user_id: auth.user.id,
        name: data.name,
        description: data.description,
        image_path: imagePath,
        source: "generated",
        generation_prompt: prompt,
        metadata: {
          image_provider: "cloudflare_workers_ai",
          image_model: model,
          reference_purpose: "ugc_video_identity_anchor",
        },
      })
      .select(
        "id,user_id,name,description,image_path,source,generation_prompt,metadata,created_at,updated_at",
      )
      .single();
    if (avatar.error || !avatar.data) {
      await supabase.storage.from("product-images").remove([imagePath]);
      throw new Error("O avatar foi criado, mas não pôde entrar na biblioteca.");
    }
    const signed = await supabase.storage.from("product-images").createSignedUrl(imagePath, 3_600);
    return { ...avatar.data, previewUrl: signed.data?.signedUrl ?? null };
  });

export const createAvatarBrief = createServerFn({ method: "POST" })
  .validator(avatarBriefSchema)
  .handler(async ({ data }) => {
    const { getSupabaseServerClient } = await import("@/lib/supabase/server");
    const supabase = getSupabaseServerClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) throw new Error("Sessão expirada. Entre novamente.");
    const key = process.env["GEMINI_API_KEY"];
    if (!key) {
      throw new Error(
        "Para criar o briefing gratuito, configure a chave de API de IA no backend. O upload de avatar continua disponível sem essa etapa.",
      );
    }

    const targetModel = (process.env["GEMINI_FREE_MODEL"] || "gemini-3.6-flash").trim();

    const fetchBriefing = async (modelName: string): Promise<Response> => {
      const cleanKey = key.trim().replace(/^["']|["']$/g, "");
      return fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(cleanKey)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": cleanKey },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Crie um briefing visual consistente para um avatar UGC adulto e fictício chamado ${data.name}. Pedido do usuário: ${data.description}\n\nNão imite pessoa pública ou pessoa real identificável. A resposta deve ajudar o usuário a criar a imagem em uma ferramenta de sua escolha e depois enviá-la ao Tik Supremo. O prompt deve pedir retrato vertical 9:16, aparência fotográfica natural, corpo e roupa visíveis, anatomia realista, iluminação suave, fundo limpo, sem texto, logotipo ou marca-d'água.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: {
                type: "object",
                required: ["visual_description", "image_prompt", "preservation_rules"],
                properties: {
                  visual_description: { type: "string" },
                  image_prompt: { type: "string" },
                  preservation_rules: { type: "array", items: { type: "string" } },
                },
              },
            },
          }),
        },
      );
    };

    let response = await fetchBriefing(targetModel);
    if (!response.ok && targetModel !== "gemini-3.6-flash") {
      response = await fetchBriefing("gemini-3.6-flash");
    }
    if (!response.ok) {
      response = await fetchBriefing("gemini-flash-latest");
    }

    if (response.status === 429) {
      throw new Error("O limite de requisições da IA foi atingido. Aguarde e tente novamente.");
    }
    if (!response.ok) {
      throw new Error("A IA não conseguiu criar o briefing do avatar.");
    }
    const result = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = result.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
    if (!text) throw new Error("A IA não retornou o briefing do avatar.");
    try {
      return generatedBriefSchema.parse(JSON.parse(text));
    } catch {
      throw new Error("O briefing retornou incompleto. Tente novamente.");
    }
  });
