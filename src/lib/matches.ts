import { createClient } from "@/lib/supabase/server";
import type { Match } from "@/types/home";

type MatchRow = {
  id: string;
  round: number;
  date: string;
  tournament_name: string;
  court_location: string;
  kaizen_is_home: boolean;
  opponent_name: string;
  opponent_logo_url: string;
  time_label: string;
  score_home: number | null;
  score_away: number | null;
};

function toMatch(row: MatchRow): Match {
  return {
    id: row.id,
    round: row.round,
    date: row.date,
    tournamentName: row.tournament_name,
    courtLocation: row.court_location,
    kaizenIsHome: row.kaizen_is_home,
    opponentName: row.opponent_name,
    opponentLogoUrl: row.opponent_logo_url,
    timeLabel: row.time_label,
    // A match without both scores is still upcoming — the site renders time_label then.
    scores:
      row.score_home === null || row.score_away === null
        ? undefined
        : { home: row.score_home, away: row.score_away },
  };
}

export async function getMatches(): Promise<Match[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kaizen_matches")
    .select(
      "id, round, date, tournament_name, court_location, kaizen_is_home, opponent_name, opponent_logo_url, time_label, score_home, score_away",
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as MatchRow[]).map(toMatch);
}
