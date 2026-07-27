const mongoose = require("../conexion");

const GrupoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    torneo: {
      type: String,
      trim: true
    },
    año: {
      type: Number,
      required: true,
      index: true
    },
    // Guarda los nombres tal cual vienen en el JSON original: ["Mexico", "South Africa", ...]
    equiposNombres: [
      {
        type: String,
        trim: true
      }
    ],
    // Relación de Mongoose para poder usar .populate("equipos") en tu API
    equipos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipo"
      }
    ]
  },
  {
    timestamps: true
  }
);

GrupoSchema.index({ nombre: 1, año: 1 });

const Grupo = mongoose.model("Grupo", GrupoSchema);

module.exports = Grupo;