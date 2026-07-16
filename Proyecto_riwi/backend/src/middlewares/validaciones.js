// middlewares/validaciones.js
// Valida los datos que llegan en el body antes de que lleguen al controlador.
// Si algo está mal, responde con error 400 y no deja pasar la solicitud.

const validarCliente = (req, res, next) => {
    const { nombre, correo } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, mensaje: 'El campo nombre es obligatorio' });
    }

    if (!correo || typeof correo !== 'string' || correo.trim() === '') {
        return res.status(400).json({ success: false, mensaje: 'El campo correo es obligatorio' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
        return res.status(400).json({ success: false, mensaje: 'El formato del correo no es válido' });
    }

    next();
};

const validarProducto = (req, res, next) => {
    const { nombre, precio } = req.body;

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        return res.status(400).json({ success: false, mensaje: 'El campo nombre es obligatorio' });
    }

    if (precio === undefined || precio === null) {
        return res.status(400).json({ success: false, mensaje: 'El campo precio es obligatorio' });
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum <= 0) {
        return res.status(400).json({ success: false, mensaje: 'El precio debe ser un número positivo mayor a 0' });
    }

    next();
};

const validarCotizacion = (req, res, next) => {
    const { cliente_id, producto_id, pais_origen, pais_destino, valor_producto } = req.body;

    const camposRequeridos = { cliente_id, producto_id, pais_origen, pais_destino, valor_producto };
    for (const [campo, valor] of Object.entries(camposRequeridos)) {
        if (valor === undefined || valor === null) {
            return res.status(400).json({ success: false, mensaje: `El campo ${campo} es obligatorio` });
        }
    }

    const numericos = { cliente_id, producto_id, pais_origen, pais_destino, valor_producto };
    for (const [campo, valor] of Object.entries(numericos)) {
        if (isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
            return res.status(400).json({ success: false, mensaje: `El campo ${campo} debe ser un número positivo` });
        }
    }

    if (parseInt(pais_origen) === parseInt(pais_destino)) {
        return res.status(400).json({ success: false, mensaje: 'El país de origen y destino no pueden ser el mismo' });
    }

    next();
};

module.exports = { validarCliente, validarProducto, validarCotizacion };
