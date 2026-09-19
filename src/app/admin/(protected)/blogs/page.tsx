import { createClient } from "@/lib/supabase/server";
import PostsManager from "@/components/admin/posts-manager";
import type { AdminPost } from "@/components/admin/posts-manager";

export default async function AdminBlogsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kaizen_posts")
    .select("id, title, slug, excerpt, body, cover_url, published_at, sort_order, active")
    .order("sort_order", { ascending: true });

  return <PostsManager initialPosts={(data ?? []) as AdminPost[]} />;
}
