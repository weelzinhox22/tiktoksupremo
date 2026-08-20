import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clapperboard,
  FolderKanban,
  Film,
  Flame,
  Sparkles,
  LogOut,
  Menu,
  Mic,
  Plus,
  FileCheck2,
  FileText,
  Shuffle,
  UserRound,
  Package,
  PersonStanding,
  BarChart3,
  Radar,
  Video,
  ShieldCheck,
  Download,
  Wand2,
  Building2,
  FlaskConical,
  Zap,
  Scissors,
  ChevronsLeft,
  ChevronsRight,
  Minimize2,
  Maximize2,
  Factory,
  Bot,
  Settings,
  Wrench,
  Radio,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { signOut } from "@/features/auth/auth";
import type { AppUser } from "@/lib/supabase/types";

const navGroups = [
  {
    title: "Principal",
    items: [
      { label: "Visão geral", icon: LayoutDashboard, to: "/dashboard" as const },
      { label: "Rastreador de Vendas", icon: TrendingUp, to: "/creative-tracker" as const },
      { label: "Fábrica diária", icon: Factory, to: "/daily-studio" as const },
      { label: "Agente de produção", icon: Bot, to: "/production-agent" as const },
      { label: "Meus Projetos", icon: FolderKanban, to: "/projects" as const },
    ],
  },
  {
    title: "Criação & Roteiro",
    items: [
      { label: "Criar roteiro", icon: Clapperboard, to: "/projects/new" as const },
      { label: "Scripts de Live IA", icon: Radio, to: "/live-scripts" as const },
      { label: "Estúdio de Ganchos", icon: Zap, to: "/hook-studio" as const },
      { label: "Modelador de Copy", icon: Wand2, to: "/copy-modeler" as const },
    ],
  },
  {
    title: "Download & Transcrição",
    items: [
      { label: "Baixar do TikTok", icon: Download, to: "/tiktok-downloader" as const },
      { label: "Transcrever por Link", icon: FileText, to: "/video-transcriber" as const },
      { label: "Transcrever Arquivo", icon: FileCheck2, to: "/copies" as const },
    ],
  },
  {
    title: "Ativos & Prompts",
    items: [
      { label: "Biblioteca de Prompts", icon: PersonStanding, to: "/movements" as const },
      { label: "Personagens & Avatares", icon: UserRound, to: "/characters" as const },
      { label: "Biblioteca de Cenários", icon: Building2, to: "/scenarios" as const },
      { label: "Produtos", icon: Package, to: "/products" as const },
    ],
  },
  {
    title: "Estúdio IA & Ferramentas",
    items: [
      { label: "Gerador de Vídeo IA", icon: Sparkles, to: "/ai-video-generator" as const },
      { label: "Estúdio de Voz IA", icon: Mic, to: "/voice-studio" as const },
      { label: "Outras Ferramentas", icon: Wrench, to: "/tools" as const },
    ],
  },
];

function NavList({
  isCollapsed,
  onNavigate,
  isAdmin,
}: {
  isCollapsed?: boolean;
  onNavigate?: () => void;
  isAdmin?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="space-y-4">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 select-none">
              {group.title}
            </div>
          ) : (
            <div className="my-1.5 border-t border-sidebar-border/40 mx-2" aria-hidden="true" />
          )}
          <nav className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active =
                pathname === item.to ||
                (item.to === "/projects" &&
                  pathname.startsWith("/projects/") &&
                  pathname !== "/projects/new") ||
                (item.to === "/tools" &&
                  [
                    "/tools",
                    "/tiktok-downloader",
                    "/video-transcriber",
                    "/copies",
                    "/watermark-remover",
                    "/metadata-cleaner",
                    "/video-combiner",
                    "/video-editor",
                    "/auto-clips",
                    "/radar",
                    "/viral-audit",
                    "/creative-lab",
                    "/performance",
                  ].includes(pathname));

              const linkContent = (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onNavigate}
                  className={`group relative flex items-center ${
                    isCollapsed ? "justify-center px-0 py-2" : "gap-2.5 px-2.5 py-2"
                  } rounded-lg text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-gradient-to-r from-primary/18 to-cyan/8 text-sidebar-accent-foreground font-semibold shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:translate-x-0.5 hover:bg-sidebar-accent/60 hover:text-foreground"
                  }`}
                >
                  {active && (
                    <span
                      className={`absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-primary ${
                        isCollapsed ? "left-0" : ""
                      }`}
                    />
                  )}
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md transition-colors ${
                      active
                        ? "bg-primary/20 text-primary"
                        : "bg-white/[0.03] group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <item.icon className="size-3.5" />
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.label} delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium text-xs">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </nav>
        </div>
      ))}
      {isAdmin && (
        <div className="space-y-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
              Administração
            </div>
          ) : (
            <div className="mx-2 my-1.5 border-t border-sidebar-border/40" />
          )}
          <Link
            to="/admin/video-providers"
            onClick={onNavigate}
            className={`group flex items-center rounded-lg py-2 text-xs font-medium text-muted-foreground transition hover:bg-sidebar-accent/60 hover:text-foreground ${isCollapsed ? "justify-center px-0" : "gap-2.5 px-2.5"}`}
          >
            <span className="flex size-6 items-center justify-center rounded-md bg-violet-500/10 text-violet-300">
              <Settings className="size-3.5" />
            </span>
            {!isCollapsed && <span>Provedores de vídeo</span>}
          </Link>
        </div>
      )}
    </div>
  );
}

function Brand({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2.5"} px-1`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-cyan/15 shadow-lg shadow-primary/10 ring-1 ring-primary/25">
        <Sparkles className="size-4 text-primary" />
      </span>
      {!isCollapsed && (
        <div className="leading-tight truncate">
          <p className="font-display text-sm font-semibold tracking-tight">Tik Supremo</p>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Studio</p>
        </div>
      )}
    </div>
  );
}

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });
  const [compactMode, setCompactMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ui_compact_mode") === "true";
    }
    return false;
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  const toggleCompactMode = () => {
    setCompactMode((prev) => {
      const next = !prev;
      localStorage.setItem("ui_compact_mode", String(next));
      return next;
    });
  };

  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/login", replace: true });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={`relative min-h-screen bg-background ${compactMode ? "compact-mode" : ""}`}>
        <div className="aurora opacity-40" aria-hidden="true" />
        <aside
          className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-sidebar-border bg-sidebar/95 shadow-2xl shadow-black/20 backdrop-blur-xl transition-all duration-300 ease-in-out lg:flex ${
            isCollapsed ? "w-16" : "w-64"
          }`}
        >
          <div
            className={`flex h-16 shrink-0 items-center ${
              isCollapsed ? "justify-center px-1" : "justify-between px-4"
            } border-b border-sidebar-border/50`}
          >
            <Brand isCollapsed={isCollapsed} />
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Recolher menu lateral"
              >
                <ChevronsLeft className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 py-4 space-y-5">
            <NavList isCollapsed={isCollapsed} isAdmin={user.isAdmin} />
          </div>

          <div className="shrink-0 border-t border-sidebar-border p-3 bg-sidebar/50">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <span className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold text-foreground">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p className="font-semibold">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="min-w-0 pr-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Sessão protegida
                </p>
                <p className="mt-0.5 truncate text-xs text-foreground/90 font-medium">
                  {user.email}
                </p>
              </div>
            )}
          </div>
        </aside>

        <div
          className={`relative z-10 transition-all duration-300 ease-in-out ${
            isCollapsed ? "lg:pl-16" : "lg:pl-64"
          }`}
        >
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur-xl md:px-8 shadow-sm">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-72 bg-sidebar p-0">
                <SheetTitle className="sr-only">Menu principal</SheetTitle>
                <div className="flex h-16 shrink-0 items-center px-4 border-b border-sidebar-border/50">
                  <Brand />
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                  <NavList onNavigate={() => setMobileOpen(false)} isAdmin={user.isAdmin} />
                </div>
                <div className="shrink-0 border-t border-sidebar-border p-4 bg-sidebar/50">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Sessão protegida
                  </p>
                  <p className="mt-0.5 truncate text-xs text-foreground/90 font-medium">
                    {user.email}
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="hidden lg:flex text-muted-foreground hover:text-foreground"
              aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
              title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {isCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </Button>

            <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground sm:block">
              Content workspace
            </p>

            <div className="ml-auto flex items-center gap-2">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCompactMode}
                    className={`gap-1.5 text-xs ${compactMode ? "bg-primary/15 border-primary/30 text-primary" : "text-muted-foreground"}`}
                  >
                    {compactMode ? (
                      <Maximize2 className="size-3.5" />
                    ) : (
                      <Minimize2 className="size-3.5" />
                    )}
                    <span className="hidden sm:inline">
                      {compactMode ? "Tamanho normal" : "Reduzir tela"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {compactMode
                    ? "Restaurar tamanho normal da interface"
                    : "Reduzir escala da tela (Visão compacta)"}
                </TooltipContent>
              </Tooltip>

              <Button variant="hero" size="sm" onClick={() => navigate({ to: "/projects/new" })}>
                <Plus />
                <span className="hidden sm:inline">Novo projeto</span>
              </Button>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-secondary text-xs font-semibold text-foreground">
                {user.displayName.slice(0, 2).toUpperCase()}
              </span>
              <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
                <LogOut />
              </Button>
            </div>
          </header>

          <main className="px-4 py-7 md:px-8 md:py-10">{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
