export function renderLanding() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-6 py-16 text-center">
      <p class="mb-4 text-sm uppercase tracking-[0.4em] text-teal-300">La forma inteligente de importar</p>
      <h1 class="text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl">
        La forma inteligente de <span class="text-teal-300">Importar</span> a <span class="text-slate-100">Barranquilla</span>
      </h1>
      <p class="mx-auto mt-6 max-w-2xl text-sm text-slate-300 sm:text-base">
        Conecta con proveedores globales, estima logística de envíos y calcula aranceles aduaneros en una plataforma intuitiva.
        La herramienta esencial para importadores barranquilleros.
      </p>
      <a href="#/simulator" class="mt-10 inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-sm font-semibold text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400">
        Calcular: Comenzar →
      </a>
    </div>
  `;
}
