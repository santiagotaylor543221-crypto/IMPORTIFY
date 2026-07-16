// simulator.js
import { appState } from '../state.js';
import { renderStepper } from './stepper.js';
import { getOffersByProduct, getTaxRule, createSimulation } from '../api.js';

export async function renderSimulator() {
  console.log('renderSimulator called, appState:', appState);
  const app = document.getElementById('app');
  if (!app) {
    console.error('#app no encontrado en DOM');
    return;
  }

  // Si el usuario todavía no completó el stepper, se muestra primero
  if (!appState.productId || !appState.incoterm) {
    app.innerHTML = '<div id="stepper-container">Cargando paso inicial…</div>';
    try {
      await renderStepper(document.getElementById('stepper-container'), showMainSimulator);
    } catch (err) {
      console.error('renderStepper falló en simulator:', err);
      const container = document.getElementById('stepper-container');
      if (container) {
        container.innerHTML = `
          <div class="p-6 text-center">
            <p class="text-red-400 mb-2">No se pudo cargar el paso inicial.</p>
            <p class="text-sm text-slate-400">Revisa la consola y la API (http://localhost:4000).</p>
            <div class="mt-4 flex justify-center gap-3">
              <button id="retry-stepper" class="rounded bg-emerald-500 px-4 py-2 text-slate-900">Reintentar</button>
            </div>
          </div>
        `;
        document.getElementById('retry-stepper')?.addEventListener('click', () => renderSimulator());
      }
    }
  } else {
    // Si ya completó el stepper, mostramos el simulador principal
    await showMainSimulator();
  }
}

async function showMainSimulator() {
  const app = document.getElementById('app');
  if (!app) return;

  // Loader mientras pedimos datos
  app.innerHTML = `<div class="p-8 text-center">Cargando simulador…</div>`;

  let offers = [];
  let taxRule = null;

  try {
    // Pedimos ofertas y regla fiscal en paralelo (si productId está presente)
    const productId = appState.productId;
    if (!productId) throw new Error('productId no definido en appState');

    const [offersRes, taxRes] = await Promise.allSettled([
      getOffersByProduct(productId),
      getTaxRule(appState.categoryId, appState.countryId),
    ]);

    if (offersRes.status === 'fulfilled' && Array.isArray(offersRes.value)) {
      offers = offersRes.value;
    } else {
      console.warn('getOffersByProduct falló o devolvió datos inválidos', offersRes);
      offers = [];
    }

    if (taxRes.status === 'fulfilled') {
      taxRule = taxRes.value;
    } else {
      console.warn('getTaxRule falló', taxRes);
      taxRule = null;
    }
  } catch (err) {
    console.error('Error al obtener datos para el simulador:', err);
    app.innerHTML = `
      <div class="p-6 text-center">
        <p class="text-red-400 mb-2">No se pudieron cargar los datos del simulador.</p>
        <p class="text-sm text-slate-400">Comprueba la API y revisa la consola para más detalles.</p>
        <div class="mt-4">
          <button id="retry-sim" class="rounded bg-emerald-500 px-4 py-2 text-slate-900">Reintentar</button>
        </div>
      </div>
    `;
    document.getElementById('retry-sim')?.addEventListener('click', () => showMainSimulator());
    return;
  }

  // Estado local para la vista
  let selectedOfferId = offers.length ? offers[0].offer_id : null;
  appState.offerId = selectedOfferId;

  function manufacturerCard(offer) {
    const isSelected = offer.offer_id === selectedOfferId;
    return `
      <button type="button" class="manufacturer-card group rounded-[28px] border ${isSelected ? 'border-sky-400/60 bg-slate-900/95' : 'border-slate-800/80 bg-slate-900/70'} px-5 py-6 text-left transition hover:border-sky-400/50" data-offer-id="${offer.offer_id}">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-lg font-semibold text-slate-100">${escapeHtml(offer.name)}</p>
            <p class="mt-2 text-sm text-slate-400">$${Number(offer.base_fob_price ?? 0).toFixed(2)} FOB</p>
          </div>
          <span class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-700/80 ${isSelected ? 'bg-sky-500/15 text-sky-300' : 'bg-slate-800 text-slate-500'}">✓</span>
        </div>
      </button>
    `;
  }

  function render() {
    app.innerHTML = `
      <main class="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <section class="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
          <div class="mb-8">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-100">Configuración de la simulación</h1>
            <p class="mt-2 text-sm text-slate-400">Define los parámetros de tu simulación</p>
          </div>

          <div class="space-y-6">
            <div class="space-y-3">
              <label class="block text-sm font-medium text-slate-400">Nombre de la simulación</label>
              <input id="sim-name" type="text" placeholder="Ej: Laptops Q3 2026"
                class="w-full rounded-3xl border border-white/10 bg-slate-900/90 px-5 py-4 text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-400 focus:ring-sky-500/20" />
            </div>

            <div>
              <h2 class="mb-4 text-base font-semibold text-slate-100">Selecciona el fabricante</h2>
              <div class="grid gap-4 sm:grid-cols-2" id="manufacturer-grid">
                ${offers.length ? offers.map(manufacturerCard).join('') : '<p class="text-sm text-slate-400">No hay fabricantes disponibles para este producto todavía.</p>'}
              </div>
            </div>

            <div class="rounded-[28px] border border-white/10 bg-slate-900/90 px-6 py-5">
              <div class="flex items-center justify-between gap-4">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Cantidad de unidades</p>
                <div class="flex items-center gap-3">
                  <input id="sim-quantity" type="number" min="1" value="100"
                    class="w-28 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-right text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-400 focus:ring-sky-500/20" />
                  <span class="text-sm text-slate-400">Unidades</span>
                </div>
              </div>
            </div>

            <button id="save-btn" class="w-full rounded-3xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400">
              Guardar simulación
            </button>
          </div>
        </section>

        <aside class="space-y-6">
          <section class="rounded-[32px] border border-white/10 bg-slate-950/80 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-10">
            <div class="mb-8 flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-semibold tracking-tight text-slate-100">Desglose de costos</h2>
                <p class="mt-2 text-sm text-slate-400">Análisis estimado del costo total</p>
              </div>
              <span class="rounded-full bg-white/5 px-4 py-2 text-sm text-slate-300">USD</span>
            </div>

            <div class="w-full space-y-4" id="cost-breakdown">
              <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-slate-950/30">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-100">Merchandise (FOB)</p>
                  <p class="font-semibold text-slate-100" id="cost-fob">-</p>
                </div>
              </div>
              <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-slate-950/30">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-100">Flete</p>
                  <p class="font-semibold text-slate-500">Pendiente</p>
                </div>
              </div>
              <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-slate-950/30">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-100">Seguro</p>
                  <p class="font-semibold text-slate-500">Pendiente</p>
                </div>
              </div>
              <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-5 shadow-sm shadow-slate-950/30">
                <div class="flex items-center justify-between">
                  <p class="font-semibold text-slate-100">Aranceles + IVA</p>
                  <p class="font-semibold text-slate-500">Pendiente</p>
                </div>
              </div>
            </div>

            <div class="mt-6 rounded-[28px] border border-white/10 bg-slate-900/90 p-6">
              <div class="flex items-center justify-between">
                <p class="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Costo total final</p>
                <p class="text-2xl font-semibold text-slate-500" id="cost-total">Pendiente</p>
              </div>
            </div>
          </section>
        </aside>
      </main>
    `;
    updateFobCost();
    attachEvents();
  }

  function updateFobCost() {
    const offer = offers.find((o) => o.offer_id === selectedOfferId);
    const quantity = Number(app.querySelector('#sim-quantity')?.value || 0);
    const unitPrice = appState.fobOverride ?? Number(offer?.base_fob_price ?? 0);
    const fobTotal = unitPrice * quantity;
    const fobEl = app.querySelector('#cost-fob');
    if (fobEl) fobEl.textContent = `$${fobTotal.toFixed(2)}`;
    const totalEl = app.querySelector('#cost-total');
    if (totalEl) totalEl.textContent = `$${fobTotal.toFixed(2)}`;
  }

  function attachEvents() {
    // manufacturer selection
    app.querySelectorAll('.manufacturer-card').forEach((card) => {
      card.addEventListener('click', () => {
        const id = Number(card.dataset.offerId);
        if (!id) return;
        selectedOfferId = id;
        appState.offerId = selectedOfferId;
        render();
      });
    });

    // quantity change
    const qtyEl = app.querySelector('#sim-quantity');
    if (qtyEl) qtyEl.addEventListener('input', updateFobCost);

    // save simulation
    const saveBtn = app.querySelector('#save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        saveBtn.disabled = true;
        saveBtn.classList.add('opacity-60', 'cursor-not-allowed');

        try {
          const name = app.querySelector('#sim-name')?.value || 'Simulación sin nombre';
          const quantity = Number(app.querySelector('#sim-quantity')?.value || 0);

          if (!appState.offerId) throw new Error('Selecciona un fabricante antes de guardar.');
          if (!quantity || quantity <= 0) throw new Error('Ingresa una cantidad válida.');

          const payload = {
            name,
            product_offer_id: appState.offerId,
            incoterm: appState.incoterm,
            quantity,
          };

          // Intentamos crear la simulación; si falla, mostramos error
          try {
            await createSimulation(payload);
          } catch (apiErr) {
            console.error('createSimulation falló:', apiErr);
            throw new Error('No se pudo guardar la simulación. Revisa la consola.');
          }

          // redirigir al historial
          window.location.hash = '#/dashboard';
        } catch (err) {
          console.error('Error al guardar simulación:', err);
          showInlineError(err.message || 'Error al guardar la simulación.');
        } finally {
          saveBtn.disabled = false;
          saveBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        }
      });
    }
  }

  function showInlineError(message) {
    const container = app.querySelector('section');
    if (!container) return;
    const existing = container.querySelector('.sim-error');
    if (existing) existing.remove();
    const node = document.createElement('div');
    node.className = 'sim-error mt-4 rounded bg-red-600/10 p-3 text-sm text-red-300';
    node.textContent = message;
    container.prepend(node);
    setTimeout(() => node.remove(), 6000);
  }

  // Render inicial
  render();
}

// Helper: escape simple para evitar inyección en templates
function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? '';
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
