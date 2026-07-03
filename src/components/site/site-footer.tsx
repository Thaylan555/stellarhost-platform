import { Link } from "@tanstack/react-router";
import { Rocket } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link to="/" className="mb-6 flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-md bg-gradient-brand">
                <Rocket className="size-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-lg font-bold text-foreground">StellarHost</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Hospedagem gamer no Brasil com hardware dedicado e suporte humano.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Produtos
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/planos" className="hover:text-brand">
                  Minecraft
                </Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-brand">
                  Bots Discord
                </Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-brand">
                  VPS
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Empresa
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/sobre" className="hover:text-brand">
                  Sobre
                </Link>
              </li>
              <li>
                <Link to="/status" className="hover:text-brand">
                  Status
                </Link>
              </li>
              <li>
                <Link to="/contato" className="hover:text-brand">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-heading text-sm font-bold uppercase tracking-widest text-foreground">
              Legal
            </h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link to="/termos" className="hover:text-brand">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="hover:text-brand">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StellarHost. Todos os direitos reservados.
          </p>
          <Link to="/status" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-status-pulse" />
            Todos os sistemas operacionais
          </Link>
        </div>
      </div>
    </footer>
  );
}
