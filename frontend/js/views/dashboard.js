// =====================================================
// dashboard.js — Historial de simulaciones
// Incluye: buscar, ver detalle con costos + COP,
// editar (lleva al simulador) y eliminar.
// =====================================================

import { getSimulations, getSimulationDetail, deleteSimulation } from '../api.js';

const USD_TO_COP   = 4100;
const FLETE_PAIS   = { 'USA': 0.06, 'China': 0.12, 'Panamá': 0.03 };
const TASA_SEGURO  = 0.008;

export async function renderDashboard() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="flex items-center justify-center min-h-[40vh]"><p class="text-slate-400 animate-pulse">Cargando historial...</p></div>`;

  const simulations = await getSimulations();

  app.innerHTML = `
    <div class="grid gap-6 xl:grid-cols-[360px_1fr]">

      <!-- Lista -->
      <aside class="space-y-4">
        <div class="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 glass">
          <p class="text-sm uppercase tracking-[0.3em] text-slate-400 mb-4">Historial</p>
          <div class="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3">
            <span class="text-slate-400">🔍</span>
            <input id="search-input" type="search" placeholder="Buscar simulaciones..."
              class="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"/>
          </div>
        </div>

        <div class="rounded-[28px] border border-white/10 bg-slate-950/70 p-5 glass">
          <h2 class="text-base font-semibold text-slate-100 mb-4">Simulaciones recientes</h2>
          <div id="sim-list" class="space-y-3">
            ${simulations.length
              ? simulations.map(simItem).join('')
              : '<p class="text-sm text-slate-400">No tienes simulaciones guardadas todavía.</p>'}
          </div>
        </div>
      </aside>

      <!-- Detalle -->
      <section>
        <div id="sim-detail" class="rounded-[32px] border border-white/10 bg-slate-950/70 p-6 glass sm:p-8 min-h-[200px] flex items-center justify-center">
          <p class="text-sm text-slate-400">Selecciona una simulación para ver el detalle.</p>
        </div>
      </section>

    </div>
  `;

  // Clicks en simulaciones
  document.getElementById('sim-list').addEventListener('click', async e => {
    const btn = e.target.closest('.sim-item');
    if (!btn) return;
    document.querySelectorAll('.sim-item').forEach(el => el.classList.remove('border-sky-400/50', 'bg-slate-900/95'));
    btn.classList.add('border-sky-400/50', 'bg-slate-900/95');
    const detail = await getSimulationDetail(btn.dataset.id);
    renderDetalle(detail);
  });

  // Buscador
  document.getElementById('search-input').addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    document.querySelectorAll('.sim-item').forEach(el => {
      el.style.display = el.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });
}

// ── Item de la lista ──────────────────────────────────
function simItem(sim) {
  const fecha = new Date(sim.created_at).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' });
  return `
    <button type="button" data-id="${sim.id}" class="sim-item group w-full rounded-2xl border border-white/10 bg-slate-900/80 p-4 text-left transition hover:border-sky-400/50">
      <div class="flex items-center gap-3">
        <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200">📦</span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-semibold text-slate-100">${sim.name}</p>
          <p class="text-xs text-slate-500 mt-0.5">${fecha}</p>
        </div>
        <span class="rounded-full bg-slate-800/90 px-2 py-1 text-xs font-semibold text-sky-300">${sim.incoterm}</span>
      </div>
    </button>
  `;
}

// ── Detalle de la simulación ──────────────────────────
function renderDetalle(sim) {
  const costs = calcularCostos(sim);
  const detailBox = document.getElementById('sim-detail');
  const fecha = sim ? new Date(sim.created_at).toLocaleString('es-CO', { dateStyle:'medium', timeStyle:'short' }) : '';

  detailBox.innerHTML = `
    <div class="space-y-6">

      <!-- Header con acciones -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 class="text-xl font-semibold text-slate-100">${sim.name}</h2>
          <p class="text-sm text-slate-400 mt-1">${fecha} · ${sim.incoterm} · ${sim.quantity} uds</p>
        </div>
        <div class="flex gap-3">
          <a href="#/simulator"
            class="inline-flex items-center gap-2 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-300 transition hover:bg-sky-500/20">
            ✏️ Editar
          </a>
          <button type="button" id="delete-btn" data-id="${sim.id}"
            class="inline-flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20">
            🗑️ Eliminar
          </button>
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-2">

<!-- Datos del fabricante -->
        <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-5 space-y-3">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-400">Fabricante</p>
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sky-300">🏭</span>
              <span class="text-slate-100 font-semibold">${sim.manufacturer_name || '—'}</span>
            </div>
            ${sim.contact_email ? `
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sky-300">✉️</span>
              <span class="text-slate-300">${sim.contact_email}</span>
            </div>` : ''}
            ${sim.website ? `
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sky-300">🌐</span>
              <span class="text-slate-300">${sim.website}</span>
            </div>` : ''}
            ${sim.manufacturer_country ? `
            <div class="flex items-center gap-3">
              <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-sky-300">📍</span>
              <span class="text-slate-300">${sim.manufacturer_country}</span>
            </div>` : ''}
          </div>

          ${sim.map_embed_url ? `
          <div class="mt-3 overflow-hidden rounded-2xl border border-white/10">
            <iframe
              src="${sim.map_embed_url}"
              width="100%"
              height="200"
              style="border:0;"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade">
            </iframe>
          </div>` : ''}
        </div>

        <!-- Resumen de costos -->
        <div class="rounded-[24px] border border-white/10 bg-slate-900/80 p-5 space-y-3">
          <p class="text-sm font-semibold uppercase tracking-wide text-slate-400">Resumen de costos</p>
          <div class="space-y-2 text-sm">
            ${costs ? costoFila('Merchandise (FOB)', costs.fob) : ''}
            ${costs && costs.flete  > 0 ? costoFila('Flete', costs.flete) : ''}
            ${costs && costs.seguro > 0 ? costoFila('Seguro', costs.seguro) : ''}
            ${costs && costs.arancel> 0 ? costoFila('Aranceles DIAN', costs.arancel) : ''}
            ${costs && costs.iva    > 0 ? costoFila('IVA', costs.iva) : ''}
            ${costs && costs.otros  > 0 ? costoFila('Otros cargos', costs.otros) : ''}
          </div>
          ${costs ? `
          <div class="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 mt-2">
            <div class="flex justify-between items-center">
              <span class="text-sm font-bold text-slate-100">Total</span>
              <div class="text-right">
                <p class="text-base font-bold text-slate-100">${fmtUSD(costs.total)}</p>
                <p class="text-xs text-emerald-400">${fmtCOP(costs.total * USD_TO_COP)}</p>
              </div>
            </div>
          </div>` : '<p class="text-slate-500 text-sm">No hay costos calculados.</p>'}
        </div>

      </div>
    </div>
  `;

  // Botón eliminar
  const delBtn = document.getElementById('delete-btn');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      if (!confirm('¿Seguro que quieres eliminar esta simulación?')) return;
      await deleteSimulation(delBtn.dataset.id);
      // Recargar el dashboard
      window.location.hash = '';
      window.location.hash = '#/dashboard';
    });
  }
}

// ── Calcular costos desde los datos de la simulación ─
function calcularCostos(sim) {
  if (!sim || !sim.base_fob_price) return null;
  const qty    = Number(sim.quantity) || 1;
  const fobT   = Number(sim.base_fob_price) * qty;
  const fRate  = FLETE_PAIS[sim.manufacturer_country] || 0.05;
  const fleteT = fobT * fRate;
  const segT   = fobT * TASA_SEGURO;
  const cifT   = fobT + fleteT + segT;
  const tArancel = sim.tariff_rate ? Number(sim.tariff_rate) / 100 : 0;
  const tIVA     = sim.vat_rate    ? Number(sim.vat_rate)    / 100 : 0;
  const otros    = sim.other_fees  ? Number(sim.other_fees)        : 0;
  const arancelT = cifT * tArancel;
  const ivaT     = (cifT + arancelT) * tIVA;

  const c = { fob: fobT, flete:0, seguro:0, arancel:0, iva:0, otros:0 };
  if (sim.incoterm === 'FOB') { c.flete = fleteT; }
  if (sim.incoterm === 'CIF') { c.flete=fleteT; c.seguro=segT; c.arancel=arancelT; c.iva=ivaT; c.otros=otros; }
  c.total = c.fob + c.flete + c.seguro + c.arancel + c.iva + c.otros;
  return c;
}

function costoFila(label, val) {
  return `
    <div class="flex justify-between items-center py-1">
      <span class="text-slate-400">${label}</span>
      <div class="text-right">
        <p class="text-slate-100 font-medium">${fmtUSD(val)}</p>
        <p class="text-[11px] text-emerald-400">${fmtCOP(val * USD_TO_COP)}</p>
      </div>
    </div>
  `;
}

function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(n)||0);
}
function fmtCOP(n) {
  return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0, maximumFractionDigits:0 }).format(Number(n)||0);
}
