"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { Award, Medal, Target, Zap, Globe, Trophy, Loader2 } from "lucide-react";

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json()).then((j) => j.data ?? j);

interface LogroDef {
  id: number;
  icon: typeof Trophy;
  titulo: string;
  descripcion: string;
  color: string;
  check: (albumCount: number, albumTotal: number, onceCountries: Set<string>, opinionsCount: number) => boolean;
}

const LOGROS: LogroDef[] = [
  {
    id: 1, icon: Trophy, titulo: "Coleccionista Novato", descripcion: "Consigue 10 estampillas en tu álbum", color: "#c8a951",
    check: (albumCount) => albumCount >= 10,
  },
  {
    id: 2, icon: Globe, titulo: "Ciudadano del Mundo", descripcion: "Arma tu once ideal con jugadores de 5+ países", color: "#22c55e",
    check: (_, __, onceCountries) => onceCountries.size >= 5,
  },
  {
    id: 3, icon: Medal, titulo: "Experto en Fútbol", descripcion: "Completa tu once ideal con 11 jugadores", color: "#3b82f6",
    check: (_, __, onceCountries) => onceCountries.size >= 1 && onceCountries.size + 10 >= 11,
  },
  {
    id: 4, icon: Zap, titulo: "Súper Fan", descripcion: "Completa la colección completa del álbum", color: "#ef4444",
    check: (albumCount, albumTotal) => albumTotal > 0 && albumCount >= albumTotal,
  },
  {
    id: 5, icon: Target, titulo: "Crítico Experto", descripcion: "Escribe 5 opiniones sobre el Mundial", color: "#a855f7",
    check: (_, __, ___, opinionsCount) => opinionsCount >= 5,
  },
  {
    id: 6, icon: Award, titulo: "Legendario", descripcion: "Desbloquea todos los logros", color: "#f59e0b",
    check: (albumCount, albumTotal, onceCountries, opinionsCount) => {
      return LOGROS.slice(0, 5).every((l) => l.check(albumCount, albumTotal, onceCountries, opinionsCount));
    },
  },
];

interface LogroResult {
  id: number;
  icon: typeof Trophy;
  titulo: string;
  descripcion: string;
  desbloqueado: boolean;
  color: string;
}

export default function MisLogros({ year }: { year: number }) {
  const storageKeyAlbum = `wc-album-collected-${year}`;
  const storageKeyOnce = `wc-once-ideal-${year}`;

  const { data: jugadores } = useSWR(`/api/jugadores?año=${year}`, fetcher);
  const { data: opinions } = useSWR(`/api/opiniones?año=${year}`, fetcher);

  const albumIds: string[] = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKeyAlbum);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  }, [storageKeyAlbum]);

  const albumCount = albumIds.length;
  const albumTotal = Array.isArray(jugadores) ? jugadores.length : 0;

  const onceCountries = useMemo(() => {
    try {
      const raw = localStorage.getItem(storageKeyOnce);
      if (!raw) return new Set<string>();
      const once = JSON.parse(raw) as { fifaCode: string }[];
      return new Set(once.filter(Boolean).map((p) => p.fifaCode));
    } catch {
      return new Set<string>();
    }
  }, [storageKeyOnce]);

  const opinionsCount = Array.isArray(opinions) ? opinions.length : 0;

  const logros: LogroResult[] = useMemo(() => {
    return LOGROS.map((l) => ({
      id: l.id,
      icon: l.icon,
      titulo: l.titulo,
      descripcion: l.descripcion,
      color: l.color,
      desbloqueado: l.check(albumCount, albumTotal, onceCountries, opinionsCount),
    }));
  }, [albumCount, albumTotal, onceCountries, opinionsCount]);

  const desbloqueados = logros.filter((l) => l.desbloqueado).length;
  const total = logros.length;
  const progress = total > 0 ? (desbloqueados / total) * 100 : 0;

  if (!jugadores || !opinions) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--wc-gold)]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--wc-gold)]" />
            Mis Logros
          </h2>
          <p className="text-sm text-muted-foreground">
            Desbloquea logros mientras exploras tu experiencia mundialista
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className="font-bold text-[var(--wc-gold-dark)]">{desbloqueados}</span>
            <span className="text-muted-foreground">/{total}</span>
          </div>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--wc-gold)] to-[var(--wc-gold-dark)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {logros.map((logro) => {
          const Icon = logro.icon;
          return (
            <div
              key={logro.id}
              className={`rounded-xl border p-4 transition-all duration-300 ${
                logro.desbloqueado
                  ? "border-[var(--wc-gold)]/30 bg-gradient-to-br from-white to-[var(--wc-gold)]/5 shadow-md"
                  : "border-gray-200 bg-gray-50/50 opacity-60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    logro.desbloqueado
                      ? "shadow-md"
                      : "bg-gray-200"
                  }`}
                  style={logro.desbloqueado ? { backgroundColor: `${logro.color}20` } : undefined}
                >
                  <Icon
                    className="h-5 w-5"
                    style={logro.desbloqueado ? { color: logro.color } : { color: "#9ca3af" }}
                  />
                </div>
                <div>
                  <p className={`text-sm font-bold ${logro.desbloqueado ? "" : "text-gray-400"}`}>
                    {logro.titulo}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {logro.descripcion}
                  </p>
                </div>
                {logro.desbloqueado && (
                  <Trophy className="h-4 w-4 text-[var(--wc-gold)] ml-auto flex-shrink-0" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
