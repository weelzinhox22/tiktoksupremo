import type { MovementPreset } from "@/lib/supabase/types";
import passandoAMaoVideo from "@/assets/videodemonstracao/passandoamao.mp4";
import { TWO_CLOTHES_ON_RUG_PRESET, twoClothesOnRugVideo } from "@/features/movements/two-clothes-rug-preset";
import { POV_TEXTURE_PRESET, povTextureVideo } from "@/features/movements/prompts/pov-texture-preset";
import { POV_CHOOSING_PRESET, povChoosingVideo } from "@/features/movements/prompts/pov-choosing-preset";
import { POV_ELASTICITY_PRESET, povElasticityVideo } from "@/features/movements/prompts/pov-elasticity-preset";
import { POV_REVEALING_PRESET, povRevealingVideo } from "@/features/movements/prompts/pov-revealing-preset";
import { POV_FOLDING_PRESET, povFoldingVideo } from "@/features/movements/prompts/pov-folding-preset";
import { POV_SOFTNESS_PRESET, povSoftnessVideo } from "@/features/movements/prompts/pov-softness-preset";
import { POV_SELFIE_TRYON_PRESET, povSelfieTryOnVideo } from "@/features/movements/prompts/pov-selfie-tryon-preset";

export {
  passandoAMaoVideo,
  twoClothesOnRugVideo,
  TWO_CLOTHES_ON_RUG_PRESET,
  POV_SELFIE_TRYON_PRESET,
  povSelfieTryOnVideo,
  POV_SOFTNESS_PRESET,
  povSoftnessVideo,
  POV_TEXTURE_PRESET,
  povTextureVideo,
  POV_CHOOSING_PRESET,
  povChoosingVideo,
  POV_ELASTICITY_PRESET,
  povElasticityVideo,
  POV_REVEALING_PRESET,
  povRevealingVideo,
  POV_FOLDING_PRESET,
  povFoldingVideo,
};

export const PASSANDO_A_MAO_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000032",
  user_id: null,
  name: "Animação de Roupas Hiper-realista (Mãos Deslizando / Flat Lay 15s)",
  category: "fashion",
  formats: ["UGC", "FLAT LAY", "MODA", "POV"],
  description: "Demonstração hiper-realista em 15.17s onde mãos femininas deslizam suavemente sobre o tecido, testam a flexibilidade da peça e ajustam a roupa sem alterar o produto ou cenário original.",
  prompt_instruction: "Utilize exclusivamente a foto anexada como referência visual. Anime exatamente a roupa ou as roupas presentes na imagem, sem substituir, reinterpretar ou inventar características. A foto anexada é a única fonte de verdade para modelo, quantidade de peças, cores, textura, formato, proporções, posição e cenário.",
  movement_json: {
    tipo: "prompt_universal_de_movimentos_para_animacao_de_roupas",
    instrucao_principal: "Utilize exclusivamente a foto anexada como referência visual. Anime exatamente a roupa ou as roupas presentes na imagem, sem substituir, reinterpretar ou inventar características. A foto anexada é a única fonte de verdade para modelo, quantidade de peças, cores, textura, formato, proporções, posição e cenário.",
    formato: {
      orientacao: "vertical",
      proporcao: "9:16",
      resolucao_de_referencia: "720x1280",
      duracao_total_segundos: 15.17,
      fps: 30,
      estilo: "vídeo hiper-realista de demonstração de produto para TikTok Shop"
    },
    referencia_visual_obrigatoria: {
      fonte: "foto anexada pelo usuário",
      regra: "Preservar exatamente tudo o que estiver visível na imagem de referência.",
      preservar: [
        "quantidade exata de roupas",
        "tipo exato de cada roupa",
        "cores originais",
        "estampas originais",
        "textura do tecido",
        "costuras",
        "recortes",
        "dobras existentes",
        "proporções",
        "posição relativa entre as peças",
        "orientação de cada peça",
        "superfície de apoio",
        "objetos presentes no cenário",
        "iluminação",
        "sombras"
      ],
      nao_inventar: [
        "novas roupas",
        "novas cores",
        "novas estampas",
        "novas partes",
        "novos acessórios",
        "novos recortes",
        "novos botões",
        "novos bolsos",
        "novas alças",
        "novos detalhes",
        "novo cenário"
      ],
      regra_de_identidade: "Cada peça visível na foto deve permanecer sendo a mesma peça física do primeiro ao último frame."
    },
    objetivo_visual: "Transformar a foto anexada em uma demonstração realista de produto, na qual mãos femininas deslizam suavemente sobre as roupas, destacam o tecido, demonstram a flexibilidade do material e fazem pequenos ajustes locais sem levantar, trocar, duplicar ou transformar as peças.",
    cenario: {
      fonte: "usar exatamente o cenário visível na foto anexada",
      superficie: "manter exatamente a superfície de apoio mostrada na referência",
      organizacao: "manter a posição geral e a organização original das roupas",
      iluminacao: "preservar a direção, intensidade e temperatura da iluminação da imagem",
      sombras: "sombras suaves, naturais e coerentes com a iluminação original",
      proibicoes: [
        "não trocar o chão",
        "não criar cama",
        "não criar mesa",
        "não criar tapete adicional",
        "não adicionar objetos decorativos",
        "não remover objetos importantes da referência",
        "não alterar a composição"
      ]
    },
    interpretacao_universal_das_pecas: {
      regra: "Não nomear nem presumir o tipo das roupas. Identificar cada peça apenas por sua posição espacial na imagem.",
      identificadores_permitidos: [
        "peça principal",
        "peça secundária",
        "peça localizada à esquerda",
        "peça localizada à direita",
        "peça localizada acima",
        "peça localizada abaixo",
        "região superior da peça",
        "região central da peça",
        "região inferior da peça",
        "borda esquerda",
        "borda direita",
        "borda superior",
        "borda inferior"
      ],
      quantidade: "Usar exatamente a quantidade de peças visível na foto.",
      se_houver_apenas_uma_peca: "Aplicar todos os movimentos somente nela.",
      se_houver_duas_ou_mais_pecas: "Distribuir os movimentos entre as peças sem mudar a posição relativa da composição."
    },
    corpo_visivel: {
      "quantidade_de_pessoas": 1,
      "quantidade_exata_de_maos": 2,
      "quantidade_exata_de_bracos": 2,
      partes_visiveis: [
        "duas mãos pertencentes à mesma pessoa",
        "pequena parte dos dois antebraços"
      ],
      partes_proibidas: [
        "cabeça",
        "rosto",
        "cabelo",
        "orelhas",
        "pescoço",
        "ombros",
        "peito",
        "tronco",
        "cintura",
        "pernas",
        "pés",
        "sombra da cabeça",
        "reflexo do rosto"
      ],
      entrada_das_maos: "as duas mãos entram somente pelas bordas inferiores ou laterais inferiores do enquadramento",
      regra_anatomica: "Nunca mostrar mais de duas mãos. Nunca mostrar mais de dois antebraços. As mãos devem permanecer conectadas anatomicamente aos mesmos dois antebraços.",
      posicao_da_pessoa: "a pessoa permanece completamente fora do enquadramento durante todo o vídeo"
    },
    camera: {
      angulo: "top-down de 90 graus, perpendicular à superfície",
      enquadramento: "preservar o enquadramento geral da foto de referência",
      estabilidade: "câmera fixa e estável",
      movimento_principal: "aproximação digital extremamente lenta e discreta, sem cortar nenhuma roupa",
      zoom_maximo: "muito leve, apenas para aumentar a percepção da textura",
      pan: "nenhum",
      rotacao: "nenhuma",
      inclinacao: "nenhuma",
      tremor: "nenhum",
      cortes: "nenhum",
      transicoes: "nenhuma",
      regra: "Toda a animação acontece em um único plano contínuo."
    },
    fisica_obrigatoria: {
      "roupas_permanecem_apoiadas": true,
      "roupas_nao_sao_levantadas": true,
      movimento_autonomo: false,
      regra_principal: "Somente a região diretamente tocada, pressionada ou puxada pelas mãos pode se deformar ou se deslocar.",
      quando_nao_ha_contato: "Quando nenhuma mão estiver encostando em uma região da roupa, essa região deve permanecer imóvel.",
      deformacao: "local, macia, progressiva e compatível com o tecido mostrado na imagem",
      reacao_ao_toque: [
        "o tecido afunda levemente sob os dedos",
        "pequenas rugas se formam na direção do movimento",
        "as rugas diminuem apenas nas regiões alisadas",
        "as bordas próximas podem reagir com pequeno atraso",
        "o restante da peça permanece apoiado e estável"
      ],
      proibicoes: [
        "a roupa não pode se abrir sozinha",
        "a roupa não pode se centralizar sozinha",
        "a roupa não pode deslizar sem contato",
        "a roupa não pode alterar suas próprias dobras",
        "a roupa não pode assumir automaticamente uma posição perfeita",
        "a roupa não pode flutuar",
        "a roupa não pode se comportar como objeto rígido"
      ]
    },
    movimentos: [
      {
        inicio: 0.0,
        fim: 0.5,
        acao: "Mostrar a composição original da foto anexada completamente imóvel.",
        maos: "fora do enquadramento",
        estado_das_roupas: "todas as peças permanecem exatamente na posição inicial da referência",
        camera: "inicia uma aproximação digital quase imperceptível"
      },
      {
        inicio: 0.5,
        fim: 1.0,
        acao: "As duas mãos entram lentamente pelas bordas inferiores e se aproximam da região central ou inferior da peça principal.",
        mao_esquerda: {
          posicao: "lado esquerdo da região escolhida",
          orientacao: "palma para baixo",
          dedos: "abertos e relaxados"
        },
        mao_direita: {
          posicao: "lado direito da mesma região",
          orientacao: "palma para baixo",
          dedos: "abertos e relaxados"
        },
        contato: "as mãos ainda não deslocam a roupa"
      },
      {
        inicio: 1.0,
        fim: 2.2,
        acao: "As duas mãos encostam suavemente no tecido e deslizam juntas para baixo e levemente para o centro.",
        direcao: "diagonal descendente e interna",
        velocidade: "lenta e simétrica",
        contato: "palmas e pontas dos dedos permanecem em contato contínuo",
        efeito_no_tecido: "apenas as pequenas rugas sob as mãos são suavizadas",
        regra: "a peça inteira não pode deslizar"
      },
      {
        inicio: 2.2,
        fim: 3.2,
        acao: "As mãos continuam o movimento, separando-se gradualmente para acompanhar o formato real da região inferior da peça.",
        direcao: "centro para baixo e para fora",
        dedos: "abertos e acompanhando o contorno existente",
        velocidade: "lenta",
        efeito_no_tecido: "evidencia a maciez e a textura sem alterar a modelagem",
        adaptacao: "se a roupa não possuir duas divisões inferiores, as mãos apenas se afastam suavemente para as bordas laterais"
      },
      {
        inicio: 3.2,
        fim: 3.7,
        acao: "As mãos terminam o primeiro alisamento e saem parcialmente pelas bordas inferiores.",
        velocidade: "moderada e natural",
        estado_das_roupas: "as peças permanecem imóveis depois que o contato termina"
      },
      {
        inicio: 3.7,
        fim: 4.3,
        acao: "As mãos retornam e se posicionam em duas regiões diferentes da peça principal.",
        mao_esquerda: {
          funcao: "estabilizar uma região da roupa",
          posicao: "borda ou região lateral esquerda"
        },
        mao_direita: {
          funcao: "preparar uma demonstração de flexibilidade",
          posicao: "borda ou região lateral direita",
          pegada: "pinça superficial usando polegar e indicador"
        },
        regra: "escolher somente uma borda real já existente na imagem"
      },
      {
        inicio: 4.3,
        fim: 5.3,
        acao: "A mão direita faz uma puxada lateral curta e controlada para mostrar a flexibilidade do tecido, enquanto a mão esquerda mantém a região oposta estável.",
        direcao: "horizontal para fora, com deslocamento curto",
        velocidade: "muito lenta",
        micro_movimentos: "uma puxada curta, pequena liberação e retorno parcial",
        efeito_no_tecido: "somente a região diretamente pinçada estica ou se desloca",
        adaptacao: "se o tecido parecer pouco elástico, realizar apenas uma leve tração sem deformação exagerada",
        proibicao: "não levantar a roupa da superfície"
      },
      {
        inicio: 5.3,
        fim: 5.8,
        acao: "A mão direita libera gradualmente a tensão. As duas mãos mudam de posição sem sair completamente do enquadramento.",
        efeito_no_tecido: "a região retorna de maneira natural e discreta",
        regra: "o retorno ocorre apenas enquanto os dedos ainda mantêm contato"
      },
      {
        inicio: 5.8,
        fim: 6.7,
        acao: "As duas mãos se deslocam para a região superior da peça principal e pousam suavemente sobre o tecido.",
        posicao: "uma mão em cada lado da região superior",
        dedos: "abertos, paralelos e relaxados",
        contato: "leve pressão com palmas e pontas dos dedos",
        efeito_no_tecido: "pequena compressão local da textura"
      },
      {
        inicio: 6.7,
        fim: 7.6,
        acao: "As mãos deslizam simultaneamente do centro da região superior para cima e para fora.",
        direcao: "diagonal ascendente e externa",
        velocidade: "lenta",
        efeito_no_tecido: "destaca textura, relevo, costura ou acabamento já existente",
        regra: "não inventar formato curvo, estrutura ou bojo se isso não estiver presente na referência"
      },
      {
        inicio: 7.6,
        fim: 8.0,
        acao: "As mãos deixam de tocar a roupa e recuam levemente.",
        estado_das_roupas: "composição completamente imóvel",
        camera: "continua a aproximação digital lenta"
      },
      {
        inicio: 8.0,
        fim: 8.6,
        acao: "As duas mãos retornam e tocam uma borda horizontal ou lateral real da peça principal.",
        pegada: "polegar sobre o tecido e indicador por baixo ou junto à borda",
        posicao: "duas extremidades opostas da mesma região",
        adaptacao: "usar o cós, barra, lateral, decote ou outra borda apenas se estiver claramente visível na foto"
      },
      {
        inicio: 8.6,
        fim: 9.5,
        acao: "As mãos fazem uma abertura lateral curta e simétrica para demonstrar flexibilidade.",
        direcao: "horizontal para fora",
        velocidade: "lenta",
        efeito_no_tecido: "a borda tocada se deforma enquanto o restante da peça permanece apoiado",
        limite: "a abertura deve ser pequena e fisicamente compatível com o material"
      },
      {
        inicio: 9.5,
        fim: 10.2,
        acao: "As mãos realizam uma única pulsação suave de abertura e relaxamento, sem soltar completamente o tecido.",
        direcao: "micro movimento horizontal",
        velocidade: "muito lenta",
        efeito_no_tecido: "demonstra recuperação natural do material",
        proibicao: "não repetir o movimento várias vezes"
      },
      {
        inicio: 10.2,
        fim: 10.7,
        acao: "As mãos liberam a borda e reposicionam-se sobre outra região visível da roupa ou sobre uma segunda peça, caso ela exista na imagem.",
        adaptacao: {
          uma_peca: "continuar a demonstração em outra região da mesma roupa",
          duas_ou_mais_pecas: "mover as mãos para a próxima peça sem alterar a posição das demais"
        }
      },
      {
        inicio: 10.7,
        fim: 11.8,
        acao: "As duas mãos pressionam suavemente a nova região e deslizam para baixo, acompanhando o formato real da peça.",
        direcao: "vertical descendente com leve abertura lateral",
        velocidade: "lenta e simétrica",
        contato: "contínuo",
        efeito_no_tecido: "suaviza pequenas rugas somente sob os dedos e palmas"
      },
      {
        inicio: 11.8,
        fim: 12.7,
        acao: "Cada mão acompanha uma lateral diferente da região escolhida até uma borda próxima.",
        direcao: "diagonal descendente e externa",
        velocidade: "lenta",
        efeito_no_tecido: "alisa localmente sem deslocar a roupa inteira"
      },
      {
        inicio: 12.7,
        fim: 13.1,
        acao: "As mãos saem brevemente e deixam todas as roupas imóveis.",
        maos: "fora do enquadramento",
        camera: "aproximação lenta continua"
      },
      {
        inicio: 13.1,
        fim: 13.5,
        acao: "As mãos retornam e colocam apenas as pontas dos dedos sobre uma região que apresente textura, relevo, estampa, acabamento ou costura visível.",
        contato: "superficial",
        dedos: "abertos e levemente curvados",
        regra: "selecionar um detalhe que realmente exista na foto"
      },
      {
        inicio: 13.5,
        fim: 14.2,
        acao: "As pontas dos dedos deslizam lentamente sobre o detalhe escolhido.",
        direcao: "seguir a orientação real da textura ou da costura",
        micro_movimentos: "pequenos movimentos curtos e alternados",
        efeito_no_tecido: "compressão e ondulações locais que destacam o acabamento"
      },
      {
        inicio: 14.2,
        fim: 14.8,
        acao: "Os dedos migram suavemente para as bordas do detalhe, mantendo pressão leve.",
        velocidade: "muito lenta",
        efeito_no_tecido: "o material se deforma apenas na área tocada"
      },
      {
        inicio: 14.8,
        fim: 15.17,
        acao: "As mãos fazem um último alisamento curto, liberam o tecido e começam a sair pelas bordas inferiores.",
        finalizacao: "o vídeo termina mostrando exatamente a composição original da foto, sem alteração de quantidade, cor, modelo ou posição geral das roupas",
        estado_final: "todas as peças imóveis e totalmente reconhecíveis"
      }
    ],
    caracteristicas_dos_gestos: {
      ritmo: "calmo, delicado, comercial e natural",
      simetria: "movimentos majoritariamente simultâneos, executados por exatamente duas mãos",
      pressao: "leve e localizada",
      velocidade: "lenta, sem movimentos bruscos",
      naturalidade: "gestos humanos realistas, sem aparência robótica",
      objetivos: [
        "alisar pequenas regiões do tecido",
        "destacar textura e acabamento",
        "demonstrar flexibilidade",
        "preservar completamente a identidade visual das roupas",
        "transformar a foto em uma demonstração realista de produto"
      ]
    },
    controle_de_consistencia: {
      cores: "permanecem exatamente iguais à foto em todos os frames",
      quantidade_de_pecas: "permanece exatamente igual à imagem",
      modelagem: "não muda",
      estampa: "não muda",
      textura: "não muda",
      cenario: "não muda",
      posicao_geral: "não muda",
      "roupas_autonomas": "proibido",
      "maos_adicionais": "proibido",
      "partes_do_corpo_adicionais": "proibido"
    },
    restricoes: [
      "Usar a foto anexada como única referência visual.",
      "Não definir previamente o tipo, a cor ou a quantidade de roupas.",
      "Não transformar a roupa em outro produto.",
      "Não criar novas peças.",
      "Não duplicar peças existentes.",
      "Não remover peças existentes.",
      "Não trocar cores.",
      "Não alterar estampas.",
      "Não alterar proporções.",
      "Não alterar o cenário.",
      "Mostrar exatamente duas mãos pertencentes a uma única pessoa.",
      "Não mostrar cabeça, rosto, cabelo, ombros ou tronco.",
      "Não criar mãos ou braços adicionais.",
      "Não permitir que a roupa se arrume sozinha.",
      "Não levantar as roupas da superfície.",
      "Não fazer dedos atravessarem o tecido.",
      "Não produzir movimentos rígidos, mágicos ou mecânicos.",
      "Não aplicar movimentos incompatíveis com a estrutura visível da roupa."
    ],
    negative_prompt: [
      "extra hands",
      "third hand",
      "four hands",
      "four arms",
      "extra arms",
      "duplicated limbs",
      "detached hands",
      "multiple people",
      "second person",
      "head visible",
      "face visible",
      "hair visible",
      "neck visible",
      "shoulders visible",
      "torso visible",
      "body entering frame",
      "head shadow",
      "autonomous clothing movement",
      "clothes arranging themselves",
      "self-folding clothes",
      "self-opening clothes",
      "automatic alignment",
      "fabric moving without hand contact",
      "magical adjustment",
      "floating fabric",
      "floating clothing",
      "garment lifting from the floor",
      "rigid clothing",
      "stiff fabric",
      "cardboard clothing",
      "plastic clothing",
      "clothing moving as a solid object",
      "color changing",
      "color swap",
      "color morphing",
      "garment transformation",
      "different garment design",
      "extra garment",
      "duplicated garment",
      "disappearing garment",
      "invented accessories",
      "invented pockets",
      "invented buttons",
      "invented straps",
      "deformed hands",
      "extra fingers",
      "missing fingers",
      "fused fingers",
      "hands passing through fabric",
      "camera shake",
      "camera rotation",
      "camera tilt",
      "scene change",
      "jump cut",
      "background replacement",
      "new objects appearing"
    ]
  },
  tags: ["passando a mão", "deslizar tecido", "animação de roupas", "flat lay", "15 segundos", "flexibilidade", "demonstração realista", "vestuário"],
  created_at: "2026-08-03T14:40:00.000Z",
  updated_at: "2026-08-03T14:40:00.000Z",
};

export const FLAT_LAY_CLOTHING_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000030",
  user_id: null,
  name: "Demonstração Flat Lay de Vestuário Universal (Visão Superior 90°)",
  category: "fashion",
  formats: ["UGC", "FLAT LAY", "MODA"],
  description: "Estrutura universal para qualquer tipo de roupa (vestidos, conjuntos, camisetas, saias, calças) em câmera superior 90°, destacando tecido, barra, cós e acabamentos.",
  prompt_instruction: "Movimento universal de demonstração delicada de vestuário sobre tecido/cenário em ângulo superior de 90°. Funciona com qualquer peça ou conjunto (vestidos, conjuntos, blusas, calças), mostrando barra, cós, costura e detalhes de textura.",
  movement_json: {},
  tags: ["flat lay", "vestuário", "qualquer roupa", "visão superior", "detalhes", "tecido", "moda universal", "tiktok shop"],
  created_at: "2026-08-03T12:00:00.000Z",
  updated_at: "2026-08-03T12:00:00.000Z",
};

export const MULTICOLOR_CROCHET_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000031",
  user_id: null,
  name: "Demonstração Multicores em Camadas (Qualquer Produto / Câmera Superior)",
  category: "product_demo",
  formats: ["UGC", "FLAT LAY", "MULTICORES"],
  description: "Apresentação sequencial universal de produtos em 3 opções de cores dispostas em camadas (vestuário, acessórios ou produtos físicos), com aproximação de textura e remoção uma a uma.",
  prompt_instruction: "Estrutura universal para mostrar variações de cores (3 cores) de qualquer produto em camadas com câmera superior. Exibe elasticidade, textura, alinhamento do produto e retirada gradual de cada cor.",
  movement_json: {},
  tags: ["multicores", "três cores", "camadas", "qualquer produto", "flat lay", "tiktok shop"],
  created_at: "2026-08-03T11:00:00.000Z",
  updated_at: "2026-08-03T11:00:00.000Z",
};

export const DUAL_SET_ELASTICITY_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000036",
  user_id: null,
  name: "Demonstração Lado a Lado & Elasticidade (2 Peças / Câmera Superior)",
  category: "fashion",
  formats: ["UGC", "FLAT LAY", "LADO A LADO"],
  description: "Apresentação de duas peças/conjuntos dispostos lado a lado com teste de elasticidade do cós/gola, close em detalhes e alinhamento do caimento.",
  prompt_instruction: "Demonstração universal em câmera superior de dois conjuntos ou peças de roupa lado a lado (Opção A e Opção B). Mostra teste de esticar o elástico/cós, close em alças e detalhes de costura, alisamento do tecido e retirada/dobra das peças.",
  movement_json: {},
  tags: ["lado a lado", "duas cores", "elasticidade", "vestuário", "qualquer roupa", "flat lay", "câmera superior", "tiktok shop"],
  created_at: "2026-08-03T10:00:00.000Z",
  updated_at: "2026-08-03T10:00:00.000Z",
};

export const TREADMILL_MANNEQUIN_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000033",
  user_id: null,
  name: "Esteira com Manequim de IA (Faceless Treadmill Transition)",
  category: "fashion",
  formats: ["UGC", "NO SPEAK", "MANEQUIM IA", "ESTEIRA"],
  description: "Formato viral internacional: Manequim humanoide sem rosto caminhando em esteira minimalista com trocas instantâneas de roupas/looks a cada passo.",
  prompt_instruction: "Manequim humanoide sem rosto (corpo preto fosco) caminhando continuamente sobre uma esteira minimalista em ritmo constante. Câmera totalmente fixa de frente. A cada passo no solo, a roupa muda instantaneamente para uma nova opção/cor sem alterar o manequim, a esteira ou o cenário. Sem fala, otimizado para retenção e loop perfeito.",
  movement_json: {},
  tags: ["esteira", "manequim ia", "faceless mannequin", "treadmill transition", "lookbook", "troca de roupa", "sem rosto", "moda", "tiktok shop"],
  created_at: "2026-08-03T09:00:00.000Z",
  updated_at: "2026-08-03T09:00:00.000Z",
};

export const STRAP_PULL_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000034",
  user_id: null,
  name: "Movimento – Puxando Alça e Tecido da Roupa",
  category: "fashion",
  formats: ["UGC", "FASHION", "ROUPA", "NO SPEAK"],
  description: "Demonstração tátil GRWM: a modelo ajusta suavemente a alça no ombro e puxa levemente o tecido para destacar a elasticidade e caimento da roupa/blusa feminina.",
  prompt_instruction: "SCENE: UGC GRWM style, fixed camera, natural behavior.",
  movement_json: {},
  tags: ["puxando alça", "tecido", "elasticidade", "blusa feminina", "moda feminina", "grwm", "ugc", "tiktok shop"],
  created_at: "2026-08-03T08:00:00.000Z",
  updated_at: "2026-08-03T08:00:00.000Z",
};

export const TURN_45_PRESET: MovementPreset = {
  id: "10000000-0000-4000-8000-000000000035",
  user_id: null,
  name: "Movimento – Gira 45 Graus",
  category: "fashion",
  formats: ["UGC", "FASHION", "TRY ON", "NO SPEAK"],
  description: "Movimento de giro suave de 45 graus: a modelo inicia de costas, gira a cabeça e o tronco 45 graus, faz contato visual com um sorriso assimétrico e retorna à posição inicial.",
  prompt_instruction: "SCENE: UGC try-on style, fixed camera, soft side natural light.",
  movement_json: {},
  tags: ["gira 45 graus", "ombro", "sorriso", "try on", "moda", "ugc", "tiktok shop"],
  created_at: "2026-08-03T07:00:00.000Z",
  updated_at: "2026-08-03T07:00:00.000Z",
};

export const BUILTIN_MOVEMENT_PRESETS: MovementPreset[] = [
  POV_SELFIE_TRYON_PRESET,
  POV_SOFTNESS_PRESET,
  TWO_CLOTHES_ON_RUG_PRESET,
  POV_TEXTURE_PRESET,
  POV_CHOOSING_PRESET,
  POV_ELASTICITY_PRESET,
  POV_REVEALING_PRESET,
  POV_FOLDING_PRESET,
  PASSANDO_A_MAO_PRESET,
  FLAT_LAY_CLOTHING_PRESET,
  MULTICOLOR_CROCHET_PRESET,
  DUAL_SET_ELASTICITY_PRESET,
  TREADMILL_MANNEQUIN_PRESET,
  STRAP_PULL_PRESET,
  TURN_45_PRESET,
];

export const PRESET_VIDEO_MAP: Record<string, string> = {
  [POV_SELFIE_TRYON_PRESET.id]: povSelfieTryOnVideo,
  [POV_SOFTNESS_PRESET.id]: povSoftnessVideo,
  [TWO_CLOTHES_ON_RUG_PRESET.id]: twoClothesOnRugVideo,
  [POV_TEXTURE_PRESET.id]: povTextureVideo,
  [POV_CHOOSING_PRESET.id]: povChoosingVideo,
  [POV_ELASTICITY_PRESET.id]: povElasticityVideo,
  [POV_REVEALING_PRESET.id]: povRevealingVideo,
  [POV_FOLDING_PRESET.id]: povFoldingVideo,
  [PASSANDO_A_MAO_PRESET.id]: passandoAMaoVideo,
};

export function movementActions(movement: MovementPreset) {
  const json = movement.movement_json as Record<string, unknown>;
  const timeline = json["action_timeline"];
  if (Array.isArray(timeline)) {
    return timeline.slice(0, 4).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action = typeof item["acao"] === "string" ? item["acao"] : "";
      const inicio = typeof item["inicio"] === "number" ? item["inicio"] : 0;
      const fim = typeof item["fim"] === "number" ? item["fim"] : 0;
      const time = `${inicio}s-${fim}s`;
      return action ? [{ action, time }] : [];
    });
  }
  const sequence = json["action_sequence"];
  if (Array.isArray(sequence)) {
    return sequence.slice(0, 3).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action = typeof item["action"] === "string" ? item["action"] : "";
      const time = typeof item["time"] === "string" ? item["time"] : "";
      return action ? [{ action, time }] : [];
    });
  }
  const sequencia = json["sequencia"];
  if (Array.isArray(sequencia)) {
    return sequencia.slice(0, 4).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action =
        (typeof item["titulo"] === "string" ? item["titulo"] : "") ||
        (typeof item["acao"] === "string" ? item["acao"] : "");
      const inicio = typeof item["inicio"] === "number" ? item["inicio"] : 0;
      const fim = typeof item["fim"] === "number" ? item["fim"] : 0;
      const time = `${inicio}s-${fim}s`;
      return action ? [{ action, time }] : [];
    });
  }
  const movimentos = json["movimentos"];
  if (Array.isArray(movimentos)) {
    return movimentos.slice(0, 4).flatMap((step) => {
      if (!step || typeof step !== "object") return [];
      const item = step as Record<string, unknown>;
      const action =
        (typeof item["acao_das_maos"] === "string" ? item["acao_das_maos"] : "") ||
        (typeof item["acao_da_mao"] === "string" ? item["acao_da_mao"] : "") ||
        (typeof item["acao"] === "string" ? item["acao"] : "");
      const inicio = typeof item["inicio"] === "number" ? item["inicio"] : 0;
      const fim = typeof item["fim"] === "number" ? item["fim"] : 0;
      const time = `${inicio}s-${fim}s`;
      return action ? [{ action, time }] : [];
    });
  }
  const legacy = json["sequence"];
  return Array.isArray(legacy)
    ? legacy.slice(0, 3).map((action, index) => ({ action: String(action), time: `${index + 1}` }))
    : [];
}

export function movementCamera(movement: MovementPreset) {
  const json = movement.movement_json as Record<string, unknown>;
  const enquadramento = json["enquadramento"];
  if (enquadramento && typeof enquadramento === "object" && !Array.isArray(enquadramento)) {
    const detail = enquadramento as Record<string, unknown>;
    const parts = [detail["angulo"], detail["cenario"], detail["estilo"]]
      .filter((v): v is string => typeof v === "string");
    if (parts.length) return parts.join(" · ");
  }
  const camera = json["camera"];
  if (typeof camera === "string") return camera;
  if (!camera || Array.isArray(camera) || typeof camera !== "object") return "Câmera natural";
  const detail = camera as Record<string, unknown>;
  return [detail["framing"], detail["movement"], detail["focus"]]
    .filter((value): value is string => typeof value === "string")
    .join(" · ");
}
