"use client";

import { useRouter } from "next/navigation";
import type { WorldCup } from "@/lib/worldcups";
import Flag from "@/components/Flag";
import { Trophy, Users, Calendar, MapPin, ArrowRight } from "lucide-react";

interface MundialCardProps {
  mundial: WorldCup;
  isActive?: boolean;
}

export default function MundialCard({ mundial, isActive }: MundialCardProps) {
  const router = useRouter();
  const c = mundial.color;

  return (
    <button
      type="button"
      onClick={() => isActive && router.push(mundial.route)}
      className={`
        group relative block h-full w-full overflow-hidden rounded-[1.75rem] text-left text-white
        transition-shadow duration-500 ease-out
        ${isActive ? "ring-2 ring-white/50" : "ring-1 ring-white/10"}
      `}
      style={{
        background: `linear-gradient(155deg, color-mix(in oklab, ${c} 88%, white 10%) 0%, color-mix(in oklab, ${c} 65%, black 15%) 55%, color-mix(in oklab, ${c} 45%, black 45%) 100%)`,
        boxShadow: isActive
          ? `0 30px 70px -18px color-mix(in oklab, ${c} 65%, transparent), 0 8px 20px -8px rgba(0,0,0,0.35)`
          : "0 14px 34px -14px rgba(0,0,0,0.4)",
      }}
    >
      {mundial.logo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mundial.logo}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)] scale-125 object-cover opacity-70 blur-2xl mix-blend-soft-light"
        />
      )}

      <div
        className="pointer-events-none absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_75%_100%,rgba(0,0,0,0.35),transparent_60%)]" />
      {mundial.logo && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      )}

      {!mundial.logo && (
        <span
          className="absolute -bottom-4 left-3 select-none font-mono text-7xl font-black leading-none tracking-tighter text-white/[0.14] sm:text-8xl"
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.15)" }}
        >
          {mundial.year}
        </span>
      )}

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

      <div className="relative z-10 flex h-full flex-col p-4 sm:p-6">
        {mundial.logo && (
          <div className="flex flex-1 min-h-0 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mundial.logo}
              alt={mundial.name}
              className="max-h-[160px] max-w-[78%] object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] sm:max-h-[210px] lg:max-h-[250px]"
            />
          </div>
        )}

        <div className={`flex flex-col gap-2 sm:gap-2.5 ${mundial.logo ? "" : "mt-auto"}`}>
          {!mundial.logo && (
            <div>
              <h3 className="text-lg font-bold leading-tight sm:text-2xl">{mundial.name}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-white/70 sm:text-sm">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{mundial.host}</span>
              </div>
            </div>
          )}

          {mundial.logo ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{mundial.host}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Trophy className="h-3.5 w-3.5 shrink-0 text-[var(--wc-gold)]" />
                <span className="truncate font-semibold text-white">{mundial.champion}</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-sm">
              <Trophy className="h-4 w-4 shrink-0 text-[var(--wc-gold)]" />
              <span className="truncate font-semibold">{mundial.champion}</span>
            </div>
          )}

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
      </div>
    </button>
  );
}
