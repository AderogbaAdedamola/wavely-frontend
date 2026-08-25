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
import { clearToken, getToken, isExpired, setToken } from "@/lib/auth/token";
import type { AuthUser } from "@/lib/types";

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  /** Convenience accessors derived from `user`. */
  name: string | null;
  email: string | null;
  userId: number | null;
  /** True once we've checked storage — guards against redirect flashes. */
  ready: boolean;
  isAuthenticated: boolean;
  /** `identifier` is the account's name or email. */
  login: (identifier: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  // Apply a successful auth response: persist the token, load the user into
  // state, and seed the settings cache so the telemetry bar shows bot state
  // immediately (no extra round-trip before the first paint).
  const applyAuth = useCallback(
    (nextToken: string, nextUser: AuthUser) => {
      setToken(nextToken);
      setTokenState(nextToken);
      setUser(nextUser);
      queryClient.setQueryData(["settings"], {
        is_bot_active: nextUser.is_bot_active,
      });
    },
    [queryClient],
  );

  const reset = useCallback(() => {
    setTokenState(null);
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // Hydrate from localStorage once on mount. localStorage is client-only, so
  // this can't be a lazy initializer (it would read empty during SSR prerender).
  // With a valid-looking token we confirm the session against /me (which also
  // fetches the fresh user); `suppressAuthRedirect` keeps a stale token on a
  // public page like /welcome from bouncing the visitor to /login.
  useEffect(() => {
    const stored = getToken();
    if (!stored || isExpired(stored)) {
      if (stored) clearToken();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReady(true);
      return;
    }
    let cancelled = false;
    authApi
      .me({ suppressAuthRedirect: true })
      .then((res) => {
        if (!cancelled) applyAuth(stored, res.user);
      })
      .catch(() => {
        if (!cancelled) {
          clearToken();
          reset();
        }
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [applyAuth, reset]);

  // Any 401/403 from the API client resets the session and bounces to login.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      reset();
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [reset, router]);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const res = await authApi.login(identifier, password);
      applyAuth(res.token, res.user);
      router.replace("/");
    },
    [applyAuth, router],
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      confirmPassword: string,
    ) => {
      // Registration returns a token directly (201), so we're signed in at once.
      const res = await authApi.register(name, email, password, confirmPassword);
      applyAuth(res.token, res.user);
      router.replace("/");
    },
    [applyAuth, router],
  );

  const logout = useCallback(() => {
    clearToken();
    reset();
    router.replace("/login");
  }, [reset, router]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      name: user?.name ?? null,
      email: user?.email ?? null,
      userId: user?.id ?? null,
      ready,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [token, user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
