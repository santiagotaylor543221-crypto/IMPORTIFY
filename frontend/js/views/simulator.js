// =====================================================
// simulator.js — Vista única combinada
// Todo en una sola pantalla: selección + costos en
// tiempo real. No hay stepper separado.
// =====================================================

import { getCountries, getCategories, getProductsByCategory, getOffersByProduct, getTaxRule, createSimulation } from '../api.js';

// ── Constantes ────────────────────────────────────────
const USD_TO_COP = 4100; // TRM aprox julio 2026

// Costo de flete según país (% del FOB total)
const FLETE_POR_PAIS = { 'USA': 0.06, 'China': 0.12, 'Panamá': 0.03 };
const TASA_SEGURO = 0.008; // 0.8% del FOB

const COLORES = {
  fob: '#3b82f6', flete: '#10b981', seguro: '#8b5cf6',
  arancel: '#f59e0b', iva: '#f97316', otros: '#ef4444',
};

const PAIS_FLAGS = { 'USA': '🇺🇸', 'China': '🇨🇳', 'Panamá': '🇵🇦' };
const CAT_ICONS  = { 'Technology': '💻', 'Fashion and Textiles': '👕', 'Home and Decor': '🏠' };

// ── Estado local ──────────────────────────────────────
let st = {
  countryId: null, countryName: '',
  categoryId: null, productId: null,
  offerId: null, offer: null, taxRule: null,
  incoterm: 'EXW', quantity: 1, simName: '',
};
let api = { countries: [], categories: [], products: [] };

// ── Punto de entrada ──────────────────────────────────
export async function renderSimulator() {
  const app = document.getElementById('app');
  app.innerHTML = `<div class="flex items-center justify-center min-h-[40vh]"><p class="text-slate-400 animate-pulse">Cargando simulador...</p></div>`;

  try {
    [api.countries, api.categories] = await Promise.all([getCountries(), getCategories()]);

    st.countryId   = api.countries[0]?.id   || null;
    st.countryName = api.countries[0]?.name || '';
    st.categoryId  = api.categories[0]?.id  || null;

    api.products = await getProductsByCategory(st.categoryId);
    st.productId = api.products[0]?.id || null;

    if (st.productId) {
      const offers = await getOffersByProduct(st.productId);
      st.offer = offers[0] || null;
      st.offerId = st.offer?.offer_id || null;
    }
    if (st.categoryId && st.countryId) {
      st.taxRule = await getTaxRule(st.categoryId, st.countryId);
    }

    renderLayout();
    attachEvents();
    updateCosts();
  } catch (err) {
    app.innerHTML = `<p class="text-red-400 p-4">Error: ${err.message}</p>`;
  }
}

// ── HTML base (se dibuja una sola vez) ───────────────
function renderLayout() {
  document.getElementById('app').innerHTML = `
  <div class="grid gap-6 lg:grid-cols-2 xl:gap-8">

    <!-- PANEL IZQUIERDO: controles -->
    <section class="space-y-4">

      <!-- Nombre -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <label class="block text-sm font-medium text-slate-400 mb-2">Nombre de la simulación</label>
        <input id="sim-name" type="text" placeholder="Ej: Laptops Q3 2026"
          class="w-full rounded-2xl border border-white/10 bg-slate-900/90 px-4 py-3 text-slate-100 outline-none focus:border-sky-400 transition placeholder:text-slate-500" />
      </div>

      <!-- País -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <label class="block text-sm font-medium text-slate-400 mb-3">🌍 País de origen</label>
        <div class="grid grid-cols-3 gap-3" id="country-cards">
          ${api.countries.map(c => cardPais(c, c.id === st.countryId)).join('')}
        </div>
      </div>

      <!-- Categoría -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <label class="block text-sm font-medium text-slate-400 mb-3">📦 Categoría del producto</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="category-cards">
          ${api.categories.map(c => cardCategoria(c, c.id === st.categoryId)).join('')}
        </div>
      </div>

      <!-- Producto -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <label class="block text-sm font-medium text-slate-400 mb-3">🛍️ Producto</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="product-cards">
          ${api.products.map(p => cardProducto(p, p.id === st.productId)).join('')}
        </div>
      </div>

      <!-- Incoterm -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <label class="block text-sm font-medium text-slate-400 mb-1">📋 ¿Hasta dónde quieres cotizar?</label>
        <p class="text-xs text-slate-500 mb-3">Elige el método de importación</p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3" id="incoterm-cards">
          ${cardIncoterm('EXW','🏭','EXW','Solo precio de fábrica', st.incoterm==='EXW')}
          ${cardIncoterm('FOB','🚢','FOB','Fábrica + flete', st.incoterm==='FOB')}
          ${cardIncoterm('CIF','📦','CIF','Todo + impuestos DIAN', st.incoterm==='CIF')}
        </div>
      </div>

      <!-- Cantidad -->
      <div class="rounded-[28px] border border-white/10 bg-slate-950/80 px-5 py-4">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p class="text-sm font-semibold text-slate-300">Cantidad de unidades</p>
            <p class="text-xs text-slate-500 mt-1">Los costos cambian al instante</p>
          </div>
          <div class="flex items-center gap-3">
            <input id="sim-quantity" type="number" min="1" value="1"
              class="w-28 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-right text-slate-100 outline-none focus:border-sky-400 transition" />
            <span class="text-sm text-slate-400">unidades</span>
          </div>
        </div>
      </div>

      <!-- Fabricante (oculto hasta que haya oferta) -->
      <div id="mfr-card" class="hidden rounded-[28px] border border-white/10 bg-slate-950/80 p-5">
        <p class="text-sm font-medium text-slate-400 mb-2">🏭 Fabricante seleccionado</p>
        <div id="mfr-info"></div>
      </div>

      <!-- Guardar -->
      <button id="save-btn"
        class="w-full rounded-3xl bg-sky-500 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed">
        Guardar simulación
      </button>

    </section>

    <!-- PANEL DERECHO: desglose de costos -->
    <aside>
      <div class="rounded-[32px] border border-white/10 bg-slate-950/80 p-6 sm:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sticky top-24">

        <div class="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 class="text-xl font-semibold text-slate-100">Desglose de costos</h2>
            <p class="mt-1 text-sm text-slate-400">Se actualiza en tiempo real</p>
          </div>
          <span class="rounded-full bg-white/5 px-3 py-1 text-sm text-slate-300">USD</span>
        </div>

        <!-- Gráfica de dona -->
        <div class="flex justify-center mb-6">
          <div class="relative flex h-[200px] w-[200px] items-center justify-center rounded-full bg-slate-900/80">
            <svg id="donut-svg" viewBox="0 0 220 220" class="h-full w-full rotate-[-90deg]">
              <circle cx="110" cy="110" r="88" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="28"/>
            </svg>
            <div class="absolute inset-0 grid place-items-center text-center pointer-events-none">
              <div>
                <p id="chart-total" class="text-xl font-bold text-slate-100">$0.00</p>
                <p class="text-xs text-slate-400 mt-1">Total USD</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Items de costo -->
        <div id="cost-list" class="space-y-2"></div>

        <!-- Totales USD + COP -->
        <div class="mt-4 rounded-[24px] border border-white/10 bg-slate-900/90 p-4 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-400">Total USD</span>
            <span id="total-usd" class="text-xl font-bold text-slate-100">$0.00</span>
          </div>
          <div class="flex items-center justify-between border-t border-white/5 pt-3">
            <span class="text-xs text-slate-500">≈ Pesos colombianos</span>
            <span id="total-cop" class="text-base font-bold text-emerald-400">$0 COP</span>
          </div>
          <p class="text-[10px] text-slate-600 text-right">TRM aprox. $${USD_TO_COP.toLocaleString('es-CO')} COP/USD</p>
        </div>

      </div>
    </aside>

  </div>`;
}

// ── Recalcular y actualizar solo los números/gráfica ─
function updateCosts() {
  const c = calcularCostos();

  // Donut
  const svg = document.getElementById('donut-svg');
  if (svg) svg.innerHTML = buildDonut(c);

  const ct = document.getElementById('chart-total');
  if (ct) ct.textContent = fmtUSD(c.total);

  // Lista de items
  const lista = document.getElementById('cost-list');
  if (lista) {
    lista.innerHTML = [
      { label:'Merchandise (FOB)', sub:'Costo de la mercancía', val:c.fob,    color:COLORES.fob,    tag:'FOB' },
      { label:'Flete',             sub:'Transporte internacional', val:c.flete, color:COLORES.flete,  tag:'FLT' },
      { label:'Seguro de carga',   sub:'Seguro internacional',   val:c.seguro, color:COLORES.seguro, tag:'SEG' },
      { label:'Aranceles DIAN',    sub:'Arancel de importación', val:c.arancel,color:COLORES.arancel,tag:'TAX' },
      { label:'IVA',               sub:'Impuesto al valor agregado', val:c.iva, color:COLORES.iva,    tag:'IVA' },
      { label:'Otros cargos',      sub:'Cargos adicionales',     val:c.otros,  color:COLORES.otros,  tag:'OTH' },
    ].map(itemCosto).join('');
  }

  const tu = document.getElementById('total-usd');
  const tc = document.getElementById('total-cop');
  if (tu) tu.textContent = fmtUSD(c.total);
  if (tc) tc.textContent = fmtCOP(c.total * USD_TO_COP);

  // Fabricante
  const mfrCard = document.getElementById('mfr-card');
  const mfrInfo = document.getElementById('mfr-info');
  if (mfrCard && mfrInfo) {
    if (st.offer) {
      mfrCard.classList.remove('hidden');
      mfrInfo.innerHTML = `
        <p class="text-slate-100 font-semibold">${st.offer.name}</p>
        ${st.offer.website ? `<p class="text-slate-400 text-sm mt-1">${st.offer.website}</p>` : ''}
        ${st.offer.contact_email ? `<p class="text-slate-400 text-sm">${st.offer.contact_email}</p>` : ''}
        <p class="text-sky-300 text-sm mt-2">Precio FOB unitario: ${fmtUSD(st.offer.base_fob_price)}</p>
      `;
    } else {
      mfrCard.classList.add('hidden');
    }
  }
}

// ── Fórmula de costos ─────────────────────────────────
function calcularCostos() {
  if (!st.offer) return { fob:0, flete:0, seguro:0, arancel:0, iva:0, otros:0, total:0 };

  const qty     = Math.max(1, Number(st.quantity) || 1);
  const fobT    = Number(st.offer.base_fob_price) * qty;
  const fRate   = FLETE_POR_PAIS[st.countryName] || 0.05;
  const fleteT  = fobT * fRate;
  const seguroT = fobT * TASA_SEGURO;
  const cifT    = fobT + fleteT + seguroT;

  const tArancel = st.taxRule ? Number(st.taxRule.tariff_rate) / 100 : 0;
  const tIVA     = st.taxRule ? Number(st.taxRule.vat_rate)    / 100 : 0;
  const otros    = st.taxRule ? Number(st.taxRule.other_fees)        : 0;
  const arancelT = cifT * tArancel;
  const ivaT     = (cifT + arancelT) * tIVA;

  // EXW: solo mercancía | FOB: + flete | CIF: todo
  const c = { fob: fobT, flete:0, seguro:0, arancel:0, iva:0, otros:0 };
  if (st.incoterm === 'FOB') { c.flete = fleteT; }
  if (st.incoterm === 'CIF') { c.flete=fleteT; c.seguro=seguroT; c.arancel=arancelT; c.iva=ivaT; c.otros=otros; }
  c.total = c.fob + c.flete + c.seguro + c.arancel + c.iva + c.otros;
  return c;
}

// ── Gráfica de dona SVG ───────────────────────────────
function buildDonut(c) {
  const r    = 88;
  const circ = 2 * Math.PI * r;
  const segs = [
    { v: c.fob,    col: COLORES.fob },
    { v: c.flete,  col: COLORES.flete },
    { v: c.seguro, col: COLORES.seguro },
    { v: c.arancel + c.iva, col: COLORES.arancel },
    { v: c.otros,  col: COLORES.otros },
  ].filter(s => s.v > 0);

  const total = segs.reduce((s, x) => s + x.v, 0);
  const fondo = `<circle cx="110" cy="110" r="${r}" fill="none" stroke="rgba(148,163,184,0.12)" stroke-width="28"/>`;
  if (!total) return fondo;

  let off = 0;
  const circulos = segs.map(s => {
    const dash = (s.v / total) * circ;
    const el = `<circle cx="110" cy="110" r="${r}" fill="none" stroke="${s.col}" stroke-width="28"
      stroke-dasharray="${dash.toFixed(2)} ${circ.toFixed(2)}"
      stroke-dashoffset="${(-off).toFixed(2)}" stroke-linecap="round"/>`;
    off += dash;
    return el;
  });
  return fondo + circulos.join('');
}

// ── Eventos de los selectores ─────────────────────────
function attachEvents() {

  // País
  document.getElementById('country-cards').addEventListener('click', async e => {
    const card = e.target.closest('.sel-card');
    if (!card) return;
    st.countryId   = Number(card.dataset.id);
    st.countryName = card.dataset.name;
    activar('#country-cards', card);
    if (st.categoryId) st.taxRule = await getTaxRule(st.categoryId, st.countryId);
    updateCosts();
  });

  // Categoría
  document.getElementById('category-cards').addEventListener('click', async e => {
    const card = e.target.closest('.sel-card');
    if (!card) return;
    st.categoryId = Number(card.dataset.id);
    activar('#category-cards', card);

    api.products = await getProductsByCategory(st.categoryId);
    const grid = document.getElementById('product-cards');
    if (grid) grid.innerHTML = api.products.map((p, i) => cardProducto(p, i === 0)).join('');

    if (api.products.length) {
      st.productId = api.products[0].id;
      const offers = await getOffersByProduct(st.productId);
      st.offer   = offers[0] || null;
      st.offerId = st.offer?.offer_id || null;
    }
    if (st.countryId) st.taxRule = await getTaxRule(st.categoryId, st.countryId);
    updateCosts();
  });

  // Producto
  document.getElementById('product-cards').addEventListener('click', async e => {
    const card = e.target.closest('.sel-card');
    if (!card) return;
    st.productId = Number(card.dataset.id);
    activar('#product-cards', card);
    const offers = await getOffersByProduct(st.productId);
    st.offer   = offers[0] || null;
    st.offerId = st.offer?.offer_id || null;
    updateCosts();
  });

  // Incoterm
  document.getElementById('incoterm-cards').addEventListener('click', e => {
    const card = e.target.closest('.sel-card');
    if (!card) return;
    st.incoterm = card.dataset.value;
    activar('#incoterm-cards', card);
    updateCosts();
  });

  // Cantidad
  document.getElementById('sim-quantity').addEventListener('input', e => {
    st.quantity = Number(e.target.value) || 1;
    updateCosts();
  });

  // Nombre
  document.getElementById('sim-name').addEventListener('input', e => {
    st.simName = e.target.value;
  });

  // Guardar
  document.getElementById('save-btn').addEventListener('click', async () => {
    if (!st.offerId) return alert('Selecciona un producto primero');
    const btn = document.getElementById('save-btn');
    btn.textContent = 'Guardando...';
    btn.disabled = true;
    try {
      await createSimulation({
        name: st.simName || 'Simulación sin nombre',
        product_offer_id: st.offerId,
        incoterm: st.incoterm,
        quantity: st.quantity,
      });
      window.location.hash = '#/dashboard';
    } catch (err) {
      alert('Error: ' + err.message);
      btn.textContent = 'Guardar simulación';
      btn.disabled = false;
    }
  });
}

// ── Helpers de tarjetas HTML ──────────────────────────
function claseBase(active) {
  return `sel-card w-full rounded-2xl border px-3 py-4 text-center transition cursor-pointer ${
    active ? 'border-sky-400/60 bg-sky-500/15 text-sky-100'
           : 'border-white/10 bg-slate-900/80 text-slate-100 hover:border-sky-400/40'
  }`;
}

function cardPais(c, active) {
  return `<button type="button" class="${claseBase(active)}" data-id="${c.id}" data-name="${c.name}">
    <div class="text-2xl mb-1">${PAIS_FLAGS[c.name] || '🌍'}</div>
    <p class="text-xs font-semibold leading-tight">${c.name}</p>
  </button>`;
}

function cardCategoria(c, active) {
  return `<button type="button" class="${claseBase(active)}" data-id="${c.id}">
    <div class="text-xl mb-1">${CAT_ICONS[c.category_name] || '📦'}</div>
    <p class="text-xs font-semibold leading-tight">${c.category_name}</p>
  </button>`;
}

function cardProducto(p, active) {
  return `<button type="button" class="${claseBase(active)}" data-id="${p.id}">
    <p class="text-xs font-semibold leading-tight">${p.name}</p>
  </button>`;
}

function cardIncoterm(value, icon, title, sub, active) {
  return `<button type="button" class="${claseBase(active)} text-left" data-value="${value}">
    <div class="text-xl mb-2">${icon}</div>
    <p class="text-xs font-bold">${title}</p>
    <p class="text-[11px] text-slate-400 mt-1 leading-tight">${sub}</p>
  </button>`;
}

function itemCosto({ label, sub, val, color, tag }) {
  return `<div class="rounded-2xl border border-white/10 bg-slate-900/80 p-3">
    <div class="flex items-center gap-3">
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white text-[10px] font-bold" style="background:${color}">${tag}</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-slate-100">${label}</p>
        <p class="text-[11px] text-slate-400">${sub}</p>
      </div>
      <div class="text-right">
        <p class="text-sm font-semibold ${val > 0 ? 'text-slate-100' : 'text-slate-500'}">${val > 0 ? fmtUSD(val) : 'No aplica'}</p>
        ${val > 0 ? `<p class="text-[11px] text-emerald-400">${fmtCOP(val * USD_TO_COP)}</p>` : ''}
      </div>
    </div>
  </div>`;
}

// ── Activar tarjeta ───────────────────────────────────
function activar(containerSel, activeCard) {
  document.querySelectorAll(`${containerSel} .sel-card`).forEach(c => {
    c.classList.remove('border-sky-400/60', 'bg-sky-500/15', 'text-sky-100');
    c.classList.add('border-white/10', 'bg-slate-900/80', 'text-slate-100');
  });
  activeCard.classList.remove('border-white/10', 'bg-slate-900/80', 'text-slate-100');
  activeCard.classList.add('border-sky-400/60', 'bg-sky-500/15', 'text-sky-100');
}

// ── Formatos ──────────────────────────────────────────
function fmtUSD(n) {
  return new Intl.NumberFormat('en-US', { style:'currency', currency:'USD' }).format(Number(n)||0);
}
function fmtCOP(n) {
  return new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP', minimumFractionDigits:0, maximumFractionDigits:0 }).format(Number(n)||0);
}
