import { apiRequest } from "@/lib/api/client";
import type { LoginResponse, RegisterResponse } from "@/lib/types";

export function register(username: string, password: string) {
  return apiRequest<RegisterResponse>("/api/auth/register", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}

export function login(username: string, password: string) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false,
  });
}
