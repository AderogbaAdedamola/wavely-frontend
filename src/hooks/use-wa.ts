"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  connect,
  getQr,
  getStatus,
  logout,
  pair,
  resetHard,
} from "@/lib/api/wa";
import { useAuth } from "@/components/providers/auth-provider";
import type { WaStatusResponse } from "@/lib/types";

/**
 * WhatsApp connection status. Socket.io pushes updates into this same cache key;
 * the poll here is a fallback (fast while linking, relaxed once connected).
 */
export function useWaStatus() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["wa", "status"],
    queryFn: getStatus,
    enabled: !!token,
    refetchInterval: (query) =>
      query.state.data?.status === "connected" ? 20_000 : 5_000,
  });
}

/**
 * The current QR string. Primarily delivered over the socket; this polls as a
 * fallback only while a scan is actually expected.
 */
export function useQr(enabled: boolean) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["wa", "qr"],
    queryFn: getQr,
    enabled: !!token && enabled,
    refetchInterval: enabled ? 15_000 : false,
    retry: false,
  });
}

/** Begin a session so the server emits a QR (delivered over the socket). */
export function useConnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: connect,
    onMutate: () => qc.setQueryData(["wa", "qr"], null),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["wa", "status"] }),
    onError: (err) =>
      toast.error("Couldn't start linking", {
        description: (err as Error).message,
      }),
  });
}

/** Request a pairing code for a phone number as an alternative to the QR. */
export function usePair() {
  return useMutation({
    mutationFn: (phoneNumber: string) => pair(phoneNumber),
    onError: (err) =>
      toast.error("Couldn't get a pairing code", {
        description: (err as Error).message,
      }),
  });
}

function resetWaCache(qc: ReturnType<typeof useQueryClient>) {
  qc.setQueryData<WaStatusResponse>(["wa", "status"], {
    status: "disconnected",
    hasQr: false,
  });
  qc.setQueryData(["wa", "qr"], null);
}

/** Unlink the current device (soft). */
export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      resetWaCache(qc);
      toast.success("Line unlinked");
    },
    onError: (err) =>
      toast.error("Couldn't unlink", { description: (err as Error).message }),
  });
}

/** Wipe stored credentials entirely — the escape hatch when linking is stuck. */
export function useResetHard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: resetHard,
    onSuccess: () => {
      resetWaCache(qc);
      toast.success("Session reset");
    },
    onError: (err) =>
      toast.error("Couldn't reset the session", {
        description: (err as Error).message,
      }),
  });
}
