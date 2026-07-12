import apiClient from '@/lib/api/apiClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials } from '@/types/auth';

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const res = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/login', credentials);
  return res.data.data;
}

export async function register(credentials: RegisterCredentials): Promise<AuthResponse> {
  const res = await apiClient.post<{ success: true; data: AuthResponse }>('/auth/register', credentials);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function refreshToken(): Promise<string> {
  const res = await apiClient.post<{ success: true; data: { accessToken: string } }>('/auth/refresh');
  return res.data.data.accessToken;
}
