export interface WorldCup {
  id: string;
  year: number;
  name: string;
  host: string;
  champion: string;
  championFlag: string;
  runnerUp: string;
  teams: number;
  matches: number;
  goals: number;
  topScorer: string;
  color: string;
  route: string;
  logo?: string;
}

export const WORLDCUPS: WorldCup[] = [
  {
    id: "2026",
    year: 2026,
    name: "FIFA World Cup 2026",
    host: "Estados Unidos, México, Canadá",
    champion: "España",
    championFlag: "ES",
    runnerUp: "Por definirse",
    teams: 48,
    matches: 104,
    goals: 0,
    topScorer: "Por definirse",
    color: "var(--wc-2026)",
    route: "/mundiales/2026",
    logo: "/mundiales/fifa-world-cup-2026-logo-footylogos-1200.png",
  },
  {
    id: "2022",
    year: 2022,
    name: "FIFA World Cup Qatar 2022",
    host: "Catar",
    champion: "Argentina",
    championFlag: "AR",
    runnerUp: "Francia",
    teams: 32,
    matches: 64,
    goals: 172,
    topScorer: "Kylian Mbappé",
    color: "var(--wc-2022)",
    route: "/mundiales/2022",
    logo: "/mundiales/World-Cup-Qatar-2022-FIFA-Logo-PNG-Transparent-Image.png",
  },
  {
    id: "2018",
    year: 2018,
    name: "FIFA World Cup Russia 2018",
    host: "Rusia",
    champion: "Francia",
    championFlag: "FR",
    runnerUp: "Croacia",
    teams: 32,
    matches: 64,
    goals: 169,
    topScorer: "Harry Kane",
    color: "var(--wc-2018)",
    route: "/mundiales/2018",
    logo: "/mundiales/2018_FIFA_World_Cup.svg.png",
  },
  {
    id: "2014",
    year: 2014,
    name: "FIFA World Cup Brazil 2014",
    host: "Brasil",
    champion: "Alemania",
    championFlag: "DE",
    runnerUp: "Argentina",
    teams: 32,
    matches: 64,
    goals: 171,
    topScorer: "James Rodríguez",
    color: "var(--wc-2014)",
    route: "/mundiales/2014",
    logo: "/mundiales/Brasil_2014_logo.png",
  },
];

export const PROJECT_INFO = {
  title: "FIFA World Cup Portal",
  description:
    "Explora la historia de los mundiales de la FIFA. Desde Brasil 2014 hasta Norteamérica 2026, descubre estadísticas, selecciones, partidos y mucho más.",
  totalWorldCups: 4,
  totalTeams: 144,
  totalMatches: 296,
  totalGoals: 512,
};
