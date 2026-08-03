insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000030', null, 'Demonstração Flat Lay de Vestuário Universal (Visão Superior 90°)', 'fashion', array['UGC', 'FLAT LAY', 'MODA'],
    'Estrutura universal para qualquer tipo de roupa (vestidos, conjuntos, camisetas, saias, calças) em câmera superior 90°, destacando tecido, barra, cós e acabamentos.',
    'Movimento universal de demonstração delicada de vestuário sobre tecido/cenário em ângulo superior de 90°. Funciona com qualquer peça ou conjunto (vestidos, conjuntos, blusas, calças), mostrando barra, cós, costura e detalhes de textura.',
    '{
      "duracao_total_segundos": 16.03,
      "formato": "9:16",
      "enquadramento": {
        "angulo": "camera superior em aproximadamente 90 graus (flat lay)",
        "cenario": "peça de vestuário disposta plana sobre fundo neutro ou tecido claro",
        "estilo": "demonstração delicada e profissional de qualquer produto de moda, com movimentos lentos e contato suave com o tecido"
      },
      "precisao_dos_tempos": "aproximadamente 0.15 segundo",
      "movimentos": [
        {
          "inicio": 0.0,
          "fim": 0.35,
          "acao_da_mao": "A mão aparece pelo canto inferior, aproximando-se da barra ou extremidade da peça de roupa.",
          "posicao_inicial": "fora do enquadramento",
          "posicao_final": "barra inferior ou extremidade da peça",
          "dedos": "polegar e indicador preparados para segurar",
          "velocidade": "lenta"
        },
        {
          "inicio": 0.35,
          "fim": 1.7,
          "acao_da_mao": "Segura a extremidade da roupa entre o polegar e os dedos. Faz uma leve puxada para fora e para cima, alinhando e esticando suavemente o tecido.",
          "direcao": "para fora e levemente para cima",
          "contato": "pinça leve",
          "efeito_na_roupa": "o tecido é desdobrado e rugas superficiais são suavizadas",
          "velocidade": "lenta e controlada"
        },
        {
          "inicio": 1.7,
          "fim": 2.2,
          "acao_da_mao": "Solta a barra e desloca a mão diagonalmente para cima, passando sobre a frente da peça em direção ao cós/gola/cintura.",
          "direcao": "diagonal ascendente",
          "contato": "toque suave ou mão flutuando próximo ao tecido",
          "velocidade": "moderada"
        },
        {
          "inicio": 2.2,
          "fim": 3.1,
          "acao_da_mao": "Encosta as pontas dos dedos na costura superior (cós/gola) e desliza horizontalmente, acompanhando a linha de acabamento da peça.",
          "direcao": "esquerda para a direita",
          "dedos": "indicador e médio liderando o movimento",
          "contato": "leve",
          "efeito_na_roupa": "destaca visualmente a costura e o acabamento",
          "velocidade": "lenta"
        },
        {
          "inicio": 3.1,
          "fim": 4.3,
          "acao_da_mao": "Pinça a borda do tecido entre o polegar e o indicador. Levanta levemente alguns milímetros e faz pequenos ajustes laterais, demonstrando espessura e flexibilidade da peça.",
          "direcao": "pequenos deslocamentos laterais",
          "dedos": "polegar e indicador",
          "contato": "pinça firme, mas delicada",
          "efeito_na_roupa": "o tecido levanta levemente mostrando a textura",
          "velocidade": "muito lenta"
        },
        {
          "inicio": 4.3,
          "fim": 5.35,
          "acao_da_mao": "Solta o tecido, abre os dedos e passa a mão deslizando sobre a frente da peça, suavizando a superfície e aproximando-se dos detalhes centrais ou amarrações.",
          "direcao": "descendente e fluida",
          "dedos": "abertos e relaxados",
          "contato": "palma e pontas dos dedos deslizando",
          "efeito_na_roupa": "alisa o tecido",
          "velocidade": "lenta e fluida"
        },
        {
          "inicio": 5.35,
          "fim": 6.05,
          "acao_da_mao": "Aproxima o polegar e o indicador dos detalhes da roupa (botões, laços, cordões ou estampas) e ajusta com precisão.",
          "direcao": "em direção ao detalhe do produto",
          "dedos": "polegar e indicador",
          "contato": "pinça leve",
          "velocidade": "lenta"
        },
        {
          "inicio": 6.05,
          "fim": 7.95,
          "acao_da_mao": "Pinça o detalhe da peça de roupa, realiza micro movimentos para demonstrar relevo, caimento ou acabamento, mantendo a peça visível.",
          "direcao": "micro movimentos laterais",
          "dedos": "polegar e indicador",
          "contato": "pinça delicada",
          "efeito_na_roupa": "o detalhe se move e retorna suavemente",
          "velocidade": "muito lenta"
        },
        {
          "inicio": 8.0,
          "fim": 9.2,
          "acao_da_mao": "Após transição de plano, a mão apoia no centro da peça e realiza um movimento de alisamento contínuo.",
          "posicao_inicial": "centro da peça",
          "direcao": "ascendente",
          "dedos": "juntos e estendidos",
          "contato": "mão plana",
          "efeito_na_roupa": "alisa a região central",
          "velocidade": "lenta"
        },
        {
          "inicio": 9.2,
          "fim": 10.45,
          "acao_da_mao": "Realiza uma passagem longa e diagonal pela roupa, cruzando da base até a parte superior do produto.",
          "direcao": "diagonal ascendente",
          "dedos": "juntos conduzindo o movimento",
          "contato": "deslizamento contínuo",
          "velocidade": "lenta e uniforme"
        },
        {
          "inicio": 10.45,
          "fim": 11.55,
          "acao_da_mao": "Ao alcançar os detalhes superiores, desliza verticalmente acompanhando a costura ou estampa.",
          "direcao": "vertical descendente",
          "contato": "pressão suave",
          "efeito_na_roupa": "destaca o tecido e caimento",
          "velocidade": "lenta"
        },
        {
          "inicio": 11.55,
          "fim": 12.35,
          "acao_da_mao": "Desliza novamente para cima acompanhando a textura do produto.",
          "direcao": "vertical ascendente",
          "velocidade": "lenta"
        },
        {
          "inicio": 12.35,
          "fim": 13.3,
          "acao_da_mao": "Desloca-se diagonalmente cobrindo toda a extensão da peça de roupa.",
          "direcao": "diagonal descendente",
          "contato": "mão plana",
          "velocidade": "lenta e contínua"
        },
        {
          "inicio": 13.3,
          "fim": 14.15,
          "acao_da_mao": "Apoia na lateral da roupa e faz pequenos ajustes de alisamento.",
          "direcao": "movimento curto",
          "contato": "pressão suave",
          "velocidade": "muito lenta"
        },
        {
          "inicio": 14.15,
          "fim": 15.15,
          "acao_da_mao": "Desliza lentamente para cima acompanhando a costura lateral da peça.",
          "direcao": "ascendente",
          "velocidade": "lenta"
        },
        {
          "inicio": 15.15,
          "fim": 15.9,
          "acao_da_mao": "Faz uma última passagem ampla sobre toda a extensão da peça de roupa, finalizando o movimento no centro.",
          "direcao": "lateral para o centro",
          "dedos": "juntos e estendidos",
          "contato": "mão plana",
          "efeito_na_roupa": "alisa o tecido e encerra a apresentação",
          "velocidade": "lenta e fluida"
        }
      ],
      "movimentos_da_camera": [
        {
          "inicio": 0.0,
          "fim": 1.8,
          "movimento": "enquadramento superior aberto mostrando a peça inteira"
        },
        {
          "inicio": 1.8,
          "fim": 5.35,
          "movimento": "zoom gradual e reposicionamento suave para os detalhes de acabamento"
        },
        {
          "inicio": 5.35,
          "fim": 7.95,
          "movimento": "aproximação em close para mostrar a textura do tecido e costuras"
        },
        {
          "inicio": 8.0,
          "fim": 8.1,
          "movimento": "corte para enquadramento aberto"
        },
        {
          "inicio": 9.2,
          "fim": 12.0,
          "movimento": "zoom gradual acompanhando a mão nos detalhes"
        },
        {
          "inicio": 12.0,
          "fim": 15.9,
          "movimento": "deslocamento suave da câmera cobrindo o comprimento da peça"
        },
        {
          "inicio": 15.9,
          "fim": 16.03,
          "movimento": "encerramento suave"
        }
      ],
      "caracteristicas_gerais_dos_gestos": {
        "ritmo": "lento, delicado e contínuo",
        "pressao": "suave, sem amassar a roupa",
        "postura_dos_dedos": "dedos juntos durante deslizes e pinça durante detalhes",
        "objetivo_visual": "destacar textura, costuras, acabamento e caimento de qualquer peça de roupa",
        "adaptabilidade": "compatível com qualquer vestuário (vestidos, conjuntos, camisetas, calças, casacos, moda praia)"
      }
    }'::jsonb,
    array['flat lay', 'vestuário', 'qualquer roupa', 'visão superior', 'detalhes', 'tecido', 'moda universal', 'tiktok shop']
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
