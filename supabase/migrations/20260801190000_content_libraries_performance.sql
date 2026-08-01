create table if not exists public.product_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160),
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
  usage_count integer not null default 0 check (usage_count >= 0),
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.products
  add column if not exists library_product_id uuid references public.product_library(id) on delete set null;

create table if not exists public.movement_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  category text not null check (category in ('fashion', 'product_demo', 'ugc', 'pov', 'cta')),
  formats text[] not null default array['UGC']::text[],
  description text not null default '',
  prompt_instruction text not null check (char_length(prompt_instruction) > 10),
  movement_json jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or char_length(name) > 0)
);

create table if not exists public.content_performance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  generation_id uuid not null references public.script_generations(id) on delete cascade,
  combination_number integer check (combination_number is null or combination_number > 0),
  hook_index integer check (hook_index is null or hook_index >= 0),
  body_index integer check (body_index is null or body_index >= 0),
  cta_index integer check (cta_index is null or cta_index >= 0),
  hook_text text not null default '',
  body_text text not null default '',
  cta_text text not null default '',
  platform text not null default 'TikTok Shop',
  publication_url text,
  published_at timestamptz not null default now(),
  views integer not null default 0 check (views >= 0),
  likes integer not null default 0 check (likes >= 0),
  comments integer not null default 0 check (comments >= 0),
  shares integer not null default 0 check (shares >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  orders integer not null default 0 check (orders >= 0),
  revenue numeric(12,2) not null default 0 check (revenue >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_library_user_updated_idx
  on public.product_library(user_id, updated_at desc);
create index if not exists products_library_product_idx
  on public.products(library_product_id);
create index if not exists movement_library_user_category_idx
  on public.movement_library(user_id, category, created_at desc);
create index if not exists content_performance_user_published_idx
  on public.content_performance(user_id, published_at desc);
create index if not exists content_performance_generation_idx
  on public.content_performance(generation_id, combination_number);

drop trigger if exists product_library_updated on public.product_library;
create trigger product_library_updated before update on public.product_library
for each row execute function public.set_updated_at();
drop trigger if exists movement_library_updated on public.movement_library;
create trigger movement_library_updated before update on public.movement_library
for each row execute function public.set_updated_at();
drop trigger if exists content_performance_updated on public.content_performance;
create trigger content_performance_updated before update on public.content_performance
for each row execute function public.set_updated_at();

alter table public.product_library enable row level security;
alter table public.movement_library enable row level security;
alter table public.content_performance enable row level security;

drop policy if exists "product library own rows" on public.product_library;
create policy "product library own rows" on public.product_library
for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "movement library readable rows" on public.movement_library;
create policy "movement library readable rows" on public.movement_library
for select using (user_id is null or user_id = auth.uid());
drop policy if exists "movement library insert own rows" on public.movement_library;
create policy "movement library insert own rows" on public.movement_library
for insert with check (user_id = auth.uid());
drop policy if exists "movement library update own rows" on public.movement_library;
create policy "movement library update own rows" on public.movement_library
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists "movement library delete own rows" on public.movement_library;
create policy "movement library delete own rows" on public.movement_library
for delete using (user_id = auth.uid());

drop policy if exists "content performance own rows" on public.content_performance;
create policy "content performance own rows" on public.content_performance
for all using (user_id = auth.uid())
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.projects p
    where p.id = project_id and p.user_id = auth.uid()
  )
  and exists (
    select 1 from public.script_generations g
    where g.id = generation_id and g.project_id = project_id and g.user_id = auth.uid()
  )
);

insert into public.movement_library
  (id, user_id, name, category, formats, description, prompt_instruction, movement_json, tags)
values
  (
    '10000000-0000-4000-8000-000000000001', null, 'Giro natural de look', 'fashion', array['UGC'],
    'Giro suave para mostrar frente, lateral e caimento da roupa.',
    'A personagem gira naturalmente entre 120 e 180 graus, olha brevemente por cima do ombro e retorna para a câmera. Preserve integralmente roupa, estampa, corpo e identidade.',
    '{"sequence":["posição frontal relaxada","giro suave","olhar sobre o ombro","retorno frontal"],"camera":"full body static","speech":false}'::jsonb,
    array['roupa','giro','corpo inteiro']
  ),
  (
    '10000000-0000-4000-8000-000000000002', null, 'Cabelo e tecido', 'fashion', array['UGC'],
    'Movimentos sutis que destacam cabelo, textura e estampa.',
    'A personagem passa lentamente a mão pelo cabelo, alisa o tecido com a ponta dos dedos e levanta levemente a barra sem cobrir a estampa. Use física realista de cabelo e tecido.',
    '{"sequence":["mão no cabelo","alisar tecido","mostrar estampa","sorriso discreto"],"camera":"controlled slow detail","speech":false}'::jsonb,
    array['roupa','cabelo','tecido','detalhe']
  ),
  (
    '10000000-0000-4000-8000-000000000003', null, 'Sequência de poses naturais', 'fashion', array['UGC'],
    'Trocas elegantes de pose sem aparência robótica.',
    'Transicione lentamente entre postura relaxada, mão na cintura, mudança de peso entre as pernas e perfil lateral. Sem poses exageradas ou anatomia artificial.',
    '{"sequence":["postura relaxada","mão na cintura","peso em uma perna","perfil lateral"],"camera":"steady full body","speech":false}'::jsonb,
    array['moda','poses','silhueta']
  ),
  (
    '10000000-0000-4000-8000-000000000004', null, 'Mão cobrindo a lente', 'ugc', array['UGC'],
    'Encerramento físico para transição entre vídeos.',
    'No final, levante uma mão aberta lentamente até a palma preencher todo o quadro. A transição acontece somente pela mão cobrindo fisicamente a lente.',
    '{"ending":"open hand physically covers lens","camera":"smartphone static","digital_transition":false}'::jsonb,
    array['transição','encerramento','lente']
  ),
  (
    '10000000-0000-4000-8000-000000000005', null, 'Começo colado na câmera', 'ugc', array['UGC'],
    'Gancho visual começando em close e recuando para plano médio.',
    'Comece com rosto e ombro ocupando cerca de 90% do quadro e recue naturalmente no eixo Z até um plano médio ou de corpo inteiro. O foco muda da mão próxima para o corpo.',
    '{"frame_0":"extreme close-up","motion_path":"z-axis recession","focus_shift":"near hand to body","camera":"handheld smartphone"}'::jsonb,
    array['gancho','close','recuo']
  ),
  (
    '10000000-0000-4000-8000-000000000006', null, 'Produto perto da câmera', 'product_demo', array['UGC','POV'],
    'Aproximação controlada para mostrar embalagem e rótulo.',
    'Aproxime o produto devagar até o rótulo ficar legível, mantenha por um instante e retorne à posição inicial. Preserve forma, cor, texto e proporções da embalagem.',
    '{"sequence":["produto no peito","aproximação controlada","rótulo visível","retorno"],"focus":"product label"}'::jsonb,
    array['produto','rótulo','close-up']
  ),
  (
    '10000000-0000-4000-8000-000000000007', null, 'Giro do frasco', 'product_demo', array['UGC','POV'],
    'Mostra frente e lateral do frasco sem abrir a embalagem.',
    'Segure o frasco fechado com anatomia correta, gire lentamente para mostrar frente e lateral do rótulo e volte à posição original. Não cubra informações importantes.',
    '{"sequence":["frente do frasco","giro lateral","pausa","retorno"],"container_closed":true}'::jsonb,
    array['frasco','produto','mãos']
  ),
  (
    '10000000-0000-4000-8000-000000000008', null, 'POV abrindo a embalagem', 'pov', array['POV'],
    'Unboxing em primeira pessoa com mãos naturais.',
    'A câmera representa os olhos da pessoa. Duas mãos entram no quadro, mostram a embalagem e iniciam a abertura de forma realista, sem exibir um creator falando para a câmera.',
    '{"camera":"first person eyes","hands":"two natural hands","action":"product unboxing"}'::jsonb,
    array['pov','unboxing','mãos']
  ),
  (
    '10000000-0000-4000-8000-000000000009', null, 'Reação espontânea', 'ugc', array['UGC'],
    'Microexpressão de descoberta ou surpresa natural.',
    'Use uma reação curta e espontânea: sobrancelhas sobem levemente, olhar vai ao produto e retorna à câmera, seguido de um pequeno sorriso. Nada teatral ou exagerado.',
    '{"expression":"subtle discovery","eye_path":"product then camera","ending":"small genuine smile"}'::jsonb,
    array['reação','microexpressão','descoberta']
  ),
  (
    '10000000-0000-4000-8000-000000000010', null, 'Apontar para o carrinho', 'cta', array['UGC','POV'],
    'Gesto final simples e compatível com CTA de compra.',
    'No final da fala, aponte uma vez para baixo com o indicador, mantenha o produto visível e encerre com expressão confiante. Sem texto, setas ou elementos na tela.',
    '{"ending":"single downward point","product_visible":true,"screen":"clean"}'::jsonb,
    array['cta','carrinho','apontar']
  )
on conflict (id) do update set
  name = excluded.name,
  category = excluded.category,
  formats = excluded.formats,
  description = excluded.description,
  prompt_instruction = excluded.prompt_instruction,
  movement_json = excluded.movement_json,
  tags = excluded.tags;

comment on table public.product_library is 'Produtos reutilizáveis e independentes de projeto.';
comment on table public.movement_library is 'Biblioteca de poses e movimentos do sistema e do usuário.';
comment on table public.content_performance is 'Resultados publicados para comparar ganchos, corpos e CTAs.';
