# Sistema Cloud – CRUD de Productos

React + Netlify Functions (API REST) + Google Sheets. Despliegue: GitHub + Netlify.

## Login
Usuario `admin` / Contraseña `12345`.

## Configuración de Google Sheets
1. Crea una hoja con una pestaña llamada **Productos** y en la fila 1: `ID | Nombre | Precio | Categoría | Stock`.
2. En Google Cloud Console: crea un proyecto, habilita **Google Sheets API**, crea una **cuenta de servicio** y descarga su clave JSON.
3. Comparte la hoja con el `client_email` de la cuenta de servicio (rol Editor).
4. Copia el ID de la hoja (el texto entre `/d/` y `/edit` en la URL).

## Variables de entorno (Netlify → Site configuration → Environment variables)
`SHEET_ID`, `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY` (ver `.env.example`; pegar la clave con los `\n`).

## Local
```
npm install
cp .env.example .env   # completar valores
npm run dev            # netlify dev
```

## API
- GET `/.netlify/functions/productos`
- POST `/.netlify/functions/productos`
- PUT `/.netlify/functions/productos/:id`
- DELETE `/.netlify/functions/productos/:id`

## Despliegue
Sube el repo a GitHub → Netlify "Import from Git" → build `npm run build`, publish `dist` (ya en `netlify.toml`).
