import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Send, X, Star, Loader2 } from "lucide-react";
import { getTicket, replyTicket, closeTicket } from "@/lib/tickets.functions";
import { useSession } from "@/hooks/use-session";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ticketQuery = (id: string) =>
  queryOptions({
    queryKey: ["tickets", id],
    queryFn: () => getTicket({ data: { id } }),
  });

export const Route = createFileRoute("/_authenticated/tickets/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(ticketQuery(params.id)),
  component: TicketDetailPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
  notFoundComponent: () => <p>Ticket não encontrado</p>,
});

const STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "Aberto", cls: "bg-brand/10 text-brand border-brand/20" },
  pending_client: { label: "Aguardando você", cls: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  pending_staff: { label: "Aguardando equipe", cls: "bg-accent/10 text-accent border-accent/20" },
  resolved: { label: "Resolvido", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  closed: { label: "Fechado", cls: "bg-muted text-muted-foreground border-border" },
};

function TicketDetailPage() {
  const { id } = Route.useParams();
  const { user } = useSession();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(ticketQuery(id));
  const reply = useServerFn(replyTicket);
  const close = useServerFn(closeTicket);
  const [msg, setMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [rating, setRating] = useState<number>(0);
  const [closing, setClosing] = useState(false);

  const isClosed = data.ticket.status === "closed";
  const st = STATUS[data.ticket.status] ?? { label: data.ticket.status, cls: "bg-muted text-muted-foreground border-border" };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setSending(true);
    try {
      await reply({ data: { ticket_id: id, body: msg } });
      setMsg("");
      await qc.invalidateQueries({ queryKey: ["tickets", id] });
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    setClosing(true);
    try {
      await close({ data: { ticket_id: id, rating: rating || undefined } });
      await qc.invalidateQueries({ queryKey: ["tickets"] });
      navigate({ to: "/tickets" });
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">{data.ticket.subject}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Aberto em {formatDateTime(data.ticket.created_at)} · Última atualização {formatDateTime(data.ticket.last_reply_at)}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
      </header>

      <div className="space-y-3">
        {data.messages.map((m) => {
          const mine = m.author_id === user?.id;
          return (
            <article
              key={m.id}
              className={cn(
                "rounded-2xl border p-5",
                mine ? "border-brand/30 bg-brand/5" : "border-border bg-surface",
              )}
            >
              <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">{mine ? "Você" : "Equipe StellarHost"}</span>
                <span>{formatDateTime(m.created_at)}</span>
              </div>
              <p className="whitespace-pre-wrap text-sm text-foreground/90">{m.body}</p>
            </article>
          );
        })}
      </div>

      {!isClosed ? (
        <>
          <form onSubmit={send} className="space-y-3 rounded-2xl border border-border bg-surface p-5">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              rows={5}
              placeholder="Digite sua resposta..."
              className="w-full resize-y rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="submit"
                disabled={sending || !msg.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
              >
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                Enviar resposta
              </button>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      className="text-muted-foreground hover:text-yellow-400"
                      aria-label={`${n} estrelas`}
                    >
                      <Star className={cn("size-5", n <= rating ? "fill-yellow-400 text-yellow-400" : "")} />
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={closing}
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-surface-2 disabled:opacity-60"
                >
                  <X className="size-4" /> Fechar ticket
                </button>
              </div>
            </div>
          </form>
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-6 text-sm text-muted-foreground">
          Este ticket está fechado. Precisa de mais ajuda?{" "}
          <Link to="/tickets/novo" className="text-brand hover:underline">
            Abra um novo
          </Link>
          .
        </div>
      )}
    </div>
  );
}
