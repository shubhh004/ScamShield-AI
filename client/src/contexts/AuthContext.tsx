/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useCallback, type ReactNode } from 'react';
import { setAccessToken } from '@/lib/api/apiClient';
import type { User, AuthState } from '@/types/auth';

export interface AuthContextValue extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);

  const login = useCallback((u: User, token: string) => {
    setUser(u);
    setToken(token);
    setAccessToken(token);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthenticated: user !== null, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

