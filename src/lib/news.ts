import { createClient } from "@/lib/supabase/server";
import type { NewsItem } from "@/types/home";

type NewsRow = {
  id: string;
  label_en: string;
  label_jp: string;
  title: string;
  link: string;
  image_url: string;
  featured: boolean;
};

function toNewsItem(row: NewsRow): NewsItem {
  return {
    id: row.id,
    labelEn: row.label_en,
    labelJp: row.label_jp,
    title: row.title,
    link: row.link,
    imageUrl: row.image_url,
    featured: row.featured,
  };
}

export async function getNews(): Promise<NewsItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, label_en, label_jp, title, link, image_url, featured")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as NewsRow[]).map(toNewsItem);
}
