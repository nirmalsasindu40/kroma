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
