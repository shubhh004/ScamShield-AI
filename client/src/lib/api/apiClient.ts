import axios, { type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let isRefreshing = false;
let onRefreshFailure: (() => void) | null = null;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
const failedQueue: QueueEntry[] = [];

export function setOnRefreshFailure(fn: (() => void) | null): void {
  onRefreshFailure = fn;
}

function processQueue(error: unknown, token: string | null): void {
  for (const entry of failedQueue) {
    if (error !== null) entry.reject(error);
    else if (token !== null) entry.resolve(token);
  }
  failedQueue.length = 0;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

interface RetryConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken !== null) {
    config.headers['Authorization'] = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config as RetryConfig | undefined;

    // Skip retry for refresh endpoint itself and already-retried requests
    if (
      error.response?.status !== 401 ||
      config === undefined ||
      config._retry === true ||
      (config.url ?? '').includes('/auth/refresh')
    ) {
      if (error.response?.status === 401) setAccessToken(null);
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        config.headers['Authorization'] = `Bearer ${token}`;
        return apiClient(config);
      });
    }

    config._retry = true;
    isRefreshing = true;

    try {
      const res = await axios.post<{ success: true; data: { accessToken: string } }>(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = res.data.data.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);
      config.headers['Authorization'] = `Bearer ${newToken}`;
      return apiClient(config);
    } catch (refreshError) {
      processQueue(refreshError, null);
      setAccessToken(null);
      onRefreshFailure?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default apiClient;
