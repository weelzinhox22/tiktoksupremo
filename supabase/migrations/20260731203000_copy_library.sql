create table if not exists public.copy_library (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_transcription_id uuid unique references public.transcriptions(id) on delete set null,
  title text not null check (char_length(title) between 1 and 180),
  content text not null check (char_length(content) > 0),
  hook text not null default '',
  body text not null default '',
  cta text not null default '',
  analysis jsonb not null default '{}'::jsonb,
  language_style text[] not null default '{}',
  tags text[] not null default '{}',
  source text not null default 'transcription' check (source in ('transcription','manual','seed')),
  created_at timestamptz not null default now()
);

create index if not exists copy_library_user_created_idx
  on public.copy_library(user_id, created_at desc);
create index if not exists copy_library_tags_idx
  on public.copy_library using gin(tags);

alter table public.copy_library enable row level security;
drop policy if exists "copy library readable" on public.copy_library;
drop policy if exists "users create own copy references" on public.copy_library;
drop policy if exists "users update own copy references" on public.copy_library;
drop policy if exists "users delete own copy references" on public.copy_library;
create policy "copy library readable" on public.copy_library
  for select to authenticated
  using (user_id is null or user_id = auth.uid());
create policy "users create own copy references" on public.copy_library
  for insert to authenticated
  with check (user_id = auth.uid());
create policy "users update own copy references" on public.copy_library
  for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "users delete own copy references" on public.copy_library
  for delete to authenticated
  using (user_id = auth.uid());

insert into public.copy_library
  (id, title, content, hook, body, cta, analysis, language_style, tags, source)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'Confronto direto e longevidade',
    $copy1$(0:00) Tá tomando tadala, né? (0:01) Aí depois se o coração brecar, você vai reclamar. (0:03) Ou então não vai nem dar tempo de reclamar, (0:05) porque você já tá, ó, dormindo pra sempre. (0:07) Já vai tá desvivido.
(0:09) E todo homem deveria saber disso, velho. (0:10) É parar de usar porcaria e utilizar suplemento natural. (0:13) Que aí você vai trazer a alegria de sua esposa agora, (0:15) e depois vai trazer tristeza pra ela e pra quem você deixar.
(0:19) Então o melhor que você pode fazer é isso aqui, ó. (0:21) Esse é o segredo da longevidade. (0:23) Você vai conseguir dar uma, dar duas, dar três, dar cinco, (0:25) e não vai ficar desvivido, né? (0:26) Como você pode ver aqui, é o combo com três. (0:28) Feno grego, mais arginina e boro.
(0:31) E pra tu garantir, é só clicar aqui no carrinho (0:33) e finalizar seu pedido.$copy1$,
    'Tá tomando tadala, né? Aí depois se o coração brecar, você vai reclamar.',
    'Confronta o risco percebido, fala com homens em linguagem coloquial, apresenta suplemento natural e demonstra o combo com três ingredientes.',
    'E pra tu garantir, é só clicar aqui no carrinho e finalizar seu pedido.',
    jsonb_build_object('why_it_worked', jsonb_build_array(
      'Interrompe a rolagem com uma pergunta direta e provocativa.',
      'Usa humor sombrio e linguagem popular para intensificar a atenção.',
      'Apela ao desejo de manter o relacionamento e agradar a parceira.',
      'Apresenta visualmente uma solução simples com três ingredientes.',
      'Encerra com uma instrução de compra curta e clara.'
    ), 'safety_note', 'Referência de linguagem. Não reutilizar alegações médicas, riscos cardíacos ou garantias sem comprovação.'),
    array['coloquial','provocativo','direto','humor sombrio','masculino'],
    array['feno grego','arginina','boro','energia','relacionamento'],
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'Rotina natural versus solução pontual',
    $copy2$O Tadalafila funciona, mas você não quer depender dele para sempre? Eu sei. A diferença é que o Tadalafila cobre o momento. O Feno Grego você coloca na rotina. Aqui dentro tem Arginina, Feno Grego e Boro. Quanto mais você usa, mais você sente que não precisa de mais nada. É suplemento natural. O Feno Grego está custando menos de R$30. Clica no carrinho laranja aqui embaixo e garanta logo o seu, porque acaba muito rápido.$copy2$,
    'O Tadalafila funciona, mas você não quer depender dele para sempre? Eu sei.',
    'Contrasta uma solução pontual com uma rotina simples, apresenta os ingredientes, reforça a opção natural e ancora o valor em um preço acessível.',
    'Clica no carrinho laranja aqui embaixo e garanta logo o seu, porque acaba muito rápido.',
    jsonb_build_object('why_it_worked', jsonb_build_array(
      'Aborda diretamente a preocupação com dependência de uma solução pontual.',
      'Apresenta uma alternativa de rotina em linguagem simples.',
      'Mostra a composição do produto para aumentar a percepção de credibilidade.',
      'Usa preço acessível como redução de objeção.',
      'Combina instrução visual de compra com urgência.'
    ), 'safety_note', 'Não afirmar substituição de medicamento, efeito cumulativo ou resultado clínico sem comprovação.'),
    array['coloquial','comparativo','direto','rotina','masculino'],
    array['feno grego','arginina','boro','preço','urgência'],
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'Três dores e solução combinada',
    $copy3$Você que é homem, tá com a testo baixa? Toma o Feno-grego. Tá percebendo que seu amigão lá embaixo tá sempre te deixando na mão? Toma L-arginina. Anda cansado e não tem energia pra nada? Toma... o Boro. Só que se você comprar essas três fórmulas isoladamente, você vai gastar uma nota por mês. Só que depois de muita pesquisa eu encontrei essas três fórmulas agindo em conjunto. E eu escolhi essa marca da Revann porque só aqui no TikTok Shop ela vendeu mais de 26 mil vezes. E esse aqui é um suplemento completo que todo homem deveria tomar. Infelizmente eu não sei se o estoque vai dar conta, porque o preço que tá sendo vendido aqui no TikTok Shop é ridículo. Mas se você tiver com sorte hoje, e ainda estiver aparecendo o carrinho laranja nesse vídeo, é sinal que restou algumas unidades em estoque.$copy3$,
    'Você que é homem, tá com a testo baixa? Tá percebendo que seu amigão lá embaixo tá sempre te deixando na mão? Anda cansado?',
    'Empilha três dores, associa cada uma a um ingrediente, mostra a economia do combo e acrescenta prova social da marca.',
    'Se ainda estiver aparecendo o carrinho laranja, é sinal que restou algumas unidades em estoque.',
    jsonb_build_object('why_it_worked', jsonb_build_array(
      'Nomeia rapidamente problemas reconhecíveis pela audiência masculina.',
      'Transforma uma fórmula complexa em uma sequência fácil de acompanhar.',
      'Compara o custo dos itens separados com a conveniência do combo.',
      'Usa prova social concreta para gerar confiança.',
      'Fecha com escassez e um indicador visual de ação.'
    ), 'safety_note', 'Números de vendas, estoque, preço e benefícios devem vir dos dados reais do produto.'),
    array['coloquial','lista de dores','masculino','prova social','escassez'],
    array['feno grego','arginina','boro','energia','combo'],
    'seed'
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'Desejo do casal e convite emocional',
    $copy4$Hoje ninguém precisa mais ficar sofrendo por falta de vontade de namorar. Esse item serve tanto para o marido quanto para a esposa. E graças ao TikTok Shop, você vai ter aí na sua casa. Estou falando do nosso queridinho, Feno Grego com Arginina e Boro, que melhora muito, muito a nossa energia no dia a dia e o desempenho lá na hora H. Compre e faça sucesso com o seu parceiro que você tanto ama. Vou deixar o link aqui no carrinho laranja para que você também comece a tomar Feno Grego, Arginina e Boro. E depois você volta pra me contar.$copy4$,
    'Hoje ninguém precisa mais ficar sofrendo por falta de vontade de namorar.',
    'Apresenta o produto para o casal, conecta energia e intimidade com o desejo de agradar quem se ama e reforça a facilidade de compra.',
    'Vou deixar o link aqui no carrinho laranja. Depois você volta pra me contar.',
    jsonb_build_object('why_it_worked', jsonb_build_array(
      'Aborda uma dor emocional e relacional de forma simples.',
      'Amplia a identificação ao falar com marido e esposa.',
      'Conecta o produto ao desejo de agradar o parceiro.',
      'Usa linguagem carinhosa e acessível.',
      'O convite para voltar e contar cria proximidade e comunidade.'
    ), 'safety_note', 'Benefícios de saúde e desempenho precisam ser compatíveis com a rotulagem e evidências do produto.'),
    array['emocional','casal','coloquial','carinhoso','comunidade'],
    array['feno grego','arginina','boro','relacionamento','casal'],
    'seed'
  )
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  hook = excluded.hook,
  body = excluded.body,
  cta = excluded.cta,
  analysis = excluded.analysis,
  language_style = excluded.language_style,
  tags = excluded.tags;
