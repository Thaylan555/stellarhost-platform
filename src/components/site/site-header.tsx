import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Rocket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/planos", label: "Planos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/status", label: "Status" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user } = useSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors",
        scrolled ? "border-border bg-background/80 backdrop-blur-md" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand shadow-brand transition-transform group-hover:scale-105">
            <Rocket className="size-4 text-white" strokeWidth={2.5} />
          </span>
          <span className="font-heading text-xl font-bold tracking-tight text-foreground">
            StellarHost
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="rounded-full border border-brand/30 bg-brand/10 px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand hover:text-brand-foreground"
              >
                Painel
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-muted-foreground hover:text-foreground">
                Entrar
              </Link>
              <Link
                to="/auth"
                search={{ mode: "signup" }}
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground shadow-brand transition-all hover:brightness-110"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        <button
          className="grid size-10 place-items-center rounded-md border border-border md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Alternar menu"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-6 py-4">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
                activeProps={{ className: "bg-surface text-foreground" }}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground"
                >
                  Meu painel
                </Link>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="rounded-md border border-border px-4 py-2.5 text-center text-sm font-medium"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/auth"
                    search={{ mode: "signup" }}
                    className="rounded-md bg-brand px-4 py-2.5 text-center text-sm font-semibold text-brand-foreground"
                  >
                    Criar conta
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
