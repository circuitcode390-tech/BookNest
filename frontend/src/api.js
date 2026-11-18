const API = 'https://booknest-5v88.onrender.com/api';

export async function request(path, options = {}) {
  const token = localStorage.getItem('libraryToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    message: 'Invalid server response',
  }));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
