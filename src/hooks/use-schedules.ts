"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import * as api from "@/lib/api/schedules";
import { ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

/** Every schedule (pending, completed, failed) for the operator. */
export function useSchedules() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["schedules"],
    queryFn: () => api.listSchedules().then((r) => r.schedules),
    enabled: !!token,
    refetchInterval: (query) =>
      query.state.data?.some(
        (schedule) =>
          schedule.status === "pending" || schedule.status === "processing",
      )
        ? 10_000
        : false,
  });
}

export function useCreateSingle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      timeZone: _timeZone,
      ...input
    }: Parameters<typeof api.createSingle>[0] & { timeZone: string }) =>
      api.createSingle(input),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success(
        result.executeAt
          ? `Send scheduled for ${formatDateTime(
              result.executeAt,
              variables.timeZone,
            )} (${variables.timeZone})`
          : "Send scheduled",
      );
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
    mutationFn: ({
      timeZone: _timeZone,
      ...input
    }: Parameters<typeof api.createBroadcast>[0] & { timeZone: string }) =>
      api.createBroadcast(input),
    onSuccess: (result, variables) => {
      qc.invalidateQueries({ queryKey: ["schedules"] });
      toast.success(
        result.executeAt
          ? `Broadcast scheduled for ${formatDateTime(
              result.executeAt,
              variables.timeZone,
            )} (${variables.timeZone})`
          : "Broadcast scheduled",
      );
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
    onError: (err) => {
      if (err instanceof ApiError && err.status === 409) {
        qc.invalidateQueries({ queryKey: ["schedules"] });
        toast.error("This schedule has already started", {
          description:
            "The schedule was refreshed. Only pending schedules can be cancelled.",
        });
        return;
      }
      toast.error("Couldn't remove the schedule", {
        description: (err as Error).message,
      });
    },
  });
}
