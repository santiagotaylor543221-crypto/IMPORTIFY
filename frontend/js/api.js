const BASE_URL = 'http://localhost:4000/api';

export async function getCountries() {
  const res = await fetch(`${BASE_URL}/countries`);
  return res.json();
}

export async function getCategories() {
  const res = await fetch(`${BASE_URL}/categories`);
  return res.json();
}

export async function getProductsByCategory(categoryId) {
  const res = await fetch(`${BASE_URL}/categories/${categoryId}/products`);
  return res.json();
}

export async function getOffersByProduct(productId) {
  const res = await fetch(`${BASE_URL}/products/${productId}/offers`);
  return res.json();
}

export async function getTaxRule(categoryId, countryId) {
  const res = await fetch(`${BASE_URL}/tax-rules?categoryId=${categoryId}&countryId=${countryId}`);
  return res.json();
}

export async function createSimulation(data) {
  const res = await fetch(`${BASE_URL}/simulations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getSimulations() {
  const res = await fetch(`${BASE_URL}/simulations`);
  return res.json();
}

export async function getSimulationDetail(id) {
  const res = await fetch(`${BASE_URL}/simulations/${id}`);
  return res.json();
}

export async function deleteSimulation(id) {
  const res = await fetch(`${BASE_URL}/simulations/${id}`, { method: 'DELETE' });
  return res.json();
}
