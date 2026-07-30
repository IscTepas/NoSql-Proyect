const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
require("./conexion");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));
app.use("/mundiales-assets", express.static(path.join(__dirname, "..", "frontend", "public", "mundiales")));

// Importar los archivos de rutas
const equiposRoutes = require("./rutas/equipos");
const estadiosRoutes = require("./rutas/estadios");
const gruposRoutes = require("./rutas/grupos");
const partidosRoutes = require("./rutas/partidos");
const jugadoresRoutes = require("./rutas/jugadores");
const opinionesRoutes = require("./rutas/opiniones");

// Montar las rutas bajo /api
app.use("/api/equipos", equiposRoutes);
app.use("/api/estadios", estadiosRoutes);
app.use("/api/grupos", gruposRoutes);
app.use("/api/partidos", partidosRoutes);
app.use("/api/jugadores", jugadoresRoutes);
app.use("/api/opiniones", opinionesRoutes);

// Ruta raíz → documentación HTML
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Ruta de prueba
app.get("/api", (req, res) => {
    res.json({
        ok: true,
        mensaje: "API del Mundial 2026",
        rutas: ["/api/equipos", "/api/estadios", "/api/grupos", "/api/partidos", "/api/jugadores", "/api/opiniones"]
    });
});

// Exportar para Vercel (serverless)
module.exports = app;
