// routes/clienteRoutes.js

const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/clienteController');
const { validarCliente } = require('../middlewares/validaciones');

router.get('/', ClienteController.getAll);
router.get('/:id', ClienteController.getById);
router.post('/', validarCliente, ClienteController.create);
router.put('/:id', validarCliente, ClienteController.update);
router.delete('/:id', ClienteController.delete);

module.exports = router;
