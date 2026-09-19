import SettingsManager from "@/components/admin/settings-manager";
import { getSiteSettings } from "@/lib/settings";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return <SettingsManager initialSettings={settings} />;
}
