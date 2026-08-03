import type { MovementPreset } from "@/lib/supabase/types";
import povFoldingVideo from "@/assets/videodemonstracao/POV satisfatório dobrando somente uma borda.mp4";

export { povFoldingVideo };

export const POV_FOLDING_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000042",
  user_id: null,
  name: "POV — Dobra Satisfatória de Borda & Lado Interno (8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "SATISFATÓRIO"],
  description: "Movimento satisfatório em 8s onde 1 única mão dobra delicadamente a barra da peça para mostrar o verso do tecido e o acabamento.",
  prompt_instruction: "Anime exatamente a imagem anexada. Nao altere nenhuma caracteristica das roupas ou do cenario. Preserve modelo, quantidade, cores, estampas, textura, posicao e proporcoes.",
  videoUrl: povFoldingVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV dobra satisfatoria",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "video satisfatorio, organico e viral de produto"
    },
    instrucao_principal: "Anime exatamente a imagem anexada. Nao altere nenhuma caracteristica das roupas ou do cenario. Preserve modelo, quantidade, cores, estampas, textura, posicao e proporcoes.",
    objetivo: "Mostrar uma unica mao dobrando e desdobrando suavemente apenas uma pequena borda da roupa para destacar o lado externo, o lado interno e a maciez do tecido.",
    camera: {
      angulo: "top-down de 90 graus",
      estabilidade: "fixa",
      movimento: "nenhum movimento de camera"
    },
    controle_anatomico: {
      quantidade_maxima_de_maos: 1,
      quantidade_maxima_de_antebracos: 1,
      partes_proibidas: [
        "segunda mao",
        "bracos adicionais",
        "cabeca",
        "rosto",
        "cabelo",
        "tronco"
      ]
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.8,
        acao: "Mostrar a composicao original imovel."
      },
      {
        inicio: 0.8,
        fim: 2.0,
        acao: "A unica mao entra e desliza suavemente ate uma barra ou borda real da roupa."
      },
      {
        inicio: 2.0,
        fim: 3.4,
        acao: "O polegar e o indicador levantam somente a extremidade da borda.",
        limite: "levantar poucos centimetros",
        efeito_no_tecido: "a borda dobra, curva e fica pendurada naturally"
      },
      {
        inicio: 3.4,
        fim: 4.7,
        acao: "A mao dobra a borda para dentro, revelando brevemente a parte interna real do tecido.",
        regra: "nao inventar forro, estampa ou acabamento que nao exista"
      },
      {
        inicio: 4.7,
        fim: 5.8,
        acao: "A mao passa o indicador sobre a dobra para destacar espessura e acabamento.",
        efeito_no_tecido: "compressao local e pequenas rugas"
      },
      {
        inicio: 5.8,
        fim: 6.8,
        acao: "A mao desdobra lentamente a borda e a apoia novamente.",
        efeito_no_tecido: "a borda cai pela gravidade e se acomoda naturalmente"
      },
      {
        inicio: 6.8,
        fim: 7.5,
        acao: "A palma faz um alisamento curto somente sobre a borda."
      },
      {
        inicio: 7.5,
        fim: 8.0,
        acao: "A mao sai e a roupa permanece imovel."
      }
    ],
    fisica_obrigatoria: {
      regra: "A borda deve parecer tecido verdadeiro e flexivel, jamais plastico ou estrutura rigida.",
      comportamento: [
        "a parte levantada fica pendurada",
        "a dobra nao permanece reta",
        "o tecido curva sob o proprio peso",
        "a roupa inteira permanece apoiada",
        "somente a borda tocada se movimenta"
      ]
    },
    negative_prompt: [
      "two hands",
      "extra hands",
      "head visible",
      "face visible",
      "entire garment lifting",
      "rigid edge",
      "plastic fabric",
      "cardboard fold",
      "solid clothing",
      "floating fabric",
      "automatic folding",
      "self-folding clothes",
      "clothes arranging themselves",
      "invented lining",
      "invented pattern",
      "color changing",
      "garment transformation",
      "deformed fingers",
      "extra fingers",
      "camera movement",
      "scene change"
    ]
  },
  tags: ["pov", "dobra satisfatória", "barra", "lado interno", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:22:00.000Z",
  updated_at: "2026-08-03T15:22:00.000Z",
};
