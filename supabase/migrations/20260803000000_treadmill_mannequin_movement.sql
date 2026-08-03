insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000033', null, 'Esteira com Manequim de IA (Faceless Treadmill Transition)', 'fashion', array['UGC', 'NO SPEAK', 'MANEQUIM IA', 'ESTEIRA'],
    'Formato viral internacional: Manequim humanoide sem rosto caminhando em esteira minimalista com trocas instantâneas de roupas/looks a cada passo.',
    'Manequim humanoide sem rosto (corpo preto fosco) caminhando continuamente sobre uma esteira minimalista em ritmo constante. Câmera totalmente fixa de frente. A cada passo no solo, a roupa muda instantaneamente para uma nova opção/cor sem alterar o manequim, a esteira ou o cenário. Sem fala, otimizado para retenção e loop perfeito.',
    '{
      "duracao_total_segundos": 24,
      "formato": "vertical 9:16",
      "variacoes_estilo": {
        "variacao_a": "Catálogo Visual — Apresentar 3 a 4 opções de cores/versões do mesmo produto",
        "variacao_b": "Comparativo — Apresentar 2 ou mais estilos (casual vs social, básico vs completo)",
        "variacao_c": "Desafio Interativo — Apresentar os looks numerados incentivando a escolha nos comentários"
      },
      "enquadramento": {
        "angulo": "câmera totalmente fixa de frente, na altura da cintura",
        "cenario": "estúdio contemporâneo neutro, estilo vitrine de loja premium com esteira preta minimalista",
        "personagem": "manequim humanoide sem rosto com corpo preto fosco, proporções adultas realistas",
        "estilo": "transição instantânea de looks sincronizada com as passadas do manequim"
      },
      "regras_de_consistencia": {
        "manequim": "manter exatamente o mesmo corpo, altura, postura e caminhada durante todo o vídeo",
        "cenario": "manter a mesma esteira, cenário, iluminação e enquadramento sem cortes nem zoom",
        "transicao": "troca limpa e instantânea no momento em que o pé toca a esteira, sem fumaça ou flashes"
      },
      "cenas_veo": [
        {
          "cena": 1,
          "tempo": "0-8s",
          "foco": "Impacto visual imediato — manequim já caminhando com primeiro look e trocas a cada passo",
          "acao_da_camera": "câmera fixa enquadrando o manequim de corpo inteiro na esteira",
          "movimento_do_manequim": "passos ritmados e constantes",
          "texto_tela_sugerido": "Qual desses você usaria?"
        },
        {
          "cena": 2,
          "tempo": "8-16s",
          "foco": "Demonstração de caimento, tecido, movimento das peças nas passadas",
          "acao_da_camera": "mantém enquadramento limpo destacando o movimento do tecido",
          "movimento_do_manequim": "caminhada fluida e alinhada",
          "texto_tela_sugerido": "Caimento perfeito e cores disponíveis"
        },
        {
          "cena": 3,
          "tempo": "16-24s",
          "foco": "Fechamento com o melhor look, chamada para ação discreta e preparação para loop natural",
          "acao_da_camera": "câmera fixa finalizando no mesmo passo do frame 1 para permitir loop perfeito",
          "movimento_do_manequim": "passo final combinando com o início do vídeo",
          "texto_tela_sugerido": "Clique no carrinho abaixo e escolha a sua cor favorita!"
        }
      ],
      "negative_prompt": [
        "face change",
        "face morphing",
        "extra fingers",
        "deformed arms",
        "melting fabric",
        "camera movement",
        "camera zoom",
        "flash transitions",
        "smoke effects",
        "floating objects",
        "background shifts",
        "talking",
        "subtitles baked into video"
      ]
    }'::jsonb,
    array['esteira', 'manequim ia', 'faceless mannequin', 'treadmill transition', 'lookbook', 'troca de roupa', 'sem rosto', 'moda', 'tiktok shop']
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
