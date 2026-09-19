"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Calendar, ShoppingBag, Medal, Newspaper, FileText, Trophy, ArrowRight, EyeOff } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SectionStat } from "@/lib/dashboard";

const ICONS: Record<string, LucideIcon> = {
  members: Users,
  matches: Calendar,
  products: ShoppingBag,
  hall_of_fame: Medal,
  news: Newspaper,
  posts: FileText,
  partners: Trophy,
};

const SITE_LINKS = [
  { href: "/", label: "Home" },
  { href: "/team-member", label: "Team member" },
  { href: "/matches", label: "Matches" },
  { href: "/products", label: "Collection" },
  { href: "/hall-of-fame", label: "Hall of fame" },
  { href: "/blogs", label: "Blogs" },
];

export default function Dashboard({ stats, email }: { stats: SectionStat[]; email?: string }) {
  const empty = stats.filter((s) => s.total === 0);
  const live = stats.reduce((sum, s) => sum + s.active, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col gap-6"
    >
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          {email ? `Signed in as ${email}. ` : ""}
          {live} item{live === 1 ? "" : "s"} live on the site.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = ICONS[stat.key] ?? FileText;
          const hidden = stat.total - stat.active;

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i, duration: 0.3 }}
            >
              <Link href={stat.href}>
                <Card className="group flex h-full flex-col gap-3 p-4 transition-colors hover:border-[#e00327]">
                  <div className="flex items-center gap-2 text-sm font-medium text-neutral-600">
                    <Icon className="size-4 text-[#e00327]" />
                    {stat.label}
                    <ArrowRight className="ml-auto size-3.5 text-neutral-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#e00327]" />
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-semibold leading-none text-neutral-900">{stat.active}</span>
                    <span className="pb-0.5 text-xs text-neutral-400">
                      {stat.total === 0 ? "nothing yet" : `of ${stat.total} shown`}
                    </span>
                  </div>
                  {hidden > 0 && (
                    <p className="flex items-center gap-1 text-xs text-neutral-400">
                      <EyeOff className="size-3" />
                      {hidden} hidden
                    </p>
                  )}
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {empty.length > 0 && (
          <Card className="flex flex-col gap-3 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Still empty</p>
            <p className="text-sm text-neutral-500">
              These sections have no content, so they render blank (or stay hidden) on the site.
            </p>
            <div className="flex flex-wrap gap-2">
              {empty.map((stat) => (
                <Link
                  key={stat.key}
                  href={stat.href}
                  className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-[#e00327] hover:text-[#e00327]"
                >
                  {stat.label}
                </Link>
              ))}
            </div>
          </Card>
        )}

        <Card className="flex flex-col gap-3 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Open the public site</p>
          <div className="flex flex-wrap gap-2">
            {SITE_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-600 hover:border-[#e00327] hover:text-[#e00327]"
              >
                {link.label}
              </a>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
