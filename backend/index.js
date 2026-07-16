require('dotenv').config();
const http = require('http');
const pool = require('./database');

const PORT = Number(process.env.PORT) || 4000;

// --------------------------------------------------
// Funciones de ayuda
// --------------------------------------------------

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(error);
      }
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

// --------------------------------------------------
// Servidor
// --------------------------------------------------

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  const method = req.method;

  // Parseo robusto de URL y query params
  // Usamos un host ficticio para poder usar la API URL en Node nativo
  const fullUrl = `http://localhost${req.url || '/'}`;
  const urlObj = new URL(fullUrl);
  const path = urlObj.pathname;
  const query = Object.fromEntries(urlObj.searchParams.entries());
  const parts = path.split('/');

  try {
    // GET /api/health
    if (method === 'GET' && path === '/api/health') {
      const result = await pool.query('SELECT NOW()');
      return sendJson(res, 200, { status: 'ok', db_time: result.rows[0].now });
    }

    // GET /api/countries
    if (method === 'GET' && path === '/api/countries') {
      const result = await pool.query('SELECT * FROM countries ORDER BY id');
      return sendJson(res, 200, result.rows);
    }

    // GET /api/categories
    if (method === 'GET' && path === '/api/categories') {
      const result = await pool.query('SELECT * FROM categories ORDER BY id');
      return sendJson(res, 200, result.rows);
    }

    // GET /api/categories/:id/products
    if (
      method === 'GET' &&
      parts.length >= 5 &&
      parts[1] === 'api' &&
      parts[2] === 'categories' &&
      parts[4] === 'products'
    ) {
      const categoryId = Number(parts[3]);
      if (!Number.isInteger(categoryId) || categoryId <= 0) {
        return sendJson(res, 400, { message: 'categoryId inválido' });
      }

      const result = await pool.query(
        'SELECT * FROM products WHERE category_id = $1 ORDER BY id',
        [categoryId]
      );
      return sendJson(res, 200, result.rows);
    }

    // GET /api/products/:id/offers
    if (
      method === 'GET' &&
      parts.length >= 5 &&
      parts[1] === 'api' &&
      parts[2] === 'products' &&
      parts[4] === 'offers'
    ) {
      const productId = Number(parts[3]);
      if (!Number.isInteger(productId) || productId <= 0) {
        return sendJson(res, 400, { message: 'productId inválido' });
      }

      const result = await pool.query(
        `SELECT product_offers.id AS offer_id, product_offers.base_fob_price, manufacturers.*
         FROM product_offers
         JOIN manufacturers ON manufacturers.id = product_offers.manufacturer_id
         WHERE product_offers.product_id = $1`,
        [productId]
      );
      return sendJson(res, 200, result.rows);
    }

    // GET /api/tax-rules?categoryId=1&countryId=2
    if (method === 'GET' && path === '/api/tax-rules') {
      const categoryId = query.categoryId ? Number(query.categoryId) : null;
      const countryId = query.countryId ? Number(query.countryId) : null;

      if (!categoryId || !countryId) {
        return sendJson(res, 400, { message: 'categoryId y countryId son requeridos' });
      }

      const result = await pool.query(
        'SELECT * FROM tax_rules WHERE category_id = $1 AND country_id = $2',
        [categoryId, countryId]
      );
      return sendJson(res, 200, result.rows[0] || null);
    }

    // POST /api/simulations
    if (method === 'POST' && path === '/api/simulations') {
      const body = await readBody(req);

      // Validaciones básicas
      if (!body.name || !body.product_offer_id || !body.incoterm || !body.quantity) {
        return sendJson(res, 400, { message: 'Faltan campos requeridos en el body' });
      }

      const result = await pool.query(
        `INSERT INTO simulations (name, product_offer_id, incoterm, quantity)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [body.name, body.product_offer_id, body.incoterm, body.quantity]
      );
      return sendJson(res, 201, result.rows[0]);
    }

    // GET /api/simulations
    if (method === 'GET' && path === '/api/simulations') {
      const result = await pool.query('SELECT * FROM simulations ORDER BY created_at DESC');
      return sendJson(res, 200, result.rows);
    }

    // GET /api/simulations/:id
    if (
      method === 'GET' &&
      parts.length >= 3 &&
      parts[1] === 'api' &&
      parts[2] === 'simulations' &&
      parts[3]
    ) {
      const simulationId = Number(parts[3]);
      if (!Number.isInteger(simulationId) || simulationId <= 0) {
        return sendJson(res, 400, { message: 'simulationId inválido' });
      }

      const simulation = await pool.query(
        `SELECT
           s.*,
           m.name AS manufacturer_name,
           m.contact_email,
           m.website,
           c.name AS manufacturer_country
         FROM simulations s
         JOIN product_offers po ON po.id = s.product_offer_id
         JOIN manufacturers m ON m.id = po.manufacturer_id
         JOIN countries c ON c.id = m.country_id
         WHERE s.id = $1`,
        [simulationId]
      );

      const results = await pool.query(
        'SELECT * FROM simulation_results WHERE simulation_id = $1',
        [simulationId]
      );

      return sendJson(res, 200, { ...simulation.rows[0], results: results.rows[0] || null });
    }

    // Ruta no encontrada
    return sendJson(res, 404, { message: 'Ruta no encontrada' });
  } catch (error) {
    console.error('Error en handler:', error);
    return sendJson(res, 500, { message: error.message });
  }
});

// Escuchar y manejar errores del server
server.listen(PORT, () => {
  console.log(`Importify API corriendo en http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Puerto ${PORT} en uso. Usa otro puerto o mata el proceso que lo ocupa.`);
    process.exit(1);
  } else {
    console.error('Error en el servidor HTTP:', err);
    process.exit(1);
  }
});

// Cerrar pool al terminar el proceso
process.on('SIGINT', async () => {
  console.log('Cerrando pool de Postgres...');
  try {
    await pool.end();
  } catch (e) {
    console.error('Error cerrando pool:', e);
  }
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  // intentar cerrar pool antes de salir
  pool.end().finally(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
  // no forzamos salida inmediata aquí, pero lo registramos
});
