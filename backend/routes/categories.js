// =====================================================
// routes/categories.js
// Todo lo relacionado con las categorías de productos
// Rutas disponibles:
//   GET /api/categories              → lista todas las categorías
//   GET /api/categories/:id/products → lista los productos de una categoría
// =====================================================

const pool = require('../database');
const { sendJson } = require('../helpers');

// Devuelve la lista de todas las categorías
async function getCategories(req, res) {
  const result = await pool.query('SELECT * FROM categories ORDER BY id');
  sendJson(res, 200, result.rows);
}

// Devuelve los productos que pertenecen a una categoría específica
// El id de la categoría viene en la URL: /api/categories/2/products
async function getProductsByCategory(req, res, parts) {
  const categoryId = Number(parts[3]); // posición 3 en ['', 'api', 'categories', '2', 'products']

  if (!Number.isInteger(categoryId) || categoryId <= 0) {
    return sendJson(res, 400, { message: 'El id de la categoría no es válido' });
  }

  const result = await pool.query(
    'SELECT * FROM products WHERE category_id = $1 ORDER BY id',
    [categoryId]
  );
  sendJson(res, 200, result.rows);
}

module.exports = { getCategories, getProductsByCategory };
