alter table public.content_performance
  add column if not exists source text not null default 'manual'
    check (source in ('manual', 'automatic_link')),
  add column if not exists analysis jsonb not null default '{}'::jsonb;

create unique index if not exists content_performance_user_publication_url_idx
  on public.content_performance(user_id, publication_url);

comment on column public.content_performance.analysis is
  'Metadados públicos, transcrição, análise de IA e confiança da identificação dos módulos.';
