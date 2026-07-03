import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PlanCard, type PlanCardData } from "@/components/site/plan-card";
import { listActivePlans } from "@/lib/plans.functions";
import { cn } from "@/lib/utils";

const plansQuery = queryOptions({
  queryKey: ["plans", "active"],
  queryFn: () => listActivePlans(),
});

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos — StellarHost" },
      {
        name: "description",
        content: "Compare planos de hospedagem Minecraft, bots Discord e VPS da StellarHost.",
      },
      { property: "og:title", content: "Planos — StellarHost" },
      {
        property: "og:description",
        content: "Compare planos de hospedagem Minecraft, bots Discord e VPS.",
      },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(plansQuery),
  component: PlansPage,
});

type Filter = "all" | "minecraft" | "discord_bot";

const TABS: { id: Filter; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "minecraft", label: "Minecraft" },
  { id: "discord_bot", label: "Bots Discord" },
];

function PlansPage() {
  const { data } = useSuspenseQuery(plansQuery);
  const [filter, setFilter] = useState<Filter>("all");

  const plans = (data as PlanCardData[]).filter((p) => filter === "all" || p.type === filter);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] hero-glow" />
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-5xl font-bold tracking-tight text-foreground">
            Planos que <span className="text-gradient-brand">crescem com você</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Escolha um plano compatível com seu projeto. Faça upgrade a qualquer momento.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 inline-flex w-full max-w-md rounded-full border border-border bg-surface p-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  filter === tab.id
                    ? "bg-brand text-brand-foreground shadow-brand"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {plans.length === 0 ? (
            <p className="text-center text-muted-foreground">Nenhum plano nesta categoria por enquanto.</p>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
