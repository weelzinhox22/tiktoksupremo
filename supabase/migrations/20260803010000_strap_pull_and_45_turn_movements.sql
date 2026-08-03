-- Inserir os novos movimentos de roupa/blusa feminina na biblioteca de movimentos
insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000034', null, 'Movimento – Puxando Alça e Tecido da Roupa', 'fashion', array['UGC', 'FASHION', 'ROUPA', 'NO SPEAK'],
    'Demonstração tátil GRWM: a modelo ajusta suavemente a alça no ombro e puxa levemente o tecido para destacar a elasticidade e caimento da roupa/blusa feminina.',
    'SCENE: UGC GRWM style, fixed camera, natural behavior.

ACTION TIMELINE:
She briefly looks at the lens and relaxes her expression.
She gently adjusts the strap on her shoulder using her thumb.
Her index finger lightly pulls the fabric to show elasticity and releases it smoothly.
She smiles subtly, hand drops naturally.

MICRO-DETAILS:
Natural fabric tension, slight delay when releasing, realistic finger contact.

TECHNICAL:
4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.',
    '{
      "duracao_total_segundos": 12,
      "formato": "vertical 9:16",
      "scene": "UGC GRWM style, fixed camera, natural behavior.",
      "action_timeline": [
        "She briefly looks at the lens and relaxes her expression.",
        "She gently adjusts the strap on her shoulder using her thumb.",
        "Her index finger lightly pulls the fabric to show elasticity and releases it smoothly.",
        "She smiles subtly, hand drops naturally."
      ],
      "micro_details": "Natural fabric tension, slight delay when releasing, realistic finger contact.",
      "technical": "4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.",
      "regras_de_consistencia": {
        "personagem": "manter identidade facial e física constante",
        "tecido": "tensão natural ao puxar e soltar suavemente"
      }
    }'::jsonb,
    array['puxando alça', 'tecido', 'elasticidade', 'blusa feminina', 'moda feminina', 'grwm', 'ugc', 'tiktok shop']
  ),
  (
    '10000000-0000-4000-8000-000000000035', null, 'Movimento – Gira 45 Graus', 'fashion', array['UGC', 'FASHION', 'TRY ON', 'NO SPEAK'],
    'Movimento de giro suave de 45 graus: a modelo inicia de costas, gira a cabeça e o tronco 45 graus, faz contato visual com um sorriso assimétrico e retorna à posição inicial.',
    'SCENE: UGC try-on style, fixed camera, soft side natural light.

ACTION TIMELINE:
She starts with her back to the camera, weight on one leg.
A subtle weight shift occurs as her right hand touches her hip naturally.
She turns her head and upper torso about 45 degrees and looks over her shoulder toward the camera.
Eye contact happens first, followed by a slow asymmetric smile.
She blinks slowly, then her head returns first, followed by the torso.

MICRO-DETAILS:
Subtle breathing in shoulders, slight chin drop, realistic focus shift on the face.

TECHNICAL:
4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.

NEGATIVE:
no jitter, no morphing, no body distortion, stable face identity',
    '{
      "duracao_total_segundos": 15,
      "formato": "vertical 9:16",
      "scene": "UGC try-on style, fixed camera, soft side natural light.",
      "action_timeline": [
        "She starts with her back to the camera, weight on one leg.",
        "A subtle weight shift occurs as her right hand touches her hip naturally.",
        "She turns her head and upper torso about 45 degrees and looks over her shoulder toward the camera.",
        "Eye contact happens first, followed by a slow asymmetric smile.",
        "She blinks slowly, then her head returns first, followed by the torso."
      ],
      "micro_details": "Subtle breathing in shoulders, slight chin drop, realistic focus shift on the face.",
      "technical": "4k, 60fps, realistic human motion, consistent lighting, shot on iPhone 15 Pro, stable framing.",
      "negative_prompt": [
        "no jitter",
        "no morphing",
        "no body distortion",
        "stable face identity"
      ]
    }'::jsonb,
    array['gira 45 graus', 'try-on', 'ombro', 'moda feminina', 'look', 'ugc', 'tiktok shop']
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
