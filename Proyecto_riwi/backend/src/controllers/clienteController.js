// controllers/clienteController.js
// El controlador recibe la solicitud HTTP, llama al modelo y devuelve la respuesta.
// No contiene lógica de negocio ni SQL.

const ClienteModel = require('../models/clienteModel');

const ClienteController = {

    getAll: async (req, res, next) => {
        try {
            const clientes = await ClienteModel.getAll();
            res.json({ success: true, data: clientes });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const cliente = await ClienteModel.getById(req.params.id);
            if (!cliente) {
                return res.status(404).json({ success: false, mensaje: 'Cliente no encontrado' });
            }
            res.json({ success: true, data: cliente });
        } catch (err) {
            next(err);
        }
    },

    create: async (req, res, next) => {
        try {
            const { nombre, correo } = req.body;

            // Verificar correo duplicado
            const existe = await ClienteModel.getByCorreo(correo);
            if (existe) {
                return res.status(409).json({ success: false, mensaje: 'Ya existe un cliente con ese correo' });
            }

            const id = await ClienteModel.create({ nombre: nombre.trim(), correo: correo.trim() });
            res.status(201).json({ success: true, mensaje: 'Cliente creado', id_cliente: id });
        } catch (err) {
            next(err);
        }
    },

    update: async (req, res, next) => {
        try {
            const { nombre, correo } = req.body;
            const afectados = await ClienteModel.update(req.params.id, { nombre: nombre.trim(), correo: correo.trim() });
            if (!afectados) {
                return res.status(404).json({ success: false, mensaje: 'Cliente no encontrado' });
            }
            res.json({ success: true, mensaje: 'Cliente actualizado' });
        } catch (err) {
            next(err);
        }
    },

    delete: async (req, res, next) => {
        try {
            const afectados = await ClienteModel.delete(req.params.id);
            if (!afectados) {
                return res.status(404).json({ success: false, mensaje: 'Cliente no encontrado' });
            }
            res.json({ success: true, mensaje: 'Cliente eliminado' });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = ClienteController;
