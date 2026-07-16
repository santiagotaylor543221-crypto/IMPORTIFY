// src/router/routes.js
// Aquí se definen todas las rutas de la SPA.
// Cada ruta tiene: render (devuelve el HTML) y opcionalmente setup (agrega la lógica JS).

import { renderHome } from "../views/home.js";
import { renderSimulador, setupSimulador } from "../views/simulador.js";
import { renderDatos, setupDatos } from "../views/datos.js";
import { renderHistorial, setupHistorial } from "../views/historial.js";
import { renderNotFound } from "../views/not-found.js";

export const routes = {
    "/": {
        render: renderHome,
    },
    "/simulador": {
        render: renderSimulador,
        setup: setupSimulador,
    },
    "/datos": {
        render: renderDatos,
        setup: setupDatos,
    },
    "/historial": {
        render: renderHistorial,
        setup: setupHistorial,
    },
};

export const notFoundView = {
    render: renderNotFound,
};
