"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { GlobalConfigNote } from "@/components/common/global-config-note";
import { ErrorState } from "@/components/common/query-states";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  useAiSettings,
  useSaveAiSettings,
  useSaveLocaleSettings,
  useSettings,
  useToggleBot,
} from "@/hooks/use-settings";
import {
  getTimeZoneOptions,
  isValidTimeZone,
  cn,
} from "@/lib/utils";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Control"
        title="Settings"
        description="Arm the bot and shape how it replies."
      />
      <BotCard />
      <LocaleCard />
      <AiCard />
    </div>
  );
}

function LocaleCard() {
  const { data, isLoading, isError, error, refetch } = useSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Country and time zone</CardTitle>
        <CardDescription>
          Schedule messages using your local clock. The time zone is also saved
          with your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <LocaleForm
            key={`${data?.countryCode ?? ""}:${data?.timeZone ?? ""}`}
            initialCountryCode={data?.countryCode ?? ""}
            initialTimeZone={data?.timeZone ?? "UTC"}
          />
        )}
      </CardContent>
    </Card>
  );
}

function LocaleForm({
  initialCountryCode,
  initialTimeZone,
}: {
  initialCountryCode: string;
  initialTimeZone: string;
}) {
  const save = useSaveLocaleSettings();
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const trimmedCountryCode = countryCode.trim().toUpperCase();
  const countryValid =
    /^[A-Z]{2}$/.test(trimmedCountryCode) ||
    (trimmedCountryCode === "" && !initialCountryCode);
  const timeZoneValid = isValidTimeZone(timeZone.trim());
  const dirty =
    trimmedCountryCode !== initialCountryCode ||
    timeZone.trim() !== initialTimeZone;
  const timeZones = getTimeZoneOptions();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || !countryValid || !timeZoneValid) return;
    save.mutate({
      countryCode: trimmedCountryCode,
      timeZone: timeZone.trim(),
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="countryCode">Country code (optional)</Label>
          <Input
            id="countryCode"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            maxLength={2}
            autoComplete="country"
            placeholder="NG"
            aria-invalid={!countryValid}
          />
          {!countryValid && (
            <p className="text-xs text-destructive">
              Enter a two-letter ISO country code. A saved country can&apos;t be
              cleared here.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="timeZone">IANA time zone</Label>
          <Input
            id="timeZone"
            list="wavely-time-zones"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            placeholder="Africa/Lagos"
            aria-invalid={!timeZoneValid}
          />
          <datalist id="wavely-time-zones">
            {[...new Set([...timeZones, initialTimeZone])].map((zone) => (
              <option key={zone} value={zone} />
            ))}
          </datalist>
          {!timeZoneValid && (
            <p className="text-xs text-destructive">
              Enter a valid IANA time-zone name.
            </p>
          )}
        </div>
      </div>
      <Alert>
        <AlertDescription>
          Country defaults may be inferred from your WhatsApp number. Your
          selected time zone determines when scheduled sends run.
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!dirty || !countryValid || !timeZoneValid || save.isPending}
        >
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save locale
        </Button>
      </div>
    </form>
  );
}

/** Per-account: arm or disarm the bot on this operator's line. */
function BotCard() {
  const { data } = useSettings();
  const toggle = useToggleBot();
  const armed = data?.is_bot_active ?? false;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bot</CardTitle>
        <CardDescription>
          When armed, the bot replies to incoming messages on your linked line.
          This setting is per account.
        </CardDescription>
        <CardAction>
          <Switch
            checked={armed}
            onCheckedChange={(v) => toggle.mutate(v)}
            disabled={toggle.isPending || data === undefined}
            aria-label={armed ? "Disarm bot" : "Arm bot"}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <p
          className={cn(
            "text-sm font-medium",
            armed ? "text-live" : "text-muted-foreground",
          )}
        >
          {armed
            ? "Armed — responding to messages."
            : "Standby — messages are ignored."}
        </p>
      </CardContent>
    </Card>
  );
}

/** Global: the AI's name and system prompt (shared server-wide today). */
function AiCard() {
  const { data, isLoading, isError, error, refetch } = useAiSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI persona</CardTitle>
        <CardDescription>
          Give the AI a name and a system prompt that defines how it behaves.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <GlobalConfigNote />
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <AiForm
            key={`${data?.aiName}::${data?.aiSystemPrompt}`}
            initialName={data?.aiName ?? ""}
            initialPrompt={data?.aiSystemPrompt ?? ""}
          />
        )}
      </CardContent>
    </Card>
  );
}

function AiForm({
  initialName,
  initialPrompt,
}: {
  initialName: string;
  initialPrompt: string;
}) {
  const save = useSaveAiSettings();
  const [name, setName] = useState(initialName);
  const [prompt, setPrompt] = useState(initialPrompt);
  const dirty = name !== initialName || prompt !== initialPrompt;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    save.mutate({ aiName: name.trim(), aiSystemPrompt: prompt });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="aiName">Name</Label>
        <Input
          id="aiName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Wavely"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="aiPrompt">System prompt</Label>
        <Textarea
          id="aiPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="min-h-32"
          placeholder="You are a warm, concise assistant for a small business…"
        />
        <p className="text-xs text-muted-foreground">
          Sets the AI&apos;s role, tone, and boundaries.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!dirty || save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save persona
        </Button>
      </div>
    </form>
  );
}
