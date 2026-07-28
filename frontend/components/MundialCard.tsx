"use client";

import { useRouter } from "next/navigation";
import type { WorldCup } from "@/lib/worldcups";
import Flag from "@/components/Flag";
import { Trophy, Users, Calendar, MapPin, ArrowRight } from "lucide-react";

interface MundialCardProps {
  mundial: WorldCup;
  isActive?: boolean;
  sizeClassName: string;
}

export default function MundialCard({ mundial, isActive, sizeClassName }: MundialCardProps) {
  const router = useRouter();
  const c = mundial.color;

  return (
    <button
      type="button"
      onClick={() => isActive && router.push(mundial.route)}
      className={`
        group relative block overflow-hidden rounded-[1.75rem] text-left text-white
        transition-[width,height,transform] duration-500 ease-out
        ${sizeClassName}
        ${isActive ? "ring-2 ring-white/50" : "ring-1 ring-white/10"}
      `}
      style={{
        background: `linear-gradient(155deg, color-mix(in oklab, ${c} 88%, white 10%) 0%, color-mix(in oklab, ${c} 65%, black 15%) 55%, color-mix(in oklab, ${c} 45%, black 45%) 100%)`,
        boxShadow: isActive
          ? `0 30px 70px -18px color-mix(in oklab, ${c} 65%, transparent), 0 8px 20px -8px rgba(0,0,0,0.35)`
          : "0 14px 34px -14px rgba(0,0,0,0.4)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_100%,rgba(0,0,0,0.35),transparent_60%)]" />

      <span
        className="absolute -bottom-4 left-3 select-none font-mono text-7xl font-black leading-none tracking-tighter text-white/[0.14] sm:text-8xl"
        style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
      >
        {mundial.year}
      </span>

      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
        <span className="rounded-full bg-white/15 px-2.5 py-1 font-mono text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm">
          {mundial.year}
        </span>
      </div>
      {mundial.championFlag && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 rounded-full bg-white/15 px-2 py-1 ring-1 ring-white/25 backdrop-blur-sm">
          <Trophy className="h-3.5 w-3.5 text-[var(--wc-gold)]" />
          <Flag code={mundial.championFlag} size={18} />
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col justify-end gap-2.5 p-4 sm:gap-3 sm:p-6">
        <div>
          <h3 className="text-lg font-bold leading-tight sm:text-2xl">{mundial.name}</h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-white/70 sm:text-sm">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{mundial.host}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm">
          <Trophy className="h-4 w-4 shrink-0 text-[var(--wc-gold)]" />
          <span className="truncate font-semibold">{mundial.champion}</span>
        </div>

        <div className="flex items-center gap-4 border-t border-white/20 pt-2.5 text-xs text-white/70 sm:pt-3">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>{mundial.teams} equipos</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{mundial.matches} partidos</span>
          </div>
        </div>

        <div
          className={`flex items-center gap-1.5 text-sm font-semibold text-white transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0"
          }`}
        >
          Ver mundial <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </button>
  );
}
