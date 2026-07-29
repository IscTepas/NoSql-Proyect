const mongoose = require("../conexion");

const OpinionSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: true,
      trim: true
    },
    texto: {
      type: String,
      required: true,
      trim: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    fecha: {
      type: String,
      required: true
    },
    año: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
);

OpinionSchema.index({ año: 1 });

const Opinion = mongoose.model("Opinion", OpinionSchema);

module.exports = Opinion;
