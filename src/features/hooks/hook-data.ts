export interface HookFormula {
  id: string;
  category: "pattern_break" | "secret" | "question" | "transformation" | "critical_error" | "viral_find";
  categoryName: string;
  title: string;
  template: string;
  visualAction: string;
  psychologicalTrigger: string;
  example: string;
  retentionScore: number;
}

export const HOOK_CATEGORIES = [
  { id: "all", name: "Todas as Fórmulas" },
  { id: "pattern_break", name: "⚡ Quebra de Padrão" },
  { id: "secret", name: "🤫 Segredo & Revelação" },
  { id: "question", name: "❓ Pergunta Provocativa" },
  { id: "transformation", name: "✨ Antes vs Depois" },
  { id: "critical_error", name: "⚠️ Alerta de Erro Crítico" },
  { id: "viral_find", name: "🛍️ Achadinho do TikTok" },
] as const;

export const VIRAL_HOOK_FORMULAS: HookFormula[] = [
  // ⚡ Quebra de Padrão
  {
    id: "pb-1",
    category: "pattern_break",
    categoryName: "Quebra de Padrão",
    title: "Parada Brusca com Advertência",
    template: "Para tudo o que você tá fazendo se você usa {PRODUTO}...",
    visualAction: "Bater na câmera com a mão ou fazer sinal de PARE com expressão séria.",
    psychologicalTrigger: "Interrupção de padrão de rolagem (Pattern Interrupt).",
    example: "Para tudo o que você tá fazendo se você usa protetor solar comum no rosto...",
    retentionScore: 98,
  },
  {
    id: "pb-2",
    category: "pattern_break",
    categoryName: "Quebra de Padrão",
    title: "Proibição Inversa",
    template: "Não compra o {PRODUTO} antes de ver esse vídeo até o final!",
    visualAction: "Apontar a garrafa/caixa do produto para a câmera com cara de choque.",
    psychologicalTrigger: "Reatância psicológica e curiosidade pela proibição.",
    example: "Não compra esse sérum de retinol antes de ver essa reação na minha pele!",
    retentionScore: 96,
  },
  {
    id: "pb-3",
    category: "pattern_break",
    categoryName: "Quebra de Padrão",
    title: "Ação Bizarra Fora de Contexto",
    template: "Eu passei {PRODUTO} na minha mão e o que aconteceu em 10 segundos me assustou.",
    visualAction: "Aplicar ou demonstrar o produto em movimento super rápido e aproximar do zoom.",
    psychologicalTrigger: "Expectativa visual e suspense imediato.",
    example: "Eu passei essa base impermeável na água e o que aconteceu me assustou.",
    retentionScore: 94,
  },
  {
    id: "pb-4",
    category: "pattern_break",
    categoryName: "Quebra de Padrão",
    title: "Negação Absurda",
    template: "Eles me disseram que esse {PRODUTO} não funcionava, mas dá uma olhada nisso...",
    visualAction: "Mostrar o produto funcionando enquanto faz cara de deboche cômico.",
    psychologicalTrigger: "Provocação e desejo de ver o teste na prática.",
    example: "Eles me disseram que esse mini aspirador não limpa nada, mas dá uma olhada nisso...",
    retentionScore: 92,
  },
  {
    id: "pb-5",
    category: "pattern_break",
    categoryName: "Quebra de Padrão",
    title: "Confissão Inesperada",
    template: "Eu jurava que era frescura até experimentar o {PRODUTO}...",
    visualAction: "Balançar a cabeça negativamente e depois sorrir mostrando o resultado impecável.",
    psychologicalTrigger: "Identificação com o ceticismo inicial do consumidor.",
    example: "Eu jurava que essa escova secadora era frescura até testar no meu cabelo cacheado...",
    retentionScore: 95,
  },

  // 🤫 Segredo & Revelação
  {
    id: "sec-1",
    category: "secret",
    categoryName: "Segredo & Revelação",
    title: "Segredo da Indústria",
    template: "As marcas de {NICHO} odeiam quando alguém descobre esse {PRODUTO}...",
    visualAction: "Falar em tom de segredo sussurrado perto do microfone com a mão na boca.",
    psychologicalTrigger: "Sensação de exclusividade e vazamento de informação valiosa.",
    example: "As marcas de maquiagem caras odeiam quando alguém descobre esse primer de R$ 30...",
    retentionScore: 97,
  },
  {
    id: "sec-2",
    category: "secret",
    categoryName: "Segredo & Revelação",
    title: "Segredo dos Bastidores do TikTok",
    template: "Se você viu o {PRODUTO} na sua For You hoje, não é coincidência.",
    visualAction: "Mostrar a tela do celular com o produto e depois apontar para o produto físico.",
    psychologicalTrigger: "Validação do algoritmo e viés de confirmação.",
    example: "Se você viu esse corretivo viral na sua For You hoje, não é coincidência...",
    retentionScore: 93,
  },
  {
    id: "sec-3",
    category: "secret",
    categoryName: "Segredo & Revelação",
    title: "O Truque Oculto",
    template: "O truque que ninguém te conta para resolver {DOR} usando apenas {PRODUTO}.",
    visualAction: "Demonstrar um passo a passo em close com iluminação perfeita.",
    psychologicalTrigger: "Busca por atalhos e soluções rápidas.",
    example: "O truque que as gringas usam para acabar com a oleosidade usando essa pedra vulcânica...",
    retentionScore: 91,
  },
  {
    id: "sec-4",
    category: "secret",
    categoryName: "Segredo & Revelação",
    title: "Segredo de Especialista",
    template: "Um dermatologista/especialista me revelou esse segredo para {BENEFÍCIO}...",
    visualAction: "Mostrar frasco do produto sendo aberto com luva ou cenário profissional.",
    psychologicalTrigger: "Autoridade e credibilidade científica implícita.",
    example: "Um cabeleireiro me revelou esse segredo para selar pontas duplas em 3 minutos...",
    retentionScore: 94,
  },

  // ❓ Pergunta Provocativa
  {
    id: "q-1",
    category: "question",
    categoryName: "Pergunta Provocativa",
    title: "Pergunta de Dor Intensa",
    template: "Você ainda sofre com {DOR}? Por que você ainda não testou o {PRODUTO}?",
    visualAction: "Mostrar a dor de forma hiper realista e em seguida a transição para a solução.",
    psychologicalTrigger: "Conscientização imediata do problema.",
    example: "Você ainda sofre com cravos no nariz? Por que você ainda não testou essa espátula ultrassônica?",
    retentionScore: 95,
  },
  {
    id: "q-2",
    category: "question",
    categoryName: "Pergunta Provocativa",
    title: "Teste de Realidade",
    template: "Será que esse {PRODUTO} de R$ {PREÇO} realmente substitui o famoso de R$ {PREÇO_ALTO}?",
    visualAction: "Segurar um produto em cada mão comparando visualmente.",
    psychologicalTrigger: "Comparação de custo-benefício (Value Proposition).",
    example: "Será que esse perfume árabe de R$ 80 realmente fixa mais que o importado de R$ 700?",
    retentionScore: 96,
  },
  {
    id: "q-3",
    category: "question",
    categoryName: "Pergunta Provocativa",
    title: "Provocação de Hábito",
    template: "Quantas vezes você já gastou dinheiro com {CATEGORIA} e se arrependeu?",
    visualAction: "Contar no dedo com expressão frustrada e depois tirar o produto da embalagem.",
    psychologicalTrigger: "Gatilho de dor financeira e busca por redenção.",
    example: "Quantas vezes você já comprou fone sem fio que descarrega em 1 hora?",
    retentionScore: 90,
  },

  // ✨ Antes vs Depois
  {
    id: "trans-1",
    category: "transformation",
    categoryName: "Antes vs Depois",
    title: "Transformação Visual Impactante",
    template: "Olha como estava o meu/minha {ÁREA} antes, e olha como tá agora depois do {PRODUTO}!",
    visualAction: "Split screen ou corte seco rápido exibindo a foto do antes ruim vs o depois incrível.",
    psychologicalTrigger: "Prova de resultado tangível e desejo de transformação.",
    example: "Olha como estava o meu fogão cheio de gordura, e olha como tá agora com essa pasta mágica!",
    retentionScore: 99,
  },
  {
    id: "trans-2",
    category: "transformation",
    categoryName: "Antes vs Depois",
    title: "O Teste Metade a Metade",
    template: "Eu apliquei o {PRODUTO} só desse lado do rosto/casa para você ver a diferença real.",
    visualAction: "Mostrar linha divisória clara com metade tratada e metade sem tratar.",
    psychologicalTrigger: "Contraste visual direto inquestionável.",
    example: "Eu apliquei a base desse lado do rosto e deixei o outro sem nada. Olha essa cobertura!",
    retentionScore: 97,
  },

  // ⚠️ Alerta de Erro Crítico
  {
    id: "err-1",
    category: "critical_error",
    categoryName: "Alerta de Erro Crítico",
    title: "Erro Destrutivo",
    template: "Você tá destruindo seu/sua {ÁREA} fazendo isso todo dia sem usar {PRODUTO}!",
    visualAction: "Fazer gesto forte com as mãos e balançar o dedo em tom de aviso.",
    psychologicalTrigger: "Aversão à perda e medo de errar (FOMO/Fear).",
    example: "Você tá destruindo a barreira da sua pele lavando o rosto com sabonete comum!",
    retentionScore: 96,
  },
  {
    id: "err-2",
    category: "critical_error",
    categoryName: "Alerta de Erro Crítico",
    title: "Desperdício de Dinheiro",
    template: "Você tá jogando dinheiro fora comprando {PRODUTO_ANTIGO} em vez de usar isso aqui.",
    visualAction: "Jogar uma embalagem genérica na lixeira e mostrar o produto viral brilhando.",
    psychologicalTrigger: "Aversão ao desperdício financeiro.",
    example: "Você tá jogando dinheiro fora comprando cápsulas caras de café em vez dessa reutilizável!",
    retentionScore: 94,
  },

  // 🛍️ Achadinho do TikTok
  {
    id: "find-1",
    category: "viral_find",
    categoryName: "Achadinho do TikTok",
    title: "O Achadinho Útil do Mês",
    template: "Esse é disparado o melhor achadinho do TikTok Shop que eu comprei esse ano!",
    visualAction: "Desembalar a caixa do correio correndo e tirar o produto sorrindo.",
    psychologicalTrigger: "Curiosidade de Unboxing e validação social de tendência.",
    example: "Esse é disparado o melhor achadinho de cozinha que eu comprei no TikTok Shop esse ano!",
    retentionScore: 95,
  },
  {
    id: "find-2",
    category: "viral_find",
    categoryName: "Achadinho do TikTok",
    title: "Alerta de Estoque Voltou",
    template: "Gente, FINALMENTE voltou pro estoque do TikTok Shop o {PRODUTO} com desconto!",
    visualAction: "Mostrar a tela do celular clicando no carrinho amarelo piscando.",
    psychologicalTrigger: "Gatilho de extrema escassez e urgência de compra imediata.",
    example: "Gente, finalmente voltou pro estoque o garfo de silicone que tinha esgotado no Brasil inteiro!",
    retentionScore: 98,
  },
];
