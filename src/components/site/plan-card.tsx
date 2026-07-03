import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { formatBRL, formatRAM } from "@/lib/format";
import { cn } from "@/lib/utils";

type PlanFeature = string;

export interface PlanCardData {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price_cents: number;
  ram_mb: number;
  cpu_cores: number;
  disk_gb: number;
  slots: number | null;
  features: unknown;
  is_featured: boolean;
  type: "minecraft" | "discord_bot" | "vps";
}

function toFeatures(input: unknown): PlanFeature[] {
  if (Array.isArray(input)) return input.filter((v): v is string => typeof v === "string");
  return [];
}

export function PlanCard({ plan }: { plan: PlanCardData }) {
  const featured = plan.is_featured;
  const specs = [
    `${formatRAM(plan.ram_mb)} RAM`,
    `${plan.cpu_cores} vCPU`,
    `${plan.disk_gb} GB NVMe`,
    plan.slots != null ? `${plan.slots} slots` : null,
  ].filter(Boolean) as string[];

  const features = toFeatures(plan.features);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl p-8 transition-all",
        featured
          ? "border-2 border-brand bg-surface shadow-2xl shadow-brand/20 md:-translate-y-4"
          : "border border-border bg-surface hover:border-border/80",
      )}
    >
      {featured && (
        <div className="mb-4 self-start rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">
          Mais popular
        </div>
      )}
      <div className={cn("text-sm font-semibold", featured ? "text-brand" : "text-muted-foreground")}>
        {plan.name}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="font-heading text-4xl font-bold text-foreground">{formatBRL(plan.price_cents)}</span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>
      {plan.description && (
        <p className="mt-3 text-sm text-muted-foreground">{plan.description}</p>
      )}

      <ul className="mt-6 space-y-3 text-sm text-foreground/90">
        {specs.map((spec) => (
          <li key={spec} className="flex items-center gap-3">
            <span className={cn("size-1.5 rounded-full", featured ? "bg-accent" : "bg-brand")} />
            {spec}
          </li>
        ))}
        {features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-muted-foreground">
            <Check className={cn("mt-0.5 size-4 shrink-0", featured ? "text-accent" : "text-brand")} />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/auth"
        search={{ mode: "signup" }}
        className={cn(
          "mt-8 w-full rounded-xl py-3 text-center text-sm font-bold transition-all",
          featured
            ? "bg-brand text-brand-foreground shadow-brand hover:brightness-110"
            : "border border-border bg-surface-2 text-foreground hover:bg-surface-2/70",
        )}
      >
        Contratar
      </Link>
    </div>
  );
}
