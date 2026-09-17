import { createClient } from "@/lib/supabase/server";
import type { Partner } from "@/types/home";

type PartnerRow = {
  id: string;
  name: string;
  logo_url: string;
  main_partner: boolean;
  international_partner: boolean;
};

function toPartner(row: PartnerRow): Partner {
  return { id: row.id, name: row.name, logoUrl: row.logo_url };
}

export async function getPartnerGroups() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, logo_url, main_partner, international_partner")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    return { mainPartners: [], internationalPartners: [], otherPartners: [] };
  }

  const rows = data as PartnerRow[];
  return {
    mainPartners: rows.filter((r) => r.main_partner).map(toPartner),
    internationalPartners: rows.filter((r) => r.international_partner).map(toPartner),
    otherPartners: rows.filter((r) => !r.main_partner && !r.international_partner).map(toPartner),
  };
}
