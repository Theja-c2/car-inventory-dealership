export interface Vehicle {
  id: number;
  make: string;
  model: string;
  category: string;
  price: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export type VehicleInput = Omit<Vehicle, 'id' | 'created_at' | 'updated_at'>;

export interface User {
  id: number;
  email: string;
  role: 'user' | 'admin';
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
