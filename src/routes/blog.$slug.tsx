import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, Clock, Eye } from "lucide-react";
import { getBlogPost } from "@/lib/blog.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { formatDate } from "@/lib/format";

const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["blog", slug], queryFn: () => getBlogPost({ data: { slug } }) });

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ context, params }) => {
    try {
      return await context.queryClient.ensureQueryData(postQuery(params.slug));
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    const p = loaderData?.post;
    if (!p) return { meta: [{ title: "Post — StellarHost" }] };
    const title = p.seo_title ?? `${p.title} — Blog StellarHost`;
    const desc = p.seo_description ?? p.excerpt ?? undefined;
    const meta = [
      { title },
      ...(desc ? [{ name: "description", content: desc }] : []),
      { property: "og:title", content: p.title },
      ...(desc ? [{ property: "og:description", content: desc }] : []),
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
      ...(p.cover_image_url ? [
        { property: "og:image", content: p.cover_image_url },
        { name: "twitter:image", content: p.cover_image_url },
      ] : []),
    ];
    return { meta };
  },
  component: PostPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold">Post não encontrado</h1>
        <Link to="/blog" className="mt-4 inline-block text-brand hover:underline">Voltar ao blog</Link>
      </div>
    </div>
  ),
});

function renderMarkdown(md: string) {
  // Renderização simples para markdown (heading, parágrafo, listas, código inline, negrito)
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let paraBuf: string[] = [];
  let listBuf: string[] = [];
  const flushPara = () => {
    if (paraBuf.length) {
      out.push(
        <p key={out.length} className="my-4 leading-relaxed text-foreground/90" dangerouslySetInnerHTML={{ __html: inline(paraBuf.join(" ")) }} />,
      );
      paraBuf = [];
    }
  };
  const flushList = () => {
    if (listBuf.length) {
      out.push(
        <ul key={out.length} className="my-4 list-disc space-y-1 pl-6 text-foreground/90">
          {listBuf.map((li, i) => (
            <li key={i} dangerouslySetInnerHTML={{ __html: inline(li) }} />
          ))}
        </ul>,
      );
      listBuf = [];
    }
  };
  const inline = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/`([^`]+)`/g, '<code class="rounded bg-surface-2 px-1.5 py-0.5 text-sm text-brand">$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-brand hover:underline" rel="noopener">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("### ")) {
      flushPara(); flushList();
      out.push(<h3 key={out.length} className="mt-8 mb-3 font-heading text-xl font-bold">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushPara(); flushList();
      out.push(<h2 key={out.length} className="mt-10 mb-4 font-heading text-2xl font-bold">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      flushPara(); flushList();
      out.push(<h1 key={out.length} className="mt-10 mb-4 font-heading text-3xl font-bold">{line.slice(2)}</h1>);
    } else if (/^[-*]\s+/.test(line)) {
      flushPara();
      listBuf.push(line.replace(/^[-*]\s+/, ""));
    } else if (line === "") {
      flushPara(); flushList();
    } else {
      flushList();
      paraBuf.push(line);
    }
  }
  flushPara(); flushList();
  return out;
}

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const p = data.post;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Todos os posts
        </Link>

        <header className="mt-8">
          {data.category && (
            <span className="inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${data.category.color}20`, color: data.category.color }}>
              {data.category.name}
            </span>
          )}
          <h1 className="mt-3 font-heading text-3xl font-bold leading-tight sm:text-4xl">{p.title}</h1>
          {p.excerpt && <p className="mt-4 text-lg text-muted-foreground">{p.excerpt}</p>}
          <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
            {p.published_at && <span>{formatDate(p.published_at)}</span>}
            <span className="inline-flex items-center gap-1"><Clock className="size-3" />{p.reading_minutes} min</span>
            <span className="inline-flex items-center gap-1"><Eye className="size-3" />{p.views_count}</span>
          </div>
        </header>

        {p.cover_image_url && (
          <img src={p.cover_image_url} alt={p.title} className="mt-8 aspect-[16/9] w-full rounded-2xl object-cover" />
        )}

        <article className="mt-10">{renderMarkdown(p.content)}</article>

        {data.related.length > 0 && (
          <section className="mt-16 border-t border-border pt-10">
            <h2 className="mb-6 font-heading text-2xl font-bold">Continue lendo</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {data.related.map((r) => (
                <Link key={r.slug} to="/blog/$slug" params={{ slug: r.slug }} className="rounded-xl border border-border bg-surface p-5 hover:border-brand/40">
                  <h3 className="font-heading font-bold">{r.title}</h3>
                  {r.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
