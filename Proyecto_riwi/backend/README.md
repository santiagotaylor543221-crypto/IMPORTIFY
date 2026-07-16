# Importify — Backend API

API REST para el sistema de cotizaciones de importación de Importify.

---

## Instalación

```bash
cd backend
npm install
```

Crea tu archivo `.env` copiando el ejemplo:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de MySQL.

---

## Base de datos

Ejecuta el script SQL en MySQL Workbench o en tu terminal:

```bash
mysql -u root -p < database.sql
```

---

## Ejecución

```bash
# Desarrollo (con recarga automática)
npm run dev

# Producción
npm start
```

El servidor corre en `http://localhost:3000`

---

## Dependencias

| Paquete | Uso                               |
| ------- | --------------------------------- |
| express | Framework web                     |
| mysql2  | Conexión a MySQL                  |
| dotenv  | Variables de entorno              |
| cors    | Permitir solicitudes del frontend |
| nodemon | Recarga automática (dev)          |

---

## Endpoints

### Clientes `/api/clientes`

| Método | Ruta              | Descripción  |
| ------ | ----------------- | ------------ |
| GET    | /api/clientes     | Listar todos |
| GET    | /api/clientes/:id | Obtener uno  |
| POST   | /api/clientes     | Crear        |
| PUT    | /api/clientes/:id | Actualizar   |
| DELETE | /api/clientes/:id | Eliminar     |

### Productos `/api/productos`

| Método | Ruta               | Descripción  |
| ------ | ------------------ | ------------ |
| GET    | /api/productos     | Listar todos |
| GET    | /api/productos/:id | Obtener uno  |
| POST   | /api/productos     | Crear        |
| PUT    | /api/productos/:id | Actualizar   |
| DELETE | /api/productos/:id | Eliminar     |

### Cotizaciones `/api/cotizaciones`

| Método | Ruta                  | Descripción                    |
| ------ | --------------------- | ------------------------------ |
| GET    | /api/cotizaciones     | Historial completo             |
| GET    | /api/cotizaciones/:id | Ver una cotización con detalle |
| POST   | /api/cotizaciones     | Crear cotización y calcular    |

---

## Ejemplos JSON

### POST /api/clientes

```json
{
  "nombre": "Laura Martínez",
  "correo": "laura@email.com"
}
```

### POST /api/productos

```json
{
  "nombre": "Laptop Gaming",
  "descripcion": "Intel i9, 32GB RAM",
  "precio": 1500.0
}
```

### POST /api/cotizaciones

```json
{
  "cliente_id": 1,
  "producto_id": 1,
  "pais_origen": 2,
  "pais_destino": 1,
  "valor_producto": 1000
}
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "id_cotizacion": 1,
    "subtotal": 1000,
    "impuesto": 190,
    "valor_flete": 200,
    "descuento_tlc": 50,
    "total": 1340
  }
}
```

### Respuesta de error (ejemplo)

```json
{
  "success": false,
  "mensaje": "El valor del producto debe ser un número positivo"
}
```

---

## Arquitectura

```
backend/
├── database.sql          ← Script completo de base de datos
├── .env.example          ← Plantilla de variables de entorno
├── package.json
└── src/
    ├── app.js            ← Entrada de la app, configuración Express
    ├── config/
    │   └── db.js         ← Pool de conexiones MySQL
    ├── models/
    │   ├── clienteModel.js      ← Consultas SQL de clientes
    │   ├── productoModel.js     ← Consultas SQL de productos
    │   └── cotizacionModel.js   ← Consultas SQL + tablas maestras
    ├── services/
    │   └── cotizacionService.js ← Motor de cálculo
    ├── controllers/
    │   ├── clienteController.js
    │   ├── productoController.js
    │   └── cotizacionController.js
    ├── routes/
    │   ├── clienteRoutes.js
    │   ├── productoRoutes.js
    │   └── cotizacionRoutes.js
    └── middlewares/
        ├── validaciones.js  ← Validación de entrada
        └── errorHandler.js  ← Manejo global de errores
```
