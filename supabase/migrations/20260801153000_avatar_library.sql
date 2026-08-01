create table if not exists public.avatars (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  description text not null default '',
  image_path text not null,
  source text not null default 'upload' check (source in ('upload', 'generated')),
  generation_prompt text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists avatars_user_created_idx on public.avatars(user_id, created_at desc);

drop trigger if exists avatars_updated on public.avatars;
create trigger avatars_updated before update on public.avatars
for each row execute function public.set_updated_at();

alter table public.avatars enable row level security;

drop policy if exists "avatars own rows" on public.avatars;
create policy "avatars own rows" on public.avatars
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

comment on table public.avatars is 'Biblioteca reutilizável de personagens de referência do usuário.';
comment on column public.avatars.image_path is 'Caminho privado no bucket product-images, sempre dentro da pasta do usuário.';
