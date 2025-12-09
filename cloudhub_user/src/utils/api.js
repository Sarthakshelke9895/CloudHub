// src/utils/api.js
const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token'); // or wherever you store JWT

  const headers = {
    ...(options.headers || {}),
    'Authorization': token ? `Bearer ${token}` : '',
  };

  const res = await fetch(`${backendUrl}${endpoint}`, { ...options, headers });
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'API Error');
  }

  return res.json();
}
