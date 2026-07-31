import { createFileRoute } from "@tanstack/react-router";
import {
  Package,
  Clapperboard,
  Video,
  CheckCircle2,
  Gauge,
  AlertTriangle,
  CalendarClock,
  Plus,
  Sparkles,
  FileText,
  Wand2,
  ShieldCheck,
  Radar,
  Lightbulb,
  FolderKanban,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Visão geral — Tik Supremo" },
      {
        name: "description",
        content:
          "Acompanhe produtos, roteiros, projetos e potencial de performance da sua operação no TikTok Shop.",
      },
      { property: "og:title", content: "Visão geral — Tik Supremo" },
      {
        property: "og:description",
        content: "Painel de produtos, roteiros e projetos do TikTok Shop.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Produtos cadastrados", value: 0, icon: Package },
  { label: "Roteiros criados", value: 0, icon: Clapperboard },
  { label: "Vídeos em produção", value: 0, icon: Video },
  { label: "Projetos concluídos", value: 0, icon: CheckCircle2 },
  { label: "Média de potencial", value: "—", icon: Gauge },
  { label: "Roteiros a corrigir", value: 0, icon: AlertTriangle },
];

const quickActions = [
  { label: "Novo produto", icon: Plus },
  { label: "Analisar produto", icon: Sparkles },
  { label: "Modelar copy", icon: FileText },
  { label: "Gerar roteiro", icon: Clapperboard },
  { label: "Criar ganchos", icon: Wand2 },
  { label: "Validar roteiro", icon: ShieldCheck },
  { label: "Criar prompts para Veo", icon: Video },
  { label: "Pesquisar oportunidades", icon: Radar },
];

function EmptyState({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Package;
  title: string;
  text: string;
}) {
  return (
    <div className="surface-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="bg-accent/60 flex size-12 items-center justify-center rounded-2xl">
        <Icon className="size-5 text-primary" />
      </span>
      <h3 className="text-base font-semibold">{title}</h3>
      <p className="max-w-md text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function Dashboard() {
  const { user } = Route.useRouteContext();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      <header>
        <p className="text-sm text-muted-foreground">{user.brand}</p>
        <h1 className="mt-1 text-2xl font-bold md:text-3xl">Olá, {user.fullName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Sua central de inteligência artificial para encontrar produtos, modelar copies, criar
          roteiros e gerar vídeos que vendem no TikTok Shop.
        </p>
      </header>

      <section aria-label="Indicadores">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="surface-card flex items-center gap-4 p-5">
              <span className="bg-accent/60 flex size-11 items-center justify-center rounded-xl">
                <s.icon className="size-5 text-primary" />
              </span>
              <div>
                <p className="font-display text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section aria-label="Ações rápidas">
        <h2 className="text-lg font-semibold">Ações rápidas</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((a) => (
            <Button
              key={a.label}
              variant="soft"
              className="h-auto justify-start gap-3 px-4 py-4 text-left"
              disabled
              title="Disponível quando o backend for ativado"
            >
              <a.icon className="text-primary" />
              <span className="flex-1 text-sm">{a.label}</span>
            </Button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          As ações são liberadas junto com o banco de dados e as funções de IA.
        </p>
      </section>

      <section aria-label="Projetos recentes" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projetos recentes</h2>
          <Badge className="bg-accent/70 text-accent-foreground">0 projetos</Badge>
        </div>
        <EmptyState
          icon={FolderKanban}
          title="Nenhum projeto ainda"
          text="Cadastre um produto, associe uma copy validada e gere sua primeira leva de roteiros para ver os projetos aqui."
        />
      </section>

      <section aria-label="Sugestões da IA" className="space-y-4">
        <h2 className="text-lg font-semibold">Sugestões da IA</h2>
        <EmptyState
          icon={Lightbulb}
          title="Sem sugestões por enquanto"
          text="As sugestões aparecem a partir das análises reais dos seus produtos, copies e roteiros. Nada aqui é preenchido com dados fictícios."
        />
      </section>

      <section aria-label="Próximos conteúdos" className="space-y-4">
        <h2 className="text-lg font-semibold">Próximos conteúdos programados</h2>
        <EmptyState
          icon={CalendarClock}
          title="Agenda vazia"
          text="Programe gravação, edição, revisão e publicação no calendário para acompanhar os próximos conteúdos."
        />
      </section>
    </div>
  );
}
