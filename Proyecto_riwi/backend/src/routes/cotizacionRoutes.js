// routes/cotizacionRoutes.js

const express = require('express');
const router = express.Router();
const CotizacionController = require('../controllers/cotizacionController');
const { validarCotizacion } = require('../middlewares/validaciones');

router.get('/', CotizacionController.getAll);
router.get('/:id', CotizacionController.getById);
router.post('/', validarCotizacion, CotizacionController.create);

module.exports = router;
