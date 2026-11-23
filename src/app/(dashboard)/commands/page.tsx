"use client";

import { useState } from "react";
import { Loader2Icon, SquareSlashIcon, XIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { GlobalConfigNote } from "@/components/common/global-config-note";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCommands, useUpdateCommand } from "@/hooks/use-commands";
import { formatJid } from "@/lib/utils";
import type { CommandPermission } from "@/lib/types";

const cmdLabel = (name: string) => `/${name.replace(/^\//, "")}`;

export default function CommandsPage() {
  const { data, isLoading, isError, error, refetch } = useCommands();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control"
        title="Commands"
        description="Choose who can run each command and whether automated replies can use it."
      />

      <GlobalConfigNote />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={SquareSlashIcon}
          title="No commands"
          description="The bot hasn't registered any commands yet."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
            <TableHeader>
              <TableRow>
                <TableHead>Command</TableHead>
                <TableHead className="text-center">Replies</TableHead>
                <TableHead className="text-center">Public</TableHead>
                <TableHead className="text-right">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((cmd) => (
                <CommandRow key={cmd.command_name} cmd={cmd} />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CommandRow({ cmd }: { cmd: CommandPermission }) {
  const update = useUpdateCommand();

  const patch = (partial: Partial<CommandPermission>) =>
    update.mutate({
      name: cmd.command_name,
      input: {
        allow_ai: cmd.allow_ai,
        allow_public: cmd.allow_public,
        allow_specific: cmd.allow_specific,
        ...partial,
      },
    });

  return (
    <TableRow>
      <TableCell className="max-w-xs whitespace-normal">
        <p className="font-mono text-sm">{cmdLabel(cmd.command_name)}</p>
        {cmd.description && (
          <p className="text-xs text-muted-foreground">{cmd.description}</p>
        )}
      </TableCell>
      <TableCell className="text-center">
        <Switch
          size="sm"
          checked={cmd.allow_ai}
          onCheckedChange={(v) => patch({ allow_ai: v })}
          disabled={update.isPending}
          aria-label={`Let automated replies run ${cmdLabel(cmd.command_name)}`}
        />
      </TableCell>
      <TableCell className="text-center">
        <Switch
          size="sm"
          checked={cmd.allow_public}
          onCheckedChange={(v) => patch({ allow_public: v })}
          disabled={update.isPending}
          aria-label={`Let everyone run ${cmdLabel(cmd.command_name)}`}
        />
      </TableCell>
      <TableCell className="text-right">
        <AccessDialog cmd={cmd} />
      </TableCell>
    </TableRow>
  );
}

/** Edits the allow-list of specific people who may run a command. */
function AccessDialog({ cmd }: { cmd: CommandPermission }) {
  const update = useUpdateCommand();
  const [open, setOpen] = useState(false);
  const [list, setList] = useState<string[]>(cmd.allow_specific);
  const [entry, setEntry] = useState("");

  // Resync the editable copy from the server each time the dialog opens, so
  // in-progress edits are never clobbered by a background refetch mid-edit.
  function handleOpenChange(next: boolean) {
    if (next) setList(cmd.allow_specific);
    setOpen(next);
  }

  function add() {
    const v = entry.trim();
    if (!v) return;
    if (!list.includes(v)) setList((l) => [...l, v]);
    setEntry("");
  }

  function save() {
    update.mutate(
      {
        name: cmd.command_name,
        input: {
          allow_ai: cmd.allow_ai,
          allow_public: cmd.allow_public,
          allow_specific: list,
        },
      },
      { onSuccess: () => setOpen(false) },
    );
  }

  const count = cmd.allow_specific.length;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {count > 0 ? `${count} allowed` : "Restrict"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{cmdLabel(cmd.command_name)} access</DialogTitle>
          <DialogDescription>
            {cmd.usage ||
              "Allow specific people to run this command, even when public access is off."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="2348012345678"
              inputMode="tel"
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={add}>
              Add
            </Button>
          </div>

          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {cmd.allow_public
                ? "No restrictions — everyone can run this."
                : "No specific users — only the owner can run this."}
            </p>
          ) : (
            <ul className="flex flex-wrap gap-1.5">
              {list.map((jid) => (
                <li key={jid}>
                  <span className="inline-flex items-center gap-1 rounded-full bg-muted py-0.5 pr-1 pl-2 text-xs">
                    <span className="font-mono">{formatJid(jid)}</span>
                    <button
                      type="button"
                      onClick={() => setList((l) => l.filter((x) => x !== jid))}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${jid}`}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          {cmd.deny_specific.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Denied: {cmd.deny_specific.map(formatJid).join(", ")}
            </p>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={save} disabled={update.isPending}>
            {update.isPending && <Loader2Icon className="animate-spin" />}
            Save access
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
