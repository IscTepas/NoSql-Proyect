const mongoose = require("../conexion");

const TablaPosicionesSchema = new mongoose.Schema(
  {
    grupo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Grupo",
      required: true,
      unique: true
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
          default: 0,
          min: 0
        },

        victorias: {
          type: Number,
          default: 0,
          min: 0
        },

        derrotas: {
          type: Number,
          default: 0,
          min: 0
        },

        empates: {
          type: Number,
          default: 0,
          min: 0
        },

        puntos: {
          type: Number,
          default: 0,
          min: 0
        },

        golesFavor: {
          type: Number,
          default: 0,
          min: 0
        },

        golesContra: {
          type: Number,
          default: 0,
          min: 0
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

const TablaPosiciones = mongoose.model(
  "TablaPosiciones",
  TablaPosicionesSchema
);

module.exports = TablaPosiciones;