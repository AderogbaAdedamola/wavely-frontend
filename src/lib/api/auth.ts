import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, MeResponse } from "@/lib/types";

/** Create an account. Returns a token + user directly (201) — no follow-up login. */
export function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password, confirmPassword },
    auth: false,
  });
}

/** Log in with a name or email (`identifier`) + password. */
export function login(identifier: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { identifier, password },
    auth: false,
  });
}

/** Request a reset link. Always resolves the same way whether or not the email
 *  is registered (the backend prevents account enumeration). */
export function forgotPassword(email: string) {
  return apiRequest<{ message: string }>("/api/auth/forgot-password", {
    method: "POST",
    body: { email },
    auth: false,
  });
}

/** Set a new password using the single-use token from the reset email. */
export function resetPassword(
  token: string,
  password: string,
  confirmPassword: string,
) {
  return apiRequest<{ success: boolean }>("/api/auth/reset-password", {
    method: "POST",
    body: { token, password, confirmPassword },
    auth: false,
  });
}

/** The current session's user. `suppressAuthRedirect` is used at bootstrap so a
 *  stale token doesn't bounce a visitor off a public page. */
export function me(opts?: { suppressAuthRedirect?: boolean }) {
  return apiRequest<MeResponse>("/api/auth/me", {
    suppressAuthRedirect: opts?.suppressAuthRedirect,
  });
}
