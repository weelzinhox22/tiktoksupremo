create table if not exists public.tiktok_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  open_id text not null,
  display_name text not null default '',
  avatar_url text,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text not null,
  scopes text[] not null default '{}',
  access_expires_at timestamptz not null,
  refresh_expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tiktok_oauth_states (
  state text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

alter table public.tiktok_connections enable row level security;
alter table public.tiktok_oauth_states enable row level security;

drop policy if exists "tiktok connections own rows" on public.tiktok_connections;
create policy "tiktok connections own rows" on public.tiktok_connections
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "tiktok oauth states own rows" on public.tiktok_oauth_states;
create policy "tiktok oauth states own rows" on public.tiktok_oauth_states
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop trigger if exists tiktok_connections_updated on public.tiktok_connections;
create trigger tiktok_connections_updated
before update on public.tiktok_connections
for each row execute function public.set_updated_at();

create index if not exists tiktok_oauth_states_user_expires_idx
  on public.tiktok_oauth_states(user_id, expires_at desc);

comment on table public.tiktok_connections is
  'Conexões OAuth do TikTok. Tokens ficam cifrados no servidor antes de serem persistidos.';
