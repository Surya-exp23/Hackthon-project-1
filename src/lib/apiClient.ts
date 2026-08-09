// Typed API client for CivicLens frontend
const API_BASE = '/api'; // proxied to Express via next.config.ts rewrites in dev

const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('civiclens_token');
};

const buildHeaders = (isFormData = false): HeadersInit => {
  const headers: HeadersInit = {};
  if (!isFormData) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json();
  if (!res.ok) throw data?.error || { message: 'An unknown error occurred' };
  return data;
};

export const apiClient = {
  get: (path: string) =>
    fetch(`${API_BASE}${path}`, { headers: buildHeaders(), credentials: 'include' }).then(handleResponse),

  post: (path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path: string, body: unknown) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: buildHeaders(),
      credentials: 'include',
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path: string) =>
    fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: buildHeaders(),
      credentials: 'include',
    }).then(handleResponse),

  upload: (path: string, formData: FormData) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: buildHeaders(true), // no Content-Type, let browser set multipart
      credentials: 'include',
      body: formData,
    }).then(handleResponse),

  // Store token after login/register
  setToken: (token: string) => localStorage.setItem('civiclens_token', token),
  clearToken: () => localStorage.removeItem('civiclens_token'),
};
