require('dotenv').config();
const http = require('http');
const pool = require('./database');
const { setCorsHeaders, sendJson } = require('./helpers');

const { getCountries }                                         = require('./routes/countries');
const { getCategories, getProductsByCategory }                 = require('./routes/categories');
const { getOffersByProduct }                                   = require('./routes/products');
const { getTaxRule }                                           = require('./routes/taxRules');
const { createSimulation, getAllSimulations, getSimulationById, deleteSimulation } = require('./routes/simulations');

const PORT = Number(process.env.PORT) || 4000;

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const method  = req.method;
  const fullUrl = `http://localhost${req.url || '/'}`;
  const urlObj  = new URL(fullUrl);
  const path    = urlObj.pathname;
  const query   = Object.fromEntries(urlObj.searchParams.entries());
  const parts   = path.split('/');

  try {
    if (method === 'GET'  && path === '/api/health')     { const r = await pool.query('SELECT NOW()'); return sendJson(res, 200, { status:'ok', db_time: r.rows[0].now }); }
    if (method === 'GET'  && path === '/api/countries')  return await getCountries(req, res);
    if (method === 'GET'  && path === '/api/categories') return await getCategories(req, res);
    if (method === 'GET'  && parts[2] === 'categories' && parts[4] === 'products') return await getProductsByCategory(req, res, parts);
    if (method === 'GET'  && parts[2] === 'products'   && parts[4] === 'offers')   return await getOffersByProduct(req, res, parts);
    if (method === 'GET'  && path === '/api/tax-rules') return await getTaxRule(req, res, query);
    if (method === 'POST' && path === '/api/simulations')                           return await createSimulation(req, res);
    if (method === 'GET'  && path === '/api/simulations')                           return await getAllSimulations(req, res);
    if (method === 'GET'  && parts[2] === 'simulations' && parts[3])               return await getSimulationById(req, res, parts);
    if (method === 'DELETE' && parts[2] === 'simulations' && parts[3])             return await deleteSimulation(req, res, parts);

    return sendJson(res, 404, { message: 'Ruta no encontrada' });
  } catch (error) {
    console.error('Error:', error);
    return sendJson(res, 500, { message: error.message });
  }
});

server.listen(PORT, () => console.log(`Importify API corriendo en http://localhost:${PORT}`));

server.on('error', err => {
  if (err.code === 'EADDRINUSE') console.error(`Puerto ${PORT} ocupado. Cambia PORT en .env.`);
  else console.error('Error en el servidor:', err);
  process.exit(1);
});

process.on('SIGINT', async () => { await pool.end(); process.exit(0); });
