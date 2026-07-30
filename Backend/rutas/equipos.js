const express = require("express");
const router = express.Router();

const Equipo = require("../Modelos/Equipo");

// GET - consultar todos los equipos (filtro opcional ?año=YYYY)
router.get("/", async (req, res) => {
    try {
        const filtro = req.query.año ? { año: Number(req.query.año) } : {};
        let query = Equipo.find(filtro).lean();
        if (req.query.skip) query = query.skip(Number(req.query.skip));
        if (req.query.limit) query = query.limit(Number(req.query.limit));
        const equipos = await query;
        res.json({
            ok: true,
            data: equipos,
            total: equipos.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los equipos",
            error: error.message
        });
    }
});

// GET - consultar un equipo por ID
router.get("/:id", async (req, res) => {
    try {
        const equipo = await Equipo.findById(req.params.id).lean();
        if (!equipo) {
            return res.status(404).json({
                ok: false,
                mensaje: "Equipo no encontrado"
            });
        }
        res.json({
            ok: true,
            data: equipo
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el equipo",
            error: error.message
        });
    }
});

// POST - Crear un equipo
router.post("/", async (req, res) => {
    try {
        const nuevoEquipo = new Equipo(req.body);
        const equipoGuardado = await nuevoEquipo.save();
        res.status(201).json({
            ok: true,
            mensaje: "Equipo creado correctamente",
            data: equipoGuardado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear el equipo",
            error: error.message
        });
    }
});

// PUT - Actualizar un equipo
router.put("/:id", async (req, res) => {
    try {
        const equipoActualizado = await Equipo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!equipoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Equipo no encontrado"
            });
        }
        res.json({
            ok: true,
            mensaje: "Equipo actualizado correctamente",
            data: equipoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar el equipo",
            error: error.message
        });
    }
});

// DELETE - Eliminar un equipo
router.delete("/:id", async (req, res) => {
    try {
        const equipoEliminado = await Equipo.findByIdAndDelete(req.params.id);
        if (!equipoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Equipo no encontrado"
            });
        }
        res.json({
            ok: true,
            mensaje: "Equipo eliminado correctamente",
            data: equipoEliminado
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el equipo",
            error: error.message
        });
    }
});

module.exports = router;