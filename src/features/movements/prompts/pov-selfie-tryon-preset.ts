import type { MovementPreset } from "@/lib/supabase/types";
import povSelfieTryOnVideo from "@/assets/videodemonstracao/POV Selfie Try-On — Captura no Celular sem Lip Sync.mp4";

export { povSelfieTryOnVideo };

export const POV_SELFIE_TRYON_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000044",
  user_id: null,
  name: "POV Selfie Try-On — Captura no Celular sem Lip Sync (15s)",
  category: "ugc",
  formats: ["UGC", "TRY-ON", "SELFIE", "POV"],
  description: "Animação UGC hiper-realista em 15s onde a modelo grava/tira foto de si mesma usando a câmera do smartphone, sem qualquer lip sync, fala ou alteração de identidade.",
  prompt_instruction: "Animar a foto de referência mostrando claramente a mulher usando o próprio celular para tirar uma foto de si mesma. Ela não está posando para uma câmera externa: toda a atenção dela permanece na tela e na câmera do smartphone.",
  videoUrl: povSelfieTryOnVideo,
  movement_json: {
    tipo: "prompt_de_animacao_para_veo",
    objetivo: "Animar a foto de referência mostrando claramente a mulher usando o próprio celular para tirar uma foto de si mesma. Ela não está posando para uma câmera externa: toda a atenção dela permanece na tela e na câmera do smartphone.",
    referencia_visual: {
      fonte: "usar a foto anexada como referência principal",
      preservar: [
        "mesma mulher",
        "mesmo rosto",
        "mesmo cabelo",
        "mesma roupa",
        "mesmo corpo",
        "mesmo celular",
        "mesmo cenário",
        "mesma iluminação",
        "mesma posição geral"
      ],
      regra: "Não alterar a identidade da mulher, o modelo da roupa, a cor da roupa, o celular ou o ambiente durante a animação."
    },
    scene: "UGC try-on hiper-realista. Uma mulher grava ou tira uma foto de si mesma usando a câmera do próprio celular. O smartphone permanece claramente visível em sua mão durante toda a ação. A cena deve parecer um momento real e espontâneo de conteúdo para TikTok, sem aparência de ensaio publicitário.",
    formato: {
      orientacao: "vertical",
      proporcao: "9:16",
      duracao_total_segundos: 15
    },
    camera_principal: {
      tipo: "câmera externa fixa observando a mulher enquanto ela usa o celular",
      enquadramento: "manter o enquadramento original da imagem anexada",
      movimento: "nenhum movimento de câmera",
      estabilidade: "completamente estável",
      proibicoes: [
        "sem zoom",
        "sem pan",
        "sem rotação",
        "sem mudança de ângulo",
        "sem cortes",
        "sem transições",
        "sem mudança de cenário"
      ]
    },
    celular: {
      funcao: "a mulher está usando a câmera frontal do smartphone para enquadrar e tirar uma selfie",
      posicao: "segurado naturalmente com uma única mão, à frente do rosto ou ligeiramente acima da linha dos olhos",
      orientacao: "vertical",
      tela: "voltada para a mulher",
      camera_do_celular: "apontada diretamente para o rosto e o corpo da mulher",
      comportamento: [
        "o celular permanece firme, mas apresenta pequenos movimentos humanos naturais",
        "a mulher ajusta discretamente o ângulo do aparelho",
        "ela observa a própria imagem na tela",
        "ela toca uma vez no botão virtual de captura",
        "após a captura, mantém o celular na posição por um instante para conferir o resultado"
      ],
      proibicoes: [
        "não criar um segundo celular",
        "não trocar o celular de mão magicamente",
        "não fazer o celular flutuar",
        "não fazer o aparelho atravessar o rosto",
        "não inverter a orientação do aparelho",
        "não deixar a câmera do celular apontada para fora da cena"
      ]
    },
    direcao_do_olhar: {
      regra_principal: "A mulher olha principalmente para a tela do próprio celular, e não diretamente para a câmera externa.",
      sequencia: [
        "primeiro observa o enquadramento na tela",
        "depois olha brevemente para a lente frontal do celular",
        "faz uma expressão sutil para a foto",
        "após a captura, volta a olhar para a tela para conferir a imagem"
      ],
      proibicao: "Ela nunca mantém contato visual prolongado com a câmera externa que está gravando a cena."
    },
    expressao_facial_e_boca: {
      regra_principal: "Não gerar lip sync em nenhuma hipótese.",
      comportamento: [
        "a mulher não está falando",
        "a mulher não está dublando",
        "a mulher não está cantando",
        "a boca permanece fechada na maior parte do tempo ou com microaberturas naturais e sutis",
        "os movimentos da boca devem ser apenas expressivos e naturais, sem sincronização com fala inexistente",
        "o sorriso pode surgir gradualmente, mas sem articulação de sílabas",
        "a mandíbula não deve simular conversa"
      ],
      proibicoes: [
        "sem lip sync",
        "sem fala",
        "sem mouth sync",
        "sem sincronização labial",
        "sem movimentos de boca parecendo diálogo",
        "sem articulação de palavras",
        "sem cantar",
        "sem narração visível",
        "sem expressão de leitura labial"
      ]
    },
    action_timeline: [
      {
        inicio: 0.0,
        fim: 2.0,
        acao: "A mulher já aparece segurando o celular verticalmente à frente do corpo. Ela observa a própria imagem na tela e faz um pequeno ajuste no enquadramento.",
        movimentos: [
          "respiração sutil nos ombros",
          "leve transferência de peso para uma das pernas",
          "pequena inclinação natural do punho que segura o celular",
          "microajuste da posição do aparelho"
        ]
      },
      {
        inicio: 2.0,
        fim: 4.5,
        acao: "Ela levanta o celular alguns centímetros e o inclina levemente para encontrar um ângulo mais favorável.",
        movimentos: [
          "cotovelo se ajusta naturalmente",
          "pulso gira poucos graus",
          "queixo abaixa discretamente",
          "olhos acompanham a imagem exibida na tela"
        ],
        regra: "O celular permanece apontado para ela durante todo o movimento."
      },
      {
        inicio: 4.5,
        fim: 7.0,
        acao: "Mantendo o celular firme, ela posiciona o corpo para a foto.",
        movimentos: [
          "pequena rotação do quadril",
          "leve arqueamento natural da postura",
          "ombro oposto recua alguns centímetros",
          "mão livre toca suavemente a cintura ou a roupa",
          "cabeça inclina poucos graus"
        ],
        regra: "A pose deve continuar espontânea e fisicamente realista."
      },
      {
        inicio: 7.0,
        fim: 9.5,
        acao: "Ela olha brevemente da tela para a lente frontal do celular e cria uma expressão sutil para a selfie.",
        movimentos: [
          "contato visual com a lente do smartphone",
          "sorriso assimétrico lento",
          "piscar natural",
          "microelevação de uma sobrancelha",
          "respiração leve"
        ],
        proibicao: "Não olhar para a câmera externa."
      },
      {
        inicio: 9.5,
        fim: 11.0,
        acao: "Com o polegar da mesma mão que segura o aparelho, ela toca uma vez no botão virtual da câmera e tira a foto.",
        detalhes: [
          "pequeno movimento realista do polegar",
          "celular permanece estável",
          "brevíssima pausa corporal no instante da captura",
          "não adicionar flash forte se ele não existir na referência"
        ]
      },
      {
        inicio: 11.0,
        fim: 13.0,
        acao: "Depois da captura, ela relaxa levemente a expressão e volta a olhar para a tela do celular.",
        movimentos: [
          "sorriso diminui naturalmente",
          "ombros relaxam",
          "celular abaixa poucos centímetros",
          "olhos percorrem brevemente a tela como se estivesse conferindo a foto"
        ]
      },
      {
        inicio: 13.0,
        fim: 15.0,
        acao: "Ela faz um último ajuste pequeno no celular e permanece conferindo o resultado da foto.",
        movimentos: [
          "leve inclinação do aparelho",
          "pequeno sorriso de aprovação",
          "transferência sutil de peso",
          "piscar natural"
        ],
        finalizacao: "O vídeo termina com a mulher ainda segurando o smartphone e olhando para a tela."
      }
    ],
    micro_details: [
      "respiração sutil nos ombros e no peito",
      "pequenos ajustes naturais dos dedos ao redor do celular",
      "leve movimento dos cabelos causado pela mudança de postura",
      "piscar em intervalos naturais",
      "movimentos oculares acompanhando a tela",
      "pequena mudança de foco entre rosto, celular e mão",
      "expressão facial gradual, nunca instantânea",
      "tecido da roupa reage suavemente à movimentação do corpo",
      "sombras permanecem coerentes com a iluminação original",
      "movimentos da boca mínimos e naturais, sem qualquer sincronização labial"
    ],
    technical: {
      qualidade: "4K",
      fps: 60,
      captura_visual: "aparência de gravação feita com iPhone 15 Pro",
      movimento_humano: "natural, suave e realista",
      iluminacao: "luz natural lateral suave e consistente",
      foco: "foco realista no rosto e no smartphone, sem desfoque artificial exagerado",
      identidade: "rosto, corpo, roupa e celular consistentes em todos os frames"
    },
    prioridades_obrigatorias: [
      "O celular deve permanecer visível durante toda a animação.",
      "A mulher deve parecer estar usando a câmera frontal do próprio celular.",
      "Ela deve olhar para a tela e para a lente do smartphone, nunca para a câmera externa.",
      "O polegar deve tocar uma única vez no botão virtual para tirar a foto.",
      "Não remover, esconder ou transformar o celular.",
      "Preservar a identidade facial da mulher.",
      "Manter anatomia correta das mãos e dos dedos.",
      "Manter a roupa exatamente igual à foto anexada.",
      "Não gerar lip sync em nenhum momento.",
      "Não gerar fala, canto ou articulação labial."
    ],
    negative_prompt: [
      "lip sync",
      "mouth sync",
      "talking",
      "speaking",
      "singing",
      "dialogue mouth movement",
      "word articulation",
      "visible speech",
      "woman looking at external camera",
      "woman ignoring the phone",
      "phone not visible",
      "phone disappearing",
      "phone changing shape",
      "phone changing color",
      "second phone",
      "floating phone",
      "phone pointing away from the woman",
      "phone passing through face",
      "incorrect phone orientation",
      "fake camera interaction",
      "no shutter gesture",
      "extra hands",
      "extra arms",
      "duplicated limbs",
      "extra fingers",
      "missing fingers",
      "fused fingers",
      "deformed hands",
      "hand passing through phone",
      "body distortion",
      "face morphing",
      "identity change",
      "unstable face identity",
      "clothing transformation",
      "color changing",
      "body morphing",
      "unnatural pose",
      "robotic motion",
      "sudden smile",
      "frozen expression",
      "unnatural eye movement",
      "crossed eyes",
      "camera jitter",
      "camera shake",
      "zoom",
      "pan",
      "rotation",
      "scene change",
      "lighting flicker",
      "background morphing"
    ]
  },
  tags: ["ugc", "selfie", "try-on", "captura no celular", "sem lip sync", "iphone", "15 segundos", "tiktok shop"],
  created_at: "2026-08-03T16:36:00.000Z",
  updated_at: "2026-08-03T16:36:00.000Z",
};
