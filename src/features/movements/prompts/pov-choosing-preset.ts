import type { MovementPreset } from "@/lib/supabase/types";
import povChoosingVideo from "@/assets/videodemonstracao/POV escolhendo entre as roupas.mp4";

export { povChoosingVideo };

export const POV_CHOOSING_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000039",
  user_id: null,
  name: "POV — Escolhendo Entre as Roupas (Decisão de Look 8s)",
  category: "pov",
  formats: ["UGC", "POV", "MODA", "ESCOLHA"],
  description: "Simulação tátil POV de 8s onde 1 mão aponta, compara e toca as opções de roupas sobre a superfície, destacando a peça escolhida.",
  prompt_instruction: "Use somente a imagem anexada como referencia. Preserve exatamente a quantidade de roupas, suas cores, modelagens, estampas, texturas, proporcoes, posicoes e o cenario. Nao invente pecas ou detalhes.",
  videoUrl: povChoosingVideo,
  movement_json: {
    tipo: "prompt_veo_pov_viral_tiktok_shop",
    nome: "POV escolhendo qual roupa usar",
    formato: {
      proporcao: "9:16",
      duracao_segundos: 8,
      fps: 30,
      estilo: "video POV casual e viral de escolha de look para TikTok Shop"
    },
    instrucao_principal: "Use somente a imagem anexada como referencia. Preserve exatamente a quantidade de roupas, suas cores, modelagens, estampas, texturas, proporcoes, posicoes e o cenario. Nao invente pecas ou detalhes.",
    objetivo: "Simular o ponto de vista de uma pessoa escolhendo entre as roupas dispostas na imagem, utilizando somente uma mao para tocar e destacar cada opcao.",
    camera: {
      angulo: "top-down de 90 graus",
      movimento: "leve aproximacao digital durante todo o video",
      estabilidade: "camera estavel",
      enquadramento: "todas as roupas continuam visiveis"
    },
    controle_anatomico: {
      quantidade_maxima_de_maos: 1,
      mao: "uma unica mao feminina",
      entrada: "borda inferior",
      proibido: [
        "segunda mao",
        "mais de um antebraco",
        "cabeca",
        "rosto",
        "cabelo",
        "tronco",
        "pernas",
        "pes"
      ]
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.6,
        acao: "Mostrar todas as roupas completamente paradas na composicao original."
      },
      {
        inicio: 0.6,
        fim: 1.8,
        acao: "Uma unica mao entra e aponta naturalmente para a primeira roupa visivel.",
        gesto: "dedo indicador estendido, demais dedos relaxados",
        contato: "um toque curto e suave no tecido"
      },
      {
        inicio: 1.8,
        fim: 3.0,
        acao: "A mao desliza para a roupa seguinte, caso exista, e faz outro toque curto.",
        regra: "a primeira roupa permanece completamente imovel"
      },
      {
        inicio: 3.0,
        fim: 4.6,
        acao: "A mao retorna para a peca principal e desliza as pontas dos dedos sobre uma pequena regiao de destaque.",
        efeito_no_tecido: "ondulacoes pequenas somente sob os dedos"
      },
      {
        inicio: 4.6,
        fim: 6.2,
        acao: "A mao puxa delicadamente uma borda real da peca principal alguns centimetros para perto da camera.",
        regra: "a roupa permanece apoiada na superficie e nao e levantada",
        efeito_no_tecido: "a borda se move primeiro e o restante acompanha com atraso natural"
      },
      {
        inicio: 6.2,
        fim: 7.2,
        acao: "A mao solta a borda e faz dois pequenos toques de aprovacao sobre a roupa escolhida.",
        efeito_no_tecido: "duas pequenas compressoes locais"
      },
      {
        inicio: 7.2,
        fim: 8.0,
        acao: "A mao sai. Todas as roupas permanecem exatamente reconheciveis e imoveis."
      }
    ],
    fisica_obrigatoria: {
      regra: "Nenhuma roupa se movimenta sem contato direto da unica mao.",
      comportamento: [
        "o tecido afunda sob os dedos",
        "a borda arrastada forma pequenas dobras",
        "as regioes distantes permanecem quase paradas",
        "o tecido nunca se move como uma placa"
      ]
    },
    negative_prompt: [
      "two hands",
      "extra hands",
      "four arms",
      "multiple people",
      "head visible",
      "face visible",
      "rigid garment",
      "plastic clothing",
      "clothes moving by themselves",
      "automatic alignment",
      "floating clothes",
      "garment lifted completely",
      "color changing",
      "morphing",
      "duplicated garment",
      "extra garment",
      "deformed fingers",
      "camera shake",
      "scene change"
    ]
  },
  tags: ["pov", "escolhendo roupa", "decisão de look", "opções", "vestuário", "flat lay", "8 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:28:00.000Z",
  updated_at: "2026-08-03T15:28:00.000Z",
};
