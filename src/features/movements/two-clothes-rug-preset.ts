import type { MovementPreset } from "@/lib/supabase/types";
import twoClothesOnRugVideo from "@/assets/videodemonstracao/Two_clothes_on_rug_1080p_202608031502.mp4";

export { twoClothesOnRugVideo };

export const TWO_CLOTHES_ON_RUG_PRESET: MovementPreset & { videoUrl?: string } = {
  id: "10000000-0000-4000-8000-000000000037",
  user_id: null,
  name: "Demonstração de Roupas no Tapete (Mão Única / Entrada Sequencial 12s)",
  category: "fashion",
  formats: ["UGC", "FLAT LAY", "MODA", "NO SPEAK"],
  description: "Animação hiper-realista de 12s em câmera top-down 90° onde 1 única mão feminina organiza duas roupas sobre tapete felpudo com física de tecido pesado, dobras e gravidade.",
  prompt_instruction: "Anime a imagem de referencia preservando exatamente as duas roupas, suas cores, modelagem, textura, proporcoes e o tapete. A animacao deve mostrar primeiro a roupa preta sendo colocada no lado esquerdo e depois a roupa marrom/caramelo sendo colocada no lado direito. Durante todo o video pode aparecer no maximo uma unica mao e uma pequena parte de um unico antebraco.",
  videoUrl: twoClothesOnRugVideo,
  movement_json: {
    tipo: "prompt_de_animacao_para_google_veo",
    idioma: "portugues_brasil",
    formato: {
      orientacao: "vertical",
      proporcao: "9:16",
      duracao_total_segundos: 12,
      fps: 30,
      estilo: "video hiper-realista de demonstracao de produto para TikTok Shop"
    },
    instrucao_principal: "Anime a imagem de referencia preservando exatamente as duas roupas, suas cores, modelagem, textura, proporcoes e o tapete. A animacao deve mostrar primeiro a roupa preta sendo colocada no lado esquerdo e depois a roupa marrom/caramelo sendo colocada no lado direito. Durante todo o video pode aparecer no maximo uma unica mao e uma pequena parte de um unico antebraco.",
    objetivo_visual: "Criar uma demonstracao natural em que uma unica mao coloca duas roupas sobre o tapete, uma de cada vez, com fisica realista de tecido macio, flexivel, pesado e sujeito a gravidade, sem comportamento plastico, duro, rigido ou autonomo.",
    imagem_de_referencia: {
      fonte: "imagem anexada",
      regra: "A imagem anexada e a unica referencia visual para as roupas e para o cenario.",
      preservar_exatamente: [
        "macaquinho preto",
        "macaquinho marrom ou caramelo",
        "modelagem curta",
        "busto estruturado visivel na referencia",
        "detalhe torcido frontal",
        "recortes na cintura",
        "textura franzida",
        "costuras",
        "comprimento",
        "proporcoes",
        "cores",
        "tapete felpudo claro",
        "iluminacao",
        "sombras"
      ],
      proibicoes: [
        "nao transformar as roupas em vestidos",
        "nao transformar as roupas em conjuntos separados",
        "nao adicionar mangas",
        "nao remover recortes",
        "nao alterar o busto",
        "nao alterar a textura",
        "nao inventar bolsos",
        "nao inventar botoes",
        "nao inventar estampas",
        "nao criar uma terceira roupa"
      ]
    },
    identidade_das_roupas: {
      quantidade_exata: 2,
      peca_1: {
        identificacao: "roupa preta",
        posicao_final: "lado esquerdo do tapete",
        cor_permanente: "preta em todos os frames"
      },
      peca_2: {
        identificacao: "roupa marrom ou caramelo",
        posicao_final: "lado direito do tapete",
        cor_permanente: "marrom ou caramelo em todos os frames"
      },
      regras: [
        "cada roupa e um objeto fisico separado e permanente",
        "a roupa preta nunca se transforma na roupa marrom",
        "a roupa marrom nunca se transforma na roupa preta",
        "nenhuma roupa muda de cor",
        "nenhuma roupa aparece ou desaparece magicamente",
        "nenhuma roupa e duplicada",
        "nenhuma roupa troca de posicao sem contato da mao"
      ]
    },
    cenario: {
      superficie: "um unico tapete felpudo branco ou creme",
      ocupacao_do_quadro: "o tapete ocupa praticamente todo o enquadramento",
      iluminacao: "natural, suave e difusa",
      sombras: "leves, realistas e coerentes",
      aparencia: "video autentico gravado com smartphone de boa qualidade",
      nao_mostrar: [
        "cama",
        "sofa",
        "mesa",
        "cadeira",
        "piso misturado",
        "moveis",
        "almofadas",
        "plantas",
        "paredes",
        "objetos decorativos"
      ]
    },
    camera: {
      angulo: "top-down exato de 90 graus",
      posicao: "perpendicular ao tapete",
      estabilidade: "completamente fixa",
      enquadramento: "manter o mesmo enquadramento durante todo o video",
      proibicoes: [
        "sem zoom",
        "sem aproximacao",
        "sem afastamento",
        "sem pan",
        "sem rotacao",
        "sem inclinacao",
        "sem tremor",
        "sem close-up",
        "sem cortes",
        "sem transicoes",
        "sem mudanca de cenario"
      ]
    },
    controle_de_anatomia: {
      quantidade_de_pessoas: 1,
      quantidade_maxima_de_maos_visiveis: 1,
      quantidade_maxima_de_antebracos_visiveis: 1,
      mao_utilizada: "uma unica mao direita durante todo o video",
      entrada_da_mao: "somente pela borda inferior do enquadramento",
      partes_permitidas: [
        "uma unica mao",
        "pequena parte de um unico antebraco"
      ],
      partes_proibidas: [
        "segunda mao",
        "terceira mao",
        "braco adicional",
        "cabeca",
        "rosto",
        "cabelo",
        "orelha",
        "pescoco",
        "ombros",
        "peito",
        "tronco",
        "cintura",
        "pernas",
        "pes",
        "sombra da cabeca",
        "reflexo da pessoa"
      ],
      regra_absoluta: "Nunca mostrar duas ou mais maos simultaneamente. Somente uma unica mao pode existir dentro do enquadramento em qualquer frame."
    },
    fisica_realista_do_tecido: {
      prioridade_maxima: true,
      material: "tecido macio, leve, maleavel, franzido, dobravel e sujeito a gravidade",
      regra_principal: "A roupa deve se comportar como uma roupa verdadeira, nunca como uma placa, plastico, papel, papelão ou objeto solido.",
      comportamento_ao_ser_puxada: [
        "somente o pequeno ponto preso pelos dedos se move primeiro",
        "as regioes proximas acompanham com pequeno atraso",
        "as partes mais distantes permanecem momentaneamente paradas",
        "o tecido dobra e se acumula",
        "as bordas arrastam sobre o tapete",
        "as barras formam dobras irregular",
        "a cintura se deforma naturalmente",
        "as pernas da roupa nao permanecem alinhadas durante o movimento",
        "cada parte reage de maneira independente"
      ],
      comportamento_ao_ser_solto: [
        "o tecido desaba suavemente sobre o tapete",
        "as dobras mudam pela gravidade",
        "ocorre uma pequena oscilacao residual",
        "a roupa se acomoda de maneira irregular",
        "depois de se acomodar, a roupa permanece parada"
      ],
      comportamento_ao_ser_alisado: [
        "somente a regiao tocada pelos dedos se move",
        "as rugas diminuem apenas sob a trajetoria da mao",
        "a roupa inteira nao pode deslizar junto",
        "uma lateral nao pode se mover quando a mao toca somente a outra lateral",
        "a parte superior nao pode acompanhar automaticamente um ajuste feito na barra"
      ],
      nunca_permitir: [
        "roupa reta durante o transporte",
        "roupa aberta como uma placa",
        "roupa perfeitamente plana enquanto esta sendo movimentada",
        "roupa com rigidez de plastico",
        "roupa com rigidez de papelão",
        "roupa com rigidez de madeira",
        "roupa se movendo como um unico bloco",
        "tecido congelado",
        "tecido sem gravidade",
        "tecido flutuando",
        "dobras imoveis durante o deslocamento"
      ]
    },
    movimento_autonomo: {
      permitido: false,
      regra: "Nenhuma parte das roupas pode se ajustar, abrir, alinhar, deslizar ou mudar de forma sem contato direto e visivel da mao.",
      quando_a_mao_nao_toca: "A roupa pode apenas concluir uma oscilacao residual causada pelo movimento anterior e depois deve permanecer completamente imovel.",
      proibicoes: [
        "roupa se abrindo sozinha",
        "roupa se organizando sozinha",
        "roupa ficando simetrica automaticamente",
        "barra se alinhando sozinha",
        "cintura se abrindo sozinha",
        "roupa deslizando sem contato",
        "roupa assumindo magicamente o formato final",
        "desdobramento automatico",
        "movimento espontaneo"
      ]
    },
    forma_de_manipular: {
      regra: "Nao levantar a roupa inteira no ar e nao segura-la aberta por duas extremidades.",
      metodo: "A unica mao pinça uma pequena quantidade de tecido e arrasta progressivamente a roupa sobre o tapete.",
      pegada: {
        dedos: "polegar e indicador comprimem uma pequena dobra real do tecido",
        efeito: "o tecido enruga visivelmente ao redor dos dedos",
        ponto_de_contato: "regiao superior ou lateral da roupa",
        proibicao: "nao segurar a roupa como uma placa plana"
      },
      contato_com_a_superficie: "a maior parte da roupa permanece em contato com o tapete durante o deslocamento",
      vantagem_visual: "o atrito do tapete produz dobras, atraso, deformacao e movimento realista de tecido"
    },
    sequencia: [
      {
        inicio: 0.0,
        fim: 0.6,
        titulo: "tapete vazio",
        acao: "Mostrar somente o tapete felpudo vazio.",
        mao: "fora do enquadramento",
        roupas: "fora do enquadramento",
        camera: "completamente fixa"
      },
      {
        inicio: 0.6,
        fim: 2.8,
        titulo: "entrada da roupa preta",
        acao: "Uma unica mao direita entra pela borda inferior pinçando uma pequena regiao da roupa preta e a arrasta sobre o tapete em direcao ao lado esquerdo.",
        estado_inicial_da_roupa: "parcialmente dobrada, amassada e com partes sobrepostas",
        fisica: [
          "a maior parte da roupa permanece tocando o tapete",
          "o ponto segurado avanca primeiro",
          "o restante acompanha com atraso",
          "as pernas entram desalinhadas",
          "as barras arrastam e criam dobras",
          "o tecido nao preserva a silhueta completa",
          "a roupa nunca fica reta"
        ],
        mao_visivel: 1,
        proibicao: "nao mostrar outra mao ajudando"
      },
      {
        inicio: 2.8,
        fim: 5.0,
        titulo: "organizacao manual da roupa preta",
        acao: "A mesma e unica mao organiza a roupa preta em pequenos ajustes independentes.",
        etapas: [
          "a mao puxa suavemente uma regiao inferior",
          "solta o tecido e espera a pequena acomodacao natural",
          "move-se para outra regiao inferior e faz um novo ajuste",
          "corrige uma lateral sem mover a lateral oposta",
          "ajusta delicadamente a cintura",
          "alisa apenas uma pequena regiao superior"
        ],
        regra: "Cada regiao se move apenas quando a mao esta tocando diretamente nela.",
        resultado: "roupa preta posicionada no lado esquerdo com pequenas dobras naturais",
        roupa_autonoma: false
      },
      {
        inicio: 5.0,
        fim: 5.4,
        titulo: "saida temporaria da mao",
        acao: "A unica mao sai pela borda inferior.",
        roupa_preta: "permanece completamente imovel no lado esquerdo",
        roupa_marrom: "ainda fora do enquadramento"
      },
      {
        inicio: 5.4,
        fim: 7.7,
        titulo: "entrada da roupa marrom",
        acao: "A mesma e unica mao direita retorna pela borda inferior pinçando uma pequena regiao da roupa marrom ou caramelo e a arrasta sobre o tapete em direcao ao lado direito.",
        roupa_preta: "permanece parada e nao e tocada",
        estado_inicial_da_roupa_marrom: "dobrada, enrugada e parcialmente acumulada",
        fisica: [
          "a maior parte da roupa permanece em contato com o tapete",
          "o tecido encontra resistencia na superficie felpuda",
          "a regiao segurada se move primeiro",
          "as outras regioes acompanham com atraso",
          "as pernas entram em momentos ligeiramente diferentes",
          "as barras dobram e arrastam",
          "o tecido forma ondas e rugas irregulares"
        ],
        mao_visivel: 1,
        proibicao: "nao criar uma segunda mao ou um segundo braco"
      },
      {
        inicio: 7.7,
        fim: 10.0,
        titulo: "organizacao manual da roupa marrom",
        acao: "A unica mao organiza a roupa marrom por meio de pequenos ajustes locais.",
        etapas: [
          "puxa suavemente uma regiao inferior",
          "solta e aguarda a acomodacao natural",
          "reposiciona outra regiao inferior",
          "corrige uma lateral",
          "ajusta a cintura",
          "alisa uma pequena regiao superior"
        ],
        regra: "A roupa nao pode se abrir inteira de uma vez.",
        resultado: "roupa marrom posicionada no lado direito da roupa preta",
        sobreposicao: "distancia pequena ou sobreposicao minima apenas entre as bordas",
        roupa_autonoma: false
      },
      {
        inicio: 10.0,
        fim: 11.2,
        titulo: "ajustes finais",
        acao: "A unica mao faz um pequeno ajuste na barra da roupa preta, sai dessa regiao e depois faz um pequeno alisamento na roupa marrom.",
        ordem: [
          "tocar a roupa preta",
          "soltar completamente a roupa preta",
          "deslocar a mao",
          "tocar a roupa marrom"
        ],
        regra: "A mao nunca toca as duas roupas simultaneamente.",
        efeito_no_tecido: "pequenas ondas e deformacoes apenas nas regioes tocadas",
        proibicoes: [
          "nao deixar as roupas perfeitamente lisas",
          "nao alterar as cores",
          "nao trocar as posicoes",
          "nao levantar as roupas"
        ]
      },
      {
        inicio: 11.2,
        fim: 12.0,
        titulo: "resultado final",
        acao: "A unica mao sai lentamente pela borda inferior.",
        resultado: [
          "roupa preta no lado esquerdo",
          "roupa marrom ou caramelo no lado direito",
          "duas roupas totalmente reconheciveis",
          "pequenas dobras naturais",
          "nenhuma parte do corpo visivel",
          "nenhum movimento autonomo"
        ],
        estado_final: "as duas roupas permanecem completamente imoveis ate o ultimo frame"
      }
    ],
    realismo_da_mao: {
      aparencia: "mao feminina natural e realista",
      quantidade_de_dedos: 5,
      anatomia: "correta e constante",
      movimentos: "delicados, lentos e fisicamente coerentes",
      interacao: [
        "os dedos comprimem o tecido",
        "o tecido enruga ao redor da pegada",
        "os dedos deslizam sobre a superficie",
        "a mao solta o tecido gradualmente",
        "a mao nunca atravessa a roupa"
      ],
      consistencia: [
        "mesma mao durante todo o video",
        "mesma pele",
        "mesmas unhas",
        "mesmos acessorios, caso existam",
        "mesmo antebraco"
      ]
    },
    prioridades_obrigatorias: [
      {
        nivel: 1,
        instrucao: "Mostrar no maximo uma unica mao em qualquer frame."
      },
      {
        nivel: 2,
        instrucao: "Aplicar fisica realista de tecido macio, dobravel e sujeito a gravidade."
      },
      {
        nivel: 3,
        instrucao: "A roupa nunca pode parecer plastica, dura, reta, solida ou rigida."
      },
      {
        nivel: 4,
        instrucao: "Nenhuma roupa pode se organizar ou se movimentar sozinha."
      },
      {
        nivel: 5,
        instrucao: "Preservar a cor e a identidade das duas roupas em todos os frames."
      },
      {
        nivel: 6,
        instrucao: "Nao mostrar cabeca, rosto, corpo ou um segundo braco."
      },
      {
        nivel: 7,
        instrucao: "Manter a camera superior completamente fixa."
      }
    ],
    restricoes_absolutas: [
      "Mostrar somente uma unica mao.",
      "Nao mostrar uma segunda mao.",
      "Nao mostrar mais de um antebraco.",
      "Nao mostrar a cabeca da pessoa.",
      "Nao mostrar o corpo da pessoa.",
      "Nao criar bracos adicionais.",
      "Nao permitir que as roupas se arrumem sozinhas.",
      "Nao permitir movimento sem contato direto da mao.",
      "Nao movimentar a roupa como uma placa.",
      "Nao deixar o tecido duro ou plastico.",
      "Nao deixar a roupa aberta durante o transporte.",
      "Nao levantar completamente as roupas.",
      "Nao trocar as cores.",
      "Nao duplicar as roupas.",
      "Nao criar uma terceira roupa.",
      "Nao modificar a modelagem.",
      "Nao alterar o cenario.",
      "Nao movimentar a camera."
    ],
    negative_prompt: [
      "two hands visible",
      "more than one hand",
      "second hand",
      "third hand",
      "four hands",
      "extra hands",
      "extra arms",
      "multiple arms",
      "duplicated limbs",
      "detached hand",
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
      "face reflection",
      "rigid garment",
      "stiff garment",
      "plastic clothing",
      "hard plastic fabric",
      "cardboard clothing",
      "wooden clothing",
      "solid garment",
      "flat rigid clothing",
      "planar garment",
      "clothing moving like a board",
      "clothing moving as one solid object",
      "frozen fabric",
      "frozen folds",
      "no cloth physics",
      "no gravity",
      "weightless fabric",
      "floating clothing",
      "garment transported fully open",
      "garment transported parallel to the floor",
      "perfectly flat garment while moving",
      "autonomous clothing movement",
      "clothes arranging themselves",
      "self-opening clothes",
      "self-folding clothes",
      "automatic alignment",
      "magical unfolding",
      "fabric moving without hand contact",
      "teleportation",
      "morphing",
      "garment transformation",
      "color changing",
      "color swap",
      "black garment turning brown",
      "brown garment turning black",
      "extra garment",
      "third garment",
      "duplicated garment",
      "disappearing garment",
      "replacing garment",
      "deformed hand",
      "extra fingers",
      "missing fingers",
      "fused fingers",
      "hand passing through fabric",
      "robotic hand movement",
      "camera movement",
      "camera shake",
      "zoom",
      "pan",
      "tilt",
      "rotation",
      "close-up",
      "jump cut",
      "scene change",
      "background replacement",
      "bed",
      "sofa",
      "table",
      "furniture",
      "mixed surfaces"
    ]
  },
  tags: ["tapete felpudo", "macaquinho", "mão única", "entrada de roupas", "física realista", "gravidade", "vestuário", "flat lay", "12 segundos", "tiktok shop"],
  created_at: "2026-08-03T15:10:00.000Z",
  updated_at: "2026-08-03T15:10:00.000Z",
};
