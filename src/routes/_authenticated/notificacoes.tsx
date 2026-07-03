import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Check } from "lucide-react";
import { listMyNotifications } from "@/lib/dashboard.functions";
import { supabase } from "@/integrations/supabase/client";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const notificationsQuery = queryOptions({
  queryKey: ["notifications", "mine"],
  queryFn: () => listMyNotifications(),
});

export const Route = createFileRoute("/_authenticated/notificacoes")({
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQuery),
  component: NotificationsPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

const TYPE_STYLES: Record<string, string> = {
  info: "text-brand",
  success: "text-emerald-400",
  warning: "text-yellow-400",
  error: "text-destructive",
  billing: "text-brand",
  service: "text-accent",
  ticket: "text-accent",
  security: "text-destructive",
};

function NotificationsPage() {
  const { data: notifs } = useSuspenseQuery(notificationsQuery);
  const qc = useQueryClient();

  async function markAllRead() {
    const ids = notifs.filter((n) => !n.read_at).map((n) => n.id);
    if (ids.length === 0) return;
    await supabase.from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notificações</h1>
          <p className="mt-1 text-sm text-muted-foreground">Últimas 100 notificações.</p>
        </div>
        <button
          onClick={markAllRead}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm hover:bg-surface-2"
        >
          <Check className="size-4" /> Marcar todas como lidas
        </button>
      </header>

      {notifs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-12 text-center">
          <Bell className="mx-auto size-10 text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Você está em dia. Sem notificações novas.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifs.map((n) => (
            <li
              key={n.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                n.read_at ? "border-border bg-surface" : "border-brand/30 bg-brand/5",
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className={cn("font-semibold", TYPE_STYLES[n.type])}>{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>}
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(n.created_at)}</p>
                </div>
                {!n.read_at && <span className="mt-1 size-2 rounded-full bg-brand" />}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
