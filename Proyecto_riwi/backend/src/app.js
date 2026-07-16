// app.js
// Punto de entrada de la aplicación. Aquí se configura Express y se montan todas las rutas.

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const clienteRoutes = require('./routes/clienteRoutes');
const productoRoutes = require('./routes/productoRoutes');
const cotizacionRoutes = require('./routes/cotizacionRoutes');
const { errorHandler, notFound } = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(cors());                        // Permite solicitudes desde el frontend
app.use(express.json());                // Parsea el body como JSON

// Rutas
app.use('/api/clientes', clienteRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/cotizaciones', cotizacionRoutes);

// Ruta raíz (health check)
app.get('/', (req, res) => {
    res.json({ success: true, mensaje: 'Importify API funcionando correctamente' });
});

// Manejador de rutas no encontradas (debe ir antes del errorHandler)
app.use(notFound);

// Manejador global de errores (siempre al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
