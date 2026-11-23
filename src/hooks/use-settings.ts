"use client";

import { useSyncExternalStore } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAiSettings,
  getSettings,
  setAiSettings,
  setLocale,
  setTimeZone,
  toggleBot,
} from "@/lib/api/settings";
import { useAuth } from "@/components/providers/auth-provider";
import type { AiSettings, SettingsState } from "@/lib/types";

const subscribeToTimeZone = () => () => {};
const getServerTimeZone = () => "UTC";
const getClientTimeZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export function useBrowserTimeZone() {
  return useSyncExternalStore(
    subscribeToTimeZone,
    getClientTimeZone,
    getServerTimeZone,
  );
}

export function useSettings() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
    enabled: !!token,
  });
}

export function useToggleBot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) => toggleBot(isActive),
    // Optimistic: the arm/disarm switch should feel instant.
    onMutate: async (isActive) => {
      await qc.cancelQueries({ queryKey: ["settings"] });
      const prev = qc.getQueryData<SettingsState>(["settings"]);
      if (prev) {
        qc.setQueryData<SettingsState>(["settings"], {
          ...prev,
          is_bot_active: isActive,
        });
      }
      return { prev };
    },
    onError: (err, _isActive, ctx) => {
      if (ctx?.prev) qc.setQueryData(["settings"], ctx.prev);
      toast.error("Couldn't update the bot", {
        description: (err as Error).message,
      });
    },
    onSuccess: (data) => {
      qc.setQueryData<SettingsState>(["settings"], (previous) =>
        previous
          ? { ...previous, is_bot_active: data.is_bot_active }
          : previous,
      );
      toast.success(data.is_bot_active ? "Bot armed" : "Bot on standby");
    },
  });
}

export function useSaveLocaleSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      countryCode,
      timeZone,
      saveCountry,
    }: {
      countryCode: string;
      timeZone: string;
      saveCountry: boolean;
    }) =>
      saveCountry && countryCode
        ? setLocale(countryCode, timeZone)
        : setTimeZone(timeZone),
    onSuccess: (result) => {
      qc.setQueryData<SettingsState>(["settings"], (previous) =>
        previous
          ? {
              ...previous,
              ...(result.countryCode
                ? { countryCode: result.countryCode }
                : {}),
              timeZone: result.timeZone,
            }
          : previous,
      );
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Location settings saved");
    },
    onError: (err) =>
      toast.error("Couldn't save location settings", {
        description: (err as Error).message,
      }),
  });
}

export function useAiSettings() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["settings", "ai"],
    queryFn: getAiSettings,
    enabled: !!token,
  });
}

export function useSaveAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AiSettings>) => setAiSettings(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings", "ai"] });
      toast.success("Reply style saved");
    },
    onError: (err) => {
      toast.error("Couldn't save reply settings", {
        description: (err as Error).message,
      });
    },
  });
}
