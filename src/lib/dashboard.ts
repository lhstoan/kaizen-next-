import { createClient } from "@/lib/supabase/server";

export type SectionStat = {
  key: string;
  label: string;
  href: string;
  table: string;
  total: number;
  active: number;
};

// Every content table the admin owns, in sidebar order.
const SECTIONS: { key: string; label: string; href: string; table: string }[] = [
  { key: "members", label: "Members", href: "/admin/members", table: "kaizen_members" },
  { key: "matches", label: "Matches", href: "/admin/matches", table: "kaizen_matches" },
  { key: "products", label: "Products", href: "/admin/products", table: "products" },
  { key: "hall_of_fame", label: "Hall of Fame", href: "/admin/hall-of-fame", table: "hall_of_fame" },
  { key: "news", label: "Hot News", href: "/admin/news", table: "news" },
  { key: "posts", label: "Blogs", href: "/admin/blogs", table: "kaizen_posts" },
  { key: "partners", label: "Partners", href: "/admin/partners", table: "partners" },
];

export async function getDashboardStats(): Promise<SectionStat[]> {
  const supabase = await createClient();

  // head:true fetches counts only, so this stays cheap as the tables grow.
  return Promise.all(
    SECTIONS.map(async (section) => {
      const [{ count: total }, { count: active }] = await Promise.all([
        supabase.from(section.table).select("id", { count: "exact", head: true }),
        supabase.from(section.table).select("id", { count: "exact", head: true }).eq("active", true),
      ]);

      return { ...section, total: total ?? 0, active: active ?? 0 };
    }),
  );
}
