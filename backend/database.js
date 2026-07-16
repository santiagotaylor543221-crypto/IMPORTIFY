require('dotenv').config();
const { Pool } = require('pg');

console.log('DBG DB_USER type:', typeof process.env.DB_USER, 'present:', !!process.env.DB_USER);
console.log('DBG DB_PASSWORD type:', typeof process.env.DB_PASSWORD, 'present:', !!process.env.DB_PASSWORD);
console.log('DBG DB_HOST type:', typeof process.env.DB_HOST, 'present:', !!process.env.DB_HOST);
console.log('DBG DB_PORT type:', typeof process.env.DB_PORT, 'present:', !!process.env.DB_PORT);
console.log('DBG DB_NAME type:', typeof process.env.DB_NAME, 'present:', !!process.env.DB_NAME);

const pool = new Pool({
  user: String(process.env.DB_USER || ''),
  password: String(process.env.DB_PASSWORD || ''), // fuerza string
  host: String(process.env.DB_HOST || 'localhost'),
  port: Number(process.env.DB_PORT || 5432),       // fuerza número
  database: String(process.env.DB_NAME || ''),
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de Postgres', err);
  process.exit(-1);
});

module.exports = pool;
