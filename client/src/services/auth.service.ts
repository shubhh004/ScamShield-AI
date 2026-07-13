import apiClient from '@/lib/api/apiClient';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '@/types/auth';

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

export async function getMe(): Promise<User> {
  const res = await apiClient.get<{ success: true; data: { user: User } }>('/auth/me');
  return res.data.data.user;
}

export async function updateProfile(data: { name?: string; email?: string }): Promise<User> {
  const res = await apiClient.patch<{ success: true; data: { user: User } }>('/auth/profile', data);
  return res.data.data.user;
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post('/auth/change-password', data);
}

export async function deleteAccount(): Promise<void> {
  await apiClient.delete('/auth/account');
}
