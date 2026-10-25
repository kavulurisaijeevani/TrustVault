import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiRequestError } from '@/api/client';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'trustvault_token';
const USER_KEY = 'trustvault_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ user: null, token: null, loading: true });

  useEffect(() => {
    // Restore session from sessionStorage (dev-friendly; production should use httpOnly cookies).
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      const userRaw = sessionStorage.getItem(USER_KEY);
      const user = userRaw ? (JSON.parse(userRaw) as User) : null;
      setState({ user, token, loading: false });
    } catch {
      setState({ user: null, token: null, loading: false });
    }
  }, []);

  const persist = (token: string, user: User) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    setState({ user, token, loading: false });
  };

  const login = useCallback(async (email: string, password: string) => {
    const res = (await api.login({ email, password })) as {
      accessToken: string;
      tokenType: string;
      expiresAt: string;
      user: User;
    };
    persist(res.accessToken, res.user);
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    const res = (await api.register({ email, password, displayName })) as {
      accessToken: string;
      tokenType: string;
      expiresAt: string;
      user: User;
    };
    persist(res.accessToken, res.user);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setState({ user: null, token: null, loading: false });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      logout,
      isAuthenticated: Boolean(state.token && state.user),
    }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { ApiRequestError };
