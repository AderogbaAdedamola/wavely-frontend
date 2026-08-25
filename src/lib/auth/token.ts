// localStorage key for the JWT. Env-driven (NEXT_PUBLIC_ so it's readable in the
// browser) with a stable fallback, so a missing env var can't wipe the key and
// silently sign everyone out.
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || "wavely_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
}

export interface JwtPayload {
  id?: number;
  email?: string;
  name?: string;
  exp?: number;
  iat?: number;
}

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}


export function isExpired(token: string): boolean {
  const p = decodeJwt(token);
  if (!p?.exp) return false;
  return p.exp * 1000 <= Date.now();
}
