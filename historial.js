const API = "http://localhost:3000/api";

export function renderHistorial() {
    return `
<div class="min-h-screen text-slate-100">
    <div class="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header class="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/70 px-6 py-4 shadow-xl shadow-slate-950/40 backdrop-blur-xl">
            <div class="flex items-center gap-4 text-base font-semibold uppercase tracking-[0.24em] text-slate-100">
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 shadow-sm shadow-sky-400/20">I</span>
                IMPORTIFY
            </div>
            <nav class="hidden items-center gap-8 text-sm text-slate-300 md:flex">
                <a href="/" class="transition hover:text-white">Home</a>
                <a href="/simulador" class="transition hover:text-white">Simulator</a>
                <a href="/historial" class="text-white font-semibold">History</a>
                <a href="/datos" class="transition hover:text-white">Manufacturers</a>
            </nav>
        </header>

        <main class="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
            <aside class="space-y-6">
                <div class="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass">
                    <p class="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">Import Simulations History</p>
                    <div class="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner shadow-slate-950/30">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">🔍</span>
                        <input id="search-input" type="search" placeholder="Search simulations..."
                            class="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
                    </div>
                </div>

                <div class="rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass">
                    <div class="mb-6 flex items-center justify-between">
                        <h2 class="text-lg font-semibold text-slate-100">Recent Import Simulations</h2>
                        <button id="btn-refresh" class="text-sm text-slate-400 transition hover:text-white">⟳</button>
                    </div>
                    <div id="lista-cotizaciones" class="space-y-4">
                        <p class="text-sm text-slate-500 text-center py-6">Loading simulations...</p>
                    </div>
                    <div class="mt-6 flex justify-center">
                        <button class="rounded-full border border-white/10 bg-slate-900/80 px-6 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900/95">Load More</button>
                    </div>
                </div>
            </aside>

            <!-- Panel derecho: detalle de cotización seleccionada -->
            <section id="detalle-panel" class="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass sm:p-8">
                <div class="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 text-sm">
                    <span class="text-5xl mb-4">📋</span>
                    <p>Select a simulation from the left to see its details.</p>
                    <a href="/simulador" class="mt-6 rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400">
                        + New Simulation
                    </a>
                </div>
            </section>
        </main>
    </div>
</div>
    `;
}

export async function setupHistorial() {
    await cargarCotizaciones();

    document.getElementById("btn-refresh").addEventListener("click", cargarCotizaciones);

    document.getElementById("search-input").addEventListener("input", (e) => {
        const q = e.target.value.toLowerCase();
        document.querySelectorAll(".cotizacion-item").forEach(item => {
            const texto = item.textContent.toLowerCase();
            item.style.display = texto.includes(q) ? "" : "none";
        });
    });
}

async function cargarCotizaciones() {
    const lista = document.getElementById("lista-cotizaciones");
    lista.innerHTML = `<p class="text-sm text-slate-500 text-center py-6">Loading...</p>`;

    try {
        const res = await fetch(`${API}/cotizaciones`);
        const json = await res.json();

        if (!json.success || json.data.length === 0) {
            lista.innerHTML = `<p class="text-sm text-slate-500 text-center py-6">No simulations found. <a href="/simulador" class="text-sky-400 hover:underline">Create one</a></p>`;
            return;
        }

        const emojis = ["📦", "🌍", "⚙️", "🚛", "🏭", "📊"];
        lista.innerHTML = json.data.map((c, i) => `
            <button class="cotizacion-item group block w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 transition hover:border-sky-400/50 hover:bg-slate-900/95 text-left"
                data-id="${c.id_cotizacion}">
                <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/15 text-sky-200">
                        ${emojis[i % emojis.length]}
                    </div>
                    <div class="min-w-0 flex-1">
                        <p class="truncate text-sm font-semibold text-slate-100">${c.cliente}</p>
                        <p class="mt-1 text-xs text-slate-500">${new Date(c.fecha).toLocaleDateString("es-CO")} · Total: $${parseFloat(c.total).toFixed(2)}</p>
                    </div>
                    <span class="inline-flex rounded-full bg-slate-800/90 px-3 py-2 text-xs font-semibold text-sky-300">Summary</span>
                </div>
            </button>
        `).join("");

        document.querySelectorAll(".cotizacion-item").forEach(btn => {
            btn.addEventListener("click", () => mostrarDetalle(btn.dataset.id));
        });

    } catch (err) {
        lista.innerHTML = `<p class="text-sm text-red-400 text-center py-6">Error connecting to the server.</p>`;
    }
}

async function mostrarDetalle(id) {
    const panel = document.getElementById("detalle-panel");
    panel.innerHTML = `<p class="text-slate-500 text-sm text-center py-10">Loading detail...</p>`;

    try {
        const res = await fetch(`${API}/cotizaciones/${id}`);
        const json = await res.json();
        if (!json.success) return;

        const c = json.data;
        panel.innerHTML = `
            <div class="mb-6 flex items-center justify-between gap-4">
                <div>
                    <p class="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">${c.cliente}</p>
                    <p class="mt-2 text-lg font-semibold text-slate-100">Import Simulation #${c.id_cotizacion}</p>
                    <p class="mt-1 text-sm text-slate-400">${new Date(c.fecha).toLocaleString("es-CO")}</p>
                </div>
                <span class="rounded-full bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300">Completed</span>
            </div>

            <div class="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Cost Breakdown (USD)</p>
                <div class="space-y-3 text-sm text-slate-300">
                    <div class="flex justify-between">
                        <span>Subtotal</span>
                        <span class="text-slate-100 font-semibold">$${parseFloat(c.subtotal).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Import Tax</span>
                        <span class="text-slate-100 font-semibold">$${parseFloat(c.impuesto).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Freight</span>
                        <span class="text-slate-100 font-semibold">$${parseFloat(c.flete).toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-emerald-300">
                        <span>TLC Discount</span>
                        <span class="font-semibold">-$${parseFloat(c.descuento).toFixed(2)}</span>
                    </div>
                </div>
                <div class="rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4 mt-2">
                    <div class="flex items-center justify-between font-semibold text-slate-100">
                        <span>Total Estimated Cost</span>
                        <span class="text-emerald-300 text-lg">$${parseFloat(c.total).toFixed(2)}</span>
                    </div>
                </div>
            </div>

            ${c.detalle && c.detalle.length > 0 ? `
            <div class="mt-6 space-y-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Products</p>
                ${c.detalle.map(d => `
                    <div class="flex justify-between text-sm text-slate-300">
                        <span>${d.producto} × ${d.cantidad}</span>
                        <span class="text-slate-100">$${parseFloat(d.precio).toFixed(2)}</span>
                    </div>
                `).join("")}
            </div>` : ""}

            <a href="/simulador" class="mt-6 block w-full rounded-3xl bg-sky-500 px-5 py-4 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                + New Simulation
            </a>
        `;
    } catch (err) {
        panel.innerHTML = `<p class="text-red-400 text-sm text-center py-10">Error loading detail.</p>`;
    }
}
