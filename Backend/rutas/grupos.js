const express = require("express");
const router = express.Router();

const Grupo = require("../Modelos/Grupo");

// GET - consultar todos los grupos
router.get("/", async (req, res) => {
    try {
        const grupos = await Grupo.find().populate("equipos.equipo");
        res.json({
            ok: true,
            data: grupos,
            total: grupos.length
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener los grupos",
            error: error.message
        });
    }
});

// GET - consultar grupo por ID
router.get("/:id", async (req, res) => {
    try {
        const grupo = await Grupo.findById(req.params.id).populate("equipos.equipo");
        if (!grupo) {
            return res.status(404).json({
                ok: false,
                mensaje: "Grupo no encontrado"
            });
        }
        res.json({
            ok: true,
            data: grupo
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al obtener el grupo",
            error: error.message
        });
    }
});

// POST - Crear grupo
router.post("/", async (req, res) => {
    try {
        const nuevoGrupo = new Grupo(req.body);
        const grupoGuardado = await nuevoGrupo.save();
        const grupoCompleto = await Grupo.findById(grupoGuardado._id).populate("equipos.equipo");

        res.status(201).json({
            ok: true,
            mensaje: "Grupo creado correctamente",
            data: grupoCompleto
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al crear el grupo",
            error: error.message
        });
    }
});

// PUT - Actualizar grupo
router.put("/:id", async (req, res) => {
    try {
        const grupoActualizado = await Grupo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate("equipos.equipo");

        if (!grupoActualizado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Grupo no encontrado"
            });
        }

        res.json({
            ok: true,
            mensaje: "Grupo actualizado correctamente",
            data: grupoActualizado
        });
    } catch (error) {
        res.status(400).json({
            ok: false,
            mensaje: "Error al actualizar el grupo",
            error: error.message
        });
    }
});

// DELETE - Eliminar grupo
router.delete("/:id", async (req, res) => {
    try {
        const grupoEliminado = await Grupo.findByIdAndDelete(req.params.id);
        if (!grupoEliminado) {
            return res.status(404).json({
                ok: false,
                mensaje: "Grupo no encontrado"
            });
        }
        res.json({
            ok: true,
            mensaje: "Grupo eliminado correctamente",
            data: grupoEliminado
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            mensaje: "Error al eliminar el grupo",
            error: error.message
        });
    }
});

module.exports = router;