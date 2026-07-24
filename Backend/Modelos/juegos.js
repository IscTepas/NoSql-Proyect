const mongoose = require("../conexion");

const PartidoSchema = new mongoose.Schema(
  {
    equipoLocal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      default: null
    },

    equipoVisitante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      default: null
    },

    marcadorLocal: {
      type: Number,
      default: 0,
      min: 0
    },

    marcadorVisitante: {
      type: Number,
      default: 0,
      min: 0
    },

    penalesLocal: {
      type: Number,
      default: null,
      min: 0
    },

    penalesVisitante: {
      type: Number,
      default: null,
      min: 0
    },

    equipoGanador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo",
      default: null
    },

    goleadoresLocal: {
      type: [String],
      default: []
    },

    goleadoresVisitante: {
      type: [String],
      default: []
    },

    grupo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grupo",
      default: null
    },

    jornada: {
      type: Number,
      min: 1
    },

    fecha: {
      type: Date,
      required: true
    },

    estadio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Estadio",
      required: true
    },

    finalizado: {
      type: Boolean,
      default: false
    },

    estado: {
      type: String,
      enum: ["programado", "en_curso", "finalizado", "suspendido"],
      default: "programado"
    },

    minuto: {
      type: Number,
      default: 0,
      min: 0
    },

    fase: {
      type: String,
      enum: [
        "grupos",
        "dieciseisavos",
        "octavos",
        "cuartos",
        "semifinal",
        "tercer_lugar",
        "final"
      ],
      default: "grupos"
    },

    etiquetaLocal: {
      type: String,
      default: "",
      trim: true
    },

    etiquetaVisitante: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Partido = mongoose.model("Partido", PartidoSchema);

module.exports = Partido;