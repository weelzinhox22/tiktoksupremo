import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Clapperboard,
  CheckCircle2,
  Plus,
  FolderKanban,
  Loader2,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listProjects } from "@/features/projects/queries";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Visão geral — Tik Supremo" }] }),
});
function Dashboard() {
  const { user } = Route.useRouteContext();
  const query = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const projects = query.data ?? [];
  const completed = projects.filter((p) => p.status === "completed").length;
  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 pb-10">
      <header>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Visão geral
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Olá, {user.displayName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Crie projetos reais com produto, referência, análise, roteiro por cenas e prompts Veo
          persistidos no Supabase.
        </p>
      </header>
      <section className="grid overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border">
        <Stat icon={FolderKanban} label="Projetos" value={projects.length} />
        <Stat
          icon={Package}
          label="Produtos cadastrados"
          value={projects.filter((p) => p.products?.length).length}
        />
        <Stat icon={CheckCircle2} label="Projetos concluídos" value={completed} />
      </section>
      <section className="surface-card flex flex-col items-start justify-between gap-5 p-6 md:flex-row md:items-center md:p-7">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Criar um novo roteiro</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre o produto, envie uma referência e gere a primeira versão.
          </p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/projects/new">
            <Plus />
            Começar agora
          </Link>
        </Button>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Projetos recentes</h2>
          <Button variant="ghost" asChild>
            <Link to="/projects">
              Ver todos
              <ArrowRight />
            </Link>
          </Button>
        </div>
        {query.isLoading ? (
          <div className="surface-card flex justify-center p-12">
            <Loader2 className="animate-spin text-primary" />
          </div>
        ) : query.error ? (
          <div className="surface-card p-5 text-destructive">{query.error.message}</div>
        ) : projects.length === 0 ? (
          <div className="surface-card p-10 text-center text-sm text-muted-foreground">
            Nenhum dado fictício: seus projetos aparecerão aqui depois de salvos.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {projects.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                to="/projects/$projectId"
                params={{ projectId: p.id }}
                className="surface-card p-5 transition-colors hover:border-primary/30 hover:bg-secondary/25"
              >
                <div className="flex justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{p.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{p.products?.[0]?.name}</p>
                  </div>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="rounded-xl border border-border bg-secondary/20 p-5">
        <div className="flex gap-3">
          <Clapperboard className="text-primary" />
          <div>
            <h2 className="font-semibold">IA sem simulação</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Se a chave do provedor não estiver configurada, você verá o erro real e poderá tentar
              novamente depois, preservando o projeto.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex size-10 items-center justify-center rounded-lg border border-border bg-secondary/50">
        <Icon className="size-5 text-primary" />
      </span>
      <div>
        <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
