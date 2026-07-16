// controllers/productoController.js

const ProductoModel = require('../models/productoModel');

const ProductoController = {

    getAll: async (req, res, next) => {
        try {
            const productos = await ProductoModel.getAll();
            res.json({ success: true, data: productos });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const producto = await ProductoModel.getById(req.params.id);
            if (!producto) {
                return res.status(404).json({ success: false, mensaje: 'Producto no encontrado' });
            }
            res.json({ success: true, data: producto });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const { nombre, descripcion, precio } = req.body;
            const id = await ProductoModel.create({ nombre: nombre.trim(), descripcion, precio: parseFloat(precio) });
            res.status(201).json({ success: true, mensaje: 'Producto creado', id_producto: id });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const { nombre, descripcion, precio } = req.body;
            const afectados = await ProductoModel.update(req.params.id, {
                nombre: nombre.trim(),
                descripcion,
                precio: parseFloat(precio)
            });
            if (!afectados) {
                return res.status(404).json({ success: false, mensaje: 'Producto no encontrado' });
            }
            res.json({ success: true, mensaje: 'Producto actualizado' });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const afectados = await ProductoModel.delete(req.params.id);
            if (!afectados) {
                return res.status(404).json({ success: false, mensaje: 'Producto no encontrado' });
            }
            res.json({ success: true, mensaje: 'Producto eliminado' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ProductoController;
