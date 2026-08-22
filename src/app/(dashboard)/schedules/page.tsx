"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  CalendarClockIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/query-states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useBroadcasts } from "@/hooks/use-broadcasts";
import {
  useCreateBroadcast,
  useCreateSingle,
  useDeleteSchedule,
  useSchedules,
} from "@/hooks/use-schedules";
import type { BroadcastList, Schedule, ScheduleStatus } from "@/lib/types";
import {
  cn,
  formatDateTime,
  formatJid,
  localInputToIso,
  relativeTime,
  toLocalInputValue,
} from "@/lib/utils";

const STATUS: Record<
  ScheduleStatus,
  { label: string; dot: string; text: string }
> = {
  pending: { label: "Scheduled", dot: "bg-warn", text: "text-warn" },
  completed: { label: "Sent", dot: "bg-live", text: "text-live" },
  failed: { label: "Failed", dot: "bg-destructive", text: "text-destructive" },
};

export default function SchedulesPage() {
  return (
    <Suspense fallback={null}>
      <SchedulesView />
    </Suspense>
  );
}

function SchedulesView() {
  const searchParams = useSearchParams();
  const presetList = searchParams.get("list");
  const presetListId = presetList && Number.isFinite(Number(presetList))
    ? Number(presetList)
    : undefined;

  const { data, isLoading, isError, error, refetch } = useSchedules();
  const { data: lists } = useBroadcasts();

  const { upcoming, history } = useMemo(() => {
    const all = data ?? [];
    const byExecuteAsc = (a: Schedule, b: Schedule) =>
      +new Date(a.execute_at) - +new Date(b.execute_at);
    return {
      upcoming: all
        .filter((s) => s.status === "pending")
        .sort(byExecuteAsc),
      history: all
        .filter((s) => s.status !== "pending")
        .sort((a, b) => -byExecuteAsc(a, b)),
    };
  }, [data]);

  const isEmpty = !isLoading && !isError && (data?.length ?? 0) === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch"
        title="Schedules"
        description="Queue a one-off message or a broadcast to go out later."
        actions={
          <NewScheduleButton
            lists={lists}
            presetListId={presetListId}
            autoOpen={presetListId !== undefined}
          />
        }
      />

      <SchedulingCaveat />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : isEmpty ? (
        <EmptyState
          icon={CalendarClockIcon}
          title="Nothing queued"
          description="Schedule a message and it'll appear here until it sends."
          action={<NewScheduleButton lists={lists} />}
        />
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <ScheduleSection
              title="Upcoming"
              count={upcoming.length}
              items={upcoming}
              lists={lists}
            />
          )}
          {history.length > 0 && (
            <ScheduleSection
              title="History"
              count={history.length}
              items={history}
              lists={lists}
            />
          )}
        </div>
      )}
    </div>
  );
}

/** SECURITY.md: sends fire from the server's job runner, not the browser. */
function SchedulingCaveat() {
  return (
    <Alert className="border-warn/30 bg-warn/8 text-foreground [&>svg]:text-warn">
      <InfoIcon />
      <AlertTitle>Sends fire from the server</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Schedules are queued here and dispatched by the server&apos;s job runner
        (QStash). If it isn&apos;t configured on the server, schedules save but
        never send — confirm it&apos;s set up with your admin.
      </AlertDescription>
    </Alert>
  );
}

function ScheduleSection({
  title,
  count,
  items,
  lists,
}: {
  title: string;
  count: number;
  items: Schedule[];
  lists: BroadcastList[] | undefined;
}) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2">
        <h2 className="eyebrow">{title}</h2>
        <Badge variant="secondary">{count}</Badge>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        {items.map((s) => (
          <ScheduleRow key={s.id} schedule={s} lists={lists} />
        ))}
      </ul>
    </section>
  );
}

function ScheduleRow({
  schedule,
  lists,
}: {
  schedule: Schedule;
  lists: BroadcastList[] | undefined;
}) {
  const status = STATUS[schedule.status];
  const target = targetLabel(schedule, lists);

  return (
    <li className="flex items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", status.text)}>
            <span className={cn("size-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
          <Badge variant="outline" className="capitalize">
            {schedule.type === "broadcast" ? "Broadcast" : "One-off"}
          </Badge>
          <span className="truncate font-mono text-xs text-muted-foreground">
            {target}
          </span>
        </div>
        <p className="line-clamp-2 text-sm">{schedule.message_content}</p>
        <p className="text-xs text-muted-foreground">
          {relativeTime(schedule.execute_at)} · {formatDateTime(schedule.execute_at)}
        </p>
      </div>
      <DeleteScheduleButton id={schedule.id} pending={schedule.status === "pending"} />
    </li>
  );
}

function targetLabel(s: Schedule, lists: BroadcastList[] | undefined): string {
  if (s.type === "broadcast") {
    const id = Number(s.target);
    const found = lists?.find((l) => l.id === id);
    return found ? found.name : `List #${s.target}`;
  }
  return formatJid(s.target);
}

function DeleteScheduleButton({
  id,
  pending,
}: {
  id: number;
  pending: boolean;
}) {
  const del = useDeleteSchedule();
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="shrink-0 text-muted-foreground hover:text-destructive"
          aria-label="Remove schedule"
        >
          <Trash2Icon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove this schedule?</AlertDialogTitle>
          <AlertDialogDescription>
            {pending
              ? "It won't be sent, and the schedule is deleted. This can't be undone."
              : "The schedule record is deleted. This can't be undone."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep it</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => del.mutate(id)}
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/* --------------------------- create dialog --------------------------- */

function defaultWhen(): string {
  // Seed the picker an hour out so the operator only nudges it.
  return toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000).toISOString());
}

function NewScheduleButton({
  lists,
  presetListId,
  autoOpen = false,
}: {
  lists: BroadcastList[] | undefined;
  presetListId?: number;
  autoOpen?: boolean;
}) {
  const createSingle = useCreateSingle();
  const createBroadcast = useCreateBroadcast();

  const [open, setOpen] = useState(autoOpen);
  const [type, setType] = useState<"single" | "broadcast">(
    presetListId !== undefined ? "broadcast" : "single",
  );
  const [target, setTarget] = useState("");
  const [listId, setListId] = useState(
    presetListId !== undefined ? String(presetListId) : "",
  );
  const [message, setMessage] = useState("");
  const [when, setWhen] = useState(defaultWhen);

  const pending = createSingle.isPending || createBroadcast.isPending;
  const hasLists = !!lists && lists.length > 0;
  const canSubmit =
    message.trim() !== "" &&
    when !== "" &&
    (type === "single" ? target.trim() !== "" : listId !== "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    const executeAt = localInputToIso(when);
    const onSuccess = () => {
      setOpen(false);
      setMessage("");
      setTarget("");
    };
    if (type === "single") {
      createSingle.mutate(
        { targetJid: target.trim(), messageContent: message, executeAt },
        { onSuccess },
      );
    } else {
      createBroadcast.mutate(
        { listId: Number(listId), messageContent: message, executeAt },
        { onSuccess },
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon />
          Schedule a send
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>Schedule a send</DialogTitle>
            <DialogDescription>
              Pick who receives it, write the message, and set the time.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 space-y-4">
            <Tabs value={type} onValueChange={(v) => setType(v as typeof type)}>
              <TabsList variant="line">
                <TabsTrigger value="single">One-off</TabsTrigger>
                <TabsTrigger value="broadcast">Broadcast</TabsTrigger>
              </TabsList>

              <TabsContent value="single" className="mt-3 space-y-1.5">
                <Label htmlFor="scheduleTarget">Recipient</Label>
                <Input
                  id="scheduleTarget"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="2348012345678"
                  inputMode="tel"
                />
                <p className="text-xs text-muted-foreground">
                  A phone with country code, or a full WhatsApp JID.
                </p>
              </TabsContent>

              <TabsContent value="broadcast" className="mt-3 space-y-1.5">
                <Label>List</Label>
                {hasLists ? (
                  <Select value={listId} onValueChange={setListId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a list" />
                    </SelectTrigger>
                    <SelectContent>
                      {(lists ?? []).map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No lists yet.{" "}
                    <Link
                      href="/broadcasts"
                      className="underline underline-offset-2 hover:text-foreground"
                    >
                      Create one
                    </Link>{" "}
                    first.
                  </p>
                )}
              </TabsContent>
            </Tabs>

            <div className="space-y-1.5">
              <Label htmlFor="scheduleMessage">Message</Label>
              <Textarea
                id="scheduleMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Hi! A quick heads-up…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="scheduleWhen">Send at</Label>
              <Input
                id="scheduleWhen"
                type="datetime-local"
                value={when}
                min={toLocalInputValue(new Date().toISOString())}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!canSubmit || pending}>
              {pending && <Loader2Icon className="animate-spin" />}
              Schedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
