// =====================================================
// routes/countries.js
// Todo lo relacionado con los países de origen
// Ruta disponible: GET /api/countries
// =====================================================

const pool = require('../database');
const { sendJson } = require('../helpers');

// Devuelve la lista de todos los países disponibles
async function getCountries(req, res) {
  const result = await pool.query('SELECT * FROM countries ORDER BY id');
  sendJson(res, 200, result.rows);
}

module.exports = { getCountries };
