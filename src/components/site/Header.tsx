"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "WE'RE KAIZEN" },
  { href: "/matches", label: "MATCHES" },
  { href: "/team-member", label: "TEAM MEMBER" },
  { href: "/products", label: "PRODUCT" },
  { href: "/hall-of-fame", label: "HALL OF FAME" },
  { href: "/blogs", label: "BLOGS" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 100);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("open-nav", navOpen);
  }, [navOpen]);

  return (
    <header>
      <div className={`iHeader${scrolled ? " scroll" : ""}`}>
        <div className="iHeader--logo">
          <Link href="/">
            <Image src="/images/logo.png" alt="Kaizen Badminton" width={160} height={60} />
          </Link>
        </div>
        <div className="iHeader--menu">
          <ul className="iHeader--list">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} onClick={() => setNavOpen(false)}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="iHeader--hamburger">
          <div
            className={`hamburger${navOpen ? " is-active" : ""}`}
            id="hamburgerMenu"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </div>
        </div>
      </div>
    </header>
  );
}
