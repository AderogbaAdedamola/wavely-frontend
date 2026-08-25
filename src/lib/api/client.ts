import { API_BASE_URL } from "@/lib/config";
import { clearToken, getToken } from "@/lib/auth/token";

/** Error carrying the HTTP status (and any machine-readable `code`) so callers
 *  can special-case 401 / 403 EMAIL_NOT_VERIFIED / 503. */
export class ApiError extends Error {
  status: number;
  /** Backend's machine-readable code, e.g. "EMAIL_NOT_VERIFIED" on the 403 gate. */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }

  /** 503 = WhatsApp not connected for this account. */
  get isConnectionRequired(): boolean {
    return this.status === 503;
  }

  /** 401 = missing/invalid/expired token → the session is over. A password reset
   *  also invalidates live tokens, so this can fire before the 24h expiry. */
  get isSessionExpired(): boolean {
    return this.status === 401;
  }

  /** 403 EMAIL_NOT_VERIFIED = the token is valid but the email isn't verified
   *  yet. Don't sign the user out — prompt them to verify instead. */
  get isEmailNotVerified(): boolean {
    return this.status === 403 && this.code === "EMAIL_NOT_VERIFIED";
  }
}

// The AuthProvider registers a handler so a 401/403 anywhere resets the session.
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: (() => void) | null): void {
  unauthorizedHandler = fn;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  /** Attach the bearer token (default true). */
  auth?: boolean;
  /** On 401/403 still clear the token, but don't fire the global session-reset
   *  handler (which redirects to /login). Used by the bootstrap /me probe so a
   *  stale token on a public page doesn't bounce the visitor. */
  suppressAuthRedirect?: boolean;
  signal?: AbortSignal;
}

async function readError(
  res: Response,
): Promise<{ message: string; code?: string }> {
  try {
    const data = await res.json();
    return {
      message: (data?.error as string) || (data?.message as string) || "",
      code: (data?.code as string) || undefined,
    };
  } catch {
    return { message: "" };
  }
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, suppressAuthRedirect, signal } = opts;

  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      signal,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the Wavely server. Is it running?");
  }

  if (res.status === 401) {
    // Session is over (no/invalid/expired token, or one killed by a password
    // reset): drop the token and let the global handler bounce to login.
    const { message } = await readError(res);
    if (auth) {
      clearToken();
      if (!suppressAuthRedirect) unauthorizedHandler?.();
    }
    throw new ApiError(401, message || "Session expired. Please sign in again.");
  }

  if (res.status === 403) {
    // Token is still valid — the account just can't do this yet (most often
    // EMAIL_NOT_VERIFIED). Never clear the token or redirect on a 403.
    const { message, code } = await readError(res);
    throw new ApiError(403, message || "You don't have access to that.", code);
  }

  if (!res.ok) {
    const { message } = await readError(res);
    throw new ApiError(res.status, message || `Request failed (${res.status}).`);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
