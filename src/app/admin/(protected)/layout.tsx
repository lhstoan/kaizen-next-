import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/sign-out-button";
import AdminSidebar from "@/components/admin/admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="h-screen overflow-hidden bg-neutral-50">
      <header className="fixed inset-x-0 top-0 z-20 flex h-14 items-center justify-between border-b bg-white px-4">
        <span className="font-semibold text-neutral-900">Kaizen Admin</span>
        <SignOutButton />
      </header>
      <aside className="fixed inset-y-0 left-0 top-14 z-10 w-56 overflow-y-auto border-r bg-white">
        <AdminSidebar />
      </aside>
      <main className="h-full overflow-y-auto pt-14 pl-56">
        <div className="mx-auto max-w-5xl p-6">{children}</div>
      </main>
    </div>
  );
}
