import { createClient } from "@/lib/supabase/server";
import NewsManager from "@/components/admin/news-manager";
import type { AdminNewsItem } from "@/components/admin/news-manager";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("news")
    .select("id, label_en, label_jp, title, link, image_url, featured, sort_order, active")
    .order("sort_order", { ascending: true });

  return <NewsManager initialItems={(data ?? []) as AdminNewsItem[]} />;
}
