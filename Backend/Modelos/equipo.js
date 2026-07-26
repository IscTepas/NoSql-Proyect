const mongoose = require("../conexion");

const EquipoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    nombreNormalizado: {
      type: String,
      trim: true
    },
    continente: {
      type: String,
      trim: true
    },
    banderaIcono: {
      type: String,
      default: ""
    },
    fifaCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    grupo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    },
    confederacion: {
      type: String,
      trim: true,
      uppercase: true
    }
  },
  {
    timestamps: true
  }
);

const Equipo = mongoose.model("Equipo", EquipoSchema);

module.exports = Equipo;