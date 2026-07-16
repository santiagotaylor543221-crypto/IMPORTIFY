export function renderHome() {
    return `
<div class="min-h-screen text-white">
    <header class="relative">
        <nav class="glass sticky top-0 z-50 px-6 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-white/10">
            <div class="flex items-center gap-3">
                <img src="./logo.jpg" alt="Importify logo" class="h-12 w-12 rounded-full object-cover shadow-lg" />
                <div>
                    <p class="text-sm uppercase tracking-[0.35em] text-slate-300">Importify</p>
                    <p class="text-xs text-slate-400">Logística y comercio</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-4 text-sm text-slate-200">
                <a href="/simulador" class="pb-1 border-b-2 border-transparent hover:border-teal-300 transition">Simulador</a>
                <a href="/historial" class="pb-1 border-b-2 border-transparent hover:border-teal-300 transition">Historial</a>
                <a href="/datos" class="pb-1 border-b-2 border-transparent hover:border-teal-300 transition">Fabricantes</a>
            </div>
        </nav>

        <div class="mx-auto flex min-h-[calc(100vh-96px)] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
            <p class="mb-4 text-sm uppercase tracking-[0.4em] text-teal-300">La forma inteligente de importar</p>
            <h1 class="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
                The Smart Way to <span class="text-teal-300">Import</span> into <span class="text-slate-100">Barranquilla</span>
            </h1>
            <p class="mx-auto mt-6 max-w-2xl text-sm text-slate-300 sm:text-base">
                Conecta con proveedores globales, estima logística de envíos y calcula aranceles aduaneros en una plataforma intuitiva.
                La herramienta esencial para importadores barranquilleros.
            </p>
            <a href="/simulador" class="mt-10 inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400">
                Calcular: Start Now →
            </a>
        </div>
    </header>
</div>
    `;
}
