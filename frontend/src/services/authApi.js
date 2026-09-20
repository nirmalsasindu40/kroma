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

export const registerUser = (payload) =>
  request('/auth/register', { method: 'POST', body: JSON.stringify(payload) });

export const loginUser = (payload) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify(payload) });

export const logoutUser = () => request('/auth/logout', { method: 'POST' });

export const fetchCurrentUser = () => request('/auth/me');

export const refreshSession = () => request('/auth/refresh-token', { method: 'POST' });

export const forgotPassword = (email) =>
  request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });

export const resetPassword = (token, password) =>
  request(`/auth/reset-password/${token}`, { method: 'POST', body: JSON.stringify({ password }) });

export const updateProfile = (payload) =>
  request('/users/me', { method: 'PUT', body: JSON.stringify(payload) });
