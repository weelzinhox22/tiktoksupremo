create unique index if not exists tiktok_connections_open_id_unique_idx
  on public.tiktok_connections(open_id);

comment on index public.tiktok_connections_open_id_unique_idx is
  'Impede que a mesma identidade TikTok seja vinculada a mais de um usuário.';
