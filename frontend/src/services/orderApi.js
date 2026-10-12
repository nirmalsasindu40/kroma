const API_BASE = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// Customer: their own order history.
export const getMyOrders = () => request('/orders/mine');

// Admin: every order across all customers.
export const getAllOrders = () => request('/orders');

// Admin: move an order to a new fulfilment status.
export const updateOrderStatus = (orderId, status) =>
  request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
