import { createFileRoute } from "@tanstack/react-router";
import { KeyRound } from "lucide-react";

export const Route = createFileRoute("/_authenticated/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-heading text-3xl font-bold">API Keys</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gere chaves para acessar sua conta programaticamente.
        </p>
      </header>
      <div className="rounded-2xl border border-border bg-surface p-12 text-center">
        <KeyRound className="mx-auto size-10 text-muted-foreground" />
        <p className="mt-4 text-sm text-muted-foreground">
          Módulo de API Keys estará disponível em breve.
        </p>
      </div>
    </div>
  );
}
