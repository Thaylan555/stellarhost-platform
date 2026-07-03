import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/status")({
  head: () => ({
    meta: [
      { title: "Status — StellarHost" },
      { name: "description", content: "Estado atual dos serviços e infraestrutura da StellarHost." },
    ],
  }),
  component: StatusPage,
});

const COMPONENTS = [
  { name: "Painel de clientes", status: "operational" },
  { name: "API pública", status: "operational" },
  { name: "Painel Pelican", status: "operational" },
  { name: "Nós de Minecraft — SP", status: "operational" },
  { name: "Nós de Bots Discord — SP", status: "operational" },
  { name: "Sistema de faturamento", status: "operational" },
] as const;

function StatusPage() {
  const allOk = COMPONENTS.every((c) => c.status === "operational");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-6 text-emerald-500" />
              <div>
                <h1 className="font-heading text-xl font-bold text-foreground">
                  {allOk ? "Todos os sistemas operacionais" : "Instabilidade em andamento"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Atualizado em {new Date().toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 divide-y divide-border rounded-2xl border border-border bg-surface">
            {COMPONENTS.map((c) => (
              <div key={c.name} className="flex items-center justify-between p-4">
                <span className="text-sm font-medium text-foreground">{c.name}</span>
                <span className="flex items-center gap-2 text-sm text-emerald-400">
                  <span className="size-2 rounded-full bg-emerald-500 animate-status-pulse" />
                  Operacional
                </span>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-surface p-6">
            <h2 className="font-heading text-lg font-bold">Histórico de incidentes</h2>
            <p className="mt-2 text-sm text-muted-foreground">Nenhum incidente registrado nos últimos 30 dias.</p>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
