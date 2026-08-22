import { apiRequest } from "@/lib/api/client";
import type { CommandPermission } from "@/lib/types";

export function listCommands() {
  return apiRequest<{ permissions: CommandPermission[] }>("/api/commands");
}

export function updateCommand(
  name: string,
  input: {
    allow_ai: boolean;
    allow_public: boolean;
    allow_specific: string[];
  },
) {
  // `:name` may be with or without a leading slash.
  const clean = name.replace(/^\//, "");
  return apiRequest<{ success: boolean }>(`/api/commands/${encodeURIComponent(clean)}`, {
    method: "PUT",
    body: input,
  });
}
