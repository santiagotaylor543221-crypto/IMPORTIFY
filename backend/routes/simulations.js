// =====================================================
// routes/simulations.js
// =====================================================

const pool = require('../database');
const { sendJson, readBody } = require('../helpers');

async function createSimulation(req, res) {
  const body = await readBody(req);
  if (!body.name || !body.product_offer_id || !body.incoterm || !body.quantity) {
    return sendJson(res, 400, { message: 'Faltan datos: name, product_offer_id, incoterm y quantity' });
  }
  const result = await pool.query(
    `INSERT INTO simulations (name, product_offer_id, incoterm, quantity)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [body.name, body.product_offer_id, body.incoterm, body.quantity]
  );
  sendJson(res, 201, result.rows[0]);
}

async function getAllSimulations(req, res) {
  const result = await pool.query('SELECT * FROM simulations ORDER BY created_at DESC');
  sendJson(res, 200, result.rows);
}

// Devuelve simulación + datos del fabricante + regla fiscal
// (para que el dashboard pueda calcular los costos sin llamadas extra)
async function getSimulationById(req, res, parts) {
  const simulationId = Number(parts[3]);
  if (!Number.isInteger(simulationId) || simulationId <= 0) {
    return sendJson(res, 400, { message: 'simulationId inválido' });
  }

  const simulation = await pool.query(
    `SELECT
       s.*,
       m.name         AS manufacturer_name,
       m.contact_email,
       m.website,
       c.name         AS manufacturer_country,
       po.base_fob_price,
       tr.tariff_rate,
       tr.vat_rate,
       tr.other_fees
     FROM simulations s
     JOIN product_offers po ON po.id = s.product_offer_id
     JOIN manufacturers  m  ON m.id  = po.manufacturer_id
     JOIN countries      c  ON c.id  = m.country_id
     JOIN products       pr ON pr.id = po.product_id
     LEFT JOIN tax_rules tr ON tr.category_id = pr.category_id
                            AND tr.country_id  = m.country_id
     WHERE s.id = $1`,
    [simulationId]
  );

  const results = await pool.query(
    'SELECT * FROM simulation_results WHERE simulation_id = $1',
    [simulationId]
  );

  sendJson(res, 200, { ...simulation.rows[0], results: results.rows[0] || null });
}

// Elimina una simulación por ID
async function deleteSimulation(req, res, parts) {
  const simulationId = Number(parts[3]);
  if (!Number.isInteger(simulationId) || simulationId <= 0) {
    return sendJson(res, 400, { message: 'simulationId inválido' });
  }
  await pool.query('DELETE FROM simulations WHERE id = $1', [simulationId]);
  sendJson(res, 200, { message: 'Simulación eliminada correctamente' });
}

module.exports = { createSimulation, getAllSimulations, getSimulationById, deleteSimulation };
