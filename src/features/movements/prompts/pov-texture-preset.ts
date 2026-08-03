import type { MovementPreset } from "@/lib/supabase/types";
import povTextureVideo from "@/assets/videodemonstracao/POV passando a mão e mostrando a textura.mp4";

export { povTextureVideo };

export const POV_TEXTURE_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000038",
  user_id: null,
  name: "POV — Passando a Mão e Mostrando Textura & Acabamento (8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "TEXTURA"],
  description: "Demonstração POV tátil em 8s onde 1 única mão passa suavemente sobre a peça para destacar maciez, espessura e acabamento das costuras.",
  prompt_instruction: "Anime exclusivamente a imagem anexada. Preserve exatamente todas as roupas, cores, estampas, texturas, modelagens, proporcoes, dobras, costuras e o cenario original. A imagem anexada e a unica fonte de referencia visual.",
  videoUrl: povTextureVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV textura e acabamento",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "POV hiper-realista, espontaneo e viral de TikTok Shop"
    },
    instrucao_principal: "Anime exclusivamente a imagem anexada. Preserve exatamente todas as roupas, cores, estampas, texturas, modelagens, proporcoes, dobras, costuras e o cenario original. A imagem anexada e a unica fonte de referencia visual.",
    objetivo: "Criar uma demonstracao POV natural em que uma unica mao passa suavemente sobre as roupas para mostrar textura, maciez e acabamento, sem levantar ou reorganizar completamente as pecas.",
    camera: {
      angulo: "top-down de 90 graus",
      enquadramento: "igual ao da imagem anexada",
      movimento: "aproximacao digital muito lenta e quase imperceptivel",
      estabilidade: "camera estavel",
      proibicoes: [
        "sem rotacao",
        "sem pan",
        "sem inclinacao",
        "sem mudanca de cenario",
        "sem cortes",
        "sem tremor excessivo"
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
        acao: "Mostrar as roupas exatamente como aparecem na foto, completamente imoveis.",
        mao: "fora do enquadramento"
      },
      {
        inicio: 0.7,
        fim: 2.3,
        acao: "Uma unica mao entra pela borda inferior e encosta suavemente na regiao inferior ou central da peca principal.",
        movimento: "a palma e as pontas dos dedos deslizam lentamente para cima",
        efeito_no_tecido: "pequenas rugas se deslocam somente sob os dedos"
      },
      {
        inicio: 2.3,
        fim: 4.0,
        acao: "A mao muda de direcao e desliza lateralmente sobre uma costura, textura, estampa ou acabamento real visivel na referencia.",
        movimento: "horizontal, lento e controlado",
        efeito_no_tecido: "compressao local e pequenas ondulacoes naturais"
      },
      {
        inicio: 4.0,
        fim: 5.5,
        acao: "O polegar e o indicador pincam uma pequena dobra do tecido para demonstrar espessura e maciez.",
        regra: "levantar somente uma pequena quantidade de tecido, sem levantar a roupa inteira",
        efeito_no_tecido: "o tecido dobra, enruga e cede naturalmente entre os dedos"
      },
      {
        inicio: 5.5,
        fim: 6.3,
        acao: "A mao libera gradualmente o tecido.",
        efeito_no_tecido: "a pequena dobra cai pela gravidade, oscila brevemente e permanece parada"
      },
      {
        inicio: 6.3,
        fim: 7.4,
        acao: "A mao faz um ultimo alisamento curto seguindo o formato real da roupa.",
        efeito_no_tecido: "somente a regiao tocada e suavizada"
      },
      {
        inicio: 7.4,
        fim: 8.0,
        acao: "A mao sai pela borda inferior e as roupas permanecem imoveis ate o ultimo frame."
      }
    ],
    fisica_do_tecido: {
      material: "tecido verdadeiro, macio, maleavel, flexivel e sujeito a gravidade",
      regras: [
        "somente a regiao tocada deve se mover",
        "o tecido deve enrugar sob os dedos",
        "o restante da roupa permanece apoiado",
        "a roupa nao pode se organizar sozinha",
        "a roupa nao pode deslizar sem contato",
        "a roupa nunca se comporta como plastico ou objeto solido"
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
      "plastic fabric",
      "cardboard clothing",
      "clothing moving as one solid object",
      "autonomous clothing movement",
      "clothes arranging themselves",
      "floating fabric",
      "garment transformation",
      "color changing",
      "duplicated garment",
      "extra garment",
      "deformed hand",
      "extra fingers",
      "hand passing through fabric",
      "camera rotation",
      "scene change"
    ]
  },
  tags: ["pov", "textura", "passando a mão", "maciez", "acabamento", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:30:00.000Z",
  updated_at: "2026-08-03T15:30:00.000Z",
};
