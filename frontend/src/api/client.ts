import type { LoginResponse, User, Vehicle, VehicleInput } from '../types';

const BASE_URL = '/api';

class ApiRequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 204) {
    return undefined as T;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiRequestError(data.error || 'Something went wrong', res.status);
  }

  return data as T;
}

export const api = {
  register(email: string, password: string): Promise<User> {
    return request('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  login(email: string, password: string): Promise<LoginResponse> {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },

  listVehicles(token: string): Promise<Vehicle[]> {
    return request('/vehicles', {}, token);
  },

  searchVehicles(token: string, params: Record<string, string>): Promise<Vehicle[]> {
    const query = new URLSearchParams(params).toString();
    return request(`/vehicles/search?${query}`, {}, token);
  },

  createVehicle(token: string, input: VehicleInput): Promise<Vehicle> {
    return request('/vehicles', { method: 'POST', body: JSON.stringify(input) }, token);
  },

  updateVehicle(token: string, id: number, input: Partial<VehicleInput>): Promise<Vehicle> {
    return request(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(input) }, token);
  },

  deleteVehicle(token: string, id: number): Promise<void> {
    return request(`/vehicles/${id}`, { method: 'DELETE' }, token);
  },

  purchaseVehicle(token: string, id: number, amount = 1): Promise<Vehicle> {
    return request(`/vehicles/${id}/purchase`, { method: 'POST', body: JSON.stringify({ amount }) }, token);
  },

  restockVehicle(token: string, id: number, amount: number): Promise<Vehicle> {
    return request(`/vehicles/${id}/restock`, { method: 'POST', body: JSON.stringify({ amount }) }, token);
  }
};

export { ApiRequestError };
