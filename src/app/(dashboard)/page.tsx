"use client";

import Link from "next/link";
import {
  CalendarClockIcon,
  type LucideIcon,
  MegaphoneIcon,
  SparklesIcon,
} from "lucide-react";

import { Waveform } from "@/components/signal/waveform";
import { SignalChip } from "@/components/common/signal-chip";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useWaStatus } from "@/hooks/use-wa";
import { useAiSettings, useSettings, useToggleBot } from "@/hooks/use-settings";
import { useBroadcasts } from "@/hooks/use-broadcasts";
import { useSchedules } from "@/hooks/use-schedules";
import { describeWaStatus, TONE } from "@/lib/wa-state";
import { cn, formatDateTime, formatJid, relativeTime } from "@/lib/utils";
import type { Schedule } from "@/lib/types";

export default function ControlCenterPage() {
  const { data: waData } = useWaStatus();
  const status = waData?.status;
  const desc = describeWaStatus(status);
  const connected = status === "connected";

  return (
    <div className="space-y-6">
      {/* Hero — the transmission panel: live line state + the bot arm control. */}
      <section className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
        <div
          className="console-grid pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
        />
        <div className="relative grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="eyebrow">Line status</p>
                <h1
                  className={cn(
                    "font-display text-3xl leading-none font-semibold tracking-tight",
                    TONE[desc.tone].text,
                  )}
                >
                  {desc.label}
                </h1>
              </div>
              <SignalChip
                tone={desc.tone}
                label={connected ? "On air" : desc.label}
                pulse={connected}
              />
            </div>

            <Waveform mode={desc.wave} height={112} />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">{desc.hint}</p>
              <Button asChild size="sm" variant={connected ? "outline" : "default"}>
                <Link href="/connection">
                  {connected ? "Manage line" : "Link a line"}
                </Link>
              </Button>
            </div>
          </div>

          <BotPanel />
        </div>
      </section>

      {/* Quick telemetry */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BroadcastStat />
        <ScheduleStat />
        <PersonaStat />
      </div>

      <NextDispatch />
    </div>
  );
}

/** The bot arm control, explained — the console's primary switch. */
function BotPanel() {
  const { data } = useSettings();
  const toggle = useToggleBot();
  const armed = data?.is_bot_active ?? false;

  return (
    <div className="flex flex-col justify-between gap-4 rounded-lg bg-background/70 p-4 ring-1 ring-foreground/10">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="eyebrow">Bot</p>
          <p
            className={cn(
              "font-display text-2xl leading-none font-semibold tracking-tight",
              armed ? "text-signal" : "text-standby",
            )}
          >
            {armed ? "Armed" : "Standby"}
          </p>
        </div>
        <Switch
          checked={armed}
          onCheckedChange={(v) => toggle.mutate(v)}
          disabled={toggle.isPending || data === undefined}
          aria-label={armed ? "Disarm bot" : "Arm bot"}
        />
      </div>
      <p className="text-sm text-muted-foreground">
        {armed
          ? "Replying to incoming messages on your line."
          : "Incoming messages are ignored until you arm the bot."}
      </p>
      <Link
        href="/settings"
        className="text-sm font-medium text-foreground underline-offset-4 hover:text-primary hover:underline"
      >
        Tune behavior →
      </Link>
    </div>
  );
}

/** A single telemetry tile linking through to its section. */
function StatCard({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: LucideIcon;
  label: string;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Card size="sm" className="transition group-hover:ring-foreground/20">
        <CardContent className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition group-hover:text-foreground">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <div className="font-display text-xl leading-none font-semibold tracking-tight">
              {children}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{label}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BroadcastStat() {
  const { data, isLoading } = useBroadcasts();
  return (
    <StatCard icon={MegaphoneIcon} label="Broadcast lists" href="/broadcasts">
      {isLoading ? <Skeleton className="h-6 w-8" /> : (data?.length ?? "—")}
    </StatCard>
  );
}

function ScheduleStat() {
  const { data, isLoading } = useSchedules();
  const active = data?.filter(
    (s) => s.status === "pending" || s.status === "processing",
  ).length;
  return (
    <StatCard icon={CalendarClockIcon} label="Active sends" href="/schedules">
      {isLoading ? <Skeleton className="h-6 w-8" /> : (active ?? "—")}
    </StatCard>
  );
}

function PersonaStat() {
  const { data, isLoading } = useAiSettings();
  const name = data?.aiName?.trim();
  return (
    <StatCard icon={SparklesIcon} label="AI persona" href="/settings">
      {isLoading ? (
        <Skeleton className="h-6 w-24" />
      ) : (
        <span className="block truncate text-lg">{name || "Not set"}</span>
      )}
    </StatCard>
  );
}

/** The soonest queued sends, newest deadline first. */
function NextDispatch() {
  const { data, isLoading, isError } = useSchedules();
  const { data: settings } = useSettings();
  const timeZone = settings?.timeZone ?? "UTC";
  const upcoming = (data ?? [])
    .filter((s) => s.status === "pending" || s.status === "processing")
    .sort(
      (a, b) =>
        new Date(a.execute_at).getTime() - new Date(b.execute_at).getTime(),
    )
    .slice(0, 3);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Next dispatch</CardTitle>
        <CardDescription>Your soonest queued sends.</CardDescription>
        <CardAction>
          <Button asChild variant="outline" size="sm">
            <Link href="/schedules">All schedules</Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t load schedules right now.
          </p>
        ) : upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClockIcon}
            title="Nothing queued"
            description="Schedule a broadcast or a single send and it'll surface here."
            action={
              <Button asChild size="sm">
                <Link href="/schedules">Schedule a send</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {upcoming.map((s) => (
              <DispatchRow key={s.id} schedule={s} timeZone={timeZone} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function DispatchRow({
  schedule,
  timeZone,
}: {
  schedule: Schedule;
  timeZone: string;
}) {
  const targetLabel =
    schedule.type === "broadcast"
      ? `List #${schedule.target}`
      : formatJid(schedule.target);

  return (
    <li className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-3">
        {schedule.status === "processing" && (
          <Badge className="text-aqua" variant="outline">
            Sending
          </Badge>
        )}
        <Badge variant="outline" className="capitalize">
          {schedule.type}
        </Badge>
        <div className="min-w-0">
          <p className="truncate font-mono text-sm">{targetLabel}</p>
          <p className="truncate text-xs text-muted-foreground">
            {schedule.message_content}
          </p>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm">{relativeTime(schedule.execute_at)}</p>
        <p className="text-xs text-muted-foreground">
          {formatDateTime(schedule.execute_at, timeZone)}
        </p>
      </div>
    </li>
  );
}
