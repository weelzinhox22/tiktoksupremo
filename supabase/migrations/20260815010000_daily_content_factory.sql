create table if not exists public.creative_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  objective text not null default 'sales' check (objective in ('sales','clicks','followers','test')),
  duration integer not null default 24 check (duration between 3 and 600),
  definition jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.daily_content_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.product_library(id) on delete set null,
  plan_date date not null default current_date,
  daily_goal integer not null default 12 check (daily_goal between 1 and 500),
  objective text not null default 'sales' check (objective in ('sales','clicks','followers','test')),
  target_duration integer not null default 24,
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, plan_date, product_id)
);

create table if not exists public.daily_video_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id uuid references public.daily_content_plans(id) on delete cascade,
  product_id uuid references public.product_library(id) on delete set null,
  template_id uuid references public.creative_templates(id) on delete set null,
  title text not null,
  objective text not null default 'sales',
  angle text not null default '',
  hook text not null default '',
  body text not null default '',
  cta text not null default '',
  duration numeric not null default 24,
  status text not null default 'idea' check (status in ('idea','script','recording','editing','queued','rendering','ready','scheduled','published','failed')),
  creative_score integer not null default 0 check (creative_score between 0 and 100),
  score_notes jsonb not null default '[]'::jsonb,
  output_path text,
  output_name text,
  scheduled_for timestamptz,
  published_at timestamptz,
  publication_url text,
  attempts integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.smart_media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid references public.product_library(id) on delete set null,
  name text not null,
  storage_path text,
  media_type text not null check (media_type in ('video','audio','image')),
  fingerprint text not null,
  tags text[] not null default '{}',
  duration numeric not null default 0,
  orientation text not null default 'unknown',
  use_count integer not null default 0,
  last_used_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, fingerprint)
);

create index if not exists daily_video_jobs_user_status_idx on public.daily_video_jobs(user_id, status, created_at desc);
create index if not exists daily_video_jobs_schedule_idx on public.daily_video_jobs(user_id, scheduled_for) where scheduled_for is not null;
create index if not exists smart_media_assets_tags_idx on public.smart_media_assets using gin(tags);

alter table public.creative_templates enable row level security;
alter table public.daily_content_plans enable row level security;
alter table public.daily_video_jobs enable row level security;
alter table public.smart_media_assets enable row level security;

drop policy if exists "creative_templates_owner" on public.creative_templates;
create policy "creative_templates_owner" on public.creative_templates for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "daily_content_plans_owner" on public.daily_content_plans;
create policy "daily_content_plans_owner" on public.daily_content_plans for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "daily_video_jobs_owner" on public.daily_video_jobs;
create policy "daily_video_jobs_owner" on public.daily_video_jobs for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "smart_media_assets_owner" on public.smart_media_assets;
create policy "smart_media_assets_owner" on public.smart_media_assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
