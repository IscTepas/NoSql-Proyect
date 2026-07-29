"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Trophy, Users, MapPin, Calendar, Swords, BarChart3, Home, Circle, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";

function extractYear(pathname: string): number | null {
  const match = pathname.match(/^\/mundiales\/(\d{4})/);
  return match ? Number(match[1]) : null;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const year = useMemo(() => extractYear(pathname), [pathname]);

  const links = useMemo(() => {
    if (year) {
      const base = `/mundiales/${year}`;
      return [
        { href: base, label: "Inicio", icon: Home },
        { href: `${base}/selecciones`, label: "Selecciones", icon: Users },
        { href: `${base}/grupos`, label: "Grupos", icon: Trophy },
        { href: `${base}/estadios`, label: "Estadios", icon: MapPin },
        { href: `${base}/partidos`, label: "Partidos", icon: Calendar },
        { href: `${base}/bracket`, label: "Bracket", icon: Swords },
        { href: `${base}/jugadores`, label: "Jugadores", icon: BarChart3 },
      ];
    }
    return [
      { href: "/", label: "Inicio", icon: Home },
      { href: "/selecciones", label: "Selecciones", icon: Users },
      { href: "/grupos", label: "Grupos", icon: Trophy },
      { href: "/estadios", label: "Estadios", icon: MapPin },
      { href: "/partidos", label: "Partidos", icon: Calendar },
      { href: "/bracket", label: "Bracket", icon: Swords },
      { href: "/jugadores", label: "Jugadores", icon: BarChart3 },
    ];
  }, [year]);

  const miExperienciaHref = year ? `/mi-experiencia/${year}` : "/mi-experiencia";
  const miExperienciaActive = pathname === miExperienciaHref || pathname.startsWith(`${miExperienciaHref}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Circle className="h-5 w-5" fill="currentColor" />
          </div>
          <span className="hidden sm:inline">
            <span className="text-primary">FIFA</span> World Cups
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((link) => {
            const active = pathname === link.href || (year && link.href !== `/mundiales/${year}` && pathname.startsWith(link.href) && link.href !== "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground hover:shadow-sm"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center">
          <Link
            href={miExperienciaHref}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 mr-2",
              miExperienciaActive
                ? "bg-[var(--wc-gold)] text-white shadow-md shadow-[var(--wc-gold)]/20"
                : "text-[var(--wc-gold-dark)] bg-[var(--wc-gold)]/10 hover:bg-[var(--wc-gold)]/20 hover:text-[var(--wc-gold-dark)] border border-[var(--wc-gold)]/20"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Mi Experiencia
          </Link>
        </div>

        <button
          className="md:hidden flex items-center justify-center h-10 w-10 rounded-lg hover:bg-accent transition-colors"
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
        <nav className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 pb-3 pt-2 space-y-1">
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
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-accent-foreground"
                )}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
          <Link
            href={miExperienciaHref}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 mt-2 border-t border-gray-100 pt-3",
              miExperienciaActive
                ? "bg-[var(--wc-gold)]/10 text-[var(--wc-gold-dark)] shadow-sm"
                : "text-[var(--wc-gold-dark)] hover:bg-[var(--wc-gold)]/10"
            )}
          >
            <Sparkles className="h-4 w-4" />
            Mi Experiencia
          </Link>
        </nav>
      )}
    </header>
  );
}
