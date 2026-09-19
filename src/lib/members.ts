import { createClient } from "@/lib/supabase/server";
import type { Member, MemberGender } from "@/types/home";

type MemberRow = {
  id: string;
  full_name: string;
  gender: MemberGender;
  nationality: string;
  event: string[];
  photo_url: string;
};

function toMember(row: MemberRow): Member {
  return {
    id: row.id,
    fullName: row.full_name,
    gender: row.gender,
    nationality: row.nationality,
    event: row.event ?? [],
    photoUrl: row.photo_url,
  };
}

export async function getMembers(): Promise<Member[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("kaizen_members")
    .select("id, full_name, gender, nationality, event, photo_url")
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error || !data) return [];

  return (data as MemberRow[]).map(toMember);
}
