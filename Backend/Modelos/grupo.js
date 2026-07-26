const mongoose = require("../conexion");

const GrupoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true // ej: "Group A"
    },
    torneo: {
      type: String,
      default: "World Cup 2026",
      trim: true // Para identificar a qué mundial pertenece
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

const Grupo = mongoose.model("Grupo", GrupoSchema);

module.exports = Grupo;