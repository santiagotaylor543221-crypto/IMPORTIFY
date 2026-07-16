// routes/productoRoutes.js

const express = require('express');
const router = express.Router();
const ProductoController = require('../controllers/productoController');
const { validarProducto } = require('../middlewares/validaciones');

router.get('/', ProductoController.getAll);
router.get('/:id', ProductoController.getById);
router.post('/', validarProducto, ProductoController.create);
router.put('/:id', validarProducto, ProductoController.update);
router.delete('/:id', ProductoController.delete);

module.exports = router;
