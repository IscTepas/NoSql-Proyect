"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FLAG_GRADIENTS: Record<string, [string, string, string]> = {
  ARG: ["#74acdf", "#ffffff", "#74acdf"], AUS: ["#012169", "#ffcd00", "#00843d"],
  BRA: ["#009c3b", "#ffdf00", "#002776"], COL: ["#fcd116", "#003893", "#ce1126"],
  ECU: ["#ffdd00", "#034ea2", "#ed1c24"], EGY: ["#ce1126", "#ffffff", "#000000"],
  ENG: ["#f3f4f6", "#ce1124", "#ffffff"], ESP: ["#aa151b", "#f1bf00", "#aa151b"],
  FRA: ["#002654", "#ffffff", "#ed2939"], GER: ["#111111", "#dd0000", "#ffcc00"],
  MEX: ["#006847", "#ffffff", "#ce1126"], NED: ["#ae1c28", "#ffffff", "#21468b"],
  NOR: ["#ba0c2f", "#ffffff", "#00205b"], POR: ["#046a38", "#da291c", "#ffcc00"],
  RUS: ["#ffffff", "#0039a6", "#d52b1e"], SEN: ["#00853f", "#fdef42", "#e31b23"],
  SUI: ["#d52b1e", "#ffffff", "#d52b1e"], URU: ["#5bc0eb", "#ffffff", "#f6b40e"],
};

function getFlagGradient(code: string): [string, string, string] {
  return FLAG_GRADIENTS[code] || ["#2563eb", "#ffffff", "#c8a951"];
}

interface Scorer {
  nombre: string;
  fifaCode: string;
  goles: number;
}

export default function TopScorersChart({ topScorers, year }: { topScorers: Scorer[]; year: number }) {
  const top8 = topScorers.slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={top8.map((scorer) => ({ ...scorer, chartLabel: `${scorer.nombre} · ${scorer.fifaCode}` }))} layout="vertical" margin={{ left: 0, right: 18 }}>
        <defs>
          {top8.map((scorer, index) => {
            const colors = getFlagGradient(scorer.fifaCode);
            return (
              <linearGradient key={scorer.nombre} id={`flag-gradient-${year}-${index}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colors[0]} />
                <stop offset="50%" stopColor={colors[1]} />
                <stop offset="100%" stopColor={colors[2]} />
              </linearGradient>
            );
          })}
        </defs>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="chartLabel" width={125} tick={{ fontSize: 9, fill: "#505B73" }} />
        <Tooltip cursor={{ fill: "rgba(200,169,81,0.06)" }} contentStyle={{ backgroundColor: "white", border: "1px solid rgba(200,169,81,.25)", borderRadius: "10px", fontSize: "11px", boxShadow: "0 8px 20px rgba(0,0,0,.08)" }} />
        <Bar dataKey="goles" radius={[0, 6, 6, 0]} barSize={13}>
          {top8.map((_, i) => (
            <Cell key={i} fill={`url(#flag-gradient-${year}-${i})`} stroke="rgba(3,18,43,0.12)" strokeWidth={0.5} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
