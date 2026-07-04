import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Copy, Check, QrCode, Loader2 } from "lucide-react";
import { getInvoice, generatePixForInvoice } from "@/lib/invoices.functions";
import { formatBRL, formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const invoiceQuery = (id: string) =>
  queryOptions({ queryKey: ["invoices", id], queryFn: () => getInvoice({ data: { id } }) });

export const Route = createFileRoute("/_authenticated/faturas/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(invoiceQuery(params.id)),
  component: InvoiceDetailPage,
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

function InvoiceDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data: inv } = useSuspenseQuery(invoiceQuery(id));
  const genPix = useServerFn(generatePixForInvoice);
  const [pix, setPix] = useState<string | null>(inv.pix_copy_paste);
  const [gen, setGen] = useState(false);
  const [copied, setCopied] = useState(false);
  const st = STATUS[inv.status] ?? { label: inv.status, cls: "bg-muted text-muted-foreground border-border" };

  const handleGenPix = async () => {
    setGen(true);
    try {
      const res = await genPix({ data: { invoice_id: id } });
      setPix(res.pix_copy_paste);
      await qc.invalidateQueries({ queryKey: ["invoices", id] });
    } finally {
      setGen(false);
    }
  };

  const copy = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/faturas" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Todas as faturas
      </Link>

      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{inv.number}</p>
          <h1 className="mt-1 font-heading text-2xl font-bold sm:text-3xl">{inv.description}</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Vencimento em {formatDate(inv.due_at)}
            {inv.paid_at && ` · Paga em ${formatDateTime(inv.paid_at)}`}
          </p>
        </div>
        <span className={cn("shrink-0 rounded-full border px-3 py-1 text-xs font-semibold", st.cls)}>{st.label}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <h2 className="mb-4 font-heading text-lg font-bold">Detalhes</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Valor bruto</dt>
                <dd>{formatBRL(inv.amount_cents)}</dd>
              </div>
              {inv.discount_cents > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <dt>Desconto</dt>
                  <dd>-{formatBRL(inv.discount_cents)}</dd>
                </div>
              )}
              {inv.coupon_code && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <dt>Cupom aplicado</dt>
                  <dd>{inv.coupon_code}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
              <span className="text-sm font-semibold">Total</span>
              <span className="font-heading text-2xl font-bold">{formatBRL(inv.total_cents)}</span>
            </div>
          </div>

          {inv.status === "pending" && (
            <div className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
                <QrCode className="size-5 text-brand" /> Pagar com PIX
              </h2>
              {!pix ? (
                <button
                  onClick={handleGenPix}
                  disabled={gen}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
                >
                  {gen && <Loader2 className="size-4 animate-spin" />}
                  Gerar código PIX
                </button>
              ) : (
                <>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="break-all font-mono text-xs text-muted-foreground">{pix}</p>
                  </div>
                  <button
                    onClick={copy}
                    className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold hover:bg-surface-2/70"
                  >
                    {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
                    {copied ? "Copiado!" : "Copiar código PIX"}
                  </button>
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Após o pagamento, sua fatura será atualizada automaticamente em até 5 minutos.
                  </p>
                </>
              )}
              <p className="mt-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs text-yellow-400">
                Integração Mercado Pago em ativação. Aguardando credenciais para PIX em produção real.
              </p>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-6 h-fit">
          <h3 className="font-heading text-lg font-bold">Formas de pagamento</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-brand" /> PIX (instantâneo)</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-muted" /> Cartão (em breve)</li>
            <li className="flex items-center gap-2"><span className="size-1.5 rounded-full bg-muted" /> Boleto (em breve)</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
