const mongoose = require("../conexion");

const EstadioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true
    },

    fifaName: {
      type: String,
      trim: true
    },

    ciudad: {
      type: String,
      required: true,
      trim: true
    },

    pais: {
      type: String,
      required: true,
      trim: true
    },

    capacidad: {
      type: Number,
      required: true,
      min: 0
    },

    region: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Estadio = mongoose.model("Estadio", EstadioSchema);

module.exports = Estadio;