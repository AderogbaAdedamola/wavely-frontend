import { apiRequest } from "@/lib/api/client";
import type { Schedule } from "@/lib/types";

export function listSchedules() {
  return apiRequest<{ schedules: Schedule[] }>("/api/schedules");
}

export function createSingle(input: {
  targetJid: string;
  messageContent: string;
  executeAt: string;
}) {
  return apiRequest<{ success: boolean }>("/api/schedules/single", {
    method: "POST",
    body: input,
  });
}

export function createBroadcast(input: {
  listId: number;
  messageContent: string;
  executeAt: string;
}) {
  return apiRequest<{ success: boolean }>("/api/schedules/broadcast", {
    method: "POST",
    body: input,
  });
}

export function deleteSchedule(id: number) {
  return apiRequest<{ success: boolean }>(`/api/schedules/${id}`, {
    method: "DELETE",
  });
}
