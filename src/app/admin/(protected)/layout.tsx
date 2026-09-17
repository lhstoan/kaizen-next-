import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/admin/sign-out-button";
import AdminSidebar from "@/components/admin/admin-sidebar";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="relative h-screen overflow-hidden bg-neutral-100">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background: "radial-gradient(50% 40% at 15% 0%, rgba(224,3,39,0.08) 0%, rgba(224,3,39,0) 70%)",
        }}
      />

      <aside className="fixed inset-y-0 left-0 z-20 w-60">
        <AdminSidebar />
      </aside>

      <header className="fixed inset-x-0 left-60 top-0 z-10 flex h-16 items-center justify-between bg-white/70 px-6 shadow-[0_1px_0_rgba(0,0,0,0.06)] backdrop-blur-md">
        <span className="text-sm text-neutral-500">
          Signed in as <span className="font-medium text-neutral-900">{user?.email}</span>
        </span>
        <SignOutButton />
      </header>

      <main className="relative h-full overflow-y-auto pl-60 pt-16">
        <div className="mx-auto max-w-5xl p-8">{children}</div>
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
