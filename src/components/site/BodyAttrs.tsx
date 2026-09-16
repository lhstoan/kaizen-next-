"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function BodyAttrs() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  useEffect(() => {
    document.body.id = isHome ? "home" : "";
    document.body.className = isHome ? "" : "under";
  }, [isHome]);

  return null;
}
