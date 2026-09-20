const API_BASE = 'http://localhost:5000/api';

export async function getProducts() {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function searchProducts(query) {
  if (!query.trim()) return [];
  const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export function resolveImageUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `http://localhost:5000${path}`;
}

// Converts a base64 data URL (from FileReader) back into a Blob,
// so it can be sent to the server as a real file at checkout time.
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mimeMatch = header.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

// Only called once the user completes checkout — uploads the design
// that was sitting in browser memory/localStorage up to that point.
export async function uploadDesign({ dataUrl, fileName, productId, productName }) {
  const blob = dataUrlToBlob(dataUrl);
  const formData = new FormData();
  formData.append('design', blob, fileName || 'design.png');
  formData.append('productId', productId || '');
  formData.append('productName', productName || '');

  const res = await fetch(`${API_BASE}/designs/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Design upload failed');
  return res.json(); // { url, productId, productName }
}
