import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Server, Receipt, LifeBuoy, Bell, ArrowRight, AlertCircle } from "lucide-react";
import { getDashboardSummary } from "@/lib/dashboard.functions";
import { formatBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const summaryQuery = queryOptions({
  queryKey: ["dashboard", "summary"],
  queryFn: () => getDashboardSummary(),
});

export const Route = createFileRoute("/_authenticated/dashboard")({
  loader: ({ context }) => context.queryClient.ensureQueryData(summaryQuery),
  component: DashboardPage,
  errorComponent: ({ error }) => (
    <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
      Erro ao carregar dashboard: {error.message}
    </div>
  ),
});

function DashboardPage() {
  const { data } = useSuspenseQuery(summaryQuery);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">Visão geral da sua conta.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard icon={Server} label="Serviços" value={data.services.length} to="/servicos" />
        <StatCard icon={Receipt} label="Faturas pendentes" value={data.pendingInvoices.length} to="/faturas" highlight={data.pendingInvoices.length > 0} />
        <StatCard icon={LifeBuoy} label="Tickets abertos" value={data.openTickets.length} to="/tickets" />
        <StatCard icon={Bell} label="Notificações" value={data.unreadNotifications} to="/notificacoes" />
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="Meus serviços" to="/servicos">
          {data.services.length === 0 ? (
            <EmptyState label="Nenhum serviço ainda" cta="Ver planos" href="/planos" />
          ) : (
            <ul className="divide-y divide-border">
              {data.services.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(s.plan as { name?: string })?.name ?? "—"} · Próx. venc.: {formatDate(s.next_due_at)}
                    </p>
                  </div>
                  <StatusBadge status={s.status} />
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Faturas pendentes" to="/faturas">
          {data.pendingInvoices.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Sem faturas em aberto. 🎉</p>
          ) : (
            <ul className="divide-y divide-border">
              {data.pendingInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-semibold">{inv.number}</p>
                    <p className="text-xs text-muted-foreground">Vence em {formatDate(inv.due_at)}</p>
                  </div>
                  <span className="font-heading font-bold">{formatBRL(inv.total_cents)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  to,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  to: "/servicos" | "/faturas" | "/tickets" | "/notificacoes";
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "group flex flex-col rounded-2xl border p-5 transition-all",
        highlight ? "border-brand/40 bg-brand/5 hover:border-brand" : "border-border bg-surface hover:border-border/80",
      )}
    >
      <div className="flex items-center justify-between">
        <Icon className={cn("size-5", highlight ? "text-brand" : "text-muted-foreground")} />
        {highlight && <AlertCircle className="size-4 text-brand" />}
      </div>
      <div className="mt-4 font-heading text-3xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{label}</div>
    </Link>
  );
}

function Panel({
  title,
  to,
  children,
}: {
  title: string;
  to: "/servicos" | "/faturas";
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <Link to={to} className="flex items-center gap-1 text-xs text-brand hover:underline">
          Ver todos <ArrowRight className="size-3" />
        </Link>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ label, cta, href }: { label: string; cta: string; href: string }) {
  return (
    <div className="flex flex-col items-center py-6 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <a href={href} className="mt-3 rounded-md bg-brand px-4 py-1.5 text-xs font-semibold text-brand-foreground">
        {cta}
      </a>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    provisioning: "bg-brand/10 text-brand border-brand/20",
    suspended: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    cancelled: "bg-muted text-muted-foreground border-border",
    expired: "bg-destructive/10 text-destructive border-destructive/20",
  };
  const labels: Record<string, string> = {
    active: "Ativo",
    provisioning: "Provisionando",
    suspended: "Suspenso",
    cancelled: "Cancelado",
    expired: "Expirado",
  };
  return (
    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", styles[status])}>
      {labels[status] ?? status}
    </span>
  );
}
