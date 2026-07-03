import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  Server,
  Receipt,
  LifeBuoy,
  Bell,
  User,
  KeyRound,
  LogOut,
  Rocket,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/servicos", label: "Serviços", icon: Server },
  { to: "/faturas", label: "Faturas", icon: Receipt },
  { to: "/tickets", label: "Suporte", icon: LifeBuoy },
  { to: "/notificacoes", label: "Notificações", icon: Bell },
  { to: "/perfil", label: "Perfil", icon: User },
  { to: "/api-keys", label: "API Keys", icon: KeyRound },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex">
        <Sidebar />
        <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
          <TopBar onOpenMobile={() => setMobileOpen(true)} />
          <main className="flex-1 px-6 py-8 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <SidebarContent />
    </aside>
  );
}

function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-background/70 backdrop-blur" onClick={onClose} />
      <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar">
        <button onClick={onClose} className="absolute right-4 top-4 grid size-8 place-items-center rounded-md hover:bg-sidebar-accent">
          <X className="size-4" />
        </button>
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void } = {}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <>
      <div className="flex h-20 items-center gap-2.5 px-6">
        <Link to="/" className="flex items-center gap-2.5" onClick={onNavigate}>
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand shadow-brand">
            <Rocket className="size-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-lg font-bold">StellarHost</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname.startsWith(to + "/");
          return (
            <Link
              key={to}
              to={to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        >
          <LogOut className="size-4" />
          Sair
        </button>
      </div>
    </>
  );
}

function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  const { user } = useSession();
  const name = (user?.user_metadata?.full_name as string | undefined) ?? user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur lg:px-10">
      <button className="lg:hidden" onClick={onOpenMobile} aria-label="Abrir menu">
        <Menu className="size-5" />
      </button>
      <div className="flex-1" />
      <div className="flex items-center gap-3">
        <div className="hidden text-sm text-muted-foreground sm:block">{name}</div>
        <div className="grid size-9 place-items-center rounded-full bg-gradient-brand font-heading text-sm font-bold text-white">
          {initial}
        </div>
      </div>
    </header>
  );
}
