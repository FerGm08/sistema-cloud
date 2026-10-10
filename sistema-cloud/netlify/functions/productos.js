const { google } = require('googleapis');

const HOJA = 'Sheet1';

const json = (statusCode, data) => ({
  statusCode,
  headers: { 
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  },
  body: JSON.stringify(data),
});

function sheets() {
  const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/spreadsheets']
  );
  return google.sheets({ version: 'v4', auth });
}

const validar = (b) =>
  b && b.nombre && String(b.nombre).trim() &&
  b.categoria && String(b.categoria).trim() &&
  !isNaN(Number(b.precio)) && Number(b.precio) >= 0 &&
  Number.isInteger(Number(b.stock)) && Number(b.stock) >= 0;

exports.handler = async (event) => {
  // Manejo de peticiones preflight (CORS)
  if (event.httpMethod === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    const api = sheets();
    const spreadsheetId = process.env.SHEET_ID;
    const id = (event.path.split('/productos/')[1] || '').replace(/\/$/, '');

    const leer = async () => {
      const r = await api.spreadsheets.values.get({ spreadsheetId, range: `${HOJA}!A2:E` });
      return r.data.values || [];
    };
    const aObj = (f) => ({ id: f[0], nombre: f[1], precio: Number(f[2]), categoria: f[3], stock: Number(f[4]) });

    if (event.httpMethod === 'GET') {
      return json(200, (await leer()).map(aObj));
    }

    if (event.httpMethod === 'POST') {
      const b = JSON.parse(event.body || '{}');
      if (!validar(b)) return json(400, { error: 'Datos incompletos o incorrectos' });
      const filas = await leer();
      const nuevoId = filas.reduce((m, f) => Math.max(m, Number(f[0]) || 0), 0) + 1;
      await api.spreadsheets.values.append({
        spreadsheetId, range: `${HOJA}!A:E`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[nuevoId, b.nombre.trim(), Number(b.precio), b.categoria.trim(), Number(b.stock)]] },
      });
      return json(201, { id: String(nuevoId), ...b });
    }

    if (!id) return json(400, { error: 'Falta el ID' });
    const filas = await leer();
    const i = filas.findIndex((f) => String(f[0]) === String(id));
    if (i === -1) return json(404, { error: 'Registro no encontrado' });

    if (event.httpMethod === 'PUT') {
      const b = JSON.parse(event.body || '{}');
      if (!validar(b)) return json(400, { error: 'Datos incompletos o incorrectos' });
      const fila = i + 2;
      await api.spreadsheets.values.update({
        spreadsheetId, range: `${HOJA}!A${fila}:E${fila}`, valueInputOption: 'USER_ENTERED',
        requestBody: { values: [[Number(id), b.nombre.trim(), Number(b.precio), b.categoria.trim(), Number(b.stock)]] },
      });
      return json(200, { id, ...b });
    }

    if (event.httpMethod === 'DELETE') {
      const meta = await api.spreadsheets.get({ spreadsheetId });
      const hoja = meta.data.sheets.find((s) => s.properties.title === HOJA);
      await api.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: { requests: [{ deleteDimension: { range: {
          sheetId: hoja.properties.sheetId, dimension: 'ROWS', startIndex: i + 1, endIndex: i + 2,
        } } }] },
      });
      return json(200, { ok: true });
    }

    return json(405, { error: 'Método no permitido' });
  } catch (e) {
    console.error(e);
    return json(500, { error: 'Error del servidor' });
  }
};