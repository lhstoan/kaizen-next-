import { createClient } from "@/lib/supabase/server";
import PartnersManager from "@/components/admin/partners-manager";
import type { AdminPartner } from "@/components/admin/partners-manager";

export default async function AdminPartnersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("id, name, logo_url, main_partner, international_partner, sort_order, active")
    .order("sort_order", { ascending: true });

  return <PartnersManager initialPartners={(data ?? []) as AdminPartner[]} />;
}
