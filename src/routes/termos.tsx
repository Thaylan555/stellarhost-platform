import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de uso — StellarHost" },
      { name: "description", content: "Termos e condições de uso dos serviços StellarHost." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-heading text-4xl font-bold">Termos de uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="prose prose-invert mt-8 space-y-6 text-muted-foreground [&_h2]:font-heading [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:mt-8">
          <p>
            Ao contratar a StellarHost, você concorda com estes termos. Leia com atenção antes de utilizar
            nossos serviços.
          </p>

          <h2>1. Serviços</h2>
          <p>
            A StellarHost oferece hospedagem de servidores para jogos (Minecraft), bots Discord e VPS,
            com painel de controle, backups e suporte via tickets.
          </p>

          <h2>2. Pagamento e renovação</h2>
          <p>
            Os serviços são pré-pagos por ciclo. Faturas não pagas até o vencimento resultam em
            suspensão do serviço; após 15 dias em suspensão o serviço é cancelado e os dados removidos.
          </p>

          <h2>3. Uso aceitável</h2>
          <p>
            É proibido usar nossos serviços para atividades ilegais, spam, ataques a terceiros ou
            hospedagem de conteúdo que viole direitos autorais. Violações resultam em suspensão imediata.
          </p>

          <h2>4. Reembolso</h2>
          <p>
            Novos clientes têm 7 dias de garantia conforme o CDC. Pedidos de reembolso devem ser
            solicitados via ticket.
          </p>

          <h2>5. Limitação de responsabilidade</h2>
          <p>
            Nos comprometemos com uptime alto e backups, mas não nos responsabilizamos por perdas
            resultantes de mau uso, ataques direcionados ou falhas de terceiros.
          </p>

          <h2>6. Alterações</h2>
          <p>
            Estes termos podem ser atualizados. Clientes serão notificados por e-mail com pelo menos
            30 dias de antecedência sobre mudanças relevantes.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
