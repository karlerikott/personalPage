"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { label: "About",      href: "/#about" },
  { label: "Experience", href: "/#experience" },
  { label: "Contact",    href: "/#contact" },
  { label: "Tracker",   href: "/tracker" },
  { label: "Journal",   href: "/diary" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-10 px-8 py-5 flex justify-between items-center border-b border-white/5 bg-[#021b26]/90 backdrop-blur-sm">
      <Link href="/" className="font-[family-name:var(--font-geist-mono)] text-sm text-white/40 tracking-widest uppercase">
        KEO
      </Link>

      {/* Desktop links */}
      <div className="hidden md:flex gap-8 text-sm text-white/50">
        {NAV_LINKS.map((l) => (
          <a key={l.label} href={l.href} className="hover:text-white transition-colors">
            {l.label}
          </a>
        ))}
      </div>

      {/* Hamburger button — mobile only */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
        className="md:hidden flex flex-col gap-1.5 p-1"
      >
        <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${open ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${open ? "opacity-0" : ""}`} />
        <span className={`block w-5 h-px bg-white/60 transition-all duration-300 ${open ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#021b26]/95 backdrop-blur-sm border-b border-white/5 flex flex-col px-8 py-4 gap-4">
          {NAV_LINKS.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="text-white/50 hover:text-white transition-colors text-sm py-1"
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
}
