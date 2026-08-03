insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000031', null, 'Demonstração Multicores em Camadas (Qualquer Produto / Câmera Superior)', 'product_demo', array['UGC', 'FLAT LAY', 'MULTICORES'],
    'Apresentação sequencial universal de produtos em 3 opções de cores dispostas em camadas (vestuário, acessórios ou produtos físicos), com aproximação de textura e remoção uma a uma.',
    'Estrutura universal para mostrar variações de cores (3 cores) de qualquer produto em camadas com câmera superior. Exibe elasticidade, textura, alinhamento do produto e retirada gradual de cada cor.',
    '{
      "duracao_total_segundos": 12.57,
      "formato": "vertical, aproximadamente 9:16",
      "precisao_dos_tempos": "aproximadamente 0.10 segundo",
      "enquadramento": {
        "angulo": "camera posicionada acima da superfície, perpendicular ao produto",
        "cenario": "superfície limpa/cenário neutro exibindo três variações de cores do mesmo produto (Cor 1, Cor 2 e Cor 3)",
        "estilo": "demonstração rápida de produto com organização em camadas, aproximação para textura e retirada sequencial de cada variação de cor"
      },
      "movimentos": [
        {
          "inicio": 0.0,
          "fim": 1.63,
          "acao_das_maos": "As duas mãos seguram o produto da Cor 1 pelas extremidades superiores, mantendo-o suspenso e exibindo o produto acima das demais opções de cores.",
          "mao_esquerda": {
            "posicao": "extremidade esquerda da peça",
            "pegada": "polegar na frente e dedos por trás"
          },
          "mao_direita": {
            "posicao": "extremidade direita da peça",
            "pegada": "polegar na frente e dedos por trás"
          },
          "movimento": "As mãos afastam-se suavemente exibindo a largura e caimento da peça. O produto recebe uma leve oscilação para registrar o tecido/material.",
          "direcao": "leve abertura horizontal com micro movimentos verticais",
          "efeito_na_roupa": "a peça fica esticada de forma suave e toda a frente permanece visível",
          "velocidade": "lenta e controlada"
        },
        {
          "inicio": 1.63,
          "fim": 1.7,
          "acao": "Corte seco para a superfície preparada, iniciando a sequência de organização das peças."
        },
        {
          "inicio": 1.7,
          "fim": 2.17,
          "acao_das_maos": "A peça da Cor 3 entra pelo canto inferior, conduzida pelas duas mãos.",
          "movimento": "As mãos deslocam a peça diagonalmente até o centro do cenário.",
          "direcao": "diagonal até o centro",
          "pegada": "mãos nas laterais da peça",
          "velocidade": "moderada"
        },
        {
          "inicio": 2.17,
          "fim": 2.63,
          "acao_das_maos": "As duas mãos posicionam a Cor 3 sobre a superfície.",
          "movimento": "Mãos ajustam as laterais para deixar a peça simétrica e centralizada.",
          "direcao": "centro para as bordas",
          "efeito_na_roupa": "a peça é aberta e alinhada"
        },
        {
          "inicio": 2.63,
          "fim": 3.07,
          "acao_das_maos": "As mãos passam abertas sobre a frente da peça da Cor 3.",
          "movimento": "Alisa a superfície do produto do topo em direção à base.",
          "dedos": "abertos e suavemente curvados",
          "contato": "palmas e dedos tocando suavemente",
          "efeito_na_roupa": "remove dobras e realça o acabamento",
          "velocidade": "lenta"
        },
        {
          "inicio": 3.07,
          "fim": 3.53,
          "acao_das_maos": "A peça da Cor 2 entra rapidamente pelo canto inferior, segurada pelas duas laterais.",
          "movimento": "Posicionada em camada sobreposta à metade da peça da Cor 3.",
          "direcao": "diagonal para o centro",
          "velocidade": "moderada"
        },
        {
          "inicio": 3.53,
          "fim": 4.13,
          "acao_das_maos": "As mãos ajustam e alinham a peça da Cor 2 sobre a Cor 3.",
          "efeito_na_roupa": "peça alinhada e perfeitamente visível em camada",
          "velocidade": "lenta"
        },
        {
          "inicio": 4.13,
          "fim": 4.43,
          "acao_das_maos": "As mãos soltam a peça da Cor 2 e recuam suavemente.",
          "efeito_na_roupa": "peças organizadas em camadas escalonadas"
        },
        {
          "inicio": 4.43,
          "fim": 4.9,
          "acao_das_maos": "A peça da Cor 1 entra pelo canto inferior, conduzida para a frente da composição.",
          "movimento": "Posicionada como peça principal na frente das outras duas cores.",
          "velocidade": "moderada"
        },
        {
          "inicio": 4.9,
          "fim": 5.27,
          "acao_das_maos": "Mãos fazem pequenos micro ajustes na peça da Cor 1.",
          "efeito_na_roupa": "as 3 variações de cor ficam perfeitamente visíveis e sobrepostas em degraus"
        },
        {
          "inicio": 5.27,
          "fim": 5.33,
          "acao": "Corte seco para enquadramento aproximado na peça principal (Cor 1)."
        },
        {
          "inicio": 5.33,
          "fim": 6.13,
          "acao_das_maos": "Mãos levantam a peça da Cor 1 em direção à câmera para foco no tecido e detalhes.",
          "movimento": "Aproxima da lente ocupando grande parte do enquadramento.",
          "velocidade": "lenta"
        },
        {
          "inicio": 6.13,
          "fim": 6.63,
          "acao_das_maos": "Mão direita afrouxa a pegada permitindo inclinação suave da peça sob a iluminação.",
          "efeito_na_roupa": "destaca trama, relevo e qualidade do produto"
        },
        {
          "inicio": 6.63,
          "fim": 7.17,
          "acao_da_mao_direita": "A mão direita passa as pontas dos dedos suavemente pela frente do produto.",
          "movimento": "Desliza horizontal e verticalmente sobre a textura da peça.",
          "velocidade": "muito lenta"
        },
        {
          "inicio": 7.17,
          "fim": 7.63,
          "acao_da_mao_direita": "A mão continua a passagem demonstrando maciez e acabamento do produto.",
          "velocidade": "lenta"
        },
        {
          "inicio": 7.63,
          "fim": 8.23,
          "acao_da_mao_direita": "Pontas dos dedos deslizam até a borda/barra destacando a costura lateral.",
          "velocidade": "lenta"
        },
        {
          "inicio": 8.23,
          "fim": 8.3,
          "acao": "Corte seco retornando ao enquadramento aberto com as 3 variações de cores."
        },
        {
          "inicio": 8.3,
          "fim": 8.57,
          "acao_das_maos": "Mãos seguram a peça da Cor 1 e a levantam acima da Cor 2.",
          "velocidade": "moderada"
        },
        {
          "inicio": 8.57,
          "fim": 9.03,
          "acao_das_maos": "Retirada rápida da peça da Cor 1 para fora do enquadramento.",
          "direcao": "centro para fora",
          "efeito_na_roupa": "revela a Cor 2 que estava por baixo"
        },
        {
          "inicio": 9.03,
          "fim": 9.53,
          "acao_das_maos": "Mãos alcançam as laterais da peça da Cor 2.",
          "velocidade": "moderada"
        },
        {
          "inicio": 9.53,
          "fim": 10.03,
          "acao_das_maos": "Mãos levantam a peça da Cor 2.",
          "velocidade": "moderada"
        },
        {
          "inicio": 10.03,
          "fim": 10.87,
          "acao_das_maos": "Retirada rápida da peça da Cor 2 para fora do enquadramento.",
          "efeito_na_roupa": "revela a peça da Cor 3 na base"
        },
        {
          "inicio": 10.87,
          "fim": 11.2,
          "acao_das_maos": "Mão direita desloca-se até a peça da Cor 3.",
          "velocidade": "moderada"
        },
        {
          "inicio": 11.2,
          "fim": 11.57,
          "acao_da_mao_direita": "Mão direita pinça a lateral da peça da Cor 3.",
          "velocidade": "moderada"
        },
        {
          "inicio": 11.57,
          "fim": 12.43,
          "acao_das_maos": "A peça da Cor 3 é arrastada e retirada do enquadramento.",
          "efeito_na_roupa": "finaliza a demonstração de todas as opções de cores"
        },
        {
          "inicio": 12.43,
          "fim": 12.57,
          "acao": "O cenário permanece limpo e o vídeo encerra."
        }
      ],
      "movimentos_da_camera": [
        {
          "inicio": 0.0,
          "fim": 1.63,
          "movimento": "câmera superior fixa mostrando as cores do produto"
        },
        {
          "inicio": 1.63,
          "fim": 5.27,
          "movimento": "enquadramento superior fixo registrando a montagem em camadas"
        },
        {
          "inicio": 5.27,
          "fim": 8.23,
          "movimento": "close-up focado na textura e detalhes da peça principal"
        },
        {
          "inicio": 8.23,
          "fim": 12.57,
          "movimento": "retorno ao enquadramento aberto acompanhando a saída sequencial de cada cor"
        }
      ],
      "caracteristicas_gerais_dos_gestos": {
        "ritmo": "movimentos suaves na textura e ágeis nas trocas de cores",
        "objetivo_visual": "demonstrar opções de cores, tecido, caimento e acabamento para qualquer linha de produto",
        "universalidade": "compatível com qualquer vestuário (camisetas, shorts, vestidos, conjuntos, biquínis, lingerie, calças) ou produto multicores"
      }
    }'::jsonb,
    array['multicores', 'qualquer produto', 'flat lay', 'camadas', 'variantes', 'moda universal', 'tiktok shop']
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
