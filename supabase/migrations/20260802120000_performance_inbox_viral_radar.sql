alter table public.content_performance
  alter column project_id drop not null,
  alter column generation_id drop not null,
  add column if not exists match_status text not null default 'matched'
    check (match_status in ('matched', 'pending')),
  add column if not exists video_id text,
  add column if not exists metrics_source text not null default 'manual'
    check (metrics_source in ('manual', 'public_page', 'tiktok_display_api'));

update public.content_performance
set match_status = case
  when project_id is null or generation_id is null then 'pending'
  else 'matched'
end;

drop policy if exists "content performance own rows" on public.content_performance;
create policy "content performance own rows" on public.content_performance
for all
using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and (
    (project_id is null and generation_id is null)
    or (
      project_id is not null
      and generation_id is not null
      and exists (
        select 1 from public.projects p
        where p.id = public.content_performance.project_id and p.user_id = auth.uid()
      )
      and exists (
        select 1 from public.script_generations g
        where g.id = public.content_performance.generation_id
          and g.project_id = public.content_performance.project_id
          and g.user_id = auth.uid()
      )
    )
  )
);

update public.movement_library
set movement_json = jsonb_build_object(
  'version', '2.0',
  'duration_seconds', 8,
  'aspect_ratio', '9:16',
  'format', coalesce(formats[1], 'UGC'),
  'timing', jsonb_build_object(
    'frame_0_2s', 'natural setup and visual hook',
    'frame_2_6s', 'main movement with realistic acceleration and deceleration',
    'frame_6_8s', 'controlled ending pose ready for continuity'
  ),
  'biomechanics', jsonb_build_object(
    'anatomy', 'natural adult human anatomy',
    'breathing', 'subtle natural breathing',
    'micro_expressions', 'spontaneous and restrained',
    'weight_transfer', 'physically plausible',
    'hand_motion', 'anatomically correct fingers and natural grip'
  ),
  'identity_lock', jsonb_build_object(
    'face', 'preserve exactly',
    'hair', 'preserve style color and length',
    'body', 'preserve proportions and skin tone',
    'clothing', 'preserve garment color print texture and accessories'
  ),
  'product_lock', jsonb_build_object(
    'packaging', 'preserve exact shape color label text and proportions',
    'state', 'closed unless explicitly requested',
    'label_visibility', 'do not cover important information'
  ),
  'continuity', jsonb_build_object(
    'start_from_previous_frame', true,
    'same_character', true,
    'same_environment', true,
    'same_lighting', true,
    'same_camera_axis', true
  ),
  'quality', jsonb_build_object(
    'render', 'photorealistic 4K HDR',
    'motion', 'smooth natural real-time motion',
    'fabric_physics', 'realistic folds drape and inertia',
    'hair_physics', 'realistic gravity and secondary motion'
  ),
  'negative_prompt', jsonb_build_array(
    'identity change', 'face morphing', 'body deformation', 'extra fingers',
    'broken hands', 'floating objects', 'product deformation', 'label mutation',
    'robotic movement', 'abrupt acceleration', 'jump cuts', 'digital transitions',
    'text', 'subtitles', 'watermark', 'logo overlay', 'AI artifacts'
  )
) || movement_json
where user_id is null;

insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000011', null, 'Entrada natural no quadro', 'ugc', array['UGC'],
    'A personagem entra caminhando e assume uma posição casual sem parecer ensaiada.',
    'Comece com o cenário vazio. A personagem entra pela lateral, caminha dois passos curtos, para na marca e olha para a câmera com uma microexpressão curiosa.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","start_pose":"off frame","action_sequence":[{"time":"0-2s","action":"enter frame from the side"},{"time":"2-5s","action":"take two natural steps and settle weight"},{"time":"5-8s","action":"soft eye contact and curious micro-expression"}],"camera":{"type":"static smartphone","framing":"medium full shot","movement":"none"},"ending":{"pose":"relaxed stance","continuity_ready":true},"negative_prompt":["runway walk","robotic steps","sliding feet","camera movement"]}'::jsonb,
    array['entrada','gancho visual','caminhada','ugc']
  ),
  (
    '10000000-0000-4000-8000-000000000012', null, 'Troca de mão com produto', 'product_demo', array['UGC','POV'],
    'Transfere o produto de uma mão para a outra preservando rótulo e anatomia.',
    'Segure o produto com a mão direita, aproxime do centro e transfira lentamente para a esquerda sem cobrir o rótulo. Termine com o produto estável na altura do peito.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","product_interaction":{"start_hand":"right","end_hand":"left","container_closed":true,"label_visible":true},"action_sequence":[{"time":"0-2s","action":"right hand presents product"},{"time":"2-6s","action":"controlled hand-to-hand transfer"},{"time":"6-8s","action":"left hand holds product at chest height"}],"camera":{"type":"smartphone","framing":"medium shot","focus":"product label"},"negative_prompt":["extra fingers","object duplication","label mutation","product opening"]}'::jsonb,
    array['produto','troca de mão','rótulo','demonstração']
  ),
  (
    '10000000-0000-4000-8000-000000000013', null, 'Revelação do look sem corte', 'fashion', array['UGC'],
    'Revela o look completo com recuo natural e sem transição digital.',
    'Comece em plano médio, dê dois passos para trás até o corpo inteiro aparecer, alise a roupa e faça uma rotação curta do tronco para mostrar o caimento.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","start_pose":"medium shot facing camera","action_sequence":[{"time":"0-3s","action":"two small steps backward"},{"time":"3-5s","action":"smooth garment naturally"},{"time":"5-8s","action":"subtle torso rotation and confident finish"}],"camera":{"type":"static smartphone","focus_shift":"face to full outfit","zoom":"none"},"garment":{"preserve_print":true,"preserve_color":true,"fabric_physics":"realistic"},"negative_prompt":["outfit replacement","digital zoom","jump cut","exaggerated posing"]}'::jsonb,
    array['moda','look completo','sem corte','roupa']
  ),
  (
    '10000000-0000-4000-8000-000000000014', null, 'POV pegando o produto', 'pov', array['POV'],
    'Mão entra no quadro, pega o produto e leva até a câmera em primeira pessoa.',
    'A câmera representa os olhos da pessoa. Uma mão entra naturalmente, segura o produto pela lateral, levanta e aproxima o rótulo da câmera, com mudança de foco realista.',
    '{"version":"2.0","duration_seconds":8,"aspect_ratio":"9:16","perspective":"first-person POV","action_sequence":[{"time":"0-2s","action":"hand enters toward product"},{"time":"2-5s","action":"natural grip and lift"},{"time":"5-8s","action":"bring label closer to lens and hold"}],"camera":{"type":"POV smartphone","focus_shift":"environment to product label","movement":"subtle head micro-motion"},"product":{"container_closed":true,"label_visible":true},"negative_prompt":["visible third-person creator","extra hand","floating product","unreadable label"]}'::jsonb,
    array['pov','produto','pegar','close-up']
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

comment on column public.content_performance.match_status is
  'Indica se a publicação foi associada com segurança a um roteiro ou aguarda associação.';
