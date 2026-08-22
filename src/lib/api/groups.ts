import { apiRequest } from "@/lib/api/client";
import type { Group } from "@/lib/types";

/** Requires an active WhatsApp connection (else the server returns 503). */
export function getGroups() {
  return apiRequest<{ success: boolean; groups: Group[] }>("/api/groups");
}
