"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as api from "@/lib/api/schedules";
import { useAuth } from "@/components/providers/auth-provider";

/** Every schedule (pending, completed, failed) for the operator. */
export function useSchedules() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["schedules"],
    queryFn: () => api.listSchedules().then((r) => r.schedules),
    enabled: !!token,
  });
}

export function useCreateSingle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createSingle,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Send scheduled");
    },
    onError: (err) =>
      toast.error("Couldn't schedule the send", {
        description: (err as Error).message,
      }),
  });
}

export function useCreateBroadcast() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createBroadcast,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Broadcast scheduled");
    },
    onError: (err) =>
      toast.error("Couldn't schedule the broadcast", {
        description: (err as Error).message,
      }),
  });
}

export function useDeleteSchedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteSchedule(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Schedule removed");
    },
    onError: (err) =>
      toast.error("Couldn't remove the schedule", {
        description: (err as Error).message,
      }),
  });
}
