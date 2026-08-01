import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clapperboard,
  FolderKanban,
  Sparkles,
  LogOut,
  Menu,
  Plus,
  FileCheck2,
  Shuffle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/features/auth/auth";
import type { AppUser } from "@/lib/supabase/types";

const navItems = [
  { label: "Visão geral", icon: LayoutDashboard, to: "/dashboard" as const },
  { label: "Criar roteiro", icon: Clapperboard, to: "/projects/new" as const },
  { label: "Transcrever vídeos", icon: FileCheck2, to: "/copies" as const },
  { label: "Editor de vídeos", icon: Shuffle, to: "/video-editor" as const },
  { label: "Projetos", icon: FolderKanban, to: "/projects" as const },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1.5">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          onClick={onNavigate}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${pathname === item.to || (item.to === "/projects" && pathname.startsWith("/projects/")) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"}`}
        >
          <item.icon className="size-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/20">
        <Sparkles className="size-4 text-primary" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-sm font-semibold tracking-tight">Tik Supremo</p>
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Studio</p>
      </div>
    </div>
  );
}

export function AppShell({ user, children }: { user: AppUser; children: ReactNode }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleSignOut = async () => {
    await signOut();
    await navigate({ to: "/login", replace: true });
  };
  return (
    <div className="relative min-h-screen bg-background">
      <div className="aurora opacity-40" aria-hidden="true" />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col gap-8 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
        <Brand />
        <NavList />
        <div className="mt-auto border-t border-sidebar-border px-1 pt-4">
          <p className="text-xs text-muted-foreground">Sessão protegida</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
        </div>
      </aside>
      <div className="relative z-10 lg:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl md:px-8">
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
          <p className="hidden text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground lg:block">
            Content workspace
          </p>
          <div className="ml-auto flex items-center gap-2">
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
  );
}
