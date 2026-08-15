export const VIDEO_PROVIDER_IDS = [
  "comfyui",
  "ltx",
  "veo",
  "replicate",
  "huggingface",
  "minimax",
] as const;

export type VideoProviderId = (typeof VIDEO_PROVIDER_IDS)[number];
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type VideoProviderPublicConfig = {
  provider: VideoProviderId;
  displayName: string;
  enabled: boolean;
  isDefault: boolean;
  configured: boolean;
  secretHint: string | null;
  settings: Record<string, JsonValue>;
  lastTestStatus: "untested" | "success" | "error";
  lastTestMessage: string | null;
  lastTestedAt: string | null;
};

export const PROVIDER_CATALOG: Array<{
  id: VideoProviderId;
  name: string;
  description: string;
  keyLabel: string;
  keyOptional?: boolean;
  recommendedSettings: Record<string, unknown>;
}> = [
  {
    id: "comfyui",
    name: "ComfyUI local / WAN / LTX",
    description:
      "Geração sem custo por vídeo usando sua própria GPU. Aceita qualquer workflow em formato API.",
    keyLabel: "Token do proxy (opcional)",
    keyOptional: true,
    recommendedSettings: { baseUrl: "http://127.0.0.1:8188", workflow: null },
  },
  {
    id: "ltx",
    name: "LTX Video 2.3",
    description: "Vídeo vertical com áudio sincronizado e API assíncrona pronta para produção.",
    keyLabel: "LTX API Key",
    recommendedSettings: {
      baseUrl: "https://api.ltx.io",
      model: "ltx-2-3-fast",
      generateAudio: true,
    },
  },
  {
    id: "veo",
    name: "Google Veo 3.1",
    description: "Alta qualidade, áudio nativo e boa aderência ao roteiro.",
    keyLabel: "Gemini API Key",
    recommendedSettings: {
      baseUrl: "https://generativelanguage.googleapis.com/v1beta",
      model: "veo-3.1-fast-generate-preview",
    },
  },
  {
    id: "replicate",
    name: "Replicate / WAN",
    description: "Acesso gerenciado a modelos abertos, com fallback simples.",
    keyLabel: "Replicate API Token",
    recommendedSettings: {
      baseUrl: "https://api.replicate.com/v1",
      version: "7677a619127ea34d1ed873fb5b77448e4b9889fbd83809b44a2c459ace99192a",
    },
  },
  {
    id: "huggingface",
    name: "Hugging Face Inference",
    description: "Modelos abertos; indicado para testes e créditos promocionais.",
    keyLabel: "Hugging Face Token",
    recommendedSettings: {
      baseUrl: "https://router.huggingface.co/hf-inference/models",
      model: "THUDM/CogVideoX-5b",
    },
  },
  {
    id: "minimax",
    name: "MiniMax Hailuo",
    description: "Bom movimento de personagens e linguagem cinematográfica.",
    keyLabel: "MiniMax API Key",
    recommendedSettings: { baseUrl: "https://api.minimaxi.chat/v1", model: "video-01" },
  },
];
