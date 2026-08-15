import type { MovementPreset } from "@/lib/supabase/types";

export const POV_WAISTBAND_ELASTIC_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000041",
  user_id: null,
  name: "POV — Elasticidade Extrema no Cós (Shorts Bege / Dynamic Stretch)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "ELASTICIDADE", "SHORTS"],
  description: "Vídeo em 1ª pessoa (POV) demonstrando a elasticidade extrema do cós do shorts bege. A pessoa estica o cós rapidamente para todas as direções mantendo formato, cor e detalhes originais.",
  prompt_instruction: "Ultra-realistic first-person POV video. The person instantly grabs only the waistband of the beige shorts and, in the same motion, brings it close to the camera while stretching it extremely fast. The waistband expands dramatically in every direction—left, right, up, down and diagonally—while keeping its original shape, color and details. It continuously stretches, bends, twists and returns to its original form with an exaggerated elastic effect. The waistband repeatedly fills most of the frame, creating a strong visual impact. The hands move continuously, changing the stretching direction many times without stopping. Emphasize a highly stylized elastic effect with smooth fabric behavior and consistent details. Focus only on the waistband; the legs of the shorts remain untouched. Continuous one-shot, no cuts, no slow motion, fast-paced, satisfying visual effect, vertical 9:16.",
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV elasticidade extrema no cós",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "POV ultra-realista, dinâmico e viral para TikTok Shop"
    },
    instrucao_principal: "Ultra-realistic first-person POV video. The person instantly grabs only the waistband of the beige shorts and, in the same motion, brings it close to the camera while stretching it extremely fast. The waistband expands dramatically in every direction—left, right, up, down and diagonally—while keeping its original shape, color and details. It continuously stretches, bends, twists and returns to its original form with an exaggerated elastic effect. The waistband repeatedly fills most of the frame, creating a strong visual impact. The hands move continuously, changing the stretching direction many times without stopping. Emphasize a highly stylized elastic effect with smooth fabric behavior and consistent details. Focus only on the waistband; the legs of the shorts remain untouched. Continuous one-shot, no cuts, no slow motion, fast-paced, satisfying visual effect, vertical 9:16.",
    objetivo: "Demonstrar a alta elasticidade do cós puxando e aproximando da câmera rapidamente sem alterar o modelo ou deformar o tecido permanentemente.",
    camera: {
      angulo: "POV 1ª pessoa",
      movimento: "plano contínuo (one-shot), sem cortes, rápido e dinâmico",
      estabilidade: "fluido e focado na ação das mãos"
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 1.5,
        acao: "A pessoa segura instantaneamente apenas o cós do shorts bege e traz para perto da câmera."
      },
      {
        inicio: 1.5,
        fim: 4.0,
        acao: "Estica o cós extremamente rápido em todas as direções (esquerda, direita, cima, baixo e diagonal)."
      },
      {
        inicio: 4.0,
        fim: 6.5,
        acao: "O cós estica, torce e retorna à sua forma original com efeito elástico exagerado e contínuo."
      },
      {
        inicio: 6.5,
        fim: 8.0,
        acao: "As mãos continuam ajustando e alternando a direção do estiramento até o retorno final suave."
      }
    ],
    negative_prompt: [
      "slow motion",
      "cuts",
      "scene changes",
      "leg deformation",
      "color change",
      "fabric tear",
      "blurry details"
    ]
  },
  tags: ["pov", "elasticidade", "cós", "shorts bege", "estica", "vestuário", "dynamic stretch", "tiktok shop"],
  created_at: "2026-08-04T22:36:00.000Z",
  updated_at: "2026-08-04T22:36:00.000Z",
};
