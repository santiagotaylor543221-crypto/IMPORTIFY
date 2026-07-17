// =====================================================
// routes/simulations.js
// Todo lo relacionado con las simulaciones de importación
// Rutas disponibles:
//   POST /api/simulations        → guarda una simulación nueva
//   GET  /api/simulations        → lista todas las simulaciones guardadas
//   GET  /api/simulations/:id    → detalle de una simulación específica
//                                  (incluye datos del fabricante y costos)
// =====================================================

const pool = require('../database');
const { sendJson, readBody } = require('../helpers');

// Guarda una simulación nueva en la base de datos
async function createSimulation(req, res) {
  // Leemos los datos que manda el frontend en el body del POST
  const body = await readBody(req);

  // Verificamos que vengan todos los campos necesarios
  if (!body.name || !body.product_offer_id || !body.incoterm || !body.quantity) {
    return sendJson(res, 400, { message: 'Faltan datos: name, product_offer_id, incoterm y quantity son obligatorios' });
  }

  const result = await pool.query(
    `INSERT INTO simulations (name, product_offer_id, incoterm, quantity)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [body.name, body.product_offer_id, body.incoterm, body.quantity]
  );

  // 201 = "creado con éxito"
  sendJson(res, 201, result.rows[0]);
}

// Devuelve todas las simulaciones guardadas, de la más reciente a la más antigua
async function getAllSimulations(req, res) {
  const result = await pool.query('SELECT * FROM simulations ORDER BY created_at DESC');
  sendJson(res, 200, result.rows);
}

// Devuelve el detalle completo de una simulación:
// sus datos + los datos del fabricante + los costos calculados
async function getSimulationById(req, res, parts) {
  const simulationId = Number(parts[3]); // posición 3 en ['', 'api', 'simulations', '7']

  if (!Number.isInteger(simulationId) || simulationId <= 0) {
    return sendJson(res, 400, { message: 'El id de la simulación no es válido' });
  }

  // Traemos la simulación junto con los datos del fabricante (varios JOINs)
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

  // Traemos los costos calculados de esa simulación (si ya existen)
  const results = await pool.query(
    'SELECT * FROM simulation_results WHERE simulation_id = $1',
    [simulationId]
  );

  // Combinamos todo en un solo objeto y lo enviamos
  sendJson(res, 200, {
    ...simulation.rows[0],
    results: results.rows[0] || null,
  });
}

module.exports = { createSimulation, getAllSimulations, getSimulationById };
