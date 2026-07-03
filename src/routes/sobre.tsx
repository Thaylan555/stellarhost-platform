import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — StellarHost" },
      { name: "description", content: "Quem somos, missão e valores da StellarHost." },
      { property: "og:title", content: "Sobre — StellarHost" },
      { property: "og:description", content: "Quem somos, missão e valores da StellarHost." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden px-6 pt-24 pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] hero-glow" />
        <div className="mx-auto max-w-3xl">
          <h1 className="font-heading text-5xl font-bold tracking-tight">Sobre a StellarHost</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Somos uma empresa brasileira de hospedagem gamer com foco em performance, estabilidade e
            atendimento humano. Trabalhamos com hardware dedicado em datacenters no Brasil para
            entregar a menor latência possível para o público local.
          </p>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {[
            {
              title: "Missão",
              body: "Democratizar hospedagem gamer profissional no Brasil, com preço justo e suporte de verdade.",
            },
            {
              title: "Visão",
              body: "Ser a plataforma de hospedagem de games mais confiável e recomendada da América Latina.",
            },
            {
              title: "Valores",
              body: "Transparência, excelência técnica, respeito com o cliente e responsabilidade com dados.",
            },
          ].map((card) => (
            <div key={card.title} className="rounded-2xl border border-border bg-surface p-8">
              <h3 className="font-heading text-xl font-bold">{card.title}</h3>
              <p className="mt-3 text-sm text-muted-foreground">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
