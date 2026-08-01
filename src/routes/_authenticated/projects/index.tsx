import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Loader2,
  Plus,
  ArrowRight,
  Search,
  Sparkles,
  Package,
  Clock,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { listProjects } from "@/features/projects/queries";

export const Route = createFileRoute("/_authenticated/projects/")({
  component: ProjectsPage,
  head: () => ({ meta: [{ title: "Seus Projetos — Tik Supremo" }] }),
});

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "outline" | "secondary" | "destructive";
    icon: typeof CheckCircle2;
    className: string;
  }
> = {
  completed: {
    label: "Concluído",
    variant: "default",
    icon: CheckCircle2,
    className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  generating: {
    label: "Gerando...",
    variant: "secondary",
    icon: Loader2,
    className: "bg-primary/10 text-primary border-primary/20 animate-pulse",
  },
  analyzing: {
    label: "Analisando...",
    variant: "secondary",
    icon: Loader2,
    className: "bg-cyan/10 text-cyan border-cyan/20 animate-pulse",
  },
  draft: {
    label: "Rascunho",
    variant: "outline",
    icon: Clock3,
    className: "bg-muted/30 text-muted-foreground border-border",
  },
  failed: {
    label: "Erro",
    variant: "destructive",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

function ProjectsPage() {
  const query = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const projects = query.data ?? [];

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.products?.[0]?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "completed"
          ? p.status === "completed"
          : p.status !== "completed";
    return matchesSearch && matchesStatus;
  });

  const completedCount = projects.filter((p) => p.status === "completed").length;
  const totalGenerations = projects.reduce(
    (acc, p) => acc + (p.script_generations?.length ?? 1),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-7 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              <Sparkles className="size-3.5" /> Biblioteca de Roteiros
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Seus Projetos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerencie, visualize e gere novas versões dos seus roteiros de alta conversão.
          </p>
        </div>
        <Button variant="hero" size="lg" asChild>
          <Link to="/projects/new">
            <Plus className="mr-1 size-5" />
            Novo Roteiro
          </Link>
        </Button>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-card sm:grid-cols-3 sm:divide-x sm:divide-border">
        <div className="flex items-center gap-3 p-4">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
            <FolderKanban className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total de Projetos</p>
            <p className="text-lg font-bold text-foreground">{projects.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-l border-border p-4 sm:border-l-0">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-emerald-400">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Roteiros Concluídos</p>
            <p className="text-lg font-bold text-foreground">{completedCount}</p>
          </div>
        </div>
        <div className="col-span-2 flex items-center gap-3 border-t border-border p-4 sm:col-span-1 sm:border-t-0">
          <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-secondary/50 text-primary">
            <Layers className="size-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Versões Geradas</p>
            <p className="text-lg font-bold text-foreground">{totalGenerations}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por projeto ou produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-border/80 bg-secondary/30 pl-10 text-sm focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={statusFilter === "all" ? "default" : "outline"}
            onClick={() => setStatusFilter("all")}
            className="text-xs"
          >
            Todos ({projects.length})
          </Button>
          <Button
            size="sm"
            variant={statusFilter === "completed" ? "default" : "outline"}
            onClick={() => setStatusFilter("completed")}
            className="text-xs"
          >
            Concluídos ({completedCount})
          </Button>
        </div>
      </div>

      {/* Content Section */}
      {query.isLoading ? (
        <div className="surface-card flex flex-col items-center justify-center p-16 text-center">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted-foreground">Carregando seus projetos...</p>
        </div>
      ) : query.error ? (
        <div className="surface-card border-destructive/50 p-6 text-destructive">
          <p className="font-semibold">Erro ao carregar projetos</p>
          <p className="mt-1 text-sm text-muted-foreground">{query.error.message}</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="surface-card flex flex-col items-center justify-center gap-4 p-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border border-border bg-secondary/50 text-primary">
            <FolderKanban className="size-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {searchTerm ? "Nenhum projeto encontrado" : "Nenhum projeto criado ainda"}
            </h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {searchTerm
                ? "Tente buscar com outros termos ou limpe o filtro."
                : "Crie seu primeiro projeto para gerar roteiros persuasivos para o TikTok Shop."}
            </p>
          </div>
          {!searchTerm && (
            <Button variant="hero" size="sm" asChild className="mt-2">
              <Link to="/projects/new">
                <Plus className="mr-1 size-4" /> Criar Roteiro Agora
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredProjects.map((project) => {
            const statusInfo = statusConfig[project.status] ?? {
              label: project.status,
              variant: "outline" as const,
              icon: Clock3,
              className: "bg-muted/30 text-muted-foreground",
            };
            const StatusIcon = statusInfo.icon;
            const product = project.products?.[0];
            const versionCount = project.script_generations?.length ?? 1;

            return (
              <Link
                key={project.id}
                to="/projects/$projectId"
                params={{ projectId: project.id }}
                className="bento-card interactive-card group relative flex flex-col justify-between overflow-hidden p-6"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary">
                        {project.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Package className="size-3.5 text-muted-foreground" />
                        <span className="font-medium text-foreground/80">
                          {product?.name ?? "Produto sem nome"}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 border ${statusInfo.className}`}
                    >
                      <StatusIcon
                        className={`size-3.5 ${project.status === "generating" || project.status === "analyzing" ? "animate-spin" : ""}`}
                      />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-border/60 pt-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary/50 px-2 py-1 text-foreground/80 font-medium">
                      <Layers className="size-3 text-muted-foreground" />
                      {versionCount} {versionCount === 1 ? "versão" : "versões"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {new Date(project.updated_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                      })}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 font-semibold text-primary transition-transform duration-200 group-hover:translate-x-1">
                    Ver Roteiro <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
