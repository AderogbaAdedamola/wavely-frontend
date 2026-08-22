"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as api from "@/lib/api/broadcast";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";

/* ----------------------------- lists ----------------------------- */

export function useBroadcasts() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["broadcasts"],
    queryFn: () => api.listLists().then((r) => r.lists),
    enabled: !!token,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => api.createList(name),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcasts"] });
      toast.success("List created");
    },
    onError: (err) =>
      toast.error("Couldn't create the list", {
        description: (err as Error).message,
      }),
  });
}

/* --------------------------- members ----------------------------- */

export function useMembers(listId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["broadcast", listId, "members"],
    queryFn: () => api.getMembers(listId).then((r) => r.members),
    enabled: !!token && Number.isFinite(listId),
  });
}

/** Tag/member imports resolve against WhatsApp, so 503 means "connect first". */
function toastError(err: unknown, title: string) {
  const description =
    err instanceof ApiError && err.isConnectionRequired
      ? "Connect a WhatsApp line first."
      : (err as Error).message;
  toast.error(title, { description });
}

function useMembersMutation<TVars>(
  listId: number,
  fn: (vars: TVars) => Promise<unknown>,
  errorTitle: string,
  onDone?: (result: unknown) => void,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (result) => {
      qc.invalidateQueries({ queryKey: ["broadcast", listId, "members"] });
      onDone?.(result);
    },
    onError: (err) => toastError(err, errorTitle),
  });
}

export function useAddMember(listId: number) {
  return useMembersMutation<string>(
    listId,
    (jid) => api.addMember(listId, jid),
    "Couldn't add the member",
    () => toast.success("Member added"),
  );
}

export function useRemoveMember(listId: number) {
  return useMembersMutation<string>(
    listId,
    (jid) => api.removeMember(listId, jid),
    "Couldn't remove the member",
    () => toast.success("Member removed"),
  );
}

export function useAddByTag(listId: number) {
  return useMembersMutation<string>(
    listId,
    (tag) => api.addByTag(listId, tag),
    "Couldn't add by tag",
    (r) => {
      const count = (r as { count?: number })?.count ?? 0;
      toast.success(`Added ${count} ${count === 1 ? "contact" : "contacts"}`);
    },
  );
}

export function useAddByMember(listId: number) {
  return useMembersMutation<string>(
    listId,
    (phone) => api.addByMember(listId, phone),
    "Couldn't add by group member",
    (r) => {
      const count = (r as { count?: number })?.count ?? 0;
      toast.success(`Added ${count} ${count === 1 ? "contact" : "contacts"}`);
    },
  );
}

/* --------------------------- content ----------------------------- */

export function useContent(listId: number) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["broadcast", listId, "content"],
    queryFn: () => api.getContent(listId).then((r) => r.content),
    enabled: !!token && Number.isFinite(listId),
  });
}

export function useSetContent(listId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contentText: string) => api.setContent(listId, contentText),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["broadcast", listId, "content"] });
      toast.success("Message saved");
    },
    onError: (err) =>
      toast.error("Couldn't save the message", {
        description: (err as Error).message,
      }),
  });
}
