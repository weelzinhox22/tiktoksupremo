insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000021', null, 'Volta completa mostrando o look', 'fashion', array['UGC'],
    'A personagem mostra frente, lateral, costas e caimento em uma volta natural.',
    'Comece de frente em plano de corpo inteiro. Transfira o peso, faça uma volta completa e lenta, segure por um instante de costas e termine novamente de frente. Preserve roupa, estampa, acessórios, identidade e física do tecido.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-2s","action":"front pose and small weight transfer"},{"time":"2-6s","action":"one controlled full turn showing side and back of garment"},{"time":"6-8s","action":"return to front and settle fabric naturally"}],"camera":{"type":"static smartphone","framing":"full body","movement":"none","focus":"outfit silhouette"},"garment":{"preserve_color":true,"preserve_print":true,"fabric_physics":"realistic drape and inertia"},"negative_prompt":["runway spin","fast rotation","body morphing","outfit change","floating fabric"]}'::jsonb,
    array['tiktok shop','moda','volta','look completo','roupa']
  ),
  (
    '10000000-0000-4000-8000-000000000022', null, 'Beijo para a câmera', 'cta', array['UGC'],
    'CTA carismático com beijo curto e gesto apontando para o produto ou botão.',
    'Depois de concluir a fala, sorria naturalmente, leve a mão aos lábios, solte um beijo curto em direção à câmera e finalize apontando de forma discreta para a região do CTA. Sem cobrir o rosto por muito tempo.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-3s","action":"finish spoken CTA with direct eye contact"},{"time":"3-6s","action":"natural hand-to-lips gesture and a short blown kiss toward lens"},{"time":"6-8s","action":"small smile and subtle point toward CTA area"}],"camera":{"type":"handheld smartphone","framing":"medium close-up","movement":"subtle creator micro movement"},"negative_prompt":["exaggerated kiss","hand deformation","face occlusion","slow motion","beauty filter"]}'::jsonb,
    array['tiktok shop','cta','beijo','creator','carisma']
  ),
  (
    '10000000-0000-4000-8000-000000000023', null, 'Caimento dos dois lados', 'fashion', array['UGC'],
    'Mostra como a roupa veste na frente e nos dois perfis com gestos simples.',
    'Em corpo inteiro, mostre a frente, gire o tronco para o perfil direito, volte ao centro e mostre o perfil esquerdo. Alise apenas uma vez a lateral da roupa e mantenha a estampa visível.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-2s","action":"front view with relaxed arms"},{"time":"2-5s","action":"right profile then return to center while smoothing side seam once"},{"time":"5-8s","action":"left profile and natural front finish"}],"camera":{"type":"static smartphone","framing":"full body","movement":"none"},"negative_prompt":["camera orbit","outfit mutation","repeated fabric pulling","robotic pose changes"]}'::jsonb,
    array['moda','caimento','perfil','roupa','tiktok shop']
  ),
  (
    '10000000-0000-4000-8000-000000000024', null, 'Câmera acompanhando o look', 'fashion', array['UGC'],
    'Movimento vertical de câmera que revela o look dos pés ao rosto sem corte.',
    'A personagem permanece quase parada enquanto a câmera faz um tilt vertical suave dos pés até o rosto. Termine em plano médio com contato visual. Não use zoom digital nem mude o eixo da câmera.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-2s","action":"camera starts on shoes and lower garment"},{"time":"2-6s","action":"smooth vertical tilt reveals full outfit details"},{"time":"6-8s","action":"camera settles on face while creator makes eye contact"}],"camera":{"type":"smartphone on controlled handheld rig","framing":"detail to medium shot","movement":"single smooth tilt up","zoom":"none"},"negative_prompt":["digital zoom","camera jump","body scan distortion","outfit change","fast tilt"]}'::jsonb,
    array['câmera','tilt','revelação','look','moda']
  ),
  (
    '10000000-0000-4000-8000-000000000025', null, 'Passarela curta de creator', 'fashion', array['UGC'],
    'Dois passos naturais para mostrar movimento e tecido sem aparência de desfile.',
    'Dê dois passos curtos em direção à câmera, pare antes do plano médio, transfira o peso para uma perna e mostre a lateral do look. Use passada casual de creator, nunca caminhada de passarela exagerada.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-2s","action":"relaxed full-body starting pose"},{"time":"2-6s","action":"two casual short steps toward camera with natural fabric motion"},{"time":"6-8s","action":"weight shift and subtle side pose"}],"camera":{"type":"static smartphone","framing":"full body to three-quarter shot","movement":"none"},"negative_prompt":["runway walk","crossed legs","sliding feet","camera zoom","exaggerated hips"]}'::jsonb,
    array['moda','caminhada','tecido','creator','look']
  ),
  (
    '10000000-0000-4000-8000-000000000026', null, 'Órbita curta no produto', 'product_demo', array['UGC','POV'],
    'A câmera contorna levemente o produto para revelar volume, acabamento e embalagem.',
    'Mantenha o produto estável e fechado enquanto a câmera percorre um arco curto de aproximadamente 35 graus. Preserve rótulo e proporções; a órbita termina novamente com a frente legível.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","action_sequence":[{"time":"0-2s","action":"front label hero shot"},{"time":"2-6s","action":"camera performs a slow 35-degree arc around stable product"},{"time":"6-8s","action":"return to readable front label and hold"}],"camera":{"type":"controlled smartphone","framing":"product close-up","movement":"short smooth orbit","focus":"locked on product"},"negative_prompt":["full orbit","product rotation","label mutation","floating product","focus pumping"]}'::jsonb,
    array['produto','câmera','órbita','close-up','tiktok shop']
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
