import { apiRequest } from "@/lib/api/client";
import type { QrResponse, WaStatusResponse } from "@/lib/types";

export function getStatus() {
  return apiRequest<WaStatusResponse>("/api/wa/status");
}

export function getQr() {
  return apiRequest<QrResponse>("/api/wa/qr");
}

export function connect() {
  return apiRequest<{ success: boolean; message: string }>("/api/wa/connect", {
    method: "POST",
  });
}

export function pair(phoneNumber: string) {
  return apiRequest<{ success: boolean; code: string }>("/api/wa/pair", {
    method: "POST",
    body: { phoneNumber },
  });
}

export function logout() {
  return apiRequest<{ success: boolean }>("/api/wa/logout", { method: "POST" });
}

export function resetHard() {
  return apiRequest<{ success: boolean; message: string }>("/api/wa/reset-hard", {
    method: "POST",
  });
}
