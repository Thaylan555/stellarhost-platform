import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Server, Plus } from "lucide-react";
import { listMyServices } from "@/lib/dashboard.functions";
import { formatBRL, formatDate, formatRAM } from "@/lib/format";
import { cn } from "@/lib/utils";

const servicesQuery = queryOptions({
  queryKey: ["services", "mine"],
  queryFn: () => listMyServices(),
});

export const Route = createFileRoute("/_authenticated/servicos")({
  loader: ({ context }) => context.queryClient.ensureQueryData(servicesQuery),
  component: ServicesPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  active: { label: "Ativo", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  provisioning: { label: "Provisionando", cls: "bg-brand/10 text-brand border-brand/20" },
  suspended: { label: "Suspenso", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  cancelled: { label: "Cancelado", cls: "bg-muted text-muted-foreground border-border" },
  expired: { label: "Expirado", cls: "bg-destructive/10 text-destructive border-destructive/20" },
};

function ServicesPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Meus serviços</h1>
          <p className="mt-1 text-sm text-muted-foreground">Servidores e bots ativos na sua conta.</p>
        </div>
        <Link
          to="/planos"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110"
        >
          <Plus className="size-4" /> Contratar
        </Link>
      </header>

      {services.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <Server className="mx-auto size-10 text-muted-foreground" />
          <h2 className="mt-4 font-heading text-lg font-bold">Nenhum serviço contratado</h2>
          <p className="mt-2 text-sm text-muted-foreground">Escolha um plano para começar.</p>
          <Link
            to="/planos"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground shadow-brand"
          >
            Ver planos
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {services.map((s) => {
            const plan = s.plan as { name?: string; ram_mb?: number; cpu_cores?: number; disk_gb?: number } | null;
            const st = STATUS[s.status] ?? { label: s.status, cls: "bg-muted text-muted-foreground border-border" };
            return (
              <article key={s.id} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="font-heading text-lg font-bold">{s.name}</h2>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", st.cls)}>
                        {st.label}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan?.name ?? "—"}
                      {plan?.ram_mb ? ` · ${formatRAM(plan.ram_mb)} RAM · ${plan?.cpu_cores ?? 0} vCPU · ${plan?.disk_gb ?? 0} GB` : null}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-heading text-lg font-bold">{formatBRL(s.price_cents)}<span className="text-sm text-muted-foreground">/mês</span></div>
                    <div className="text-xs text-muted-foreground">Próx. venc.: {formatDate(s.next_due_at)}</div>
                  </div>
                </div>
                {s.ip_address && (
                  <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
                    <span><b className="text-foreground">IP:</b> {s.ip_address}{s.port ? `:${s.port}` : ""}</span>
                    {s.node_name && <span><b className="text-foreground">Nó:</b> {s.node_name}</span>}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
