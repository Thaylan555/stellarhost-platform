import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { getMyProfile, updateMyProfile } from "@/lib/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";

const profileQuery = queryOptions({
  queryKey: ["profile", "mine"],
  queryFn: () => getMyProfile(),
});

export const Route = createFileRoute("/_authenticated/perfil")({
  loader: ({ context }) => context.queryClient.ensureQueryData(profileQuery),
  component: ProfilePage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

function ProfilePage() {
  const { data: profile } = useSuspenseQuery(profileQuery);
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSaving(true);
    try {
      await updateMyProfile({
        data: {
          full_name: String(fd.get("full_name") ?? "").trim(),
          phone: String(fd.get("phone") ?? "").trim(),
          document: String(fd.get("document") ?? "").trim(),
          company: String(fd.get("company") ?? "").trim(),
        },
      });
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["profile"] });
    } catch (err) {
      toast.error((err as Error).message);
    }
    setSaving(false);
  }

  async function onChangePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p = String(fd.get("password") ?? "");
    if (p.length < 8) return toast.error("Senha muito curta (mín. 8)");
    setPwSaving(true);
    const { error } = await supabase.auth.updateUser({ password: p });
    setPwSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada");
    e.currentTarget.reset();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-heading text-3xl font-bold">Perfil</h1>
        <p className="mt-1 text-sm text-muted-foreground">Suas informações pessoais e de segurança.</p>
      </header>

      <form onSubmit={onSave} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-bold">Dados da conta</h2>
        <Field label="E-mail" value={profile.email} disabled />
        <Field name="full_name" label="Nome completo" defaultValue={profile.full_name ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="phone" label="Telefone" defaultValue={profile.phone ?? ""} placeholder="(11) 99999-9999" />
          <Field name="document" label="CPF/CNPJ" defaultValue={profile.document ?? ""} />
        </div>
        <Field name="company" label="Empresa (opcional)" defaultValue={profile.company ?? ""} />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>

      <form onSubmit={onChangePassword} className="space-y-4 rounded-2xl border border-border bg-surface p-6">
        <h2 className="font-heading text-lg font-bold">Segurança</h2>
        <Field name="password" type="password" label="Nova senha (mín. 8)" autoComplete="new-password" />
        <button
          type="submit"
          disabled={pwSaving}
          className="rounded-lg bg-brand px-5 py-2 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
        >
          {pwSaving ? "Alterando..." : "Alterar senha"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  value,
  disabled,
  placeholder,
  autoComplete,
}: {
  label: string;
  name?: string;
  type?: string;
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  autoComplete?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30 disabled:opacity-60"
      />
    </label>
  );
}
