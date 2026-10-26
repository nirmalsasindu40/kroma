const API_BASE = 'http://localhost:5000/api/community';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const getFaqs = () => request('/faqs');
export const getFeedback = () => request('/feedback');
export const submitFeedback = (feedback) =>
  request('/feedback', { method: 'POST', body: JSON.stringify(feedback) });

export const createFaq = (faq) =>
  request('/faqs', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify(faq),
  });

export const updateFaq = (id, faq) =>
  request(`/faqs/${id}`, {
    method: 'PUT',
    credentials: 'include',
    body: JSON.stringify(faq),
  });
