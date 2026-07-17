// =====================================================
// routes/taxRules.js
// Todo lo relacionado con las reglas de impuestos
// Ruta disponible:
//   GET /api/tax-rules?categoryId=1&countryId=2
//   → devuelve el arancel, IVA y otros cargos
//     para esa combinación de categoría + país
// =====================================================

const pool = require('../database');
const { sendJson } = require('../helpers');

// Devuelve los impuestos que aplican según la categoría y el país elegido
async function getTaxRule(req, res, query) {
  const categoryId = query.categoryId ? Number(query.categoryId) : null;
  const countryId = query.countryId ? Number(query.countryId) : null;

  // Validamos que ambos parámetros vengan en la URL
  if (!categoryId || !countryId) {
    return sendJson(res, 400, { message: 'Se necesitan categoryId y countryId en la URL' });
  }

  const result = await pool.query(
    'SELECT * FROM tax_rules WHERE category_id = $1 AND country_id = $2',
    [categoryId, countryId]
  );

  // Si no hay regla para esa combinación, devolvemos null
  sendJson(res, 200, result.rows[0] || null);
}

module.exports = { getTaxRule };
