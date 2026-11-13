const API_URL = import.meta.env.VITE_API_URL;

// Sends a request to our backend and returns the JSON answer.
// - adds the login token automatically, if there is one
// - turns the body into JSON
// - throws an Error with the server's message when the answer is not OK
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');

  const headers = { ...options.headers };
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.error ?? `Request failed (${res.status})`);
    error.status = res.status;
    error.details = data?.details ?? [];
    throw error;
  }
  return data;
}