import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { createTicket } from "@/lib/tickets.functions";

export const Route = createFileRoute("/_authenticated/tickets/novo")({
  component: NewTicketPage,
});

function NewTicketPage() {
  const navigate = useNavigate();
  const create = useServerFn(createTicket);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<"technical" | "billing" | "sales" | "other">("technical");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "urgent">("normal");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await create({ data: { subject, body, category, priority } });
      navigate({ to: "/tickets/$id", params: { id: res.id } });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Erro");
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/tickets" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Voltar
      </Link>
      <header>
        <h1 className="font-heading text-3xl font-bold">Novo ticket</h1>
        <p className="mt-1 text-sm text-muted-foreground">Descreva sua solicitação com o máximo de detalhes possível.</p>
      </header>

      <form onSubmit={submit} className="space-y-5 rounded-2xl border border-border bg-surface p-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Assunto</label>
          <input
            required
            minLength={4}
            maxLength={140}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as typeof category)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="technical">Técnico</option>
              <option value="billing">Financeiro</option>
              <option value="sales">Comercial</option>
              <option value="other">Outros</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as typeof priority)}
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
            >
              <option value="low">Baixa</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">Descrição</label>
          <textarea
            required
            minLength={10}
            maxLength={5000}
            rows={8}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full resize-y rounded-lg border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>

        {err && <p className="text-sm text-destructive">{err}</p>}

        <button
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-60"
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Abrir ticket
        </button>
      </form>
    </div>
  );
}
