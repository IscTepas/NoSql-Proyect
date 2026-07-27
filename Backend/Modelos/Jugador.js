const mongoose = require("../conexion");

const ClubSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      trim: true
    },
    pais: {
      type: String,
      uppercase: true,
      trim: true
    }
  },
  { _id: false }
);

const JugadorSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    numero: {
      type: Number,
      required: true
    },
    posicion: {
      type: String,
      required: true,
      enum: ["GK", "DF", "MF", "FW"],
      uppercase: true,
      trim: true
    },
    fechaNacimiento: {
      type: Date
    },
    club: ClubSchema,
    fifaCodeEquipo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipo"
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

const Jugador = mongoose.model("Jugador", JugadorSchema, 'jugadores');

module.exports = Jugador;