// =====================================================
// routes/products.js
// Todo lo relacionado con los productos y sus ofertas
// Ruta disponible:
//   GET /api/products/:id/offers → devuelve el fabricante y precio de un producto
// =====================================================

const pool = require('../database');
const { sendJson } = require('../helpers');

// Devuelve la oferta de un producto: qué fabricante lo vende y a qué precio FOB
// El id del producto viene en la URL: /api/products/5/offers
async function getOffersByProduct(req, res, parts) {
  const productId = Number(parts[3]); // posición 3 en ['', 'api', 'products', '5', 'offers']

  if (!Number.isInteger(productId) || productId <= 0) {
    return sendJson(res, 400, { message: 'El id del producto no es válido' });
  }

  // Traemos el producto junto con los datos del fabricante (JOIN entre tablas)
  const result = await pool.query(
    `SELECT product_offers.id AS offer_id, product_offers.base_fob_price, manufacturers.*
     FROM product_offers
     JOIN manufacturers ON manufacturers.id = product_offers.manufacturer_id
     WHERE product_offers.product_id = $1`,
    [productId]
  );

  sendJson(res, 200, result.rows);
}

module.exports = { getOffersByProduct };
