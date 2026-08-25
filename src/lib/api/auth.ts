import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  MeResponse,
  RegisterResponse,
  VerifyEmailResponse,
} from "@/lib/types";

/** Create an account (201). Returns the new user and a message — **no token**.
 *  A verification email is sent and the account starts unverified; the caller
 *  must sign in separately. */
export function register(
  name: string,
  email: string,
  password: string,
  confirmPassword: string,
) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: { name, email, password, confirmPassword },
    auth: false,
  });
}

/** Log in with email + password. Succeeds even when the email isn't verified —
 *  read `user.email_verified` to decide whether to show the verify prompt. */
export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

/** Verify an email with the single-use token from the verification link. On
 *  success the token the user already holds clears the EMAIL_NOT_VERIFIED gate. */
export function verifyEmail(token: string) {
  return apiRequest<VerifyEmailResponse>("/api/auth/verify-email", {
    method: "POST",
    body: { token },
    auth: false,
  });
}

/** Request a fresh verification email. Always resolves the same way whether or
 *  not the account exists / is already verified (no enumeration). */
export function resendVerification(email: string) {
  return apiRequest<{ message: string }>("/api/auth/resend-verification", {
    method: "POST",
    body: { email },
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

/** Set a new password using the single-use token from the reset email. On
 *  success every previously-issued token for the account is invalidated. */
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

/** The current session's user. Not verification-gated, so it works while the
 *  email is still unverified. `suppressAuthRedirect` is used at bootstrap so a
 *  stale token doesn't bounce a visitor off a public page. */
export function me(opts?: { suppressAuthRedirect?: boolean }) {
  return apiRequest<MeResponse>("/api/auth/me", {
    suppressAuthRedirect: opts?.suppressAuthRedirect,
  });
}
