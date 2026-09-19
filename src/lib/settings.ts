import { createClient } from "@/lib/supabase/server";

export type SiteSettings = {
  banner_pc: string;
  banner_sp: string;
  facebook_url: string;
  tiktok_url: string;
  youtube_url: string;
};

// Values the site shipped with — used until the row exists, and whenever a row is
// blanked out, so the public page never renders an empty banner or a dead link.
export const SITE_SETTING_DEFAULTS: SiteSettings = {
  banner_pc: "/images/banner.png",
  banner_sp: "/images/banner-sp.jpg",
  facebook_url: "https://www.facebook.com/profile.php?id=61572834952468",
  tiktok_url: "https://www.tiktok.com/@kaizen.badminton",
  youtube_url: "https://www.youtube.com/@KaizenBadmintonHouse",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");

  if (error || !data) return SITE_SETTING_DEFAULTS;

  const stored = Object.fromEntries((data as { key: string; value: string }[]).map((r) => [r.key, r.value]));

  return Object.fromEntries(
    Object.entries(SITE_SETTING_DEFAULTS).map(([key, fallback]) => [key, stored[key] || fallback]),
  ) as SiteSettings;
}
