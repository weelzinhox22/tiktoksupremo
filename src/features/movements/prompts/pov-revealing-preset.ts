import type { MovementPreset } from "@/lib/supabase/types";
import povRevealingVideo from "@/assets/videodemonstracao/POV puxando uma roupa para revelar as opções.mp4";

export { povRevealingVideo };

export const POV_REVEALING_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000041",
  user_id: null,
  name: "POV — Revelando Opções & Camadas de Roupas (8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "REVELAÇÃO"],
  description: "Movimento POV de revelação em 8s onde 1 única mão desloca suavemente a peça da frente para mostrar as opções de cores/modelos por baixo.",
  prompt_instruction: "Use a foto anexada como unica fonte de referencia. Mantenha exatamente todas as roupas presentes, sem mudar cores, modelos, texturas, estampas ou quantidade.",
  videoUrl: povRevealingVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV revelando as opcoes",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "revelacao rapida e satisfatoria de produtos para TikTok Shop"
    },
    instrucao_principal: "Use a foto anexada como unica fonte de referencia. Mantenha exatamente todas as roupas presentes, sem mudar cores, modelos, texturas, estampas ou quantidade.",
    condicao: "Este movimento deve ser usado somente quando existirem duas ou mais roupas visiveis ou parcialmente sobrepostas na imagem.",
    objetivo: "Uma unica mao desloca levemente a roupa posicionada na frente para revelar melhor a roupa que esta atras, sem retirar nenhuma peca do enquadramento.",
    camera: {
      angulo: "top-down",
      estabilidade: "fixa",
      movimento: "zoom digital muito leve",
      proibicoes: [
        "sem cortes",
        "sem rotacao",
        "sem mudanca de cenario"
      ]
    },
    controle_anatomico: {
      quantidade_maxima_de_maos: 1,
      mao: "uma unica mao feminina",
      entrada: "somente pela borda inferior",
      proibido: [
        "segunda mao",
        "bracos extras",
        "cabeca",
        "rosto",
        "corpo"
      ]
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.8,
        acao: "Mostrar todas as roupas na composicao original e completamente imoveis."
      },
      {
        inicio: 0.8,
        fim: 2.0,
        acao: "A unica mao entra e desliza sobre a roupa posicionada mais a frente.",
        efeito_no_tecido: "pequenas rugas acompanham os dedos"
      },
      {
        inicio: 2.0,
        fim: 3.0,
        acao: "A mao pinça uma pequena borda lateral da roupa da frente.",
        pegada: "polegar e indicador comprimem uma dobra real"
      },
      {
        inicio: 3.0,
        fim: 4.6,
        acao: "A mao arrasta lentamente a roupa da frente alguns centimetros para a lateral.",
        fisica: [
          "a roupa permanece apoiada",
          "a borda pinçada se move primeiro",
          "o tecido acumula pequenas dobras",
          "o restante acompanha com atraso",
          "a roupa que esta atras permanece completamente parada"
        ]
      },
      {
        inicio: 4.6,
        fim: 5.8,
        acao: "A mao solta a roupa da frente e passa suavemente sobre a roupa revelada.",
        regra: "a primeira roupa permanece na nova posicao sem se mover sozinha"
      },
      {
        inicio: 5.8,
        fim: 7.0,
        acao: "A mao faz um pequeno gesto de comparacao, tocando uma roupa e depois a outra.",
        regra: "somente uma roupa e tocada por vez"
      },
      {
        inicio: 7.0,
        fim: 8.0,
        acao: "A mao sai e todas as roupas permanecem imoveis e visiveis."
      }
    ],
    fisica: {
      regras: [
        "as roupas nao podem flutuar",
        "as roupas nao podem trocar de lugar magicamente",
        "a roupa de tras nao pode se mover quando a roupa da frente for puxada",
        "o tecido deve dobrar e arrastar sobre a superficie",
        "nenhuma roupa pode se alinhar sozinha"
      ]
    },
    negative_prompt: [
      "second hand",
      "extra hands",
      "four arms",
      "multiple people",
      "head visible",
      "body entering frame",
      "clothes swapping positions",
      "teleporting garments",
      "automatic reveal",
      "self-moving clothing",
      "rigid clothing",
      "plastic clothing",
      "cardboard movement",
      "floating garment",
      "color swap",
      "color changing",
      "morphing garments",
      "duplicated clothes",
      "disappearing clothes",
      "deformed hand",
      "extra fingers",
      "camera shake",
      "scene change"
    ]
  },
  tags: ["pov", "revelando opções", "camadas", "puxar roupa", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:24:00.000Z",
  updated_at: "2026-08-03T15:24:00.000Z",
};
