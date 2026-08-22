import { API_BASE_URL } from "@/lib/config";
import { clearToken, getToken } from "@/lib/auth/token";

/** Error carrying the HTTP status so callers can special-case 401/403/503. */
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  /** 503 = WhatsApp not connected for this account. */
  get isConnectionRequired(): boolean {
    return this.status === 503;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
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
  signal?: AbortSignal;
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return (data?.error as string) || (data?.message as string) || "";
  } catch {
    return "";
  }
}

export async function apiRequest<T>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, signal } = opts;

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

  if (res.status === 401 || res.status === 403) {
    const message = (await readError(res)) || "Session expired. Please sign in again.";
    if (auth) {
      clearToken();
      unauthorizedHandler?.();
    }
    throw new ApiError(res.status, message);
  }

  if (!res.ok) {
    const message = (await readError(res)) || `Request failed (${res.status}).`;
    throw new ApiError(res.status, message);
  }

  if (res.status === 204) return undefined as T;
  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
