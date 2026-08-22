import { apiRequest } from "@/lib/api/client";
import type { BroadcastContent, BroadcastList } from "@/lib/types";

export function listLists() {
  return apiRequest<{ lists: BroadcastList[] }>("/api/broadcast");
}

export function createList(name: string) {
  return apiRequest<{ success: boolean; listId: number }>("/api/broadcast", {
    method: "POST",
    body: { name },
  });
}

export function getMembers(listId: number) {
  return apiRequest<{ members: string[] }>(`/api/broadcast/${listId}/members`);
}

export function addMember(listId: number, jid: string) {
  return apiRequest<{ success: boolean }>(`/api/broadcast/${listId}/members`, {
    method: "POST",
    body: { jid },
  });
}

export function removeMember(listId: number, jid: string) {
  return apiRequest<{ success: boolean }>(
    `/api/broadcast/${listId}/members/${encodeURIComponent(jid)}`,
    { method: "DELETE" },
  );
}

export function addByTag(listId: number, tag: string) {
  return apiRequest<{ success: boolean; count: number }>(
    `/api/broadcast/${listId}/add-by-tag`,
    { method: "POST", body: { tag } },
  );
}

export function addByMember(listId: number, phone: string) {
  return apiRequest<{ success: boolean; count: number }>(
    `/api/broadcast/${listId}/add-by-member`,
    { method: "POST", body: { phone } },
  );
}

export function removeByTag(listId: number, tag: string) {
  return apiRequest<{ success: boolean; count: number }>(
    `/api/broadcast/${listId}/remove-by-tag`,
    { method: "POST", body: { tag } },
  );
}

export function removeByMember(listId: number, phone: string) {
  return apiRequest<{ success: boolean; count: number }>(
    `/api/broadcast/${listId}/remove-by-member`,
    { method: "POST", body: { phone } },
  );
}

export function setContent(listId: number, contentText: string) {
  return apiRequest<{ success: boolean }>(`/api/broadcast/${listId}/content`, {
    method: "POST",
    body: { contentText },
  });
}

export function getContent(listId: number) {
  return apiRequest<{ content: BroadcastContent | null }>(
    `/api/broadcast/${listId}/content`,
  );
}
