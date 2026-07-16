// stepper.js
import { appState } from '../state.js';
import { getCountries, getCategories, getProductsByCategory } from '../api.js';

// Mapeo entre las etiquetas del mockup y el incoterm real que exige la base de datos
const METHOD_TO_INCOTERM = {
  expert: 'EXW',
  intermediate: 'FOB',
  easy: 'CIF',
};

// El stepper vive DENTRO de la vista del simulador (no tiene ruta propia).
// Cuando el usuario envía el formulario, se llama a onComplete().
export async function renderStepper(container, onComplete) {
  if (!container) {
    console.error('renderStepper: container no proporcionado');
    return;
  }

  // Mostrar loader inicial
  container.innerHTML = `
    <div class="p-8 text-center">
      <p class="text-slate-400">Cargando configuración…</p>
    </div>
  `;

  let countries = [], categories = [], products = [];

  try {
    // Peticiones paralelas
    [countries, categories] = await Promise.all([getCountries(), getCategories()]);

    // Validación defensiva
    if (!Array.isArray(countries) || countries.length === 0) {
      throw new Error('No hay países disponibles (countries vacío).');
    }
    if (!Array.isArray(categories) || categories.length === 0) {
      throw new Error('No hay categorías disponibles (categories vacío).');
    }

    // Pedimos productos de la primera categoría por defecto
    products = await getProductsByCategory(categories[0].id);
    if (!Array.isArray(products)) products = [];
  } catch (err) {
    console.error('API error en renderStepper:', err);
    container.innerHTML = `
      <div class="p-6 text-center">
        <p class="text-red-400 mb-2">No se pudieron cargar los datos iniciales.</p>
        <p class="text-sm text-slate-400">Asegúrate de que la API en <strong>http://localhost:4000</strong> esté corriendo y revisa los logs del servidor.</p>
        <div class="mt-4 flex justify-center gap-3">
          <button id="retry-stepper" class="rounded bg-emerald-500 px-4 py-2 text-slate-900">Reintentar</button>
        </div>
      </div>
    `;
    container.querySelector('#retry-stepper')?.addEventListener('click', () => renderStepper(container, onComplete));
    return;
  }

  // Render principal del formulario (ya con datos válidos o arrays vacíos manejados)
  container.innerHTML = `
    <main class="mx-auto w-full max-w-2xl rounded-[32px] border border-white/10 p-8 shadow-[0_50px_120px_rgba(15,23,42,0.7)] glass sm:p-10">
      <div class="text-center">
        <p class="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Inicia tu simulación de importación</p>
        <h1 class="mt-4 text-3xl font-semibold text-white sm:text-4xl">Paso 1 de 2: Configuración básica</h1>
      </div>

      <form id="stepper-form" class="mt-10 space-y-6">
        <div>
          <label for="country" class="text-sm font-medium text-slate-300">País de origen</label>
          <select id="country" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            ${countries.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label for="category" class="text-sm font-medium text-slate-300">Categoría del producto</label>
          <select id="category" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            ${categories.map((c) => `<option value="${c.id}">${escapeHtml(c.category_name ?? c.name ?? 'Categoría')}</option>`).join('')}
          </select>
        </div>

        <div>
          <label for="product" class="text-sm font-medium text-slate-300">Producto específico</label>
          <select id="product" class="mt-3 w-full rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-slate-100 shadow-inner shadow-slate-950/30 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20">
            ${products.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="text-sm font-medium text-slate-300">Método de importación <span class="text-slate-500">(EXW / FOB / CIF)</span></label>
          <div class="mt-3 grid gap-4 sm:grid-cols-3" id="method-options">
            <label class="method-card flex cursor-pointer flex-col rounded-[26px] border border-sky-400/40 bg-sky-500/10 px-4 py-5 text-sky-100 transition hover:border-sky-300/60 hover:bg-sky-500/15" data-value="expert">
              <input type="radio" name="method" value="expert" class="mb-3 h-5 w-5 accent-sky-400" checked />
              <span class="text-base font-semibold">El experto (EXW)</span>
              <span class="mt-2 text-sm text-slate-300">Precisión manual</span>
            </label>
            <label class="method-card flex cursor-pointer flex-col rounded-[26px] border border-white/10 bg-slate-900/80 px-4 py-5 text-slate-100 transition hover:border-sky-400/50 hover:bg-slate-900/95" data-value="intermediate">
              <input type="radio" name="method" value="intermediate" class="mb-3 h-5 w-5 accent-sky-400" />
              <span class="text-base font-semibold">El intermedio (FOB)</span>
              <span class="mt-2 text-sm text-slate-400">Modo equilibrado</span>
            </label>
            <label class="method-card flex cursor-pointer flex-col rounded-[26px] border border-white/10 bg-slate-900/80 px-4 py-5 text-slate-100 transition hover:border-sky-400/50 hover:bg-slate-900/95" data-value="easy">
              <input type="radio" name="method" value="easy" class="mb-3 h-5 w-5 accent-sky-400" />
              <span class="text-base font-semibold">La forma fácil (CIF)</span>
              <span class="mt-2 text-sm text-slate-400">Configuración más rápida</span>
            </label>
          </div>
        </div>

        <div>
          <label for="fob" class="text-sm font-medium text-slate-300">Precio base estimado del fabricante (FOB - opcional, para mayor precisión)</label>
          <div class="mt-3 flex items-center gap-3 rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 shadow-inner shadow-slate-950/30">
            <span class="text-slate-400">$</span>
            <input id="fob" type="number" step="0.01" min="0" placeholder="0.00" class="w-full bg-transparent text-slate-100 outline-none placeholder:text-slate-500" />
          </div>
        </div>

        <button type="submit" id="stepper-submit" class="mt-8 w-full rounded-3xl bg-emerald-500 px-6 py-4 text-base font-semibold text-slate-950 transition hover:bg-emerald-400">
          CONTINUAR AL SIMULADOR DE COSTOS →
        </button>
      </form>
    </main>
  `;

  // Referencias a elementos
  const countrySelect = container.querySelector('#country');
  const categorySelect = container.querySelector('#category');
  const productSelect = container.querySelector('#product');
  const methodCards = container.querySelectorAll('.method-card');
  const form = container.querySelector('#stepper-form');
  const submitBtn = container.querySelector('#stepper-submit');

  // Si no existen selects por alguna razón, mostramos error leve
  if (!countrySelect || !categorySelect || !productSelect || !form) {
    console.error('renderStepper: elementos del DOM faltantes');
    container.innerHTML = `<p class="text-red-400">Error interno al montar el formulario.</p>`;
    return;
  }

  // Cuando cambia la categoría, hay que volver a pedir los productos de ESA categoría
  categorySelect.addEventListener('change', async () => {
    // bloqueo visual mientras carga
    productSelect.innerHTML = `<option>Cargando productos…</option>`;
    try {
      const newProducts = await getProductsByCategory(categorySelect.value);
      if (!Array.isArray(newProducts) || newProducts.length === 0) {
        productSelect.innerHTML = `<option value="">No hay productos</option>`;
      } else {
        productSelect.innerHTML = newProducts.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
      }
    } catch (err) {
      console.error('Error al cargar productos por categoría:', err);
      productSelect.innerHTML = `<option value="">Error al cargar</option>`;
    }
  });

  // Resalta visualmente la tarjeta del método que el usuario va eligiendo
  methodCards.forEach((card) => {
    card.addEventListener('click', () => {
      methodCards.forEach((c) => {
        c.classList.remove('border-sky-400/40', 'bg-sky-500/10', 'text-sky-100');
        c.classList.add('border-white/10', 'bg-slate-900/80', 'text-slate-100');
        // también marcar el input radio dentro
        const input = c.querySelector('input[type="radio"]');
        if (input) input.checked = false;
      });
      card.classList.remove('border-white/10', 'bg-slate-900/80', 'text-slate-100');
      card.classList.add('border-sky-400/40', 'bg-sky-500/10', 'text-sky-100');
      const input = card.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });

  // Manejo del submit con validación mínima y bloqueo de botón para evitar dobles envíos
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-60', 'cursor-not-allowed');

    try {
      const methodInput = form.querySelector('input[name="method"]:checked');
      const methodValue = methodInput ? methodInput.value : 'expert';

      appState.countryId = Number(countrySelect.value) || null;
      appState.categoryId = Number(categorySelect.value) || null;
      appState.productId = Number(productSelect.value) || null;
      appState.incoterm = METHOD_TO_INCOTERM[methodValue] || METHOD_TO_INCOTERM.expert;

      const fobValue = container.querySelector('#fob').value;
      appState.fobOverride = fobValue ? Number(fobValue) : null;

      // Validación mínima: asegurar que tengamos productId
      if (!appState.productId) {
        throw new Error('Selecciona un producto válido antes de continuar.');
      }

      onComplete();
    } catch (err) {
      console.error('Error en submit del stepper:', err);
      // mostrar feedback breve al usuario
      const errNode = document.createElement('div');
      errNode.className = 'mt-4 rounded bg-red-600/10 p-3 text-sm text-red-300';
      errNode.textContent = err.message || 'Error al procesar el formulario.';
      form.appendChild(errNode);
      setTimeout(() => errNode.remove(), 5000);
    } finally {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-60', 'cursor-not-allowed');
    }
  });
}

// Helper: escape simple para evitar inyección en templates
function escapeHtml(str) {
  if (typeof str !== 'string') return str ?? '';
  return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}
