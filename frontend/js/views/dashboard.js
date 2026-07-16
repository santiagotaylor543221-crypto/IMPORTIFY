import { getSimulations, getSimulationDetail } from '../api.js';

export async function renderDashboard() {
  const app = document.getElementById('app');
  const simulations = await getSimulations();

  app.innerHTML = `
    <main class="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
      <aside class="space-y-6">
        <div class="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass">
          <div class="mb-6 flex items-center justify-between">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-400">Historial</p>
          </div>
          <div class="flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-3 text-slate-100 shadow-inner shadow-slate-950/30">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-slate-200">🔍</span>
            <input id="search-input" type="search" placeholder="Busca simulaciones..."
              class="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500" />
          </div>
        </div>

        <div class="rounded-[32px] border border-white/10 bg-slate-950/70 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass">
          <h2 class="mb-6 text-lg font-semibold text-slate-100">Simulaciones recientes</h2>
          <div class="space-y-4" id="sim-list">
            ${
              simulations.length
                ? simulations.map(simListItem).join('')
                : '<p class="text-sm text-slate-400">No tienes simulaciones guardadas todavía.</p>'
            }
          </div>
        </div>
      </aside>

      <section class="space-y-6">
        <div id="sim-detail" class="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] glass sm:p-8">
          <p class="text-sm text-slate-400">Selecciona una simulación de la lista para ver el detalle.</p>
        </div>
      </section>
    </main>
  `;

  document.querySelectorAll('.sim-item').forEach((item) => {
    item.addEventListener('click', async () => {
      const detail = await getSimulationDetail(item.dataset.id);
      renderDetail(detail);
    });
  });

  const searchInput = document.getElementById('search-input');
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    document.querySelectorAll('.sim-item').forEach((item) => {
      const matches = item.textContent.toLowerCase().includes(term);
      item.style.display = matches ? '' : 'none';
    });
  });
}

function simListItem(sim) {
  const date = new Date(sim.created_at).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  return `
    <button type="button" data-id="${sim.id}" class="sim-item group block w-full rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-left transition hover:border-sky-400/50 hover:bg-slate-900/95">
      <div class="flex items-center gap-4">
        <div class="flex h-12 w-12 items-center justify-center rounded-3xl bg-sky-500/15 text-sky-200">📦</div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-100">${sim.name}</p>
          <p class="mt-1 text-xs text-slate-500">${date}</p>
        </div>
        <span class="inline-flex rounded-full bg-slate-800/90 px-3 py-2 text-xs font-semibold text-sky-300">Resumen</span>
      </div>
    </button>
  `;
}

function renderDetail(sim) {
  const detailBox = document.getElementById('sim-detail');
  const results = sim.results;

  detailBox.innerHTML = `
    <div class="mb-6">
      <p class="text-lg font-semibold text-slate-100">${sim.name}</p>
      <p class="mt-1 text-sm text-slate-400">Incoterm: ${sim.incoterm} — Cantidad: ${sim.quantity}</p>
    </div>

    <div class="grid gap-6 xl:grid-cols-[1fr_0.95fr]">
      <div class="space-y-3 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Contacto del fabricante</p>
        <div class="space-y-2 text-sm text-slate-300">
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">🏭</span>
            <span class="text-slate-100">${sim.manufacturer_name || 'No disponible'}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">✉️</span>
            <span class="text-slate-100">${sim.contact_email || 'No disponible'}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">🌐</span>
            <span class="text-slate-100">${sim.website || 'No disponible'}</span>
          </div>
          <div class="flex items-center gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-800 text-sky-300">📍</span>
            <span class="text-slate-100">${sim.manufacturer_country || 'No disponible'}</span>
          </div>
        </div>
      </div>

      <div class="space-y-4 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Desglose de costos (USD)</p>
        ${
          results
            ? `
          <div class="space-y-2 text-sm text-slate-300">
            <div class="flex justify-between"><span>Flete</span><span class="text-slate-100">$${results.freight_cost}</span></div>
            <div class="flex justify-between"><span>Seguro</span><span class="text-slate-100">$${results.insurance_cost}</span></div>
            <div class="flex justify-between"><span>Aranceles</span><span class="text-slate-100">$${results.duties_amount}</span></div>
          </div>
          <div class="rounded-[24px] border border-white/10 bg-slate-950/80 px-5 py-4">
            <div class="flex items-center justify-between text-sm font-semibold text-slate-100">
              <span>Costo total estimado</span>
              <span class="text-emerald-300">$${results.total_landed_cost}</span>
            </div>
          </div>
        `
            : '<p class="text-sm text-slate-400">Esta simulación todavía no tiene resultados calculados.</p>'
        }
      </div>
    </div>
  `;
}
