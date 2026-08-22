"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { listCommands, updateCommand } from "@/lib/api/commands";
import { useAuth } from "@/components/providers/auth-provider";
import type { CommandPermission } from "@/lib/types";

export function useCommands() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ["commands"],
    queryFn: () => listCommands().then((r) => r.permissions),
    enabled: !!token,
  });
}

interface UpdateVars {
  name: string;
  input: {
    allow_ai: boolean;
    allow_public: boolean;
    allow_specific: string[];
  };
}

export function useUpdateCommand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, input }: UpdateVars) => updateCommand(name, input),
    // Optimistic: inline access switches should flip instantly.
    onMutate: async ({ name, input }) => {
      await qc.cancelQueries({ queryKey: ["commands"] });
      const prev = qc.getQueryData<CommandPermission[]>(["commands"]);
      if (prev) {
        qc.setQueryData<CommandPermission[]>(
          ["commands"],
          prev.map((c) =>
            c.command_name === name ? { ...c, ...input } : c,
          ),
        );
      }
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["commands"], ctx.prev);
      toast.error("Couldn't update the command", {
        description: (err as Error).message,
      });
    },
    onSuccess: () => toast.success("Command updated"),
    onSettled: () => qc.invalidateQueries({ queryKey: ["commands"] }),
  });
}
