import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";

const searchSchema = z.object({
  mode: z.enum(["login", "signup", "recover"]).catch("login"),
  next: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — StellarHost" },
      { name: "description", content: "Acesse sua conta StellarHost ou crie uma nova." },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: searchSchema,
  component: AuthPage,
});

function AuthPage() {
  const { mode, next } = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useSession();

  useEffect(() => {
    if (!sessionLoading && user) {
      navigate({ to: (next as "/dashboard") ?? "/dashboard" });
    }
  }, [sessionLoading, user, navigate, next]);

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-surface lg:block">
        <div className="pointer-events-none absolute inset-0 hero-glow" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand shadow-brand">
              <Rocket className="size-4 text-white" strokeWidth={2.5} />
            </span>
            <span className="font-heading text-xl font-bold">StellarHost</span>
          </Link>
          <div className="max-w-md">
            <h2 className="font-heading text-3xl font-bold leading-tight">
              Sua comunidade merece <span className="text-gradient-brand">infraestrutura de verdade</span>.
            </h2>
            <p className="mt-4 text-muted-foreground">
              Painel Pelican, backups automáticos e suporte humano — tudo em uma conta.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} StellarHost. Todos os direitos reservados.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-gradient-brand">
                <Rocket className="size-4 text-white" strokeWidth={2.5} />
              </span>
              <span className="font-heading text-xl font-bold">StellarHost</span>
            </Link>
          </div>

          <ModeTabs current={mode} />

          {mode === "login" && <LoginForm />}
          {mode === "signup" && <SignupForm />}
          {mode === "recover" && <RecoverForm />}
        </div>
      </main>
    </div>
  );
}

function ModeTabs({ current }: { current: "login" | "signup" | "recover" }) {
  if (current === "recover") return null;
  return (
    <div className="mb-8 inline-flex rounded-full border border-border bg-surface p-1">
      <Link
        to="/auth"
        search={{ mode: "login" }}
        className={cn(
          "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
          current === "login" ? "bg-brand text-brand-foreground" : "text-muted-foreground",
        )}
      >
        Entrar
      </Link>
      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className={cn(
          "rounded-full px-5 py-1.5 text-sm font-medium transition-colors",
          current === "signup" ? "bg-brand text-brand-foreground" : "text-muted-foreground",
        )}
      >
        Criar conta
      </Link>
    </div>
  );
}

const emailSchema = z.string().trim().email("E-mail inválido").max(255);
const passwordSchema = z.string().min(8, "Mínimo de 8 caracteres").max(72);

function LoginForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.data,
      password: password.data,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos" : error.message);
      return;
    }
    toast.success("Login realizado");
    navigate({ to: "/dashboard" });
  }

  async function google() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Falha ao entrar com Google");
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Entrar</h1>
      <p className="mt-2 text-sm text-muted-foreground">Acesse seu painel StellarHost.</p>

      <button
        onClick={google}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        Entrar com Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        ou
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField name="email" type="email" label="E-mail" autoComplete="email" required />
        <TextField name="password" type="password" label="Senha" autoComplete="current-password" required />
        <div className="text-right">
          <Link to="/auth" search={{ mode: "recover" }} className="text-xs text-brand hover:underline">
            Esqueci minha senha
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}

function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    if (name.length < 2) return toast.error("Informe seu nome");
    const email = emailSchema.safeParse(fd.get("email"));
    const password = passwordSchema.safeParse(fd.get("password"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    if (!password.success) return toast.error(password.error.issues[0].message);

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.data,
      password: password.data,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Conta criada! Você já pode entrar.");
  }

  async function google() {
    setGoogleLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Falha ao entrar com Google");
      setGoogleLoading(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Criar conta</h1>
      <p className="mt-2 text-sm text-muted-foreground">Grátis. Sem cartão de crédito.</p>

      <button
        onClick={google}
        disabled={googleLoading}
        className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
      >
        {googleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        Continuar com Google
      </button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        ou
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <TextField name="name" label="Nome completo" autoComplete="name" required />
        <TextField name="email" type="email" label="E-mail" autoComplete="email" required />
        <TextField name="password" type="password" label="Senha (mín. 8 caracteres)" autoComplete="new-password" required />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="mt-4 text-xs text-muted-foreground">
        Ao criar sua conta, você concorda com nossos{" "}
        <Link to="/termos" className="text-brand hover:underline">
          termos
        </Link>{" "}
        e{" "}
        <Link to="/privacidade" className="text-brand hover:underline">
          política de privacidade
        </Link>
        .
      </p>
    </div>
  );
}

function RecoverForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = emailSchema.safeParse(fd.get("email"));
    if (!email.success) return toast.error(email.error.issues[0].message);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.data, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Enviamos um link para seu e-mail.");
  }

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Recuperar senha</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Digite seu e-mail e enviaremos instruções para redefinir sua senha.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <TextField name="email" type="email" label="E-mail" autoComplete="email" required />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-brand-foreground shadow-brand hover:brightness-110 disabled:opacity-50"
        >
          {loading ? "Enviando..." : "Enviar link"}
        </button>
      </form>
      <div className="mt-6">
        <Link to="/auth" search={{ mode: "login" }} className="text-sm text-brand hover:underline">
          ← Voltar ao login
        </Link>
      </div>
    </div>
  );
}

function TextField({
  name,
  label,
  type = "text",
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        name={name}
        type={type}
        {...rest}
        className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.7-5.5 3.7-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3 14.6 2 12 2 6.9 2 2.7 6.1 2.7 11.2S6.9 20.4 12 20.4c6.7 0 9.3-4.7 9.3-8.4 0-.6 0-1-.1-1.5z" />
    </svg>
  );
}
