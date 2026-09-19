import { createClient } from "@/lib/supabase/server";
import type { HallOfFameEntry } from "@/types/home";

type HallOfFameRow = {
  id: string;
  year: number;
  rank: string;
  champion_name: string;
  champion_logo_url: string;
  top_scorers: { name: string; logo_url: string }[];
};

function toEntry(row: HallOfFameRow): HallOfFameEntry {
  return {
    id: row.id,
    year: row.year,
    rank: row.rank,
    championName: row.champion_name,
    championLogoUrl: row.champion_logo_url,
    topScorers: (row.top_scorers ?? []).map((s) => ({ name: s.name, logoUrl: s.logo_url })),
  };
}

export async function getHallOfFame(): Promise<HallOfFameEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hall_of_fame")
    .select("id, year, rank, champion_name, champion_logo_url, top_scorers")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as HallOfFameRow[]).map(toEntry);
}
