alter table public.content_performance
  add column if not exists retention_curve jsonb,
  add column if not exists average_watch_seconds numeric,
  add column if not exists creative_dimensions jsonb;

comment on column public.content_performance.retention_curve is
  'Pontos de retenção por segundo quando a plataforma disponibilizar estes dados.';
comment on column public.content_performance.creative_dimensions is
  'Dimensões comparáveis do criativo: duração, CTA, avatar, voz e formato.';

alter table public.daily_video_jobs
  add column if not exists variation_purpose text;

alter table public.smart_media_assets
  add column if not exists favorite boolean not null default false,
  add column if not exists collections text[] not null default '{}',
  add column if not exists movement text,
  add column if not exists description text not null default '';
