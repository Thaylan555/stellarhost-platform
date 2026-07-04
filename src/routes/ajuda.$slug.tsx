import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Eye } from "lucide-react";
import { getKbArticle } from "@/lib/kb.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const articleQuery = (slug: string) =>
  queryOptions({ queryKey: ["kb", slug], queryFn: () => getKbArticle({ data: { slug } }) });

export const Route = createFileRoute("/ajuda/$slug")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(articleQuery(params.slug));
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Ajuda StellarHost` },
          ...(loaderData.excerpt ? [{ name: "description", content: loaderData.excerpt }] : []),
          { property: "og:title", content: loaderData.title },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Artigo — Ajuda StellarHost" }],
  }),
  component: KbArticlePage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold">Artigo não encontrado</h1>
        <Link to="/ajuda" className="mt-4 inline-block text-brand hover:underline">Voltar à central de ajuda</Link>
      </div>
    </div>
  ),
});

function KbArticlePage() {
  const { slug } = Route.useParams();
  const { data: a } = useSuspenseQuery(articleQuery(slug));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/ajuda" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Central de Ajuda
        </Link>
        <header className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">{a.category}</p>
          <h1 className="mt-2 font-heading text-3xl font-bold sm:text-4xl">{a.title}</h1>
          {a.excerpt && <p className="mt-3 text-muted-foreground">{a.excerpt}</p>}
          <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3" /> {a.views_count} visualizações
          </p>
        </header>
        <article className="mt-8 whitespace-pre-wrap text-foreground/90 leading-relaxed">{a.content}</article>

        <footer className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="text-sm font-semibold">Este artigo foi útil?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Se ainda precisa de ajuda,{" "}
            <Link to="/contato" className="text-brand hover:underline">fale com nossa equipe</Link>.
          </p>
        </footer>
      </main>
      <SiteFooter />
    </div>
  );
}
