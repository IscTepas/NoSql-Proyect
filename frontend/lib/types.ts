export interface Equipo {
  _id: string;
  nombre: string;
  nombreNormalizado: string;
  continente: string;
  banderaIcono: string;
  fifaCode: string;
  grupo: string;
  confederacion: string;
  año: number;
}

export interface Estadio {
  _id: string;
  nombre: string;
  ciudad: string;
  capacidad: number;
  zonaHoraria: string;
  codigoPais: string;
  coordenadas: string;
  año: number;
}

export interface Grupo {
  _id: string;
  nombre: string;
  torneo: string;
  año: number;
  equiposNombres: string[];
  equipos: Equipo[];
}

export interface Gol {
  nombre: string;
  minuto: string;
  penalti: boolean;
  autogol: boolean;
}

export interface Marcador {
  ft: number[];
  ht: number[];
  et: number[];
  p: number[];
}

export interface Partido {
  _id: string;
  numeroPartido: number;
  ronda: string;
  fecha: string;
  hora: string;
  equipo1: Equipo;
  equipo2: Equipo;
  equipoGanador: Equipo | null;
  marcador: Marcador;
  goles1: Gol[];
  goles2: Gol[];
  grupo: Grupo | null;
  estadio: Estadio | null;
  año: number;
}

export interface JugadorClub {
  nombre: string;
  pais: string;
}

export interface Jugador {
  _id: string;
  nombre: string;
  numero: number;
  posicion: "GK" | "DF" | "MF" | "FW";
  fechaNacimiento: string;
  club: JugadorClub;
  fifaCodeEquipo: string;
  equipo: Equipo;
  año: number;
}

export interface ApiResponse<T> {
  ok: boolean;
  mensaje: string;
  data: T;
  total?: number;
}
