create table if not exists public.transcriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  storage_path text not null,
  original_filename text not null,
  transcript text,
  analysis jsonb,
  processing_status public.processing_status not null default 'pending',
  processing_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transcriptions_user_created_idx
  on public.transcriptions(user_id, created_at desc);
create index if not exists transcriptions_project_idx
  on public.transcriptions(project_id)
  where project_id is not null;

drop trigger if exists transcriptions_updated on public.transcriptions;
create trigger transcriptions_updated
  before update on public.transcriptions
  for each row execute function public.set_updated_at();

alter table public.transcriptions enable row level security;
drop policy if exists "transcriptions own rows" on public.transcriptions;
create policy "transcriptions own rows" on public.transcriptions
  for all
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      project_id is null
      or exists (
        select 1 from public.projects p
        where p.id = project_id and p.user_id = auth.uid()
      )
    )
  );
