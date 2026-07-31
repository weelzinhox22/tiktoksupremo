import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  FileText,
  Clapperboard,
  FolderKanban,
  ShieldCheck,
  Radar,
  Video,
  CalendarDays,
  SlidersHorizontal,
  Plug,
  Settings,
  Search,
  Bell,
  Plus,
  Sparkles,
  LogOut,
  Menu,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut, type DemoUser } from "@/lib/demo-auth";

export const navItems = [
  { label: "Visão geral", icon: LayoutDashboard, to: "/dashboard" as const, ready: true },
  { label: "Produtos", icon: Package, ready: false },
  { label: "Copies", icon: FileText, ready: false },
  { label: "Criar roteiro", icon: Clapperboard, ready: false },
  { label: "Projetos", icon: FolderKanban, ready: false },
  { label: "Validador", icon: ShieldCheck, ready: false },
  { label: "Radar de produtos", icon: Radar, ready: false },
  { label: "Biblioteca de vídeos", icon: Video, ready: false },
  { label: "Calendário", icon: CalendarDays, ready: false },
  { label: "Presets", icon: SlidersHorizontal, ready: false },
  { label: "Integrações", icon: Plug, ready: false },
  { label: "Configurações", icon: Settings, ready: false },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) =>
        item.ready && item.to ? (
          <Link
            key={item.label}
            to={item.to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              pathname === item.to
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
            }`}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ) : (
          <button
            key={item.label}
            type="button"
            disabled
            title="Disponível quando o backend for ativado"
            className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground/55"
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            <span className="text-[10px] tracking-wide uppercase">em breve</span>
          </button>
        ),
      )}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="bg-gradient-supremo flex size-9 items-center justify-center rounded-xl">
        <Sparkles className="size-4 text-primary-foreground" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-bold">Tik Supremo</p>
        <p className="text-[11px] text-muted-foreground">Workspace pessoal</p>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: DemoUser; children: ReactNode }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    signOut();
    navigate({ to: "/login", replace: true });
  };

  return (
    <div className="relative min-h-screen bg-background">
      <div className="aurora opacity-60" aria-hidden="true" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col gap-6 border-r border-sidebar-border bg-sidebar p-4 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto surface-card p-4">
          <p className="text-xs text-muted-foreground">Créditos disponíveis</p>
          <p className="font-display mt-1 text-2xl font-bold text-cyan">{user.credits}</p>
        </div>
      </aside>

      <div className="relative z-10 lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-4">
              <SheetTitle className="sr-only">Menu principal</SheetTitle>
              <div className="mb-6">
                <Brand />
              </div>
              <NavList onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="relative hidden flex-1 sm:block">
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar produtos, copies, projetos..."
              className="h-9 bg-secondary/60 pl-9"
              aria-label="Busca global"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Badge className="hidden bg-accent/70 text-accent-foreground sm:inline-flex">
              {user.credits} créditos
            </Badge>
            <Button variant="hero" size="sm" disabled title="Disponível quando o backend for ativado">
              <Plus /> <span className="hidden sm:inline">Novo projeto</span>
            </Button>
            <Button variant="ghost" size="icon" aria-label="Notificações" disabled>
              <Bell />
            </Button>
            <span className="bg-gradient-supremo flex size-8 items-center justify-center rounded-full text-xs font-semibold text-primary-foreground">
              {user.fullName.slice(0, 2).toUpperCase()}
            </span>
            <Button variant="ghost" size="icon" aria-label="Sair" onClick={handleSignOut}>
              <LogOut />
            </Button>
          </div>
        </header>

        <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
