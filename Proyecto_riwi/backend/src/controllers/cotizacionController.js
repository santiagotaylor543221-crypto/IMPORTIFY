// controllers/cotizacionController.js

const CotizacionModel = require('../models/cotizacionModel');
const CotizacionService = require('../services/cotizacionService');

const CotizacionController = {

    getAll: async (req, res, next) => {
        try {
            const cotizaciones = await CotizacionModel.getAll();
            res.json({ success: true, data: cotizaciones });
        } catch (err) {
            next(err);
        }
    },

    getById: async (req, res, next) => {
        try {
            const cotizacion = await CotizacionModel.getById(req.params.id);
            if (!cotizacion) {
                return res.status(404).json({ success: false, mensaje: 'Cotización no encontrada' });
            }
            res.json({ success: true, data: cotizacion });
        } catch (err) {
            next(err);
        }
    },

    // El POST delega toda la lógica al servicio
    create: async (req, res, next) => {
        try {
            const resultado = await CotizacionService.calcular(req.body);
            res.status(201).json({ success: true, data: resultado });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = CotizacionController;
