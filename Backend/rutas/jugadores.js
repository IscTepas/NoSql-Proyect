const express = require("express");
const router = express.Router();

const Jugador = require("../Modelos/Jugador");

// GET - consultar todos los jugadores (soporta filtro opcional ?equipo=ID)
router.get("/", async (req, res) => {
    try {
        const { equipo } = req.query;
        const filtro = equipo ? { equipo } : {};

        const jugadores = await Jugador.find(filtro).populate("equipo");

        res.json({
            ok: true,
            data: jugadores,
            total: jugadores.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los jugadores",
            error: error.message
        });
    }
});

// GET - consultar un jugador por ID
router.get("/:id", async (req, res) => {
    try {
        const jugador = await Jugador.findById(req.params.id).populate("equipo");

        if (!jugador) {
            return res.status(404).json({
                ok: false,
                mensaje: "Jugador no encontrado"
            });
        }

        res.json({
            ok: true,
            data: jugador
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el jugador",
            error: error.message
        });
    }
});

// POST - Crear un jugador
router.post("/", async (req, res) => {
    try {
        const nuevoJugador = new Jugador(req.body);
        const jugadorGuardado = await nuevoJugador.save();
        const jugadorCompleto = await Jugador.findById(jugadorGuardado._id).populate("equipo");

        res.status(201).json({
            ok: true,
            mensaje: "Jugador creado correctamente",
            data: jugadorCompleto
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear el jugador",
            error: error.message
        });
    }
});

// PUT - Actualizar un jugador
router.put("/:id", async (req, res) => {
    try {
        const jugadorActualizado = await Jugador.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("equipo");

        if (!jugadorActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Jugador no encontrado"
            });
        }

        res.json({
            ok: true,
            mensaje: "Jugador actualizado correctamente",
            data: jugadorActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar el jugador",
            error: error.message
        });
    }
});

// DELETE - Eliminar un jugador
router.delete("/:id", async (req, res) => {
    try {
        const jugadorEliminado = await Jugador.findByIdAndDelete(req.params.id);

        if (!jugadorEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Jugador no encontrado"
            });
        }

        res.json({
            ok: true,
            mensaje: "Jugador eliminado correctamente",
            data: jugadorEliminado
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el jugador",
            error: error.message
        });
    }
});

module.exports = router;