create table if not exists public.video_provider_configs (
  id uuid primary key default gen_random_uuid(),
  provider text not null unique check (provider in ('comfyui', 'ltx', 'veo', 'replicate', 'huggingface', 'minimax')),
  display_name text not null,
  enabled boolean not null default false,
  is_default boolean not null default false,
  secret_ciphertext text,
  secret_hint text,
  settings jsonb not null default '{}'::jsonb,
  last_test_status text not null default 'untested' check (last_test_status in ('untested', 'success', 'error')),
  last_test_message text,
  last_tested_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists video_provider_one_default_idx
  on public.video_provider_configs (is_default)
  where is_default = true;

alter table public.video_provider_configs enable row level security;

comment on table public.video_provider_configs is
  'Configuração global de provedores de vídeo. Acesso somente pelo backend com service role; segredos ficam cifrados.';

insert into public.video_provider_configs (provider, display_name, settings)
values
  ('comfyui', 'ComfyUI local / WAN / LTX', '{"baseUrl":"http://127.0.0.1:8188","workflow":null}'::jsonb),
  ('ltx', 'LTX Video 2.3', '{"baseUrl":"https://api.ltx.io","model":"ltx-2-3-fast","generateAudio":true}'::jsonb),
  ('veo', 'Google Veo 3.1', '{"baseUrl":"https://generativelanguage.googleapis.com/v1beta","model":"veo-3.1-fast-generate-preview"}'::jsonb),
  ('replicate', 'Replicate / WAN', '{"baseUrl":"https://api.replicate.com/v1","version":"7677a619127ea34d1ed873fb5b77448e4b9889fbd83809b44a2c459ace99192a"}'::jsonb),
  ('huggingface', 'Hugging Face Inference', '{"baseUrl":"https://router.huggingface.co/hf-inference/models","model":"THUDM/CogVideoX-5b"}'::jsonb),
  ('minimax', 'MiniMax Hailuo', '{"baseUrl":"https://api.minimaxi.chat/v1","model":"video-01"}'::jsonb)
on conflict (provider) do nothing;
