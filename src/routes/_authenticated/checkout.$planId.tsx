import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ArrowLeft, Loader2, Ticket, Check } from "lucide-react";
import { listActivePlans } from "@/lib/plans.functions";
import { createInvoiceForPlan, validateCoupon } from "@/lib/invoices.functions";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/utils";

const plansQuery = queryOptions({ queryKey: ["plans", "active"], queryFn: () => listActivePlans() });

export const Route = createFileRoute("/_authenticated/checkout/$planId")({
  loader: ({ context }) => context.queryClient.ensureQueryData(plansQuery),
  component: CheckoutPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

const CYCLES = [
  { key: "monthly", label: "Mensal", months: 1, discount: 0 },
  { key: "quarterly", label: "Trimestral", months: 3, discount: 0.05 },
  { key: "semiannual", label: "Semestral", months: 6, discount: 0.1 },
  { key: "annual", label: "Anual", months: 12, discount: 0.2 },
] as const;

function CheckoutPage() {
  const { planId } = Route.useParams();
  const navigate = useNavigate();
  const { data: plans } = useSuspenseQuery(plansQuery);
  const plan = plans.find((p) => p.id === planId);
  const create = useServerFn(createInvoiceForPlan);
  const validate = useServerFn(validateCoupon);

  const [cycle, setCycle] = useState<(typeof CYCLES)[number]["key"]>("monthly");
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount_cents: number } | null>(null);
  const [couponErr, setCouponErr] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totals = useMemo(() => {
    if (!plan) return null;
    const c = CYCLES.find((x) => x.key === cycle)!;
    const gross = plan.price_cents * c.months;
    const cycleDisc = Math.floor(gross * c.discount);
    const subtotal = gross - cycleDisc;
    const coupDisc = coupon?.discount_cents ?? 0;
    return { gross, cycleDisc, subtotal, coupDisc, total: Math.max(subtotal - coupDisc, 100) };
  }, [plan, cycle, coupon]);

  if (!plan) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-muted-foreground">Plano não encontrado.</p>
        <Link to="/planos" className="mt-4 inline-block text-brand hover:underline">Ver planos disponíveis</Link>
      </div>
    );
  }

  const applyCoupon = async () => {
    if (!couponInput.trim() || !totals) return;
    setChecking(true);
    setCouponErr(null);
    try {
      const res = await validate({ data: { code: couponInput.trim(), amount_cents: totals.subtotal } });
      if (res.valid) {
        setCoupon({ code: res.code, discount_cents: res.discount_cents });
      } else {
        setCoupon(null);
        setCouponErr(res.reason);
      }
    } finally {
      setChecking(false);
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await create({ data: { plan_id: plan.id, billing_cycle: cycle, coupon_code: coupon?.code } });
      navigate({ to: "/faturas/$id", params: { id: res.invoice_id } });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/planos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar aos planos
      </Link>

      <header>
        <h1 className="font-heading text-3xl font-bold">Finalizar contratação</h1>
        <p className="mt-1 text-sm text-muted-foreground">Revise os detalhes e escolha o ciclo de cobrança.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-border bg-surface p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-brand">Plano selecionado</p>
            <h2 className="mt-1 font-heading text-2xl font-bold">{plan.name}</h2>
            {plan.description && <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>}
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="mb-4 font-heading text-lg font-bold">Ciclo de cobrança</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {CYCLES.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCycle(c.key)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-all",
                    cycle === c.key ? "border-brand bg-brand/5" : "border-border bg-surface-2 hover:border-border/80",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{c.label}</span>
                    {cycle === c.key && <Check className="size-4 text-brand" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {c.months}× {formatBRL(plan.price_cents)}
                    {c.discount > 0 && <span className="ml-2 text-emerald-400">-{c.discount * 100}%</span>}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <h3 className="mb-4 font-heading text-lg font-bold">Cupom de desconto</h3>
            <div className="flex gap-2">
              <input
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                placeholder="STELLAR10"
                className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
              />
              <button
                onClick={applyCoupon}
                disabled={checking || !couponInput.trim()}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-4 text-sm font-semibold hover:bg-surface-2/70 disabled:opacity-60"
              >
                {checking ? <Loader2 className="size-4 animate-spin" /> : <Ticket className="size-4" />}
                Aplicar
              </button>
            </div>
            {coupon && (
              <p className="mt-2 text-xs text-emerald-400">
                Cupom {coupon.code} aplicado: -{formatBRL(coupon.discount_cents)}
              </p>
            )}
            {couponErr && <p className="mt-2 text-xs text-destructive">{couponErr}</p>}
          </div>
        </section>

        <aside className="rounded-2xl border border-border bg-surface p-6 lg:sticky lg:top-24 h-fit">
          <h3 className="font-heading text-lg font-bold">Resumo</h3>
          {totals && (
            <>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd>{formatBRL(totals.gross)}</dd>
                </div>
                {totals.cycleDisc > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <dt>Desconto do ciclo</dt>
                    <dd>-{formatBRL(totals.cycleDisc)}</dd>
                  </div>
                )}
                {totals.coupDisc > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <dt>Cupom</dt>
                    <dd>-{formatBRL(totals.coupDisc)}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-heading text-2xl font-bold">{formatBRL(totals.total)}</span>
              </div>
              <button
                onClick={submit}
                disabled={submitting}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
              >
                {submitting && <Loader2 className="size-4 animate-spin" />}
                Gerar fatura
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Você poderá pagar via PIX após gerar a fatura.
              </p>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
