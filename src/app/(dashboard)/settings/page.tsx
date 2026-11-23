"use client";

import { useState } from "react";
import { Loader2Icon, MapPinIcon, RotateCcwIcon } from "lucide-react";

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
  useBrowserTimeZone,
  useSaveAiSettings,
  useSaveLocaleSettings,
  useSettings,
  useToggleBot,
} from "@/hooks/use-settings";
import {
  getCountryOptions,
  getTimeZoneCityLabel,
  getTimeZoneGroup,
  getTimeZoneOffset,
  getTimeZoneOptions,
  isValidTimeZone,
  cn,
} from "@/lib/utils";

const TIME_ZONE_OPTIONS = getTimeZoneOptions();
const COUNTRY_OPTIONS = getCountryOptions();

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
      <ReplyStyleCard />
    </div>
  );
}

function LocaleCard() {
  const { data, isLoading, isError, error, refetch } = useSettings();
  const browserTimeZone = useBrowserTimeZone();
  const initialTimeZone = data?.timeZone ?? browserTimeZone;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your time zone</CardTitle>
        <CardDescription>
          Choose your city so scheduled messages go out at the right local time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <LocaleForm
            key={`${data?.countryCode ?? ""}:${initialTimeZone}:${browserTimeZone}`}
            initialCountryCode={data?.countryCode ?? ""}
            initialTimeZone={initialTimeZone}
            isTimeZoneSaved={!!data?.timeZone}
            browserTimeZone={browserTimeZone}
          />
        )}
      </CardContent>
    </Card>
  );
}

function LocaleForm({
  initialCountryCode,
  initialTimeZone,
  isTimeZoneSaved,
  browserTimeZone,
}: {
  initialCountryCode: string;
  initialTimeZone: string;
  isTimeZoneSaved: boolean;
  browserTimeZone: string;
}) {
  const save = useSaveLocaleSettings();
  const [countryCode, setCountryCode] = useState(
    initialCountryCode.trim().toUpperCase(),
  );
  const [timeZone, setTimeZone] = useState(initialTimeZone);
  const trimmedCountryCode = countryCode.trim().toUpperCase();
  const normalizedInitialCountryCode = initialCountryCode.trim().toUpperCase();
  const countryValid =
    COUNTRY_OPTIONS.some((country) => country.value === trimmedCountryCode) ||
    trimmedCountryCode === normalizedInitialCountryCode ||
    (trimmedCountryCode === "" && !normalizedInitialCountryCode);
  const timeZoneValid = isValidTimeZone(timeZone.trim());
  const dirty =
    trimmedCountryCode !== normalizedInitialCountryCode ||
    timeZone.trim() !== initialTimeZone;
  const formattedNow = timeZoneValid
    ? new Intl.DateTimeFormat(undefined, {
        timeStyle: "short",
        timeZone: timeZone.trim(),
      }).format(new Date())
    : null;
  const timeZoneOptions = [
    ...new Set([...TIME_ZONE_OPTIONS, initialTimeZone, browserTimeZone]),
  ]
    .filter(isValidTimeZone)
    .sort((a, b) => {
      const groupOrder = getTimeZoneGroup(a).localeCompare(getTimeZoneGroup(b));
      return groupOrder || getTimeZoneCityLabel(a).localeCompare(getTimeZoneCityLabel(b));
    });
  const timeZoneGroups = timeZoneOptions.reduce<Record<string, string[]>>(
    (groups, zone) => {
      const group = getTimeZoneGroup(zone);
      (groups[group] ??= []).push(zone);
      return groups;
    },
    {},
  );
  const countryOptions = initialCountryCode &&
    !COUNTRY_OPTIONS.some((country) => country.value === normalizedInitialCountryCode)
    ? [
        ...COUNTRY_OPTIONS,
        { value: normalizedInitialCountryCode, label: normalizedInitialCountryCode },
      ]
    : COUNTRY_OPTIONS;

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty || !countryValid || !timeZoneValid) return;
    save.mutate({
      countryCode: trimmedCountryCode,
      timeZone: timeZone.trim(),
      saveCountry: trimmedCountryCode !== normalizedInitialCountryCode,
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="countryCode">Country (optional)</Label>
          <select
            id="countryCode"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            autoComplete="country-name"
            aria-invalid={!countryValid}
          >
            {!normalizedInitialCountryCode && (
              <option value="">Choose a country if needed</option>
            )}
            {countryOptions.map((country) => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Leave this alone unless you need to change your country.
          </p>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="timeZone">City</Label>
            {timeZone.trim() !== browserTimeZone && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => setTimeZone(browserTimeZone)}
              >
                <RotateCcwIcon />
                Use this device&apos;s city
              </Button>
            )}
          </div>
          <select
            id="timeZone"
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            value={timeZone}
            onChange={(e) => setTimeZone(e.target.value)}
            aria-invalid={!timeZoneValid}
          >
            {Object.entries(timeZoneGroups).map(([group, zones]) => (
              <optgroup key={group} label={group}>
                {zones.map((zone) => (
                  <option key={zone} value={zone}>
                    {getTimeZoneCityLabel(zone)} — {getTimeZoneOffset(zone)}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {!timeZoneValid && (
            <p className="text-xs text-destructive">
              Choose a city from the list.
            </p>
          )}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <MapPinIcon className="size-4 shrink-0" />
        {formattedNow
          ? `Local time in ${getTimeZoneCityLabel(timeZone.trim())}: ${formattedNow}`
          : "Choose a city to see its current local time."}
      </p>
      <Alert>
        <AlertDescription>
          {isTimeZoneSaved
            ? "Your saved city is used when you schedule messages. Daylight-saving time changes are handled automatically."
            : "Your device's city is selected for you. Save it to keep your schedule times consistent across devices."}
        </AlertDescription>
      </Alert>
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={!dirty || !countryValid || !timeZoneValid || save.isPending}
        >
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save changes
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

/** Shared reply name and guidance. */
function ReplyStyleCard() {
  const { data, isLoading, isError, error, refetch } = useAiSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reply style</CardTitle>
        <CardDescription>
          Choose the name and tone people will see in your replies.
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
        <Label htmlFor="aiPrompt">Instructions</Label>
        <Textarea
          id="aiPrompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={6}
          className="min-h-32"
          placeholder="You are a warm, concise assistant for a small business…"
        />
        <p className="text-xs text-muted-foreground">
          Describe how you want replies to sound and what they should focus on.
        </p>
      </div>
      <div className="flex justify-end">
        <Button type="submit" disabled={!dirty || save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save reply style
        </Button>
      </div>
    </form>
  );
}
