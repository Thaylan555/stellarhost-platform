import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { listBlogPosts } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const blogQuery = queryOptions({ queryKey: ["blog", "list"], queryFn: () => listBlogPosts() });

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog StellarHost — Tutoriais, novidades e performance" },
      { name: "description", content: "Guias, atualizações e boas práticas de hospedagem, Minecraft, Discord bots e infraestrutura." },
      { property: "og:title", content: "Blog StellarHost" },
      { property: "og:description", content: "Tutoriais e novidades da plataforma StellarHost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(blogQuery),
  component: BlogListPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

function BlogListPage() {
  const { data } = useSuspenseQuery(blogQuery);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const posts = activeCat ? data.posts.filter((p) => p.category_id === activeCat) : data.posts;
  const featured = data.posts.find((p) => p.is_featured) ?? data.posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-16">
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Blog</p>
          <h1 className="mt-2 font-heading text-4xl font-bold sm:text-5xl">Insights de infraestrutura e performance</h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Tutoriais, novidades e boas práticas para tirar o máximo da StellarHost.
          </p>
        </header>

        {data.categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveCat(null)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                !activeCat ? "border-brand bg-brand/10 text-brand" : "border-border bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              Todos
            </button>
            {data.categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCat(c.id)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-semibold transition-all",
                  activeCat === c.id ? "border-brand bg-brand/10 text-brand" : "border-border bg-surface text-muted-foreground hover:text-foreground",
                )}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <Sparkles className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Nenhum post publicado ainda. Volte em breve.</p>
          </div>
        ) : (
          <>
            {featured && !activeCat && (
              <Link
                to="/blog/$slug"
                params={{ slug: featured.slug }}
                className="group mb-12 grid gap-6 overflow-hidden rounded-3xl border border-border bg-surface p-8 transition-all hover:border-brand/40 md:grid-cols-2 md:p-10"
              >
                <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-surface-2">
                  {featured.cover_image_url ? (
                    <img src={featured.cover_image_url} alt={featured.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                  ) : (
                    <div className="grid size-full place-items-center bg-gradient-brand/20">
                      <Sparkles className="size-12 text-brand" />
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <span className="mb-3 self-start rounded-full bg-brand px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-brand-foreground">Destaque</span>
                  <h2 className="font-heading text-2xl font-bold sm:text-3xl">{featured.title}</h2>
                  {featured.excerpt && <p className="mt-3 text-muted-foreground">{featured.excerpt}</p>}
                  <p className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                    {featured.published_at && <span>{formatDate(featured.published_at)}</span>}
                    <span className="inline-flex items-center gap-1"><Clock className="size-3" />{featured.reading_minutes} min</span>
                  </p>
                </div>
              </Link>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <Link
                  key={p.id}
                  to="/blog/$slug"
                  params={{ slug: p.slug }}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-brand/40 hover:shadow-brand/10 hover:shadow-2xl"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-surface-2">
                    {p.cover_image_url ? (
                      <img src={p.cover_image_url} alt={p.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="grid size-full place-items-center bg-gradient-brand/10">
                        <Sparkles className="size-8 text-brand/60" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="font-heading text-lg font-bold group-hover:text-brand">{p.title}</h3>
                    {p.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>}
                    <p className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
                      {p.published_at && <span>{formatDate(p.published_at)}</span>}
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" />{p.reading_minutes} min</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
