"use client";

import { useState } from "react";
import { Sparkles, Album, Shirt, MessageSquare, Award } from "lucide-react";
import MiAlbumPersonal from "./MiAlbumPersonal";
import MiOnceIdeal from "./MiOnceIdeal";
import MiExperienciaFIFA from "./MiExperienciaFIFA";
import MisLogros from "./MisLogros";

const TABS = [
  { id: "album", label: "Mi Álbum", icon: Album },
  { id: "once", label: "Mi Once Ideal", icon: Shirt },
  { id: "experiencia", label: "Mi Experiencia", icon: MessageSquare },
  { id: "logros", label: "Mis Logros", icon: Award },
];

export default function MiExperienciaPage({ year }: { year: number }) {
  const [activeTab, setActiveTab] = useState("album");

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 text-[var(--wc-black)]">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[var(--wc-gold)] to-[var(--wc-gold-dark)] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            Mi Experiencia {year}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tu rincón personal para vivir el Mundial {year} a tu manera
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border-b border-gray-200 pb-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 border-b-2 ${
                isActive
                  ? "border-[var(--wc-gold)] text-[var(--wc-gold-dark)] bg-[var(--wc-gold)]/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-gray-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === "album" && <MiAlbumPersonal year={year} />}
        {activeTab === "once" && <MiOnceIdeal year={year} />}
        {activeTab === "experiencia" && <MiExperienciaFIFA year={year} />}
        {activeTab === "logros" && <MisLogros year={year} />}
      </div>
    </div>
  );
}
