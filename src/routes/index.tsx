import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Shield, Zap, HardDrive, Terminal, Database, Headphones } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { PlanCard, type PlanCardData } from "@/components/site/plan-card";
import { listActivePlans } from "@/lib/plans.functions";

const plansQuery = queryOptions({
  queryKey: ["plans", "active"],
  queryFn: () => listActivePlans(),
});

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(plansQuery),
  component: LandingPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center bg-background text-foreground">
      <p className="text-sm text-muted-foreground">Erro ao carregar: {error.message}</p>
    </div>
  ),
});

const FEATURES = [
  {
    icon: Terminal,
    title: "Painel Pelican integrado",
    body: "Gerencie arquivos, banco de dados, backups e console em tempo real, tudo em uma interface só.",
  },
  {
    icon: Shield,
    title: "Proteção Anti-DDoS",
    body: "Filtragem ativa localizada no Brasil mantém seu servidor online mesmo sob ataque.",
  },
  {
    icon: Zap,
    title: "Provisionamento rápido",
    body: "Após confirmar o pagamento, seu servidor é ativado automaticamente em segundos.",
  },
  {
    icon: HardDrive,
    title: "Backups automáticos",
    body: "Rotinas de backup diárias mantêm seus dados seguros. Restaure com um clique.",
  },
  {
    icon: Database,
    title: "Bancos MySQL inclusos",
    body: "Crie bancos de dados MySQL diretamente pelo painel, sem configuração extra.",
  },
  {
    icon: Headphones,
    title: "Suporte por tickets",
    body: "Atendimento humano especializado, com prioridade para clientes dos planos maiores.",
  },
];

const FAQ = [
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Aceitamos Pix (aprovação imediata), cartão de crédito e boleto bancário, todos processados via Mercado Pago.",
  },
  {
    q: "Onde ficam os servidores?",
    a: "Nossa infraestrutura está em datacenters de São Paulo, garantindo baixa latência para o público brasileiro.",
  },
  {
    q: "Posso trocar de plano depois?",
    a: "Sim. Você pode fazer upgrade ou downgrade pelo painel a qualquer momento, com cobrança proporcional.",
  },
  {
    q: "Vocês oferecem reembolso?",
    a: "Sim, seguimos a garantia de 7 dias prevista pelo Código de Defesa do Consumidor para primeiras compras.",
  },
];

function LandingPage() {
  const { data: plans } = useSuspenseQuery(plansQuery);
  const minecraftPlans = (plans as PlanCardData[]).filter((p) => p.type === "minecraft");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden px-6 pt-24 pb-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] hero-glow" />
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs">
            <span className="size-2 rounded-full bg-accent shadow-glow animate-status-pulse" />
            <span className="text-muted-foreground">Sistemas operacionais</span>
          </div>

          <h1 className="font-heading text-5xl font-bold leading-[1.05] tracking-tight text-foreground md:text-7xl">
            Hospedagem de elite para sua{" "}
            <span className="text-gradient-brand">comunidade</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Alta performance, proteção DDoS e painel Pelican para servidores Minecraft e bots
            Discord. Contrate em minutos, gerencie com poucos cliques.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-8 py-4 text-sm font-bold text-brand-foreground shadow-brand transition-all hover:brightness-110 sm:w-auto"
            >
              Começar agora
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/planos"
              className="inline-flex w-full items-center justify-center rounded-xl border border-border bg-surface px-8 py-4 text-sm font-bold text-foreground transition-all hover:bg-surface-2 sm:w-auto"
            >
              Ver planos
            </Link>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section id="planos" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-heading text-4xl font-bold text-foreground">Escolha sua potência</h2>
            <p className="mt-3 text-muted-foreground">Planos Minecraft otimizados para cada fase do seu projeto.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {minecraftPlans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/planos" className="text-sm font-medium text-brand hover:underline">
              Ver todos os planos, incluindo bots Discord →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-surface/40 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-2xl">
            <h2 className="font-heading text-4xl font-bold text-foreground">
              Tudo que sua operação precisa
            </h2>
            <p className="mt-3 text-muted-foreground">
              Ferramentas profissionais para você focar no seu projeto, não na infraestrutura.
            </p>
          </div>
          <div className="grid gap-x-8 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <div className="mb-4 grid size-11 place-items-center rounded-xl bg-brand/10 ring-1 ring-brand/20">
                  <Icon className="size-5 text-brand" strokeWidth={2} />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center font-heading text-4xl font-bold text-foreground">
            Dúvidas frequentes
          </h2>
          <div className="space-y-4">
            {FAQ.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-surface p-6 open:border-brand/40"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-foreground">
                  {item.q}
                  <span className="ml-4 text-brand transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-4xl rounded-3xl border border-border bg-surface p-12 text-center relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 -z-10 hero-glow" />
          <h2 className="font-heading text-4xl font-bold text-foreground">Pronto para colocar seu servidor no ar?</h2>
          <p className="mt-3 text-muted-foreground">Crie sua conta grátis e contrate em minutos.</p>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-sm font-bold text-brand-foreground shadow-brand transition-all hover:brightness-110"
          >
            Criar conta gratuita
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
