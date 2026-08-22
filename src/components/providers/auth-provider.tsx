"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { setUnauthorizedHandler } from "@/lib/api/client";
import * as authApi from "@/lib/api/auth";
import {
  clearToken,
  decodeJwt,
  getToken,
  isExpired,
  setToken,
} from "@/lib/auth/token";

interface AuthContextValue {
  token: string | null;
  username: string | null;
  userId: number | null;
  /** True once we've checked storage — guards against redirect flashes. */
  ready: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  const applyToken = useCallback((value: string, fallbackUsername?: string) => {
    const payload = decodeJwt(value);
    setTokenState(value);
    setUsername(payload?.username ?? fallbackUsername ?? null);
    setUserId(payload?.id ?? payload?.userId ?? null);
  }, []);

  const reset = useCallback(() => {
    setTokenState(null);
    setUsername(null);
    setUserId(null);
    queryClient.clear();
  }, [queryClient]);

  // Hydrate from localStorage once on mount. localStorage is client-only, so
  // this can't be a lazy initializer (it would read empty during SSR prerender);
  // a one-time mount effect is the correct place to sync it into React state.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const stored = getToken();
    if (stored && !isExpired(stored)) {
      applyToken(stored);
    } else if (stored) {
      clearToken();
    }
    setReady(true);
  }, [applyToken]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Any 401/403 from the API client resets the session and bounces to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      reset();
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [reset, router]);

  const login = useCallback(
    async (u: string, p: string) => {
      const res = await authApi.login(u, p);
      setToken(res.token);
      applyToken(res.token, u);
      // Seed the settings cache so the telemetry bar shows bot state immediately.
      queryClient.setQueryData(["settings"], { is_bot_active: res.is_bot_active });
      router.replace("/");
    },
    [applyToken, queryClient, router],
  );

  const register = useCallback(
    async (u: string, p: string) => {
      await authApi.register(u, p);
      await login(u, p);
    },
    [login],
  );

  const logout = useCallback(() => {
    clearToken();
    reset();
    router.replace("/login");
  }, [reset, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      username,
      userId,
      ready,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [token, username, userId, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
