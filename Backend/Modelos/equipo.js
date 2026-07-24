const mongoose = require("../conexion");

const EquipoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    bandera: {
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

    iso2: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    grupo: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

const Equipo = mongoose.model("Equipo", EquipoSchema);

module.exports = Equipo;