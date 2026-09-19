"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Users, Trophy, Calendar, ShoppingBag, Medal, Newspaper } from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/matches", label: "Matches", icon: Calendar },
  { href: "/admin/products", label: "Products", icon: ShoppingBag },
  { href: "/admin/hall-of-fame", label: "Hall of Fame", icon: Medal },
  { href: "/admin/news", label: "Hot News", icon: Newspaper },
  { href: "/admin/partners", label: "Partners", icon: Trophy },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-neutral-950">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(120% 60% at 50% -10%, rgba(224,3,39,0.25) 0%, rgba(224,3,39,0) 60%)",
        }}
      />

      <div className="relative flex flex-col items-center py-8">
        <div className="absolute top-1/2 size-32 -translate-y-1/2 rounded-full bg-[#e00327]/25 blur-3xl" />
        <div className="relative rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.35)]">
          <Image src="/images/logo.png" alt="Kaizen Badminton" width={112} height={112} priority />
        </div>
      </div>

      <div className="relative mx-5 mb-4 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <nav className="relative flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item, i) => {
          const active = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#e00327] text-white shadow-[0_4px_14px_rgba(224,3,39,0.35)]"
                    : "text-neutral-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
