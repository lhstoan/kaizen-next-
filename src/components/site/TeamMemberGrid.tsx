"use client";

import { useState } from "react";
import MemberCard from "@/components/site/MemberCard";
import type { Member, MemberGender } from "@/types/home";

const FILTERS: { value: MemberGender | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
];

export default function TeamMemberGrid({ members }: { members: Member[] }) {
  const [active, setActive] = useState<MemberGender | "all">("all");
  const visible = active === "all" ? members : members.filter((m) => m.gender === active);

  return (
    <section className="iTeam">
      <div className="iTeam--wrap">
        <ul className="iTeam--cate">
          {FILTERS.map((filter) => (
            <li
              key={filter.value}
              className={active === filter.value ? "active" : ""}
              onClick={() => setActive(filter.value)}
            >
              <span className="en">{filter.label}</span>
              <span className="jp">プレイヤー</span>
            </li>
          ))}
        </ul>
        <ul className="iTeam--list iMember--list">
          {visible.map((member) => (
            <li key={member.id}>
              <MemberCard member={member} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
