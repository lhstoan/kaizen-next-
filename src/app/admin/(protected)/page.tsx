import { createClient } from "@/lib/supabase/server";
import Dashboard from "@/components/admin/dashboard";
import { getDashboardStats } from "@/lib/dashboard";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const [stats, { data }] = await Promise.all([getDashboardStats(), supabase.auth.getUser()]);

  return <Dashboard stats={stats} email={data.user?.email} />;
}
