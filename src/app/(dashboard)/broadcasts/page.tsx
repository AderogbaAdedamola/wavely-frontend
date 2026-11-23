"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRightIcon,
  Loader2Icon,
  MegaphoneIcon,
  PlusIcon,
  Trash2Icon,
  UsersRoundIcon,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBroadcasts,
  useCreateList,
  useCreateListWithMembers,
  useDeleteList,
  useSelectableMembers,
} from "@/hooks/use-broadcasts";
import { formatDateTime } from "@/lib/utils";

export default function BroadcastsPage() {
  const { data, isLoading, isError, error, refetch } = useBroadcasts();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch"
        title="Broadcasts"
        description="Reusable send lists. Build the audience, write the message, then schedule it."
        actions={<NewListButton />}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={MegaphoneIcon}
          title="No lists yet"
          description="Create a broadcast list to group the people you send to."
          action={<NewListButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.map((list) => (
            <Card
              key={list.id}
              size="sm"
              className="group transition hover:ring-foreground/20"
            >
              <CardContent className="flex items-center gap-2">
                <Link
                  href={`/broadcasts/${list.id}`}
                  className="group/link flex min-w-0 flex-1 items-center justify-between gap-3 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-medium">
                      {list.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDateTime(list.created_at)}
                    </p>
                  </div>
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition group-hover/link:translate-x-0.5 group-hover/link:text-foreground" />
                </Link>
                <DeleteListButton id={list.id} name={list.name} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function DeleteListButton({ id, name }: { id: number; name: string }) {
  const remove = useDeleteList();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${name}`}
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes the list, its members, and its message.
            Lists with a pending or sending schedule can&apos;t be deleted until
            that schedule is cancelled.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep list</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={remove.isPending}
            onClick={() => remove.mutate(id)}
          >
            {remove.isPending && <Loader2Icon className="animate-spin" />}
            Delete list
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function NewListButton() {
  const router = useRouter();
  const create = useCreateList();
  const createWithMembers = useCreateListWithMembers();
  const selectable = useSelectableMembers();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const pending = create.isPending || createWithMembers.isPending;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    const onSuccess = (res: { listId: number }) => {
      setOpen(false);
      setName("");
      setSelected([]);
      router.push(`/broadcasts/${res.listId}`);
    };
    if (selected.length > 0) {
      createWithMembers.mutate(
        { name: trimmed, members: selected },
        { onSuccess },
      );
    } else {
      create.mutate(trimmed, { onSuccess });
    }
  }

  function toggleMember(jid: string) {
    setSelected((current) =>
      current.includes(jid)
        ? current.filter((item) => item !== jid)
        : [...current, jid],
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          New list
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>New broadcast list</DialogTitle>
            <DialogDescription>
              Name it something you&apos;ll recognize — like &ldquo;VIP
              customers&rdquo; or &ldquo;Lagos team&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-1.5">
            <Label htmlFor="listName">List name</Label>
            <Input
              id="listName"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VIP customers"
            />
          </div>
          {selectable.isError ? (
            <p className="mb-4 text-xs text-destructive">
              WhatsApp members couldn&apos;t be loaded. Connect your line and try again.
            </p>
          ) : selectable.data ? (
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <UsersRoundIcon className="size-3.5" />
                Add WhatsApp members now
                {selected.length > 0 && (
                  <span className="ml-auto text-muted-foreground">
                    {selected.length} selected
                  </span>
                )}
              </div>
              <div className="max-h-48 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                {[...selectable.data.contacts, ...selectable.data.groups].map(
                  (member) => (
                    <label
                      key={member.jid}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(member.jid)}
                        onChange={() => toggleMember(member.jid)}
                        className="size-4 accent-primary"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {member.name || member.jid}
                      </span>
                    </label>
                  ),
                )}
              </div>
            </div>
          ) : selectable.isLoading ? (
            <Skeleton className="mb-4 h-24 w-full" />
          ) : null}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || pending}>
              {pending && <Loader2Icon className="animate-spin" />}
              Create list
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
