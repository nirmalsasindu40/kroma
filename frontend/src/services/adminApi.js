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
