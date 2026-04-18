"use client";

import Link from "next/link";
import { useState } from "react";

const nav = [
  { href: "/", label: "Home" },
  { href: "/company", label: "Company" },
  { href: "/service", label: "Service" },
  { href: "/message", label: "Message" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-navy-100">
      <div className="container-max flex items-center justify-between h-16 md:h-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl font-semibold tracking-wider2 text-navy-900">
            Corte
          </span>
          <span className="hidden md:inline text-[10px] tracking-wider2 text-navy-500">
            CORTE INC.
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-navy-800 hover:text-navy-500 transition"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          aria-label="menu"
          className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5"
          onClick={() => setOpen(!open)}
        >
          <span
            className={`block w-6 h-px bg-navy-900 transition ${
              open ? "translate-y-[5px] rotate-45" : ""
            }`}
          />
          <span
            className={`block w-6 h-px bg-navy-900 transition ${
              open ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-navy-100 bg-white">
          <div className="container-max py-4 flex flex-col">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-navy-800 border-b border-navy-50 last:border-0"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
