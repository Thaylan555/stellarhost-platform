import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { LifeBuoy, Plus } from "lucide-react";
import { listMyTickets } from "@/lib/dashboard.functions";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ticketsQuery = queryOptions({
  queryKey: ["tickets", "mine"],
  queryFn: () => listMyTickets(),
});

export const Route = createFileRoute("/_authenticated/tickets")({
  loader: ({ context }) => context.queryClient.ensureQueryData(ticketsQuery),
  component: TicketsPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Aberto", cls: "bg-brand/10 text-brand border-brand/20" },
  pending_client: { label: "Aguardando você", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  pending_staff: { label: "Aguardando equipe", cls: "bg-accent/10 text-accent border-accent/20" },
  resolved: { label: "Resolvido", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  closed: { label: "Fechado", cls: "bg-muted text-muted-foreground border-border" },
};

const PRIORITY: Record<string, string> = {
  low: "text-muted-foreground",
  normal: "text-foreground",
  high: "text-yellow-400",
  urgent: "text-destructive",
};

const PRIORITY_LABEL: Record<string, string> = {
  low: "Baixa",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

function TicketsPage() {
  const { data: tickets } = useSuspenseQuery(ticketsQuery);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Suporte</h1>
          <p className="mt-1 text-sm text-muted-foreground">Abra um ticket para atendimento técnico ou financeiro.</p>
        </div>
        <Link to="/tickets/novo" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110">
          <Plus className="size-4" /> Novo ticket
        </Link>
      </header>

      {tickets.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <LifeBuoy className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Nenhum ticket. Precisa de ajuda? Abra um novo.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {tickets.map((t) => {
            const st = STATUS[t.status] ?? { label: t.status, cls: "bg-muted text-muted-foreground border-border" };
            return (
              <Link
                to="/tickets/$id"
                params={{ id: t.id }}
                key={t.id}
                className="block rounded-xl border border-border bg-surface p-5 transition-colors hover:border-brand/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{t.subject}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Última atualização: {formatDateTime(t.last_reply_at)} · Prioridade{" "}
                      <span className={PRIORITY[t.priority]}>{PRIORITY_LABEL[t.priority]}</span>
                    </p>
                  </div>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-semibold", st.cls)}>{st.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
