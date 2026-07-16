// middlewares/errorHandler.js
// Este middleware captura cualquier error que ocurra en la aplicación.
// Express lo reconoce como manejador de errores porque recibe 4 parámetros: (err, req, res, next)

const errorHandler = (err, req, res, next) => {
    console.error('[ERROR]', err.message);

    // Si el error tiene un statusCode personalizado (lo pusimos nosotros), lo usamos.
    // Si no, asumimos que es un error interno del servidor (500).
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success: false,
        mensaje: err.message || 'Error interno del servidor'
    });
};

// Middleware para rutas que no existen (404)
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        mensaje: `La ruta ${req.originalUrl} no existe`
    });
};

module.exports = { errorHandler, notFound };
