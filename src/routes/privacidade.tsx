import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade — StellarHost" },
      { name: "description", content: "Como a StellarHost coleta, usa e protege seus dados pessoais." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <article className="mx-auto max-w-3xl px-6 py-24">
        <h1 className="font-heading text-4xl font-bold">Política de privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-BR")}</p>

        <div className="mt-8 space-y-6 text-muted-foreground [&_h2]:font-heading [&_h2]:text-foreground [&_h2]:text-xl [&_h2]:mt-8">
          <p>
            Esta política descreve como coletamos, usamos e protegemos suas informações em conformidade
            com a LGPD (Lei 13.709/2018).
          </p>

          <h2>Dados coletados</h2>
          <p>
            Coletamos nome, e-mail, telefone, documento (CPF/CNPJ), dados de pagamento (via Mercado
            Pago) e informações de uso dos serviços contratados.
          </p>

          <h2>Uso dos dados</h2>
          <p>
            Utilizamos seus dados para prestar os serviços contratados, emitir faturas, prestar
            suporte, prevenir fraudes e cumprir obrigações legais.
          </p>

          <h2>Compartilhamento</h2>
          <p>
            Não vendemos dados. Compartilhamos apenas com processadores de pagamento e fornecedores
            estritamente necessários (Mercado Pago para pagamentos, infraestrutura em nuvem).
          </p>

          <h2>Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção, portabilidade ou exclusão dos seus dados a qualquer
            momento pelo e-mail dpo@stellarhost.com.br.
          </p>

          <h2>Segurança</h2>
          <p>
            Utilizamos criptografia em trânsito e em repouso, controles de acesso baseados em papéis
            e monitoramento contínuo. Ainda assim, nenhum sistema é 100% seguro.
          </p>
        </div>
      </article>
      <SiteFooter />
    </div>
  );
}
