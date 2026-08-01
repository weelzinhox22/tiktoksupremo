create extension if not exists pgcrypto;

do $$
begin
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'project_status'
  ) then
    create type public.project_status as enum ('draft', 'analyzing', 'generating', 'completed', 'failed');
  end if;
  if not exists (
    select 1 from pg_type t join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'processing_status'
  ) then
    create type public.processing_status as enum ('pending', 'processing', 'completed', 'failed');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
  status public.project_status not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  product_analysis jsonb,
  reference_analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  product_url text,
  category text not null default '',
  price numeric(12,2) check (price is null or price >= 0),
  commission_rate numeric(5,2) check (commission_rate is null or commission_rate between 0 and 100),
  rating numeric(3,2) check (rating is null or rating between 0 and 5),
  review_count integer check (review_count is null or review_count >= 0),
  known_sales integer check (known_sales is null or known_sales >= 0),
  description text not null default '',
  benefits text[] not null default '{}',
  problems_solved text[] not null default '{}',
  objections text[] not null default '{}',
  target_audience text not null default '',
  perceived_competition text,
  notes text,
  image_paths text[] not null default '{}',
  raw_data jsonb not null default '{}'::jsonb,
  analysis jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id)
);

create table if not exists public.reference_videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null,
  original_filename text not null,
  duration_seconds numeric(10,2),
  transcription text,
  analysis jsonb,
  processing_status public.processing_status not null default 'pending',
  processing_error text,
  created_at timestamptz not null default now()
);

create table if not exists public.copies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null check (char_length(content) > 0),
  source_type text not null default 'validated_copy' check (source_type in ('validated_copy','transcription','manual')),
  analysis jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.script_generations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  version integer not null check (version > 0),
  status public.processing_status not null default 'pending',
  input_snapshot jsonb not null,
  strategy jsonb,
  full_script text,
  headline text,
  caption text,
  hashtags text[] not null default '{}',
  result jsonb,
  processing_error text,
  created_at timestamptz not null default now(),
  unique(project_id, version)
);

create table if not exists public.script_scenes (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.script_generations(id) on delete cascade,
  scene_number integer not null check (scene_number > 0),
  duration_seconds numeric(4,1) not null check (duration_seconds > 0 and duration_seconds <= 8),
  spoken_text text not null,
  speech_direction text not null default '',
  visual_action text not null default '',
  body_movement text not null default '',
  camera_direction text not null default '',
  framing text not null default '',
  character_direction text not null default '',
  product_direction text not null default '',
  setting text not null default '',
  continuity_rules text not null default '',
  veo_prompt text not null,
  created_at timestamptz not null default now(),
  unique(generation_id, scene_number)
);

create index if not exists projects_user_created_idx on public.projects(user_id, created_at desc);
create index if not exists products_user_idx on public.products(user_id);
create index if not exists videos_project_idx on public.reference_videos(project_id);
create index if not exists copies_project_idx on public.copies(project_id);
create index if not exists generations_project_version_idx on public.script_generations(project_id, version desc);
create index if not exists scenes_generation_number_idx on public.script_scenes(generation_id, scene_number);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists profiles_updated on public.profiles;
drop trigger if exists projects_updated on public.projects;
drop trigger if exists products_updated on public.products;
create trigger profiles_updated before update on public.profiles for each row execute function public.set_updated_at();
create trigger projects_updated before update on public.projects for each row execute function public.set_updated_at();
create trigger products_updated before update on public.products for each row execute function public.set_updated_at();

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name) values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.products enable row level security;
alter table public.reference_videos enable row level security;
alter table public.copies enable row level security;
alter table public.script_generations enable row level security;
alter table public.script_scenes enable row level security;

drop policy if exists "profiles own rows" on public.profiles;
drop policy if exists "projects own rows" on public.projects;
drop policy if exists "products own rows" on public.products;
drop policy if exists "videos own rows" on public.reference_videos;
drop policy if exists "copies own rows" on public.copies;
drop policy if exists "generations own rows" on public.script_generations;
drop policy if exists "scenes through generation owner" on public.script_scenes;
create policy "profiles own rows" on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());
create policy "projects own rows" on public.projects for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "products own rows" on public.products for all using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "videos own rows" on public.reference_videos for all using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "copies own rows" on public.copies for all using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "generations own rows" on public.script_generations for all using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.projects p where p.id = project_id and p.user_id = auth.uid()));
create policy "scenes through generation owner" on public.script_scenes for all
  using (exists (select 1 from public.script_generations g where g.id = generation_id and g.user_id = auth.uid()))
  with check (exists (select 1 from public.script_generations g where g.id = generation_id and g.user_id = auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('product-images', 'product-images', false, 10485760, array['image/jpeg','image/png','image/webp']),
  ('reference-videos', 'reference-videos', false, 524288000, array['video/mp4','video/webm','video/quicktime']),
  ('project-files', 'project-files', false, 52428800, null)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage users read own folder" on storage.objects;
drop policy if exists "storage users insert own folder" on storage.objects;
drop policy if exists "storage users update own folder" on storage.objects;
drop policy if exists "storage users delete own folder" on storage.objects;
create policy "storage users read own folder" on storage.objects for select to authenticated using (
  bucket_id in ('product-images','reference-videos','project-files') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "storage users insert own folder" on storage.objects for insert to authenticated with check (
  bucket_id in ('product-images','reference-videos','project-files') and (storage.foldername(name))[1] = auth.uid()::text
);
create policy "storage users update own folder" on storage.objects for update to authenticated using (
  bucket_id in ('product-images','reference-videos','project-files') and (storage.foldername(name))[1] = auth.uid()::text
) with check ((storage.foldername(name))[1] = auth.uid()::text);
create policy "storage users delete own folder" on storage.objects for delete to authenticated using (
  bucket_id in ('product-images','reference-videos','project-files') and (storage.foldername(name))[1] = auth.uid()::text
);
