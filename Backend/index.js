const express = require("express");
require("./conexion");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Servidor funcionando");
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
});