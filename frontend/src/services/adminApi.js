const API_BASE = 'http://localhost:5000/api';

export async function createProduct(formData) {
  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to create product');
  return data;
}

export async function updateProduct(id, formData) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to update product');
  return data;
}

export async function deleteProduct(id) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
}

async function jsonRequest(path, method, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Admin view of the catalogue — includes deactivated products, which the
// public /products endpoint hides from customers.
export async function getAllProductsAdmin() {
  const res = await fetch(`${API_BASE}/products/admin/all`, { credentials: 'include' });
  const data = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(data.message || 'Failed to load products');
  return data;
}

// Soft-delete (active=false) or restore (active=true) a product.
export const setProductActive = (id, active) => jsonRequest(`/products/${id}/active`, 'PATCH', { active });

// Update only the stock quantity of a product.
export const updateProductStock = (id, stock) => jsonRequest(`/products/${id}/stock`, 'PATCH', { stock });
