const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

require("../conexion");

const equiposRoutes = require("../rutas/equipos");
const estadiosRoutes = require("../rutas/estadios");
const gruposRoutes = require("../rutas/grupos");
const partidosRoutes = require("../rutas/partidos");
const jugadoresRoutes = require("../rutas/jugadores");
const opinionesRoutes = require("../rutas/opiniones");

app.use("/api/equipos", equiposRoutes);
app.use("/api/estadios", estadiosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/jugadores", jugadoresRoutes);
app.use("/api/opiniones", opinionesRoutes);

module.exports = app;
