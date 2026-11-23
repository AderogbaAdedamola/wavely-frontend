"use client";

import { useQuery } from "@tanstack/react-query";

import * as api from "@/lib/api/admin";
import type { AdminScheduleStatus } from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";

export function useAdminOverview() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["admin", "overview"],
    queryFn: api.getAdminOverview,
    enabled: !!token,
    refetchInterval: 30_000,
  });
}

export function useAdminUsers(offset: number, enabled: boolean) {
  return useQuery({
    queryKey: ["admin", "users", offset],
    queryFn: () => api.getAdminUsers(offset),
    enabled,
  });
}

export function useAdminSchedules(
  offset: number,
  status: AdminScheduleStatus | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["admin", "schedules", status ?? "all", offset],
    queryFn: () => api.getAdminSchedules(offset, status),
    enabled,
  });
}
