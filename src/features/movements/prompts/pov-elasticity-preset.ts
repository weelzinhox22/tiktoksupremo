import type { MovementPreset } from "@/lib/supabase/types";
import povElasticityVideo from "@/assets/videodemonstracao/POV mostrando elasticidade sem deformar a roupa.mp4";

export { povElasticityVideo };

export const POV_ELASTICITY_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000040",
  user_id: null,
  name: "POV — Teste de Elasticidade & Flexibilidade de Borda (8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "ELASTICIDADE"],
  description: "Teste realista de tecido em 8s onde 1 mão pinça a borda do cós/barra, estica suavemente para mostrar elasticidade e solta para retorno perfeito.",
  prompt_instruction: "Anime a imagem anexada sem alterar nenhuma roupa. Preserve exatamente o produto, a quantidade de pecas, cores, estampas, recortes, textura, proporcoes e cenario.",
  videoUrl: povElasticityVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV teste de elasticidade",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "teste de tecido POV realista e viral para TikTok Shop"
    },
    instrucao_principal: "Anime a imagem anexada sem alterar nenhuma roupa. Preserve exatamente o produto, a quantidade de pecas, cores, estampas, recortes, textura, proporcoes e cenario.",
    objetivo: "Mostrar uma unica mao testando suavemente a flexibilidade e o retorno do tecido em uma borda real da roupa.",
    camera: {
      angulo: "top-down de 90 graus",
      movimento: "aproximacao digital discreta",
      estabilidade: "fixa e estavel",
      enquadramento: "produto inteiro permanece reconhecivel"
    },
    controle_anatomico: {
      quantidade_maxima_de_maos: 1,
      mao: "uma unica mao direita",
      partes_visiveis: [
        "uma mao",
        "pequena parte de um antebraco"
      ],
      partes_proibidas: [
        "segunda mao",
        "outros bracos",
        "cabeca",
        "rosto",
        "cabelo",
        "ombros",
        "tronco"
      ]
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.8,
        acao: "Mostrar a roupa completamente imovel."
      },
      {
        inicio: 0.8,
        fim: 2.0,
        acao: "A unica mao entra e alisa suavemente uma borda, cintura, barra ou lateral real da roupa.",
        regra: "escolher somente uma parte que realmente exista na imagem"
      },
      {
        inicio: 2.0,
        fim: 3.2,
        acao: "O polegar e o indicador pincam uma pequena porcao da borda.",
        efeito_no_tecido: "o tecido comprime e forma rugas ao redor dos dedos"
      },
      {
        inicio: 3.2,
        fim: 4.6,
        acao: "A mao puxa a borda lateralmente por uma distancia curta.",
        direcao: "horizontal para fora",
        velocidade: "lenta",
        efeito_no_tecido: "somente a regiao pinçada estica; o restante permanece apoiado"
      },
      {
        inicio: 4.6,
        fim: 5.5,
        acao: "A mao diminui a tensao lentamente sem soltar.",
        efeito_no_tecido: "o tecido retorna gradualmente enquanto continua preso pelos dedos"
      },
      {
        inicio: 5.5,
        fim: 6.5,
        acao: "A mao solta completamente a borda.",
        efeito_no_tecido: "a regiao cai pela gravidade, faz uma pequena oscilacao e para"
      },
      {
        inicio: 6.5,
        fim: 7.4,
        acao: "A palma faz um alisamento curto sobre a regiao testada.",
        efeito_no_tecido: "suaviza somente pequenas rugas locais"
      },
      {
        inicio: 7.4,
        fim: 8.0,
        acao: "A mao sai lentamente do enquadramento."
      }
    ],
    "limites_da_elasticidade": {
      regra: "A tracao deve ser pequena e compatível com o material aparente.",
      se_o_tecido_nao_parecer_elastico: "substituir a puxada por uma flexao leve da borda, sem esticar exageradamente.",
      proibicoes: [
        "nao deformar permanentemente a roupa",
        "nao aumentar o tamanho da peca",
        "nao rasgar o tecido",
        "nao alterar costuras ou recortes"
      ]
    },
    negative_prompt: [
      "more than one hand",
      "extra arms",
      "head visible",
      "face visible",
      "extreme stretching",
      "rubber fabric",
      "plastic fabric",
      "rigid fabric",
      "solid garment",
      "garment moving like cardboard",
      "clothes moving without touch",
      "self-adjusting clothing",
      "color changing",
      "garment transformation",
      "duplicated garment",
      "deformed hand",
      "extra fingers",
      "hand through fabric",
      "camera movement",
      "scene change"
    ]
  },
  tags: ["pov", "elasticidade", "flexibilidade", "cós", "esticar", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:26:00.000Z",
  updated_at: "2026-08-03T15:26:00.000Z",
};
