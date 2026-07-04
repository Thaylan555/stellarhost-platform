import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Receipt } from "lucide-react";
import { listMyInvoices } from "@/lib/dashboard.functions";
import { formatBRL, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const invoicesQuery = queryOptions({
  queryKey: ["invoices", "mine"],
  queryFn: () => listMyInvoices(),
});

export const Route = createFileRoute("/_authenticated/faturas")({
  loader: ({ context }) => context.queryClient.ensureQueryData(invoicesQuery),
  component: InvoicesPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  paid: { label: "Paga", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pending: { label: "Pendente", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  overdue: { label: "Vencida", cls: "bg-destructive/10 text-destructive border-destructive/20" },
  cancelled: { label: "Cancelada", cls: "bg-muted text-muted-foreground border-border" },
  refunded: { label: "Estornada", cls: "bg-muted text-muted-foreground border-border" },
  draft: { label: "Rascunho", cls: "bg-muted text-muted-foreground border-border" },
};

function InvoicesPage() {
  const { data: invoices } = useSuspenseQuery(invoicesQuery);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">Faturas</h1>
        <p className="mt-1 text-sm text-muted-foreground">Histórico completo de cobranças e pagamentos.</p>
      </header>

      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <Receipt className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Nenhuma fatura por enquanto.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <table className="w-full text-sm">
            <thead className="bg-surface-2 text-left text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Nº</th>
                <th className="px-6 py-3 font-semibold">Descrição</th>
                <th className="px-6 py-3 font-semibold">Vencimento</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 text-right font-semibold">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invoices.map((inv) => {
                const st = STATUS[inv.status] ?? { label: inv.status, cls: "bg-muted text-muted-foreground border-border" };
                return (
                  <tr key={inv.id} className="cursor-pointer hover:bg-surface-2/50">
                    <td className="px-6 py-4 font-mono text-xs">
                      <Link to="/faturas/$id" params={{ id: inv.id }} className="hover:text-brand">{inv.number}</Link>
                    </td>
                    <td className="px-6 py-4">
                      <Link to="/faturas/$id" params={{ id: inv.id }}>{inv.description}</Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(inv.due_at)}</td>
                    <td className="px-6 py-4">
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-heading font-bold">{formatBRL(inv.total_cents)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
