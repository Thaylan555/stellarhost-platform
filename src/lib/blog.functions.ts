import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function pub() {
  return createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

export const listBlogPosts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = pub();
  const [postsRes, catsRes] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, cover_image_url, tags, reading_minutes, published_at, is_featured, category_id")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(50),
    supabase.from("blog_categories").select("id, slug, name, color").order("sort_order"),
  ]);
  return { posts: postsRes.data ?? [], categories: catsRes.data ?? [] };
});

export const getBlogPost = createServerFn({ method: "GET" })
  .inputValidator((raw: unknown) => z.object({ slug: z.string().min(1).max(200) }).parse(raw))
  .handler(async ({ data }) => {
    const supabase = pub();
    const { data: post, error } = await supabase
      .from("blog_posts")
      .select("id, slug, title, excerpt, content, cover_image_url, tags, reading_minutes, published_at, seo_title, seo_description, views_count, category_id")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) throw new Error("Post não encontrado");

    await supabase.rpc("increment_blog_views", { _slug: data.slug });

    const { data: category } = post.category_id
      ? await supabase.from("blog_categories").select("slug, name, color").eq("id", post.category_id).maybeSingle()
      : { data: null };

    const { data: related } = await supabase
      .from("blog_posts")
      .select("slug, title, excerpt, cover_image_url, reading_minutes, published_at")
      .eq("status", "published")
      .neq("slug", data.slug)
      .order("published_at", { ascending: false })
      .limit(3);

    return { post, category, related: related ?? [] };
  });
