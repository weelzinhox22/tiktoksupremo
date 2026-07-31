import { createFileRoute } from "@tanstack/react-router";
import {
  Sparkles,
  Package,
  FileText,
  Clapperboard,
  ShieldCheck,
  Gauge,
  Radar,
  CalendarDays,
  Wand2,
  Copy,
  ArrowRight,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import heroMockup from "@/assets/hero-mockup.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tik Supremo — Roteiros e vídeos com IA para TikTok Shop" },
      {
        name: "description",
        content:
          "Cadastre seu produto uma vez: o Tik Supremo analisa imagens, modela copies, gera roteiros e prompts para o Google Veo e mostra o que melhorar.",
      },
      { property: "og:title", content: "Tik Supremo — Do produto ao vídeo pronto para vender" },
      {
        property: "og:description",
        content:
          "Central de inteligência artificial para afiliados, criadores e vendedores do TikTok Shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: Package,
    title: "Biblioteca de produtos",
    text: "Cadastre produto, oferta, restrições e imagens uma única vez e reaproveite em todas as gerações.",
  },
  {
    icon: Sparkles,
    title: "Análise de imagens",
    text: "A IA descreve cor, formato, textura e detalhes visíveis — separando o que é confirmado do que é inferência.",
  },
  {
    icon: FileText,
    title: "Modelagem de copies",
    text: "Estude uma copy validada, preserve a lógica de venda e renove vocabulário, ritmo e abordagem.",
  },
  {
    icon: Clapperboard,
    title: "Roteiros e prompts para o Veo",
    text: "Versões divididas em cenas de 8 segundos, com bloco técnico completo em inglês e falas em português.",
  },
  {
    icon: ShieldCheck,
    title: "Validador automático",
    text: "Regras determinísticas mais análise por IA: tela limpa, continuidade, mãos, palavras proibidas e promessas.",
  },
  {
    icon: Gauge,
    title: "Potencial de performance",
    text: "Pontuação de 0 a 100 com pontos fortes, pontos fracos e melhorias prioritárias.",
  },
  {
    icon: Radar,
    title: "Radar de produtos",
    text: "Importe listas e fontes autorizadas para avaliar oportunidades, saturação e ângulos de venda.",
  },
  {
    icon: CalendarDays,
    title: "Calendário de conteúdo",
    text: "Programe gravação, edição, revisão e publicação em uma linha do tempo única.",
  },
];

const flow = [
  { step: "01", title: "Produto", text: "Cadastre e envie as imagens." },
  { step: "02", title: "Copy", text: "Cole a copy validada e analise." },
  { step: "03", title: "Briefing", text: "Responda só o que ainda falta." },
  { step: "04", title: "Roteiros", text: "Gere versões em cenas de 8s." },
  { step: "05", title: "Validação", text: "Corrija e exporte os prompts." },
];

const commands = [
  "Gerar 3 roteiros completos",
  "Criar 10 ganchos",
  "Versão focada no preço",
  "Versão focada na dor",
  "Versão de comparação",
  "Transformar em POV",
  "Transformar em UGC",
  "Deixar a fala mais natural",
  "Encurtar falas para 8 segundos",
  "Gerar prompts para o Veo",
  "Validar roteiro",
  "Corrigir automaticamente",
];

const personas = [
  "Afiliados do TikTok Shop",
  "Criadores de conteúdo",
  "Donos de loja",
  "Gestores de tráfego",
  "Agências e social medias",
  "Quem gera vídeos no Google Veo",
];

const plans = [
  {
    name: "Gratuito",
    price: "R$ 0",
    desc: "Para testar o fluxo completo.",
    items: ["1 produto", "Análise de copy", "1 projeto por mês", "Exportação em texto"],
  },
  {
    name: "Criador",
    price: "R$ 97",
    desc: "Para quem publica toda semana.",
    items: ["20 produtos", "Roteiros ilimitados*", "Validador completo", "Presets personalizados"],
    highlight: true,
  },
  {
    name: "Profissional",
    price: "R$ 197",
    desc: "Para operações com volume.",
    items: ["Produtos ilimitados", "Radar de produtos", "Biblioteca de vídeos", "Calendário"],
  },
  {
    name: "Agência",
    price: "Sob consulta",
    desc: "Para times e múltiplos clientes",
    items: ["Vários workspaces", "Papéis e permissões", "Integrações oficiais", "Suporte dedicado"],
  },
];

const faqs = [
  {
    q: "O Tik Supremo copia a copy que eu enviar?",
    a: "Não. A IA preserva a lógica de venda, a dor e a estrutura persuasiva, mas renova vocabulário, ritmo, ordem das ideias, abertura e fechamento.",
  },
  {
    q: "A IA pode inventar características do produto?",
    a: "Não. O motor usa apenas dados confirmados por você ou claramente visíveis nas imagens. Inferências ficam sinalizadas e precisam da sua confirmação.",
  },
  {
    q: "Preciso ter acesso ao Google Veo?",
    a: "Não. Você pode copiar os prompts prontos e usar onde preferir. Com a integração configurada, a geração acontece dentro da plataforma.",
  },
  {
    q: "A pontuação garante que o vídeo vai viralizar?",
    a: "Não. A pontuação é uma estimativa baseada na estrutura do conteúdo. Resultados reais dependem do produto, conta, audiência, distribuição, oferta, preço e execução.",
  },
  {
    q: "Meus dados ficam isolados?",
    a: "Sim. Cada workspace acessa apenas os próprios dados, com regras de acesso aplicadas no banco e chaves mantidas somente no backend.",
  },
];

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div className="aurora" aria-hidden="true" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5">
        <a href="#topo" className="flex items-center gap-2">
          <span className="bg-gradient-supremo flex size-9 items-center justify-center rounded-xl">
            <Sparkles className="size-4 text-primary-foreground" />
          </span>
          <span className="font-display text-lg font-bold">Tik Supremo</span>
        </a>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#funcionalidades" className="transition-colors hover:text-foreground">
            Funcionalidades
          </a>
          <a href="#como-funciona" className="transition-colors hover:text-foreground">
            Como funciona
          </a>
          <a href="#planos" className="transition-colors hover:text-foreground">
            Planos
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            Perguntas
          </a>
        </nav>
        <Button variant="hero" size="sm" asChild>
          <a href="#planos">Começar</a>
        </Button>
      </header>

      <main id="topo" className="relative z-10">
        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-10 pb-16 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            <div>
              <Badge className="mb-5 border-border bg-accent/60 text-accent-foreground">
                Do produto ao vídeo pronto para vender
              </Badge>
              <h1 className="text-4xl leading-[1.05] font-bold md:text-6xl">
                Crie roteiros e vídeos para TikTok Shop{" "}
                <span className="text-gradient-supremo">sem começar do zero</span> toda vez.
              </h1>
              <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
                Cadastre seu produto uma vez. O Tik Supremo analisa, modela copies, gera roteiros,
                cria prompts para o Veo e mostra exatamente o que pode melhorar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button variant="hero" size="xl" asChild>
                  <a href="#planos">
                    Começar gratuitamente <ArrowRight />
                  </a>
                </Button>
                <Button variant="soft" size="xl" asChild>
                  <a href="#como-funciona">Ver como funciona</a>
                </Button>
              </div>
              <p className="mt-5 text-xs text-muted-foreground">
                Interface em português. Sem chaves de IA expostas no navegador.
              </p>
            </div>

            <div className="surface-card glow-primary overflow-hidden p-2">
              <img
                src={heroMockup}
                alt="Painel do Tik Supremo mostrando projetos, roteiros e métricas em tela escura"
                width={1408}
                height={1008}
                className="w-full rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Fluxo */}
        <section id="como-funciona" className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Um fluxo, cinco etapas</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cada etapa aproveita o que já foi preenchido antes. Você nunca responde a mesma pergunta
            duas vezes.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {flow.map((f) => (
              <div key={f.step} className="surface-card p-5">
                <span className="font-mono text-xs text-cyan">{f.step}</span>
                <h3 className="mt-3 text-lg font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Funcionalidades */}
        <section id="funcionalidades" className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Principais funcionalidades</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="surface-card p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <span className="bg-accent/70 mb-4 flex size-10 items-center justify-center rounded-xl">
                  <f.icon className="size-5 text-primary" />
                </span>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Antes e depois */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Antes e depois</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="surface-card p-7">
              <h3 className="text-sm tracking-widest text-muted-foreground uppercase">Antes</h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {[
                  "Reescrever o mesmo briefing em cada vídeo",
                  "Prompts improvisados que mudam o produto",
                  "Cenas com duração desalinhada",
                  "Textos e legendas aparecendo na tela",
                  "Nenhum critério para saber o que melhorar",
                ].map((i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-muted-foreground" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
            <div className="surface-card glow-primary p-7">
              <h3 className="text-sm tracking-widest text-primary uppercase">Depois</h3>
              <ul className="mt-4 space-y-3 text-sm">
                {[
                  "Briefing inteligente que pergunta só o que falta",
                  "Prompts que preservam cor, textura e caimento",
                  "Cenas de exatamente 8 segundos",
                  "Bloco de tela limpa e negative prompt completos",
                  "Pontuação com melhorias prioritárias",
                ].map((i) => (
                  <li key={i} className="flex gap-3">
                    <Check className="mt-0.5 size-4 shrink-0 text-cyan" />
                    {i}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Comandos */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="flex items-center gap-3">
            <Wand2 className="size-5 text-pink" />
            <h2 className="text-2xl font-bold md:text-4xl">Comandos de um clique</h2>
          </div>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Cada comando usa os dados do produto, da copy e do projeto — sem colar prompt nenhum.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {commands.map((c) => (
              <span
                key={c}
                className="surface-card flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground"
              >
                <Copy className="size-3.5 text-primary" />
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Público */}
        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Para quem é</h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {personas.map((p) => (
              <div key={p} className="surface-card px-5 py-4 text-sm">
                {p}
              </div>
            ))}
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="mx-auto w-full max-w-6xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Planos</h2>
          <p className="mt-3 text-muted-foreground">
            Valores de referência. A cobrança será ativada em uma etapa futura.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`surface-card flex flex-col p-6 ${p.highlight ? "glow-primary" : ""}`}
              >
                {p.highlight && (
                  <Badge className="bg-gradient-supremo mb-3 w-fit text-primary-foreground">
                    Mais escolhido
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <p className="font-display mt-4 text-3xl font-bold">{p.price}</p>
                <ul className="mt-5 flex-1 space-y-2 text-sm text-muted-foreground">
                  {p.items.map((i) => (
                    <li key={i} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-cyan" />
                      {i}
                    </li>
                  ))}
                </ul>
                <Button variant={p.highlight ? "hero" : "soft"} className="mt-6 w-full" disabled>
                  Em breve
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto w-full max-w-3xl px-5 py-16">
          <h2 className="text-2xl font-bold md:text-4xl">Perguntas frequentes</h2>
          <Accordion type="single" collapsible className="mt-8">
            {faqs.map((f) => (
              <AccordionItem key={f.q} value={f.q}>
                <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        {/* CTA final */}
        <section className="mx-auto w-full max-w-6xl px-5 pt-8 pb-24">
          <div className="surface-card glow-primary p-10 text-center md:p-16">
            <h2 className="text-3xl font-bold md:text-5xl">
              Do produto ao <span className="text-gradient-supremo">vídeo pronto para vender</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Cadastre seu produto, cole a copy que já funciona e receba roteiros prontos para
              gravar ou gerar no Veo.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button variant="hero" size="xl" asChild>
                <a href="#planos">
                  Começar gratuitamente <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border px-5 py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
          <span>Tik Supremo — inteligência artificial para TikTok Shop.</span>
          <span>Feito no Brasil.</span>
        </div>
      </footer>
    </div>
  );
}
