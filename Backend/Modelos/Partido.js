const mongoose = require("../conexion");

// Schema para los goles anotados
const GolSchema = new mongoose.Schema(
  {
    nombre: { type: String, trim: true },
    minuto: { type: String, trim: true },
    penalti: { type: Boolean, default: false },
    autogol: { type: Boolean, default: false }
  },
  { _id: false }
);

const PartidoSchema = new mongoose.Schema(
  {
    numeroPartido: {
      type: Number,
      required: true
    },
    ronda: {
      type: String,
      required: true,
      trim: true
    },
    fecha: {
      type: String,
      required: true
    },
    hora: {
      type: String,
      trim: true
    },
    // Referencias a los Equipos
    equipo1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      required: true
    },
    equipo2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      required: true
    },
    equipoGanador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      default: null
    },
    // Estructura completa del marcador por tiempos
    marcador: {
      ft: [{ type: Number }], // Final Time [goles_eq1, goles_eq2]
      ht: [{ type: Number }], // Half Time
      et: [{ type: Number }], // Extra Time
      p: [{ type: Number }]   // Penaltis
    },
    goles1: [GolSchema],
    goles2: [GolSchema],
    // Referencia al Grupo (puede ser null en fases eliminatorias)
    grupo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grupo",
      default: null
    },
    // Referencia al Estadio
    estadio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estadio",
      default: null
    },
    año: {
      type: Number,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

PartidoSchema.index({ numeroPartido: 1, año: 1 });

const Partido = mongoose.model("Partido", PartidoSchema);

module.exports = Partido;