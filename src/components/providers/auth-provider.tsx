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
  /** True when the signed-in user's email is verified. The backend gates every
   *  functional route on this, so the console does too. */
  isEmailVerified: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Create an account. Resolves to the backend's confirmation message and does
   *  NOT sign in — no token is issued; the user verifies their email then logs in. */
  register: (
    name: string,
    email: string,
    password: string,
    confirmPassword: string,
  ) => Promise<string>;
  /** Re-fetch the current user (e.g. after verifying email) so gates re-evaluate. */
  refreshUser: () => Promise<void>;
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

  // Re-fetch the current user (e.g. after the email is verified) and refresh the
  // derived state so the verification gate lifts without a full reload.
  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.user);
    queryClient.setQueryData(["settings"], {
      is_bot_active: res.user.is_bot_active,
    });
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
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
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
      // No token is returned — the account must verify its email and then sign
      // in. Hand the confirmation message back so the form can prompt for that.
      const res = await authApi.register(name, email, password, confirmPassword);
      return res.message;
    },
    [],
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
      isEmailVerified: !!user?.email_verified,
      login,
      register,
      refreshUser,
      logout,
    }),
    [token, user, ready, login, register, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
