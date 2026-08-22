"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, Loader2Icon, MegaphoneIcon, PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useBroadcasts, useCreateList } from "@/hooks/use-broadcasts";
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
            <Link
              key={list.id}
              href={`/broadcasts/${list.id}`}
              className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card size="sm" className="transition group-hover:ring-foreground/20">
                <CardContent className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-heading text-sm font-medium">
                      {list.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDateTime(list.created_at)}
                    </p>
                  </div>
                  <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NewListButton() {
  const router = useRouter();
  const create = useCreateList();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    create.mutate(trimmed, {
      onSuccess: (res) => {
        setOpen(false);
        setName("");
        router.push(`/broadcasts/${res.listId}`);
      },
    });
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
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim() || create.isPending}>
              {create.isPending && <Loader2Icon className="animate-spin" />}
              Create list
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
