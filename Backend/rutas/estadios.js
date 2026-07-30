const express = require("express");
const router = express.Router();

const Estadio = require("../Modelos/Estadio");

// GET - consultar todos los estadios (filtro opcional ?año=YYYY)
router.get("/", async (req, res) => {
    try {
        const filtro = req.query.año ? { año: Number(req.query.año) } : {};
        let query = Estadio.find(filtro).lean();
        if (req.query.skip) query = query.skip(Number(req.query.skip));
        if (req.query.limit) query = query.limit(Number(req.query.limit));
        const estadios = await query;
        res.status(200).json({
            ok: true,
            data: estadios,
            total: estadios.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los estadios",
            error: error.message
        });
    }
});

// GET - consultar un estadio por ID
router.get("/:id", async (req, res) => {
    try {
        const estadio = await Estadio.findById(req.params.id).lean();
        if (!estadio) {
            return res.status(404).json({
                ok: false,
                mensaje: "Estadio no encontrado"
            });
        }
        res.status(200).json({
            ok: true,
            data: estadio
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el estadio",
            error: error.message
        });
    }
});

// POST - Crear un estadio
router.post("/", async (req, res) => {
    try {
        const nuevoEstadio = new Estadio(req.body);
        const estadioGuardado = await nuevoEstadio.save();
        res.status(201).json({
            ok: true,
            mensaje: "Estadio creado correctamente",
            data: estadioGuardado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear el estadio",
            error: error.message
        });
    }
});

// PUT - Actualizar un estadio
router.put("/:id", async (req, res) => {
    try {
        const estadioActualizado = await Estadio.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!estadioActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Estadio no encontrado"
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: "Estadio actualizado correctamente",
            data: estadioActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar el estadio",
            error: error.message
        });
    }
});

// DELETE - Eliminar un estadio
router.delete("/:id", async (req, res) => {
    try {
        const estadioEliminado = await Estadio.findByIdAndDelete(req.params.id);
        if (!estadioEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Estadio no encontrado"
            });
        }
        res.status(200).json({
            ok: true,
            mensaje: "Estadio eliminado correctamente",
            data: estadioEliminado
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el estadio",
            error: error.message
        });
    }
});

module.exports = router;