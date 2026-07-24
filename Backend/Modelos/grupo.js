const mongoose = require("../conexion");

const GrupoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    equipos: [
      {
        equipo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Equipo",
          required: true
        },

        partidosJugados: {
          type: Number,
          default: 0
        },

        victorias: {
          type: Number,
          default: 0
        },

        derrotas: {
          type: Number,
          default: 0
        },

        empates: {
          type: Number,
          default: 0
        },

        puntos: {
          type: Number,
          default: 0
        },

        golesFavor: {
          type: Number,
          default: 0
        },

        golesContra: {
          type: Number,
          default: 0
        },

        diferenciaGoles: {
          type: Number,
          default: 0
        }
      }
    ]
  },
  {
    timestamps: true
  }
);

const Grupo = mongoose.model("Grupo", GrupoSchema);

module.exports = Grupo;