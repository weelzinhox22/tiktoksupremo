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
      { label: "Meus Projetos", icon: FolderKanban, to: "/projects" as const },
      { label: "Biblioteca de Prompts", icon: PersonStanding, to: "/movements" as const },
    ],
  },
  {
    title: "Ativos do Estúdio",
    items: [
      { label: "Personagens & Avatares", icon: UserRound, to: "/characters" as const },
      { label: "Biblioteca de Cenários", icon: Building2, to: "/scenarios" as const },
      { label: "Produtos", icon: Package, to: "/products" as const },
    ],
  },
  {
    title: "Criação & Roteiro",
    items: [
      { label: "Criar roteiro", icon: Clapperboard, to: "/projects/new" as const },
      { label: "Roteiros para Upar Conta", icon: Flame, to: "/follower-growth" as const },
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
    title: "Estúdio IA & Ferramentas",
    items: [
      { label: "Editor de Vídeos", icon: Scissors, to: "/video-editor" as const },
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
            <div className="px-3 pt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666A78] select-none">
              {group.title}
            </div>
          ) : (
            <div className="my-2 border-t border-white/[0.06] mx-2" aria-hidden="true" />
          )}
          <nav className="flex flex-col gap-0.5">
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
                    isCollapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2"
                  } rounded-xl text-xs font-medium transition-all duration-150 ${
                    active
                      ? "bg-[#9B7CFF]/12 text-[#F7F7FB] font-semibold border border-[#9B7CFF]/25 shadow-sm shadow-[#9B7CFF]/5"
                      : "text-[#A3A6B3] hover:text-[#F7F7FB] hover:bg-white/[0.04]"
                  }`}
                >
                  {active && (
                    <span
                      className={`absolute left-0 inset-y-1.5 w-1 rounded-r-full bg-[#9B7CFF] shadow-[0_0_8px_#9B7CFF] ${
                        isCollapsed ? "left-0" : ""
                      }`}
                    />
                  )}
                  <span
                    className={`flex size-6 shrink-0 items-center justify-center rounded-lg transition-colors ${
                      active
                        ? "bg-[#9B7CFF]/20 text-[#9B7CFF]"
                        : "bg-white/[0.03] text-[#A3A6B3] group-hover:bg-[#9B7CFF]/10 group-hover:text-[#9B7CFF]"
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
                    <TooltipContent side="right" className="font-medium text-xs bg-[#101119] border-white/10 text-white">
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
        <div className="space-y-1 pt-1">
          {!isCollapsed ? (
            <div className="px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#666A78]">
              Administração
            </div>
          ) : (
            <div className="mx-2 my-2 border-t border-white/[0.06]" />
          )}
          <Link
            to="/admin/video-providers"
            onClick={onNavigate}
            className={`group flex items-center rounded-xl py-2 text-xs font-medium text-[#A3A6B3] transition hover:bg-white/[0.04] hover:text-[#F7F7FB] ${isCollapsed ? "justify-center px-0" : "gap-3 px-3"}`}
          >
            <span className="flex size-6 items-center justify-center rounded-lg bg-white/[0.03] text-[#A3A6B3] group-hover:bg-[#9B7CFF]/10 group-hover:text-[#9B7CFF]">
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
    <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} px-1`}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#9B7CFF]/25 to-[#7C5CFC]/15 shadow-md shadow-[#9B7CFF]/15 border border-[#9B7CFF]/30 text-[#9B7CFF]">
        <Sparkles className="size-4" />
      </span>
      {!isCollapsed && (
        <div className="leading-tight truncate">
          <div className="flex items-center gap-1.5">
            <p className="font-display text-sm font-bold tracking-tight text-[#F7F7FB]">Tik Supremo</p>
            <span className="rounded-md bg-[#9B7CFF]/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-[#9B7CFF] border border-[#9B7CFF]/20">
              Studio
            </span>
          </div>
          <p className="text-[10px] text-[#666A78] mt-0.5">Content AI Platform</p>
        </div>
      )}
    </div>
  );
}

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isVideoEditor = pathname === "/video-editor";
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
          className={`fixed inset-y-0 left-0 z-20 hidden flex-col border-r border-white/[0.06] bg-[#090A10]/95 shadow-2xl shadow-black/40 backdrop-blur-xl transition-all duration-300 ease-in-out lg:flex ${
            isCollapsed ? "w-16" : "w-64"
          } ${isVideoEditor ? "lg:!hidden" : ""}`}
        >
          <div
            className={`flex h-16 shrink-0 items-center ${
              isCollapsed ? "justify-center px-1" : "justify-between px-4"
            } border-b border-white/[0.06]`}
          >
            <Brand isCollapsed={isCollapsed} />
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleCollapsed}
                className="h-8 w-8 text-[#A3A6B3] hover:text-[#F7F7FB] hover:bg-white/[0.04] rounded-lg"
                title="Recolher menu lateral"
              >
                <ChevronsLeft className="size-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            <NavList isCollapsed={isCollapsed} isAdmin={user.isAdmin} />
          </div>

          <div className="shrink-0 border-t border-white/[0.06] p-3 bg-[#0B0C12]/80">
            {isCollapsed ? (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="flex justify-center">
                    <span className="flex size-8 items-center justify-center rounded-xl border border-[#9B7CFF]/30 bg-[#9B7CFF]/10 text-xs font-bold text-[#9B7CFF]">
                      {user.displayName.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-[#101119] border-white/10 text-white">
                  <p className="font-semibold text-xs">{user.displayName}</p>
                  <p className="text-[10px] text-[#A3A6B3]">{user.email}</p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-xl border border-[#9B7CFF]/30 bg-[#9B7CFF]/10 text-xs font-bold text-[#9B7CFF]">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#F7F7FB] truncate">
                      {user.displayName}
                    </p>
                    <p className="truncate text-[10px] text-[#666A78]">
                      {user.email}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-[#666A78] hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0"
                  onClick={handleSignOut}
                  title="Sair"
                >
                  <LogOut className="size-3.5" />
                </Button>
              </div>
            )}
          </div>
        </aside>

        <div
          className={`relative z-10 transition-all duration-300 ease-in-out ${
            isVideoEditor ? "" : isCollapsed ? "lg:pl-16" : "lg:pl-64"
          }`}
        >
          <header className={`${isVideoEditor ? "hidden" : "sticky"} top-0 z-30 h-16 items-center gap-3 border-b border-white/[0.06] bg-[#07080D]/90 px-4 backdrop-blur-xl md:px-8 shadow-sm ${isVideoEditor ? "" : "flex"}`}>
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden text-[#A3A6B3]" aria-label="Abrir menu">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col w-72 bg-[#090A10] border-white/10 p-0">
                <SheetTitle className="sr-only">Menu principal</SheetTitle>
                <div className="flex h-16 shrink-0 items-center px-4 border-b border-white/[0.06]">
                  <Brand />
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
                  <NavList onNavigate={() => setMobileOpen(false)} isAdmin={user.isAdmin} />
                </div>
                <div className="shrink-0 border-t border-white/[0.06] p-4 bg-[#0B0C12]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#666A78]">
                    Sessão conectada
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#F7F7FB] font-medium">
                    {user.email}
                  </p>
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapsed}
              className="hidden lg:flex text-[#666A78] hover:text-[#F7F7FB] hover:bg-white/[0.04] rounded-lg"
              aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
              title={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
            >
              {isCollapsed ? (
                <ChevronsRight className="size-4" />
              ) : (
                <ChevronsLeft className="size-4" />
              )}
            </Button>

            <p className="hidden text-xs font-semibold uppercase tracking-[0.14em] text-[#666A78] sm:block">
              Content Studio
            </p>

            <div className="ml-auto flex items-center gap-2.5">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleCompactMode}
                    className={`h-8 gap-1.5 text-xs border-white/10 bg-white/[0.02] hover:bg-white/[0.06] ${compactMode ? "bg-[#9B7CFF]/15 border-[#9B7CFF]/30 text-[#9B7CFF]" : "text-[#A3A6B3]"}`}
                  >
                    {compactMode ? (
                      <Maximize2 className="size-3.5" />
                    ) : (
                      <Minimize2 className="size-3.5" />
                    )}
                    <span className="hidden sm:inline font-medium">
                      {compactMode ? "Normal" : "Compacto"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#101119] border-white/10 text-white text-xs">
                  {compactMode
                    ? "Restaurar tamanho normal"
                    : "Visão compacta"}
                </TooltipContent>
              </Tooltip>

              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-[#9B7CFF] hover:bg-[#AA92FF] text-[#07080D] shadow-md shadow-[#9B7CFF]/20 gap-1.5"
                onClick={() => navigate({ to: "/projects/new" })}
              >
                <Plus className="size-3.5" />
                <span className="hidden sm:inline">Novo projeto</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-[#666A78] hover:text-[#F7F7FB] hover:bg-white/[0.04] rounded-lg"
                aria-label="Sair"
                onClick={handleSignOut}
                title="Sair"
              >
                <LogOut className="size-4" />
              </Button>
            </div>
          </header>

          <main className={isVideoEditor ? "h-screen overflow-hidden" : "px-4 py-6 md:px-8 md:py-8"}>{children}</main>
        </div>
      </div>
    </TooltipProvider>
  );
}
