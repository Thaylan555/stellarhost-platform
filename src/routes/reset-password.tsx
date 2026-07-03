import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [{ title: "Redefinir senha — StellarHost" }, { name: "robots", content: "noindex" }],
  }),
  component: ResetPasswordPage,
});

const passwordSchema = z.string().min(8, "Mínimo de 8 caracteres").max(72);

function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const p1 = passwordSchema.safeParse(fd.get("password"));
    const p2 = fd.get("confirm");
    if (!p1.success) return toast.error(p1.error.issues[0].message);
    if (p1.data !== p2) return toast.error("As senhas não coincidem");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: p1.data });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Senha atualizada");
    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8">
        <h1 className="font-heading text-2xl font-bold">Nova senha</h1>
        <p className="mt-1 text-sm text-muted-foreground">Escolha uma nova senha para sua conta.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Nova senha</span>
            <input
              name="password"
              type="password"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              required
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Confirmar</span>
            <input
              name="confirm"
              type="password"
              className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar nova senha"}
          </button>
        </form>
      </div>
    </div>
  );
}
