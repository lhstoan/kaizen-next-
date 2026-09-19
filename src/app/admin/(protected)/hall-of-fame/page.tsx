import { createClient } from "@/lib/supabase/server";
import HallOfFameManager from "@/components/admin/hall-of-fame-manager";
import type { AdminHallOfFameEntry } from "@/components/admin/hall-of-fame-manager";

export default async function AdminHallOfFamePage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hall_of_fame")
    .select("id, year, rank, champion_name, champion_logo_url, top_scorers, sort_order, active")
    .order("sort_order", { ascending: true });

  return <HallOfFameManager initialEntries={(data ?? []) as AdminHallOfFameEntry[]} />;
}
