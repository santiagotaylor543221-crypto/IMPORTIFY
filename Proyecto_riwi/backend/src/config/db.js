// config/db.js
// Crea y exporta el pool de conexiones a MySQL.
// Un "pool" es un grupo de conexiones reutilizables, más eficiente que abrir una nueva por cada consulta.

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = pool;
