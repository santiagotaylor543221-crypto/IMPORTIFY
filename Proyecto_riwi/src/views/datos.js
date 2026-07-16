const API = "http://localhost:3000/api";

export function renderDatos() {
    return `
<div class="min-h-screen text-slate-100 antialiased">
    <div class="mx-auto max-w-7xl px-6 py-10 sm:px-8 lg:px-10">
        <header class="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4 text-sm font-semibold uppercase tracking-[0.3em] text-slate-100/90">
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-300 shadow-sm shadow-sky-400/10">I</span>
                Import Simulator
            </div>
            <nav class="flex flex-wrap items-center gap-3 rounded-full border border-white/10 bg-slate-950/50 p-3 backdrop-blur-sm">
                <a href="/simulador" class="rounded-full bg-sky-500/20 px-4 py-2 text-slate-100 transition hover:bg-sky-500/30">New Simulation</a>
                <a href="/historial" class="rounded-full px-4 py-2 text-slate-300 transition hover:bg-white/5">My Simulations</a>
                <a href="/" class="rounded-full px-4 py-2 text-slate-300 transition hover:bg-white/5">Home</a>
            </nav>
        </header>

        <main class="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
            <section class="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
                <div class="mb-8">
                    <h1 class="text-2xl font-semibold tracking-tight text-slate-100">Step 2: Select Manufacturer</h1>
                    <p class="mt-2 text-sm text-slate-400">Choose a manufacturer and confirm your import simulation</p>
                </div>

                <div>
                    <div class="mb-4 flex items-center justify-between">
                        <h2 class="text-base font-semibold text-slate-100">Select Manufacturer</h2>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2" id="fabricantes-grid">
                        <button data-fab="1" class="fab-btn group rounded-[28px] border border-sky-400/40 bg-sky-500/10 px-5 py-6 text-left transition hover:border-sky-300/60 hover:bg-sky-500/15">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-lg font-semibold text-slate-100">ASUS</p>
                                    <p class="mt-2 text-sm text-slate-400">Taiwan</p>
                                </div>
                                <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-sky-500/15 text-sky-300">✓</span>
                            </div>
                        </button>
                        <button data-fab="2" class="fab-btn group rounded-[28px] border border-slate-800/80 bg-slate-900/70 px-5 py-6 text-left transition hover:border-sky-400/50 hover:bg-slate-900/90">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-lg font-semibold text-slate-100">MSI</p>
                                    <p class="mt-2 text-sm text-slate-400">Taiwan</p>
                                </div>
                                <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800 text-slate-500">✓</span>
                            </div>
                        </button>
                        <button data-fab="3" class="fab-btn group rounded-[28px] border border-slate-800/80 bg-slate-900/70 px-5 py-6 text-left transition hover:border-sky-400/50 hover:bg-slate-900/90">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-lg font-semibold text-slate-100">Dell</p>
                                    <p class="mt-2 text-sm text-slate-400">USA</p>
                                </div>
                                <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800 text-slate-500">✓</span>
                            </div>
                        </button>
                        <button data-fab="4" class="fab-btn group rounded-[28px] border border-slate-800/80 bg-slate-900/70 px-5 py-6 text-left transition hover:border-sky-400/50 hover:bg-slate-900/90">
                            <div class="flex items-center justify-between gap-3">
                                <div>
                                    <p class="text-lg font-semibold text-slate-100">Lenovo</p>
                                    <p class="mt-2 text-sm text-slate-400">China</p>
                                </div>
                                <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800 text-slate-500">✓</span>
                            </div>
                        </button>
                    </div>
                </div>

                <p id="datos-error" class="mt-4 hidden text-sm text-red-400"></p>

                <button id="btn-calcular" class="mt-8 w-full rounded-3xl bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400">
                    CALCULATE IMPORT COST →
                </button>
            </section>

            <!-- Panel de resultado -->
            <section class="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
                <h2 class="mb-6 text-xl font-semibold text-slate-100">Cost Breakdown</h2>

                <div id="resultado-panel" class="flex flex-col items-center justify-center h-48 text-slate-500 text-sm">
                    <span class="text-4xl mb-4">📊</span>
                    Complete the form and click "Calculate" to see the cost breakdown.
                </div>

                <div id="resultado-detalle" class="hidden space-y-4">
                    <div class="space-y-3 text-sm text-slate-300">
                        <div class="flex justify-between">
                            <span>Subtotal (FOB)</span>
                            <span id="r-subtotal" class="font-semibold text-slate-100"></span>
                        </div>
                        <div class="flex justify-between">
                            <span>Import Tax</span>
                            <span id="r-impuesto" class="font-semibold text-slate-100"></span>
                        </div>
                        <div class="flex justify-between">
                            <span>Freight</span>
                            <span id="r-flete" class="font-semibold text-slate-100"></span>
                        </div>
                        <div class="flex justify-between text-emerald-300">
                            <span>TLC Discount</span>
                            <span id="r-descuento" class="font-semibold"></span>
                        </div>
                    </div>
                    <div class="rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4 mt-4">
                        <div class="flex items-center justify-between text-sm font-semibold text-slate-100">
                            <span>Total Estimated Cost</span>
                            <span id="r-total" class="text-emerald-300 text-lg"></span>
                        </div>
                    </div>
                    <a href="/historial" class="mt-4 block w-full rounded-3xl bg-sky-500 px-5 py-4 text-center text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                        View History →
                    </a>
                </div>
            </section>
        </main>
    </div>
</div>
    `;
}

export function setupDatos() {
    let fabricanteSeleccionado = "1";

    // Lógica de selección de fabricante
    document.querySelectorAll(".fab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".fab-btn").forEach(b => {
                b.className = b.className
                    .replace("border-sky-400/40 bg-sky-500/10", "border-slate-800/80 bg-slate-900/70");
                b.querySelector("span:last-child").className =
                    "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-slate-800 text-slate-500";
            });
            btn.className = btn.className
                .replace("border-slate-800/80 bg-slate-900/70", "border-sky-400/40 bg-sky-500/10");
            btn.querySelector("span:last-child").className =
                "inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 bg-sky-500/15 text-sky-300";
            fabricanteSeleccionado = btn.dataset.fab;
        });
    });

    document.getElementById("btn-calcular").addEventListener("click", async () => {
        const errorEl = document.getElementById("datos-error");
        const panelVacio = document.getElementById("resultado-panel");
        const panelDetalle = document.getElementById("resultado-detalle");

        const pais_origen = sessionStorage.getItem("sim_pais_origen") || "2";
        const producto_id = sessionStorage.getItem("sim_producto_id") || "1";
        const valor_producto = parseFloat(sessionStorage.getItem("sim_fob"));

        if (!valor_producto || valor_producto <= 0) {
            errorEl.textContent = "Vuelve al simulador y completa el precio base.";
            errorEl.classList.remove("hidden");
            return;
        }

        errorEl.classList.add("hidden");

        try {
            const res = await fetch(`${API}/cotizaciones`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cliente_id: 1,
                    producto_id: parseInt(producto_id),
                    pais_origen: parseInt(pais_origen),
                    pais_destino: 1,
                    valor_producto
                })
            });

            const json = await res.json();

            if (!json.success) {
                errorEl.textContent = json.mensaje || "Error al calcular la cotización.";
                errorEl.classList.remove("hidden");
                return;
            }

            const d = json.data;
            document.getElementById("r-subtotal").textContent = `$${d.subtotal.toFixed(2)}`;
            document.getElementById("r-impuesto").textContent = `$${d.impuesto.toFixed(2)}`;
            document.getElementById("r-flete").textContent = `$${d.valor_flete.toFixed(2)}`;
            document.getElementById("r-descuento").textContent = `-$${d.descuento_tlc.toFixed(2)}`;
            document.getElementById("r-total").textContent = `$${d.total.toFixed(2)}`;

            panelVacio.classList.add("hidden");
            panelDetalle.classList.remove("hidden");

        } catch (err) {
            errorEl.textContent = "No se pudo conectar con el servidor. ¿Está corriendo el backend?";
            errorEl.classList.remove("hidden");
        }
    });
}
