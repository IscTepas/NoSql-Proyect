const express = require("express");
require("./conexion");

const Equipo = require("./Modelos/equipo");
const Estadio = require("./Modelos/estadio");
const Grupo = require("./Modelos/grupo");
const Partido = require("./Modelos/juegos");
const TablaPosiciones = require("./Modelos/tabla");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log("Modelo cargados correctamente");
});