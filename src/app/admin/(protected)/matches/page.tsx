import { createClient } from "@/lib/supabase/server";
import MatchesManager from "@/components/admin/matches-manager";
import type { AdminMatch } from "@/components/admin/matches-manager";

export default async function AdminMatchesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kaizen_matches")
    .select(
      "id, round, date, tournament_name, court_location, kaizen_is_home, opponent_name, opponent_logo_url, time_label, score_home, score_away, sort_order, active",
    )
    .order("sort_order", { ascending: true });

  return <MatchesManager initialMatches={(data ?? []) as AdminMatch[]} />;
}
