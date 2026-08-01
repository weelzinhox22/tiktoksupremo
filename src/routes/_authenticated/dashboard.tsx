import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clapperboard,
  Eye,
  FileVideo2,
  FolderKanban,
  Layers3,
  Loader2,
  Package,
  Play,
  Plus,
  Radar,
  Shuffle,
  Sparkles,
  TrendingUp,
  UserRound,
  WandSparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  listAvatarLibrary,
  listPerformance,
  listProductLibrary,
} from "@/features/libraries/queries";
import { listProjects } from "@/features/projects/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Visão geral — Tik Supremo" }] }),
});

function Dashboard() {
  const { user } = Route.useRouteContext();
  const projectsQuery = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const performanceQuery = useQuery({ queryKey: ["performance"], queryFn: listPerformance });
  const productsQuery = useQuery({ queryKey: ["product-library"], queryFn: listProductLibrary });
  const avatarsQuery = useQuery({
    queryKey: ["avatars", user.id],
    queryFn: () => listAvatarLibrary(user.id),
  });
  const projects = projectsQuery.data ?? [];
  const performance = performanceQuery.data ?? [];
  const completed = projects.filter((project) => project.status === "completed").length;
  const pendingLinks = performance.filter((record) => record.match_status === "pending").length;
  const totalViews = performance.reduce((sum, record) => sum + record.views, 0);
  const bestPublication = [...performance].sort(
    (a, b) =>
      b.views +
      b.likes * 4 +
      b.comments * 8 +
      b.shares * 12 +
      b.orders * 500 -
      (a.views + a.likes * 4 + a.comments * 8 + a.shares * 12 + a.orders * 500),
  )[0];
  const loading =
    projectsQuery.isLoading ||
    performanceQuery.isLoading ||
    productsQuery.isLoading ||
    avatarsQuery.isLoading;

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[55vh] max-w-6xl items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Montando sua central criativa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-12">
      <header className="bento-hero p-6 md:p-8">
        <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="relative z-10">
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              <Sparkles className="mr-1 size-3" /> Seu estúdio está pronto
            </Badge>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-tight md:text-5xl">
              Olá, {user.displayName}. O próximo vídeo vencedor começa aqui.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
              Transforme produtos em roteiros, gere variações realmente diferentes e acompanhe o que
              está performando sem sair do mesmo fluxo.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="feature-pill">
                <CheckCircle2 /> Prompts VEO em JSON
              </span>
              <span className="feature-pill">
                <CheckCircle2 /> Biblioteca reutilizável
              </span>
              <span className="feature-pill">
                <CheckCircle2 /> Desempenho por link
              </span>
            </div>
          </div>
          <div className="relative z-10 flex flex-wrap gap-3">
            <Button variant="outline" size="lg" asChild>
              <Link to="/radar">
                <Radar /> Abrir radar
              </Link>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <Link to="/projects/new">
                <Plus /> Criar roteiro
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Eye} label="Views monitoradas" value={totalViews.toLocaleString("pt-BR")} />
        <StatCard
          icon={FolderKanban}
          label="Projetos"
          value={projects.length}
          detail={`${completed} concluídos`}
        />
        <StatCard
          icon={Package}
          label="Produtos salvos"
          value={productsQuery.data?.length ?? 0}
          detail="prontos para reutilizar"
        />
        <StatCard
          icon={UserRound}
          label="Avatares"
          value={avatarsQuery.data?.length ?? 0}
          detail={pendingLinks ? `${pendingLinks} links pendentes` : "identidade consistente"}
          attention={pendingLinks > 0}
        />
      </section>

      <section className="grid gap-5 lg:grid-cols-12">
        <div className="bento-card bento-card-accent p-5 md:p-6 lg:col-span-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Produção rápida
              </p>
              <h2 className="mt-1 text-xl font-semibold">O que você quer criar agora?</h2>
            </div>
            <WandSparkles className="size-6 text-primary" />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <ActionCard
              to="/projects/new"
              icon={Clapperboard}
              title="Novo roteiro"
              description="Produto, avatar, movimentos e variações modulares."
              accent="primary"
            />
            <ActionCard
              to="/copies"
              icon={FileVideo2}
              title="Transcrever vídeo"
              description="Salve gancho, corpo, CTA e o que deu certo."
              accent="cyan"
            />
            <ActionCard
              to="/video-editor"
              icon={Shuffle}
              title="Combinar vídeos"
              description="Monte e baixe variações em lote num arquivo ZIP."
              accent="pink"
            />
            <ActionCard
              to="/radar"
              icon={Radar}
              title="Encontrar oportunidades"
              description="Compare seus vencedores com sinais virais do TikTok."
              accent="amber"
            />
          </div>
        </div>

        <div className="bento-card interactive-card p-5 md:p-6 lg:col-span-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Melhor sinal atual
              </p>
              <h2 className="mt-1 text-xl font-semibold">Seu criativo líder</h2>
            </div>
            <span className="flex size-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
              <TrendingUp className="size-5" />
            </span>
          </div>
          {bestPublication ? (
            <div className="mt-5">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary/10 text-primary">
                  {bestPublication.projects?.name ?? "Publicação avulsa"}
                </Badge>
                <Badge variant="outline">
                  {bestPublication.views.toLocaleString("pt-BR")} views
                </Badge>
              </div>
              <p className="mt-4 line-clamp-4 text-sm font-medium leading-6">
                {bestPublication.hook_text ||
                  "Este vídeo ainda não foi associado a um gancho do seu banco."}
              </p>
              <div className="mt-5 grid grid-cols-3 gap-2">
                <SmallMetric label="Curtidas" value={bestPublication.likes} />
                <SmallMetric label="Compart." value={bestPublication.shares} />
                <SmallMetric label="Pedidos" value={bestPublication.orders} />
              </div>
              <Button className="mt-5" variant="ghost" asChild>
                <Link to="/performance">
                  Ver análise completa <ArrowRight />
                </Link>
              </Button>
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center">
              <BarChart3 className="mx-auto size-7 text-primary" />
              <p className="mt-3 text-sm font-medium">Seu ranking começa com um link</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Publique um vídeo e cole o endereço na página de desempenho.
              </p>
            </div>
          )}
        </div>

        <div className="bento-card overflow-hidden lg:col-span-8">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Continue de onde parou
              </p>
              <h2 className="mt-1 font-semibold">Projetos recentes</h2>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                Ver todos <ArrowRight />
              </Link>
            </Button>
          </div>
          {projects.length ? (
            <div className="divide-y divide-border">
              {projects.slice(0, 4).map((project) => (
                <Link
                  key={project.id}
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="group flex items-center gap-4 p-4 transition-colors hover:bg-secondary/25 md:px-5"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-105">
                    <Play className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium transition-colors group-hover:text-primary">
                      {project.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {project.products?.[0]?.name ?? "Produto ainda não identificado"}
                    </p>
                  </div>
                  <Badge variant="outline">{project.status}</Badge>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-10 text-center text-sm text-muted-foreground">
              Crie o primeiro projeto para começar sua biblioteca de vencedores.
            </div>
          )}
        </div>

        <div className="bento-card bento-card-accent p-5 md:p-6 lg:col-span-4">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-cyan/10 text-cyan">
              <Layers3 className="size-5" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">Biblioteca criativa</p>
              <h2 className="font-semibold">Tudo conectado</h2>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <LibraryRow label="Produtos" value={productsQuery.data?.length ?? 0} to="/products" />
            <LibraryRow label="Avatares" value={avatarsQuery.data?.length ?? 0} to="/avatars" />
            <LibraryRow label="Publicações" value={performance.length} to="/performance" />
          </div>
          {pendingLinks > 0 && (
            <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-3 text-xs leading-5 text-amber-100/80">
              {pendingLinks} publicação(ões) foi(ram) preservada(s), mas ainda aguardam associação a
              um projeto.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
  attention,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  detail?: string;
  attention?: boolean;
}) {
  return (
    <article className="bento-card interactive-card p-5">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`flex size-10 items-center justify-center rounded-xl ${attention ? "bg-amber-500/10 text-amber-300" : "bg-primary/10 text-primary"}`}
        >
          <Icon className="size-5" />
        </span>
        {detail && <span className="text-[11px] text-muted-foreground">{detail}</span>}
      </div>
      <p className="mt-5 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </article>
  );
}

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
  accent,
}: {
  to: "/projects/new" | "/copies" | "/video-editor" | "/radar";
  icon: LucideIcon;
  title: string;
  description: string;
  accent: "primary" | "cyan" | "pink" | "amber";
}) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    cyan: "bg-cyan/10 text-cyan",
    pink: "bg-pink/10 text-pink",
    amber: "bg-amber-400/10 text-amber-300",
  };
  return (
    <Link
      to={to}
      className="group rounded-2xl border border-border bg-background/25 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-secondary/25"
    >
      <div className="flex items-start justify-between gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl ${accents[accent]}`}>
          <Icon className="size-5" />
        </span>
        <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
      </div>
      <h3 className="mt-4 font-semibold transition-colors group-hover:text-primary">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </Link>
  );
}

function SmallMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-secondary/30 p-3 text-center">
      <p className="font-semibold">{value.toLocaleString("pt-BR")}</p>
      <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function LibraryRow({
  label,
  value,
  to,
}: {
  label: string;
  value: number;
  to: "/products" | "/avatars" | "/performance";
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-border bg-background/25 px-4 py-3 transition-colors hover:border-primary/25 hover:bg-secondary/30"
    >
      <span className="text-sm text-muted-foreground group-hover:text-foreground">{label}</span>
      <span className="font-semibold text-primary">{value}</span>
    </Link>
  );
}
