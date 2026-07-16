export function renderSimulador() {
    return `
<div class="min-h-screen font-sans text-slate-100">
    <div class="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header class="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-slate-950/60 px-5 py-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
            <div class="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-slate-100/90">
                <span class="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300 shadow-sm shadow-sky-400/20">I</span>
                IMPORTIFY
            </div>
            <nav class="hidden items-center gap-6 text-slate-300 md:flex">
                <a href="/" class="transition hover:text-white">Home</a>
                <a href="/simulador" class="text-white font-semibold">Simulator</a>
                <a href="/historial" class="transition hover:text-white">History</a>
                <a href="/datos" class="transition hover:text-white">Manufacturers</a>
            </nav>
        </header>

        <main class="mx-auto w-full max-w-2xl rounded-[32px] border border-white/10 p-8 shadow-[0_50px_120px_rgba(15,23,42,0.7)] glass sm:p-10">
            <div class="text-center">
                <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Start your import simulation</p>
                <h1 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">Step 1 of 2: Basic Configuration</h1>
            </div>

            <div class="mt-10 space-y-6">
                <div>
                    <label for="country" class="text-sm font-medium text-slate-300">Country of Origin</label>
                    <select id="country" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <option value="2">🇺🇸 USA</option>
                        <option value="3">🇨🇳 China</option>
                        <option value="5">🇹🇼 Taiwan</option>
                        <option value="4">🇩🇪 Germany</option>
                    </select>
                </div>

                <div>
                    <label for="category" class="text-sm font-medium text-slate-300">Product Category</label>
                    <select id="category" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <option value="technology">Technology</option>
                        <option value="fashion">Fashion</option>
                        <option value="food">Food & Beverage</option>
                        <option value="industrial">Industrial</option>
                    </select>
                </div>

                <div>
                    <label for="product" class="text-sm font-medium text-slate-300">Product</label>
                    <select id="product" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
                        <option value="1">Laptop Gaming</option>
                        <option value="2">Smartphone</option>
                        <option value="3">Accesorio USB-C</option>
                        <option value="4">Wearable SmartWatch</option>
                    </select>
                </div>

                <div>
                    <label class="text-sm font-medium text-slate-300">Import Method</label>
                    <div class="mt-3 grid gap-4 sm:grid-cols-3">
                        <label class="flex cursor-pointer flex-col rounded-[26px] border border-white/10 bg-slate-900/80 px-4 py-5 text-slate-100 transition hover:border-sky-400/50">
                            <input type="radio" name="method" value="expert" class="mb-3 h-5 w-5 accent-sky-400" checked />
                            <span class="text-base font-semibold">The Expert</span>
                            <span class="mt-2 text-sm text-slate-400">Manual accuracy</span>
                        </label>
                        <label class="flex cursor-pointer flex-col rounded-[26px] border border-white/10 bg-slate-900/80 px-4 py-5 text-slate-100 transition hover:border-sky-400/50">
                            <input type="radio" name="method" value="intermediate" class="mb-3 h-5 w-5 accent-sky-400" />
                            <span class="text-base font-semibold">The Intermediate</span>
                            <span class="mt-2 text-sm text-slate-400">Balanced mode</span>
                        </label>
                        <label class="flex cursor-pointer flex-col rounded-[26px] border border-sky-400/40 bg-sky-500/10 px-4 py-5 text-sky-100 transition hover:border-sky-300/60">
                            <input type="radio" name="method" value="easy" class="mb-3 h-5 w-5 accent-sky-400" />
                            <span class="text-base font-semibold">The Easy Way</span>
                            <span class="mt-2 text-sm text-slate-200">Fastest setup</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label for="fob" class="text-sm font-medium text-slate-300">Estimated Base Price (FOB, USD)</label>
                    <div class="mt-3 flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 shadow-inner shadow-slate-950/30">
                        <span class="text-slate-400">$</span>
                        <input id="fob" type="number" step="0.01" min="0" placeholder="0.00"
                            class="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
                    </div>
                    <p id="sim-error" class="mt-2 hidden text-sm text-red-400"></p>
                </div>

                <button id="btn-continuar" class="mt-8 w-full rounded-3xl bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400">
                    CONTINUE TO COST SIMULATOR →
                </button>
            </div>
        </main>

        <footer class="mt-12 flex justify-center text-center text-xs text-slate-500">
            © 2026 Importify - Modern Manufacturer & Logistics Platform
        </footer>
    </div>
</div>
    `;
}

export function setupSimulador() {
    const btn = document.getElementById("btn-continuar");
    const errorEl = document.getElementById("sim-error");

    btn.addEventListener("click", () => {
        const fob = parseFloat(document.getElementById("fob").value);
        const country = document.getElementById("country").value;
        const product = document.getElementById("product").value;

        if (!fob || fob <= 0) {
            errorEl.textContent = "Ingresa un precio base válido mayor a 0.";
            errorEl.classList.remove("hidden");
            return;
        }

        errorEl.classList.add("hidden");

        // Guardamos los datos en sessionStorage para usarlos en la siguiente vista
        sessionStorage.setItem("sim_pais_origen", country);
        sessionStorage.setItem("sim_producto_id", product);
        sessionStorage.setItem("sim_fob", fob);

        window.history.pushState({}, "", "/datos");
        window.dispatchEvent(new PopStateEvent("popstate"));
    });
}
