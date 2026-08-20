export interface ElevenLabsVoice {
  id: string;
  name: string;
  gender: "female" | "male";
  style: string;
  description: string;
  avatarBg: string;
  previewSampleText: string;
}

export const ELEVENLABS_VOICES: ElevenLabsVoice[] = [
  {
    id: "21m00Tcm4TlvDq8ikWAM", // Rachel
    name: "Gabi UGC (Moda & Beleza)",
    gender: "female",
    style: "Viral TikTok",
    description: "Voz jovem, alegre, espontânea com respiração e entonação natural de criadora.",
    avatarBg: "from-pink-500/20 to-rose-600/20 text-pink-400 border-pink-500/30",
    previewSampleText: "Gente, eu quase chorei quando meu pacote do TikTok Shop chegou!",
  },
  {
    id: "EXAVITQu4vr4xnSDxMaL", // Bella
    name: "Larissa Shop (Espontânea)",
    gender: "female",
    style: "Review Sincero",
    description: "Voz expressiva, envolvente e dinâmica. Perfeita para quebra de objeção e prova de tecido.",
    avatarBg: "from-purple-500/20 to-indigo-600/20 text-purple-400 border-purple-500/30",
    previewSampleText: "Coloquei na luz forte só pra tirar a dúvida se esse vestido era transparente...",
  },
  {
    id: "AZnzlk1XvdvUeBnXmlld", // Domi
    name: "Bruna Vendas (Persuasiva)",
    gender: "female",
    style: "Alta Conversão",
    description: "Voz firme, confiante e rápida. Ideal para urgência e chamada da sacolinha amarela.",
    avatarBg: "from-emerald-500/20 to-teal-600/20 text-emerald-400 border-emerald-500/30",
    previewSampleText: "Você pagaria 280 reais no shopping por essa mesma peça, corre na sacolinha!",
  },
  {
    id: "pNInz6obpgDQGcFmaJgB", // Adam
    name: "Lucas Criador (Review Masculino)",
    gender: "male",
    style: "UGC Masculino",
    description: "Voz autêntica, grave e natural. Ótima para streetwear, calçados e unboxing.",
    avatarBg: "from-blue-500/20 to-indigo-600/20 text-blue-400 border-blue-500/30",
    previewSampleText: "Pensei que ia tomar um golpe pelo valor, mas a qualidade é insana!",
  },
  {
    id: "ErXwobaYiN019PkySvjV", // Antoni
    name: "Rodrigo Impacto (Voz Grave)",
    gender: "male",
    style: "Comercial Forte",
    description: "Voz potente, segura e profissional para anúncios de alta autoridade.",
    avatarBg: "from-amber-500/20 to-orange-600/20 text-amber-400 border-amber-500/30",
    previewSampleText: "Pare de gastar dinheiro com produtos de baixa qualidade agora mesmo.",
  },
];

const STORAGE_KEY = "tik_elevenlabs_api_key";

export function getStoredElevenLabsKey(): string {
  if (typeof window === "undefined") return "";
  try {
    return localStorage.getItem(STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function saveStoredElevenLabsKey(key: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, key.trim());
  } catch {}
}

export interface GenerateElevenLabsOptions {
  text: string;
  voiceId: string;
  apiKey?: string;
  stability?: number; // 0.0 - 1.0 (default 0.45 for natural variation)
  similarityBoost?: number; // 0.0 - 1.0 (default 0.78)
  style?: number; // 0.0 - 1.0 (default 0.35)
}

/**
 * Calls ElevenLabs API directly using multilingual v2 model for ultra-realistic human audio.
 */
export async function generateElevenLabsAudio(
  options: GenerateElevenLabsOptions
): Promise<{ audioBlob: Blob; audioUrl: string }> {
  const apiKey = options.apiKey || getStoredElevenLabsKey();

  if (!apiKey) {
    throw new Error(
      "Insira sua API Key do ElevenLabs para gerar vozes humanas ultra-realistas com emoção e respiração natural."
    );
  }

  const voiceId = options.voiceId || ELEVENLABS_VOICES[0]!.id;

  // Clean text from bracket cues like [0s-2s GANCHO]:
  const cleanedText = options.text
    .replace(/\[.*?\]: /g, "")
    .replace(/\[.*?\]/g, "")
    .replace(/"/g, "")
    .trim();

  if (!cleanedText) {
    throw new Error("Texto do roteiro vazio.");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        text: cleanedText,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: options.stability ?? 0.42,
          similarity_boost: options.similarityBoost ?? 0.82,
          style: options.style ?? 0.38,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!response.ok) {
    let errorDetail = `Erro HTTP ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson?.detail?.message) errorDetail = errJson.detail.message;
      else if (errJson?.message) errorDetail = errJson.message;
    } catch {}
    throw new Error(`Falha no ElevenLabs: ${errorDetail}`);
  }

  const blob = await response.blob();
  const audioUrl = URL.createObjectURL(blob);

  return {
    audioBlob: blob,
    audioUrl,
  };
}
