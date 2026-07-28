"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Users, MapPin, Calendar, Swords, BarChart3, Home } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/mundiales/2026", label: "2026", icon: Trophy },
  { href: "/selecciones", label: "Selecciones", icon: Users },
  { href: "/grupos", label: "Grupos", icon: Trophy },
  { href: "/estadios", label: "Estadios", icon: MapPin },
  { href: "/partidos", label: "Partidos", icon: Calendar },
  { href: "/bracket", label: "Bracket", icon: Swords },
  { href: "/jugadores", label: "Jugadores", icon: BarChart3 },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--wc-gold)]/15 bg-white/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 font-bold text-lg tracking-tight group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--wc-gold)] text-white shadow-sm group-hover:shadow-md transition-shadow duration-300">
            <span className="text-sm font-black tracking-tighter">26</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="text-[var(--wc-gold-dark)] text-sm font-black tracking-widest">FIFA</span>
            <span className="text-[var(--wc-black)] text-xs font-medium tracking-wider">WORLD CUP</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-0.5">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--wc-gold)] text-white shadow-sm shadow-[var(--wc-gold)]/20"
                    : "text-[var(--wc-black)]/60 hover:bg-[var(--wc-gold)]/10 hover:text-[var(--wc-black)]"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-[var(--wc-gold)]/10 transition-colors text-[var(--wc-black)]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-[var(--wc-gold)]/15 bg-white/95 backdrop-blur-xl px-4 pb-3 pt-2 space-y-1">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-[var(--wc-gold)] text-white"
                    : "text-[var(--wc-black)]/60 hover:bg-[var(--wc-gold)]/10 hover:text-[var(--wc-black)]"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
