import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MessageCircle, Ticket } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — StellarHost" },
      { name: "description", content: "Fale com a equipe StellarHost. Suporte, vendas e imprensa." },
      { property: "og:title", content: "Contato — StellarHost" },
      { property: "og:description", content: "Fale com a equipe StellarHost." },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  subject: z.string().trim().min(3, "Descreva o assunto").max(150),
  message: z.string().trim().min(10, "Mensagem muito curta").max(2000),
});

function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = contactSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Verifique os dados");
      return;
    }
    setSubmitting(true);
    // TODO: server function will handle actual delivery once email infra is wired.
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    toast.success("Mensagem enviada. Responderemos em breve!");
    form.reset();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] hero-glow" />
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="font-heading text-5xl font-bold tracking-tight">Fale com a gente</h1>
          <p className="mt-4 text-muted-foreground">
            Já é cliente? Abra um ticket pelo painel. Não é cliente ainda? Use o formulário abaixo.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            { icon: Ticket, title: "Suporte", body: "Clientes abrem tickets pelo painel para atendimento técnico." },
            { icon: Mail, title: "E-mail", body: "contato@stellarhost.com.br para comercial e imprensa." },
            { icon: MessageCircle, title: "Comunidade", body: "Discord da StellarHost — em breve." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-2xl border border-border bg-surface p-6">
              <Icon className="size-6 text-brand" />
              <h3 className="mt-3 font-heading font-bold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <form
          onSubmit={onSubmit}
          className="mx-auto mt-16 max-w-2xl space-y-4 rounded-2xl border border-border bg-surface p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="name" label="Nome" required />
            <Field name="email" label="E-mail" type="email" required />
          </div>
          <Field name="subject" label="Assunto" required />
          <Field name="message" label="Mensagem" as="textarea" required />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand px-6 py-3 text-sm font-bold text-brand-foreground shadow-brand transition-all hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar mensagem"}
          </button>
        </form>
      </section>

      <SiteFooter />
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  as = "input",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  as?: "input" | "textarea";
  required?: boolean;
}) {
  const cls =
    "w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {as === "textarea" ? (
        <textarea name={name} required={required} rows={5} className={cls} />
      ) : (
        <input name={name} type={type} required={required} className={cls} />
      )}
    </label>
  );
}
