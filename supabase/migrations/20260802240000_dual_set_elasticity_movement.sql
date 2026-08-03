insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000032', null, 'Demonstração Lado a Lado & Elasticidade Universal (Dois Conjuntos / Câmera Superior)', 'product_demo', array['UGC', 'FLAT LAY', 'MODA'],
    'Demonstração universal de duas opções de vestuário dispostas lado a lado, com teste de elasticidade do cós/gola, close em alças/detalhes e dobra/retirada sequencial.',
    'Demonstração universal em câmera superior de dois conjuntos ou peças de roupa lado a lado (Opção A e Opção B). Mostra teste de esticar o elástico/cós, close em alças e detalhes de costura, alisamento do tecido e retirada/dobra das peças.',
    '{
      "duracao_total_segundos": 12.61,
      "formato": "vertical, aproximadamente 9:16",
      "precisao_dos_tempos": "aproximadamente 0.10 segundo",
      "enquadramento": {
        "angulo": "câmera posicionada acima da superfície, perpendicular às roupas",
        "cenario": "mesa/superfície limpa e iluminada com elementos neutros ao fundo",
        "produtos": [
          "peça ou conjunto de vestuário na Opção A (cor clara/principal)",
          "peça ou conjunto de vestuário na Opção B (cor escura/secundária)"
        ],
        "estilo": "demonstração visual do caimento, elasticidade do cós/gola, textura e acabamento de qualquer produto de moda"
      },
      "movimentos": [
        {
          "inicio": 0.0,
          "fim": 0.45,
          "acao_das_maos": "As duas mãos seguram a peça/short da Opção A pelas extremidades do cós ou gola elástica.",
          "mao_esquerda": {
            "posicao": "lado esquerdo do cós/gola",
            "pegada": "polegar na frente e dedos por trás"
          },
          "mao_direita": {
            "posicao": "lado direito do cós/gola",
            "pegada": "polegar na frente e dedos por trás"
          },
          "movimento": "As mãos aproximam ligeiramente a peça da superfície e reduzem a tensão do elástico.",
          "direcao": "levemente para baixo e para o centro",
          "efeito_na_roupa": "o cós relaxa e cria franzidos naturais",
          "velocidade": "lenta"
        },
        {
          "inicio": 0.45,
          "fim": 0.95,
          "acao_das_maos": "As mãos reposicionam os dedos sobre o elástico da Opção A.",
          "movimento": "Os polegares deslizam por alguns centímetros sobre a parte frontal enquanto os demais dedos sustentam a peça.",
          "direcao": "pequenos movimentos laterais",
          "efeito_na_roupa": "o elástico é alinhado antes do teste de esticar",
          "velocidade": "lenta e controlada"
        },
        {
          "inicio": 0.95,
          "fim": 1.8,
          "acao_das_maos": "As mãos afastam-se gradualmente, esticando horizontalmente o cós/gola da peça da Opção A.",
          "direcao": "mão esquerda para a esquerda e mão direita para a direita",
          "amplitude": "moderada",
          "efeito_na_roupa": "os franzidos diminuem e a abertura da cintura/gola fica mais ampla",
          "finalizacao": "as mãos mantêm o elástico esticado por um breve instante demonstrando flexibilidade",
          "velocidade": "lenta"
        },
        {
          "inicio": 1.8,
          "fim": 1.9,
          "acao": "Corte seco para a organização da peça da Opção B."
        },
        {
          "inicio": 1.9,
          "fim": 2.25,
          "acao_das_maos": "As duas mãos levantam e abrem a parte superior da peça da Opção B.",
          "mao_esquerda": {
            "posicao": "lateral esquerda",
            "movimento": "puxa suavemente para a esquerda"
          },
          "mao_direita": {
            "posicao": "alça/ombro e lateral direita",
            "movimento": "desloca a peça para a direita"
          },
          "efeito_na_roupa": "o decote, gola e alças ficam simétricos e abertos",
          "velocidade": "lenta"
        },
        {
          "inicio": 2.25,
          "fim": 2.55,
          "acao_das_maos": "As mãos apoiam a peça da Opção B sobre a mesa e realizam pequenos ajustes nas laterais.",
          "efeito_na_roupa": "a peça fica centralizada e plana"
        },
        {
          "inicio": 2.55,
          "fim": 2.85,
          "acao_das_maos": "A peça complementar (short/calça/saia) entra pelo centro inferior do enquadramento.",
          "movimento": "As mãos transportam a peça para cima segurando o cós com cada mão.",
          "velocidade": "moderada"
        },
        {
          "inicio": 2.85,
          "fim": 3.25,
          "acao_das_maos": "As mãos posicionam a peça complementar abaixo da peça superior.",
          "direcao": "centro para os lados",
          "efeito_na_roupa": "o cós fica alinhado com a barra da blusa"
        },
        {
          "inicio": 3.25,
          "fim": 3.5,
          "acao_das_maos": "As mãos fazem pequenos ajustes nas laterais do conjunto da Opção B.",
          "efeito_na_roupa": "o conjunto fica simétrico e centralizado"
        },
        {
          "inicio": 3.5,
          "fim": 3.8,
          "acao_das_maos": "A peça complementar da Opção A entra pela lateral direita.",
          "movimento": "As mãos carregam a peça posicionando-a ao lado da Opção B.",
          "velocidade": "moderada"
        },
        {
          "inicio": 3.8,
          "fim": 4.15,
          "acao_das_maos": "As mãos apoiam a peça da Opção A e alinham seu cós com a parte superior.",
          "efeito_na_roupa": "os dois conjuntos ficam perfeitamente alinhados lado a lado"
        },
        {
          "inicio": 4.15,
          "fim": 4.45,
          "acao_das_maos": "As duas mãos passam abertas sobre as peças da Opção A.",
          "movimento": "Deslizamento curto do topo em direção às barras.",
          "contato": "palmas e pontas dos dedos",
          "efeito_na_roupa": "alisa rugas e destaca a textura do tecido",
          "velocidade": "lenta"
        },
        {
          "inicio": 4.45,
          "fim": 4.55,
          "acao": "Corte seco para um close em detalhes de alça, gola ou costura."
        },
        {
          "inicio": 4.55,
          "fim": 5.1,
          "acao_da_mao_direita": "A mão direita pinça o detalhe/alça entre o polegar e o indicador.",
          "movimento": "Levanta o detalhe alguns centímetros acima da mesa.",
          "velocidade": "muito lenta"
        },
        {
          "inicio": 5.1,
          "fim": 5.65,
          "acao_da_mao_direita": "O detalhe é apoiado sobre o indicador enquanto o pulso realiza uma rotação discreta.",
          "efeito_na_roupa": "mostra o acabamento, costura e elasticidade do detalhe"
        },
        {
          "inicio": 5.65,
          "fim": 6.4,
          "acao_da_mao_direita": "A mão realiza pequenos ciclos de puxar e relaxar a alça/detalhe.",
          "efeito_na_roupa": "o detalhe se alonga e retorna suavemente",
          "velocidade": "lenta e controlada"
        },
        {
          "inicio": 6.4,
          "fim": 6.55,
          "acao": "Corte seco para demonstração do elástico do conjunto secundário."
        },
        {
          "inicio": 6.55,
          "fim": 7.15,
          "acao_das_maos": "As mãos seguram o cós do conjunto secundário e afastam-se esticando o elástico na horizontal.",
          "velocidade": "lenta"
        },
        {
          "inicio": 7.15,
          "fim": 7.4,
          "acao_das_maos": "O elástico permanece esticado por um breve instante sob a luz.",
          "efeito_na_roupa": "o tecido reflete a iluminação natural"
        },
        {
          "inicio": 7.4,
          "fim": 7.7,
          "acao_das_maos": "As mãos aproximam-se reduzindo a tensão do elástico.",
          "velocidade": "lenta"
        },
        {
          "inicio": 7.7,
          "fim": 7.8,
          "acao": "Corte seco retornando ao enquadramento aberto dos dois conjuntos."
        },
        {
          "inicio": 7.8,
          "fim": 8.3,
          "acao_das_maos": "As mãos aproximam-se da peça da Opção A e preparam a pegada.",
          "dedos": "polegares na frente e demais dedos por baixo"
        },
        {
          "inicio": 8.3,
          "fim": 8.85,
          "acao_das_maos": "As mãos levantam e esticam o cós/gola horizontalmente uma última vez.",
          "velocidade": "lenta"
        },
        {
          "inicio": 8.85,
          "fim": 9.15,
          "acao_das_maos": "Reduz a tensão e apoia a peça de volta sobre a superfície.",
          "efeito_na_roupa": "o elástico retorna ao formato franzido natural"
        },
        {
          "inicio": 9.15,
          "fim": 9.7,
          "acao_das_maos": "As duas mãos passam sobre o tecido alisando a superfície em direção às barras.",
          "efeito_na_roupa": "alisa o tecido e alinha o caimento"
        },
        {
          "inicio": 9.7,
          "fim": 10.15,
          "acao_das_maos": "As mãos seguram o conjunto da Opção A e iniciam sua retirada do enquadramento.",
          "velocidade": "moderada"
        },
        {
          "inicio": 10.15,
          "fim": 10.3,
          "acao": "O conjunto da Opção A sai do enquadramento, permanecendo apenas o conjunto da Opção B."
        },
        {
          "inicio": 10.3,
          "fim": 10.65,
          "acao_das_maos": "As mãos ajustam e alinham o conjunto da Opção B no centro.",
          "velocidade": "moderada"
        },
        {
          "inicio": 10.65,
          "fim": 11.05,
          "acao_das_maos": "As mãos levantam a peça inferior da Opção B e a retiram lateralmente.",
          "velocidade": "moderada"
        },
        {
          "inicio": 11.05,
          "fim": 11.35,
          "acao_das_maos": "As mãos posicionam os dedos nas extremidades da peça superior da Opção B."
        },
        {
          "inicio": 11.35,
          "fim": 11.8,
          "acao_das_maos": "As mãos pinçam a barra e dobram a peça ao meio de forma organizada.",
          "velocidade": "moderada"
        },
        {
          "inicio": 11.8,
          "fim": 12.2,
          "acao_das_maos": "As mãos mantêm a peça dobrada e a transportam para fora do enquadramento.",
          "velocidade": "moderada"
        },
        {
          "inicio": 12.2,
          "fim": 12.61,
          "acao": "A superfície permanece limpa e o vídeo encerra."
        }
      ],
      "movimentos_da_camera": [
        {
          "inicio": 0.0,
          "fim": 1.8,
          "movimento": "câmera superior fixa mostrando os dois conjuntos e teste do elástico"
        },
        {
          "inicio": 1.8,
          "fim": 1.9,
          "movimento": "corte seco"
        },
        {
          "inicio": 1.9,
          "fim": 4.45,
          "movimento": "enquadramento superior aberto e fixo durante a organização das peças"
        },
        {
          "inicio": 4.45,
          "fim": 4.55,
          "movimento": "corte seco para close de alça e acabamentos de costura"
        },
        {
          "inicio": 4.55,
          "fim": 6.4,
          "movimento": "close fixo destacando os detalhes de elasticidade"
        },
        {
          "inicio": 6.4,
          "fim": 6.55,
          "movimento": "corte seco para aproximação no conjunto secundário"
        },
        {
          "inicio": 6.55,
          "fim": 7.7,
          "movimento": "enquadramento aproximado registrando a elasticidade"
        },
        {
          "inicio": 7.7,
          "fim": 7.8,
          "movimento": "corte seco retornando ao enquadramento aberto"
        },
        {
          "inicio": 7.8,
          "fim": 12.61,
          "movimento": "câmera superior fixa enquanto as roupas são alisadas, dobradas e retiradas"
        }
      ],
      "caracteristicas_gerais_dos_gestos": {
        "ritmo": "movimentos suaves na demonstração de elasticidade e ágeis na organização e retirada",
        "pressao_sobre_o_tecido": "suave, apenas o suficiente para alisar, esticar ou dobrar",
        "objetivo_visual": "demonstrar elasticidade, acabamento, caimento e duas variações de modelo/cor",
        "universalidade": "compatível com qualquer vestuário (conjuntos de dormir, moda praia, camisetas, fitness, moda feminina/masculina)"
      }
    }'::jsonb,
    array['lado a lado', 'duas cores', 'elasticidade', 'vestuário', 'qualquer roupa', 'flat lay', 'câmera superior', 'tiktok shop']
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  formats = excluded.formats,
  description = excluded.description,
  prompt_instruction = excluded.prompt_instruction,
  movement_json = excluded.movement_json,
  tags = excluded.tags,
  updated_at = now();
