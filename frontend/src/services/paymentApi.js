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

// Asks the backend to calculate the PayHere hash and returns everything
// needed to build the hidden form that redirects to PayHere sandbox.
export const initiatePayment = (payload) =>
  request('/payment/initiate', { method: 'POST', body: JSON.stringify(payload) });

// Called from the order-success page once the customer is redirected back
// from PayHere — marks the order paid and deducts stock.
export const confirmPayment = (orderId) =>
  request('/payment/confirm', { method: 'POST', body: JSON.stringify({ orderId }) });

// Called from the order-cancelled page so an abandoned order is marked
// cancelled instead of sitting as "pending" forever.
export const cancelPayment = (orderId) =>
  request('/payment/cancel', { method: 'POST', body: JSON.stringify({ orderId }) });
