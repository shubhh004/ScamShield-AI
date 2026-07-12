/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { setAccessToken } from '@/lib/api/apiClient';
import * as authService from '@/services/auth.service';
import type { User, AuthState } from '@/types/auth';

export interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initAuth(): Promise<void> {
      try {
        const token = await authService.refreshToken();
        setAccessToken(token);
        setToken(token);
        const profile = await authService.getMe();
        setUser(profile);
      } catch {
        // No valid session — user stays unauthenticated
      } finally {
        setIsLoading(false);
      }
    }
    void initAuth();
  }, []);

  const login = useCallback((u: User, token: string) => {
    setUser(u);
    setToken(token);
    setAccessToken(token);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // best-effort
    }
    setUser(null);
    setToken(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthenticated: user !== null, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

