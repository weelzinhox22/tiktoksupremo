import type { MovementPreset } from "@/lib/supabase/types";
import povSoftnessVideo from "@/assets/videodemonstracao/POV amassando e soltando para mostrar maciez.mp4";

export { povSoftnessVideo };

export const POV_SOFTNESS_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000043",
  user_id: null,
  name: "POV — Amassando e Soltando (Teste de Maciez & Compressão 8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "MACIEZ"],
  description: "Demonstração POV tátil em 8s onde 1 única mão comprime o tecido na palma para mostrar volume, maciez extrema e recuperação natural do tecido.",
  prompt_instruction: "Anime exclusivamente a imagem anexada. Preserve exatamente a quantidade de roupas, cores, estampas, modelagens, texturas, recortes, costuras, proporcoes, posicoes e cenario. A imagem anexada e a unica fonte de verdade visual.",
  videoUrl: povSoftnessVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV teste de maciez com compressao",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "POV hiper-realista, satisfatorio e espontaneo de TikTok Shop"
    },
    instrucao_principal: "Anime exclusivamente a imagem anexada. Preserve exatamente a quantidade de roupas, cores, estampas, modelagens, texturas, recortes, costuras, proporcoes, posicoes e cenario. A imagem anexada e a unica fonte de verdade visual.",
    objetivo: "Mostrar uma unica mao comprimindo uma pequena regiao da roupa para demonstrar maciez, volume e recuperacao natural do tecido.",
    camera: {
      angulo: "top-down de 90 graus",
      enquadramento: "igual ao da imagem de referencia",
      estabilidade: "camera fixa",
      movimento: "aproximacao digital extremamente lenta e discreta",
      proibicoes: [
        "sem pan",
        "sem rotacao",
        "sem inclinacao",
        "sem tremor",
        "sem cortes",
        "sem mudanca de cenario"
      ]
    },
    controle_anatomico: {
      quantidade_maxima_de_maos: 1,
      quantidade_maxima_de_antebracos: 1,
      mao: "uma unica mao feminina direita",
      entrada: "somente pela borda inferior",
      partes_proibidas: [
        "segunda mao",
        "braco adicional",
        "cabeca",
        "rosto",
        "cabelo",
        "pescoco",
        "ombros",
        "tronco",
        "pernas",
        "pes",
        "sombra da cabeca"
      ]
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.7,
        acao: "Mostrar todas as roupas completamente imoveis na composicao original."
      },
      {
        inicio: 0.7,
        fim: 1.8,
        acao: "A unica mao entra lentamente e coloca a palma sobre uma regiao central da peca principal.",
        contato: "leve e progressivo"
      },
      {
        inicio: 1.8,
        fim: 3.2,
        acao: "Os dedos se fecham gradualmente, reunindo uma pequena quantidade de tecido na palma.",
        efeito_no_tecido: [
          "o tecido enruga entre os dedos",
          "pequenas dobras se acumulam",
          "somente a regiao tocada se move",
          "o restante da roupa permanece apoiado"
        ]
      },
      {
        inicio: 3.2,
        fim: 4.3,
        acao: "A mao mantém a pequena porcao de tecido comprimida por um instante.",
        movimento: "micro compressao curta e natural",
        proibicao: "nao levantar a roupa inteira"
      },
      {
        inicio: 4.3,
        fim: 5.5,
        acao: "Os dedos abrem lentamente e liberam o tecido.",
        efeito_no_tecido: "as dobras caem pela gravidade, relaxam de maneira irregular e fazem uma pequena oscilacao residual"
      },
      {
        inicio: 5.5,
        fim: 7.1,
        acao: "A palma desliza suavemente sobre a mesma regiao, alisando apenas parte das rugas.",
        efeito_no_tecido: "a textura continua natural e levemente enrugada"
      },
      {
        inicio: 7.1,
        fim: 8.0,
        acao: "A mao sai pela borda inferior e todas as roupas permanecem imoveis."
      }
    ],
    fisica_obrigatoria: {
      material: "tecido verdadeiro, macio, flexivel, comprimivel e sujeito a gravidade",
      regras: [
        "a roupa nao pode se mover como um bloco",
        "a compressao deve afetar apenas a regiao tocada",
        "o tecido deve formar dobras irregulares",
        "a roupa nao pode se organizar sozinha",
        "o tecido nao pode parecer plastico, borracha dura ou papelao"
      ]
    },
    negative_prompt: [
      "more than one hand",
      "second hand",
      "extra hands",
      "extra arms",
      "multiple people",
      "head visible",
      "face visible",
      "body entering frame",
      "rigid clothing",
      "plastic clothing",
      "cardboard fabric",
      "solid garment",
      "clothing moving as one solid object",
      "automatic unfolding",
      "clothes arranging themselves",
      "floating fabric",
      "color changing",
      "garment transformation",
      "duplicated garment",
      "extra garment",
      "deformed hand",
      "extra fingers",
      "hand passing through fabric",
      "camera shake",
      "scene change"
    ]
  },
  tags: ["pov", "maciez", "amassando e soltando", "compressão", "tecido macio", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T16:21:00.000Z",
  updated_at: "2026-08-03T16:21:00.000Z",
};
