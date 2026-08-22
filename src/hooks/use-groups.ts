"use client";

import { useQuery } from "@tanstack/react-query";

import { getGroups } from "@/lib/api/groups";
import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/components/providers/auth-provider";

/**
 * Groups the linked line belongs to. Needs a live WhatsApp connection, so the
 * server answers 503 when none is linked — we don't retry that (it isn't
 * transient), letting the page show a "connect first" prompt instead.
 */
export function useGroups() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["groups"],
    queryFn: () => getGroups().then((r) => r.groups),
    enabled: !!token,
    staleTime: 30_000,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.isConnectionRequired) return false;
      return failureCount < 2;
    },
  });
}
