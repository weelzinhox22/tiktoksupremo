-- Migration: 20260803020000_four_core_modules.sql
-- Criar tabelas para os 4 módulos integrados do Tik Supremo

-- 1. Tabela de Cenários (Biblioteca de Cenários)
create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  category text not null default 'general',
  environment jsonb not null default '{}'::jsonb,
  lighting jsonb not null default '{}'::jsonb,
  camera_presets jsonb not null default '[]'::jsonb,
  fixed_elements jsonb not null default '[]'::jsonb,
  action_zones jsonb not null default '[]'::jsonb,
  audio jsonb not null default '{}'::jsonb,
  reference_assets jsonb not null default '[]'::jsonb,
  environment_prompt text not null default '',
  lighting_prompt text not null default '',
  camera_prompt text not null default '',
  continuity_prompt text not null default '',
  negative_prompt text not null default '',
  compatible_formats text[] not null default '{}',
  compatible_categories text[] not null default '{}',
  tags text[] not null default '{}',
  version integer not null default 1,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.scenarios enable row level security;
create policy "Usuário gerencia próprios cenários" on public.scenarios
  for all using (auth.uid() = user_id or user_id is null);

-- 2. Tabela de Projetos de Copy (Modelador de Copy)
create table if not exists public.copy_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  original_copy text not null,
  original_product text not null default '',
  original_audience text not null default '',
  copy_source text not null default 'user',
  reference_link text,
  notes text,
  language text not null default 'pt-BR',
  market text not null default 'BR',
  duration_approx integer not null default 30,
  content_type text not null default 'ugc',
  is_own_copy boolean not null default true,
  analysis jsonb not null default '{}'::jsonb,
  versions jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.copy_projects enable row level security;
create policy "Usuário gerencia próprios projetos de copy" on public.copy_projects
  for all using (auth.uid() = user_id);

-- 3. Tabela de Experimentos Criativos (Laboratório de Criativos)
create table if not exists public.creative_experiments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  product_id text,
  objective text not null default 'conversions',
  hypothesis text not null default '',
  primary_metric text not null default 'orders',
  secondary_metrics text[] not null default '{}',
  test_type text not null default 'hook',
  variants jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  start_date timestamptz,
  end_date timestamptz,
  conclusion jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creative_experiments enable row level security;
create policy "Usuário gerencia próprios experimentos" on public.creative_experiments
  for all using (auth.uid() = user_id);

-- Indices para performance
create index if not exists scenarios_user_id_idx on public.scenarios(user_id);
create index if not exists copy_projects_user_id_idx on public.copy_projects(user_id);
create index if not exists creative_experiments_user_id_idx on public.creative_experiments(user_id);
