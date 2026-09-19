import { createClient } from "@/lib/supabase/server";
import type { Post } from "@/types/home";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  cover_url: string;
  published_at: string;
};

const COLUMNS = "id, title, slug, excerpt, body, cover_url, published_at";

function toPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    excerpt: row.excerpt,
    body: row.body,
    coverUrl: row.cover_url,
    publishedAt: row.published_at,
  };
}

export async function getPosts(): Promise<Post[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kaizen_posts")
    .select(COLUMNS)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as PostRow[]).map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kaizen_posts")
    .select(COLUMNS)
    .eq("active", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  return toPost(data as PostRow);
}
