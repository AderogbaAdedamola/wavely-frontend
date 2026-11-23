import { apiRequest } from "@/lib/api/client";
import type {
  AdminOverview,
  AdminScheduleStatus,
  AdminSchedulesResponse,
  AdminUsersResponse,
} from "@/lib/types";

const ADMIN_PAGE_SIZE = 25;

export function getAdminOverview() {
  return apiRequest<AdminOverview>("/api/admin/overview");
}

export function getAdminUsers(offset: number) {
  const params = new URLSearchParams({
    limit: String(ADMIN_PAGE_SIZE),
    offset: String(offset),
  });
  return apiRequest<AdminUsersResponse>(`/api/admin/users?${params}`);
}

export function getAdminSchedules(
  offset: number,
  status?: AdminScheduleStatus,
) {
  const params = new URLSearchParams({
    limit: String(ADMIN_PAGE_SIZE),
    offset: String(offset),
  });
  if (status) params.set("status", status);
  return apiRequest<AdminSchedulesResponse>(`/api/admin/schedules?${params}`);
}

export { ADMIN_PAGE_SIZE };
