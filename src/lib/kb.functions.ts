import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const listKbArticles = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = pub();
  const { data } = await supabase
    .from("kb_articles")
    .select("id, slug, title, excerpt, category, tags, views_count, helpful_count")
    .eq("status", "published")
    .order("sort_order")
    .order("title");
  return data ?? [];
});

export const getKbArticle = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(raw))
  .handler(async ({ data }) => {
    const supabase = pub();
    const { data: article, error } = await supabase
      .from("kb_articles")
      .select("id, slug, title, excerpt, content, category, tags, views_count, helpful_count, not_helpful_count")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!article) throw new Error("Artigo não encontrado");
    await supabase.rpc("increment_kb_views", { _slug: data.slug });
    return article;
  });
