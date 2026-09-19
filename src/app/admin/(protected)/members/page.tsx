import { createClient } from "@/lib/supabase/server";
import MembersManager from "@/components/admin/members-manager";
import type { AdminMember } from "@/components/admin/members-manager";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("kaizen_members")
    .select("id, full_name, gender, nationality, event, photo_url, sort_order, active")
    .order("sort_order", { ascending: true });

  return <MembersManager initialMembers={(data ?? []) as AdminMember[]} />;
}
