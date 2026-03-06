// API helper for authenticated requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message || 'Request failed' };
    }

    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Network error' };
  }
}

// Convenience methods
export const api = {
  get: <T = any>(endpoint: string) => apiRequest<T>(endpoint),
  post: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T = any>(endpoint: string, body: any) =>
    apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T = any>(endpoint: string) =>
    apiRequest<T>(endpoint, { method: 'DELETE' }),
};
