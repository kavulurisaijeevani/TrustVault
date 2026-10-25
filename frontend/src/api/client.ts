// Centralized API service for TrustVault.
//
// All backend communication goes through this module. Endpoint paths match
// the backend routes under api/*.

const rawBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
// Normalize: strip trailing slash.
export const API_BASE_URL = (rawBase ?? '').replace(/\/+$/, '');

export class ApiRequestError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.details = details;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token, headers = {} } = options;
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };
  if (body !== undefined) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    finalHeaders['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'omit',
    });
  } catch (err) {
    // Network failure (backend down, CORS, etc.)
    throw new ApiRequestError(
      0,
      'Unable to reach the backend API. Is it running on http://localhost:5285?',
      err
    );
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    const message =
      (payload && typeof payload === 'object' && 'message' in (payload as Record<string, unknown>)
        ? String((payload as Record<string, unknown>).message)
        : null) ||
      (typeof payload === 'string' && payload.trim() ? payload : null) ||
      `Request failed with status ${response.status}`;
    throw new ApiRequestError(response.status, message, payload);
  }

  return payload as T;
}

export const api = {
  // --- Backend health (implemented by current backend) ---
  health: () => request<{ application: string; status: string }>('/'),
  dbCheck: () => request<{ status: string; database: string }>('/db-check'),

  // --- Auth ---
  login: (data: { email: string; password: string }) =>
    request<{ accessToken: string; tokenType: string; expiresAt: string; user: unknown }>('/api/auth/login', {
      method: 'POST',
      body: data,
    }),
  register: (data: { email: string; password: string; displayName: string }) =>
    request<{ accessToken: string; tokenType: string; expiresAt: string; user: unknown }>('/api/auth/register', {
      method: 'POST',
      body: data,
    }),

  // --- Documents ---
  listDocuments: (token: string | null) =>
    request<unknown[]>('/api/documents', { token }),
  getDocument: (id: string, token: string | null) =>
    request<unknown>(`/api/documents/${encodeURIComponent(id)}`, { token }),
  uploadDocument: async (file: File, token: string | null) => {
    const url = `${API_BASE_URL}/api/documents/upload`;
    const form = new FormData();
    form.append('file', file);
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { method: 'POST', headers, body: form });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new ApiRequestError(res.status, text || `Upload failed (${res.status})`);
    }
    return res.json();
  },
  deleteDocument: (id: string, token: string | null) =>
    request<void>(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE', token }),

  // --- Permissions / sharing ---
  listPermissions: (documentId: string, token: string | null) =>
    request<unknown[]>(`/api/documents/${encodeURIComponent(documentId)}/permissions`, { token }),
  shareDocument: (payload: unknown, token: string | null) =>
    request<unknown>('/api/permissions', { method: 'POST', body: payload, token }),
  revokePermission: (permissionId: string, token: string | null) =>
    request<void>(`/api/permissions/${encodeURIComponent(permissionId)}/revoke`, { method: 'POST', token }),
  updateExpiry: (permissionId: string, expiresAt: string | null, token: string | null) =>
    request<unknown>(`/api/permissions/${encodeURIComponent(permissionId)}/expiry`, {
      method: 'PATCH',
      body: { expiresAt },
      token,
    }),

  // --- Audit ---
  listAuditLogs: (token: string | null, params?: { page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set('page', String(params.page));
    if (params?.pageSize) qs.set('pageSize', String(params.pageSize));
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    return request<{ items: unknown[]; total: number; page: number; pageSize: number }>(
      `/api/audit${suffix}`,
      { token }
    );
  },
};

export default api;
