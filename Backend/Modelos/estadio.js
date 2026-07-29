const mongoose = require("../conexion");

const EstadioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },
    ciudad: {
      type: String,
      required: true,
      trim: true
    },
    capacidad: {
      type: Number
    },
    zonaHoraria: {
      type: String,
      trim: true
    },
    codigoPais: {
      type: String,
      lowercase: true,
      trim: true
    },
    pais: {
      type: String,
      trim: true
    },
    coordenadas: {
      type: String,
      trim: true
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

const Estadio = mongoose.model("Estadio", EstadioSchema);

module.exports = Estadio;