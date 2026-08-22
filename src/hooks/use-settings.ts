"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getAiSettings,
  getSettings,
  setAiSettings,
  toggleBot,
} from "@/lib/api/settings";
import { useAuth } from "@/components/providers/auth-provider";
import type { AiSettings, SettingsState } from "@/lib/types";

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
      qc.setQueryData<SettingsState>(["settings"], { is_bot_active: isActive });
      return { prev };
    },
    onError: (err, _isActive, ctx) => {
      if (ctx?.prev) qc.setQueryData(["settings"], ctx.prev);
      toast.error("Couldn't update the bot", {
        description: (err as Error).message,
      });
    },
    onSuccess: (data) => {
      qc.setQueryData<SettingsState>(["settings"], {
        is_bot_active: data.is_bot_active,
      });
      toast.success(data.is_bot_active ? "Bot armed" : "Bot on standby");
    },
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
      toast.success("AI persona saved");
    },
    onError: (err) => {
      toast.error("Couldn't save AI settings", {
        description: (err as Error).message,
      });
    },
  });
}
