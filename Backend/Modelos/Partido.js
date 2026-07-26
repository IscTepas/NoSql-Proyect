const mongoose = require("../conexion");

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
      type: Number
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
    equipo1: {
      type: String,
      required: true,
      trim: true
    },
    equipo2: {
      type: String,
      required: true,
      trim: true
    },
    marcador: {
      ft: [{ type: Number }], // [goles_eq1, goles_eq2] Final Time
      ht: [{ type: Number }], // Half Time
      et: [{ type: Number }], // Extra Time
      p: [{ type: Number }]   // Penaltis
    },
    goles1: [GolSchema],
    goles2: [GolSchema],
    grupo: {
      type: String,
      trim: true
    },
    estadio: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Partido = mongoose.model("Partido", PartidoSchema);

module.exports = Partido;