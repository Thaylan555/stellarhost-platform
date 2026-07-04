import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { listKbArticles } from "@/lib/kb.functions";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

const kbQuery = queryOptions({ queryKey: ["kb", "list"], queryFn: () => listKbArticles() });

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Central de Ajuda StellarHost" },
      { name: "description", content: "Encontre respostas rápidas sobre hospedagem Minecraft, Discord bots, VPS, cobrança e configurações." },
      { property: "og:title", content: "Central de Ajuda StellarHost" },
      { property: "og:description", content: "Base de conhecimento e tutoriais oficiais." },
      { property: "og:type", content: "website" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(kbQuery),
  component: KbPage,
  errorComponent: ({ error }) => <p className="text-destructive">Erro: {error.message}</p>,
});

function KbPage() {
  const { data } = useSuspenseQuery(kbQuery);
  const [q, setQ] = useState("");

  const byCat = useMemo(() => {
    const filtered = data.filter((a) => {
      if (!q) return true;
      const s = q.toLowerCase();
      return a.title.toLowerCase().includes(s) || (a.excerpt ?? "").toLowerCase().includes(s);
    });
    const map = new Map<string, typeof data>();
    for (const a of filtered) {
      const arr = map.get(a.category) ?? [];
      arr.push(a);
      map.set(a.category, arr);
    }
    return Array.from(map.entries());
  }, [data, q]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <header className="mb-12 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Central de Ajuda</p>
          <h1 className="mt-2 font-heading text-4xl font-bold sm:text-5xl">Como podemos ajudar?</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Tutoriais, respostas rápidas e boas práticas — atualizados pela equipe StellarHost.
          </p>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2 rounded-xl border border-border bg-surface px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por palavra-chave..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </header>

        {data.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface p-16 text-center">
            <BookOpen className="mx-auto size-10 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">
              Estamos preparando os primeiros artigos. Enquanto isso,{" "}
              <Link to="/contato" className="text-brand hover:underline">fale com nossa equipe</Link>.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {byCat.map(([cat, articles]) => (
              <section key={cat}>
                <h2 className="mb-4 font-heading text-xl font-bold capitalize">{cat}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {articles.map((a) => (
                    <Link
                      key={a.id}
                      to="/ajuda/$slug"
                      params={{ slug: a.slug }}
                      className="rounded-xl border border-border bg-surface p-5 hover:border-brand/40"
                    >
                      <h3 className="font-semibold group-hover:text-brand">{a.title}</h3>
                      {a.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{a.excerpt}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
