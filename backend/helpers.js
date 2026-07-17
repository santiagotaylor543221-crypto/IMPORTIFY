// =====================================================
// helpers.js
// Funciones pequeñas que se usan en todos los archivos
// de rutas para no repetir el mismo código una y otra vez
// =====================================================

// Le dice al navegador que SÍ puede hacer peticiones
// a esta API desde otro origen (ej: el frontend)
function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

// Envía una respuesta en formato JSON al frontend
// statusCode: 200 = ok, 400 = error del usuario, 500 = error del servidor
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// Lee los datos que manda el frontend en el body de un POST
// Node los recibe en pedacitos, así que hay que juntarlos
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk; // va juntando los pedacitos
    });

    req.on('end', () => {
      try {
        // cuando termina, convierte el texto a objeto JavaScript
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

module.exports = { setCorsHeaders, sendJson, readBody };
