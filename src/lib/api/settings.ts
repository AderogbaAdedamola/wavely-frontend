import { apiRequest } from "@/lib/api/client";
import type { AiSettings, SettingsState } from "@/lib/types";

export function getSettings() {
  return apiRequest<SettingsState>("/api/settings");
}

export function toggleBot(isActive: boolean) {
  return apiRequest<{ success: boolean; is_bot_active: boolean }>(
    "/api/settings/toggle-bot",
    { method: "POST", body: { isActive } },
  );
}

export function getAiSettings() {
  return apiRequest<AiSettings>("/api/settings/ai");
}

export function setAiSettings(input: Partial<AiSettings>) {
  return apiRequest<{ success: boolean }>("/api/settings/ai", {
    method: "POST",
    body: input,
  });
}
