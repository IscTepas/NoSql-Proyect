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

EquipoSchema.index({ fifaCode: 1, año: 1 });

const Equipo = mongoose.model("Equipo", EquipoSchema);

module.exports = Equipo;