// src/router/router.js
// Mismo patrón que TaskFlowSPA: intercepta clicks en <a>, usa history.pushState y renderiza la vista correcta.

import { routes, notFoundView } from "./routes.js";

export function renderRouter() {
    const app = document.getElementById("app");
    if (!app) return;

    const currentPath = window.location.pathname;

    const route = routes[currentPath] ?? notFoundView;

    app.innerHTML = route.render();

    if (route.setup) {
        route.setup();
    }
}

export function initRouter() {
    // Intercepta todos los clicks en links internos
    document.body.addEventListener("click", (event) => {
        const link = event.target.closest("a");
        if (!link) return;

        const href = link.getAttribute("href");
        if (!href || !href.startsWith("/")) return;

        event.preventDefault();
        window.history.pushState({}, "", href);
        renderRouter();
    });

    // Maneja el botón atrás/adelante del navegador
    window.addEventListener("popstate", renderRouter);

    renderRouter();
}
