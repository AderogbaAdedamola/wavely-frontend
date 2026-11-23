"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ActivityIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  MessageCircleIcon,
  RefreshCwIcon,
  ServerIcon,
  ShieldAlertIcon,
  UsersRoundIcon,
  type LucideIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { ErrorState } from "@/components/common/query-states";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminOverview,
  useAdminSchedules,
  useAdminUsers,
} from "@/hooks/use-admin";
import { ApiError } from "@/lib/api/client";
import { ADMIN_PAGE_SIZE } from "@/lib/api/admin";
import type { AdminScheduleStatus } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type AdminTab = "users" | "schedules";
type ScheduleFilter = AdminScheduleStatus | "all";

const COUNT = new Intl.NumberFormat();
const SCHEDULE_FILTERS: { value: ScheduleFilter; label: string }[] = [
  { value: "all", label: "All schedules" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function AdminPage() {
  const overview = useAdminOverview();
  const [tab, setTab] = useState<AdminTab>("users");
  const [scheduleFilter, setScheduleFilter] = useState<ScheduleFilter>("all");
  const [userOffset, setUserOffset] = useState(0);
  const [scheduleOffset, setScheduleOffset] = useState(0);
  const users = useAdminUsers(userOffset, overview.isSuccess && tab === "users");
  const schedules = useAdminSchedules(
    scheduleOffset,
    scheduleFilter === "all" ? undefined : scheduleFilter,
    overview.isSuccess && tab === "schedules",
  );
  const queryClient = useQueryClient();
  const refreshing =
    overview.isFetching ||
    (tab === "users" ? users.isFetching : schedules.isFetching);

  function changeTab(value: string) {
    if (value === "users" || value === "schedules") setTab(value);
  }

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["admin"] });
  }

  if (overview.isPending) return <AdminLoading />;

  if (overview.isError) {
    if (overview.error instanceof ApiError && overview.error.status === 403) {
      return <AdminAccessDenied />;
    }
    return (
      <div className="space-y-6">
        <AdminHeading />
        <ErrorState error={overview.error} onRetry={() => overview.refetch()} />
      </div>
    );
  }

  const { data } = overview;
  const sessionCount = Object.values(data.whatsappSessions).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeading />
        <Button
          variant="outline"
          size="sm"
          onClick={refresh}
          disabled={refreshing}
        >
          <RefreshCwIcon className={refreshing ? "animate-spin" : ""} />
          Refresh data
        </Button>
      </div>

      <section
        aria-label="Current server instance"
        className="relative overflow-hidden rounded-xl bg-foreground p-5 text-background sm:p-6"
      >
        <div className="absolute inset-y-0 right-0 hidden w-1/3 bg-primary/10 sm:block" />
        <div className="relative grid gap-6 sm:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-background/70">
              <span className="grid size-8 place-items-center rounded-lg bg-background/10">
                <ServerIcon className="size-4" />
              </span>
              <span className="eyebrow text-background/70">Live instance</span>
            </div>
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight">
                {formatUptime(data.system.uptimeSeconds)}
              </p>
              <p className="mt-1 text-sm text-background/65">
                Running · {data.system.nodeVersion}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-background/20 bg-background/10 text-background">
                {data.system.environment}
              </Badge>
              <span className="text-xs text-background/60">
                Updated {formatDateTime(data.generatedAt)}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 self-end">
            <RuntimeStat
              label="Process memory"
              value={formatBytes(data.system.memoryBytes.rss)}
            />
            <RuntimeStat
              label="Heap in use"
              value={`${formatBytes(data.system.memoryBytes.heapUsed)} / ${formatBytes(data.system.memoryBytes.heapTotal)}`}
            />
            <RuntimeStat
              label="Connected lines"
              value={`${COUNT.format(data.whatsappSessions.connected ?? 0)} / ${COUNT.format(sessionCount)}`}
            />
          </div>
        </div>
      </section>

      <section aria-label="Platform totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRoundIcon}
          label="Accounts"
          value={data.users.total}
          note={`${COUNT.format(data.users.verified)} verified · ${COUNT.format(data.users.unverified)} waiting`}
          accent="text-aqua"
        />
        <MetricCard
          icon={ActivityIcon}
          label="Bots running"
          value={data.users.botActive}
          note={`${COUNT.format(data.whatsappSessions.connected ?? 0)} WhatsApp lines connected`}
          accent="text-live"
        />
        <MetricCard
          icon={MessageCircleIcon}
          label="Messages · last 24 hours"
          value={data.messages.last24Hours}
          note={`${COUNT.format(data.messages.total)} all time`}
          accent="text-signal"
        />
        <MetricCard
          icon={CircleAlertIcon}
          label="Failed deliveries · 24 hours"
          value={data.deliveries.failed.last24Hours}
          note={`${COUNT.format(data.deliveries.failed.total)} failed all time`}
          accent="text-destructive"
        />
      </section>

      <section aria-labelledby="schedule-health-title" className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Dispatch health</p>
            <h2
              id="schedule-health-title"
              className="mt-1 font-display text-xl font-semibold tracking-tight"
            >
              Schedule status
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            {COUNT.format(data.deliveries.delivered.last24Hours)} delivered in the last day
          </p>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-4">
          <ScheduleTotal label="Pending" value={data.schedules.pending} />
          <ScheduleTotal label="In progress" value={data.schedules.processing} />
          <ScheduleTotal label="Completed" value={data.schedules.completed} />
          <ScheduleTotal label="Failed" value={data.schedules.failed} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <DeliveryTotal
            label="Waiting to deliver"
            total={data.deliveries.pending.total}
            last24Hours={data.deliveries.pending.last24Hours}
          />
          <DeliveryTotal
            label="Delivered"
            total={data.deliveries.delivered.total}
            last24Hours={data.deliveries.delivered.last24Hours}
          />
          <DeliveryTotal
            label="Failed deliveries"
            total={data.deliveries.failed.total}
            last24Hours={data.deliveries.failed.last24Hours}
          />
        </div>
      </section>

      <section aria-labelledby="connection-health-title" className="space-y-3">
        <div>
          <p className="eyebrow">WhatsApp lines</p>
          <h2
            id="connection-health-title"
            className="mt-1 font-display text-xl font-semibold tracking-tight"
          >
            Connection status
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-border sm:grid-cols-3 xl:grid-cols-6">
          <ScheduleTotal
            label="Connected"
            value={data.whatsappSessions.connected}
          />
          <ScheduleTotal
            label="Connecting"
            value={data.whatsappSessions.connecting}
          />
          <ScheduleTotal
            label="Waiting for scan"
            value={data.whatsappSessions.requires_scan}
          />
          <ScheduleTotal
            label="Reconnecting"
            value={data.whatsappSessions.reconnecting}
          />
          <ScheduleTotal
            label="Sign-in needed"
            value={data.whatsappSessions.requires_reauth}
          />
          <ScheduleTotal
            label="Disconnected"
            value={data.whatsappSessions.disconnected}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Connection status reflects the last saved server state and may be
          behind during a reconnect.
        </p>
      </section>

      <section aria-labelledby="records-title" className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Platform records</p>
            <h2
              id="records-title"
              className="mt-1 font-display text-xl font-semibold tracking-tight"
            >
              Accounts &amp; schedules
            </h2>
          </div>
          {tab === "schedules" && (
            <div className="flex items-center gap-2">
              <Label htmlFor="schedule-filter" className="sr-only">
                Filter schedules
              </Label>
              <Select
                value={scheduleFilter}
                onValueChange={(value) => {
                  if (isScheduleFilter(value)) {
                    setScheduleFilter(value);
                    setScheduleOffset(0);
                  }
                }}
              >
                <SelectTrigger id="schedule-filter" className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCHEDULE_FILTERS.map((filter) => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Tabs value={tab} onValueChange={changeTab} className="gap-4">
          <TabsList aria-label="Admin records">
            <TabsTrigger value="users">Accounts</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <RecordsCard>
              {users.isPending ? (
                <RecordsLoading />
              ) : users.isError ? (
                <ErrorState error={users.error} onRetry={() => users.refetch()} />
              ) : (
                <>
                  <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Account</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verification</TableHead>
                        <TableHead>WhatsApp</TableHead>
                        <TableHead>Bot</TableHead>
                        <TableHead>Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.data.users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <StatusBadge
                              label={user.email_verified ? "Verified" : "Unverified"}
                              positive={user.email_verified}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={prettyStatus(user.whatsapp_status)}
                              positive={user.whatsapp_status === "connected"}
                            />
                          </TableCell>
                          <TableCell>
                            <StatusBadge
                              label={user.is_bot_active ? "Running" : "Standby"}
                              positive={user.is_bot_active}
                            />
                          </TableCell>
                          <TableCell>{formatDateTime(user.created_at)}</TableCell>
                        </TableRow>
                      ))}
                      {users.data.users.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No accounts found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pagination
                    offset={userOffset}
                    total={users.data.total}
                    onChange={setUserOffset}
                  />
                </>
              )}
            </RecordsCard>
          </TabsContent>
          <TabsContent value="schedules">
            <RecordsCard>
              {schedules.isPending ? (
                <RecordsLoading />
              ) : schedules.isError ? (
                <ErrorState
                  error={schedules.error}
                  onRetry={() => schedules.refetch()}
                />
              ) : (
                <>
                  <Table className="[&_td:first-child]:pl-4 [&_td:last-child]:pr-4 [&_th:first-child]:pl-4 [&_th:last-child]:pr-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Owner</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Send time</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Delivery results</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {schedules.data.schedules.map((schedule) => (
                        <TableRow key={schedule.id}>
                          <TableCell>
                            <span className="block font-medium">
                              {schedule.owner_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {schedule.owner_email}
                            </span>
                          </TableCell>
                          <TableCell className="capitalize">{schedule.type}</TableCell>
                          <TableCell>
                            <StatusBadge
                              label={prettyStatus(schedule.status)}
                              positive={schedule.status === "completed"}
                              negative={schedule.status === "failed"}
                            />
                          </TableCell>
                          <TableCell>{formatDateTime(schedule.execute_at)}</TableCell>
                          <TableCell>{COUNT.format(schedule.recipient_count)}</TableCell>
                          <TableCell>
                            <span className="text-live">
                              {COUNT.format(schedule.delivered_count)} delivered
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {COUNT.format(schedule.pending_count)} pending ·{" "}
                              {COUNT.format(schedule.failed_count)} failed
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      {schedules.data.schedules.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="h-24 text-center text-muted-foreground"
                          >
                            No schedules match this filter.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  <Pagination
                    offset={scheduleOffset}
                    total={schedules.data.total}
                    onChange={setScheduleOffset}
                  />
                </>
              )}
            </RecordsCard>
          </TabsContent>
        </Tabs>
      </section>

      <Alert>
        <ShieldAlertIcon />
        <AlertTitle>Read-only administration</AlertTitle>
        <AlertDescription>
          This view monitors platform activity. It does not expose message
          contents, recipient details, or account controls.
        </AlertDescription>
      </Alert>
    </div>
  );
}

function AdminHeading() {
  return (
    <div>
      <p className="eyebrow">Platform control</p>
      <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">
        Administration
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Monitor accounts, WhatsApp connections, delivery activity, and server health.
      </p>
    </div>
  );
}

function AdminAccessDenied() {
  return (
    <div className="mx-auto max-w-xl space-y-5 py-12">
      <div className="grid size-12 place-items-center rounded-xl bg-warn/10 text-warn">
        <ShieldAlertIcon className="size-6" />
      </div>
      <div className="space-y-2">
        <p className="eyebrow">Restricted area</p>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Admin access required
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          This dashboard is only available to verified accounts whose email is
          configured by the server administrator. Your account data and the
          regular operator dashboard are unaffected.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">Return to Control Center</Link>
      </Button>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  note: string;
  accent: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {COUNT.format(value)}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{note}</p>
        </div>
        <span className={`grid size-9 shrink-0 place-items-center rounded-lg bg-muted ${accent}`}>
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function RuntimeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-background/15 bg-background/5 p-3">
      <p className="text-[0.68rem] text-background/60">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function ScheduleTotal({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between bg-card px-4 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-display text-xl font-semibold">{COUNT.format(value)}</span>
    </div>
  );
}

function DeliveryTotal({
  label,
  total,
  last24Hours,
}: {
  label: string;
  total: number;
  last24Hours: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 ring-1 ring-foreground/10">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {COUNT.format(last24Hours)} in the last 24 hours
        </p>
      </div>
      <span className="font-display text-xl font-semibold">{COUNT.format(total)}</span>
    </div>
  );
}

function RecordsCard({ children }: { children: React.ReactNode }) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="sr-only">
        <CardTitle>Administration records</CardTitle>
      </CardHeader>
      <CardContent className="px-0">{children}</CardContent>
    </Card>
  );
}

function Pagination({
  offset,
  total,
  onChange,
}: {
  offset: number;
  total: number;
  onChange: (offset: number) => void;
}) {
  const start = total === 0 ? 0 : offset + 1;
  const end = Math.min(offset + ADMIN_PAGE_SIZE, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3">
      <p className="text-xs text-muted-foreground">
        Showing {COUNT.format(start)}–{COUNT.format(end)} of {COUNT.format(total)}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(Math.max(0, offset - ADMIN_PAGE_SIZE))}
          disabled={offset === 0}
          aria-label="Previous page"
        >
          <ChevronLeftIcon />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onChange(offset + ADMIN_PAGE_SIZE)}
          disabled={offset + ADMIN_PAGE_SIZE >= total}
          aria-label="Next page"
        >
          Next
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}

function StatusBadge({
  label,
  positive = false,
  negative = false,
}: {
  label: string;
  positive?: boolean;
  negative?: boolean;
}) {
  const className = positive
    ? "border-live/20 bg-live/10 text-live"
    : negative
      ? "border-destructive/20 bg-destructive/10 text-destructive"
      : "border-border bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}

function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <Skeleton className="h-52 w-full rounded-xl" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function RecordsLoading() {
  return (
    <div className="space-y-2 p-4">
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  );
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3_600);
  const minutes = Math.floor((seconds % 3_600) / 60);
  return days > 0
    ? `${days}d ${hours}h up`
    : hours > 0
      ? `${hours}h ${minutes}m up`
      : `${minutes}m up`;
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function prettyStatus(status: string | null): string {
  if (!status) return "Unknown";
  return status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function isScheduleFilter(value: string): value is ScheduleFilter {
  return SCHEDULE_FILTERS.some((filter) => filter.value === value);
}
