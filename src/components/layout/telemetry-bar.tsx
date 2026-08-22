"use client";

import { InfoIcon } from "lucide-react";

import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { BrandMark } from "@/components/signal/brand-mark";
import { Waveform } from "@/components/signal/waveform";
import { SignalChip } from "@/components/common/signal-chip";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useWaStatus } from "@/hooks/use-wa";
import { useSettings, useToggleBot } from "@/hooks/use-settings";
import { describeWaStatus } from "@/lib/wa-state";
import { cn } from "@/lib/utils";

/** The bot arm/disarm control — the console's primary switch. */
function BotArm() {
  const { data } = useSettings();
  const toggle = useToggleBot();
  const armed = data?.is_bot_active ?? false;

  return (
    <div className="flex items-center gap-2.5">
      <div className="hidden text-right leading-tight sm:block">
        <p
          className={cn(
            "text-xs font-medium",
            armed ? "text-live" : "text-muted-foreground",
          )}
        >
          {armed ? "Armed" : "Standby"}
        </p>
        <p className="eyebrow">Bot</p>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <Switch
              checked={armed}
              onCheckedChange={(v) => toggle.mutate(v)}
              disabled={toggle.isPending || data === undefined}
              aria-label={armed ? "Disarm bot" : "Arm bot"}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-56">
          <span className="inline-flex items-center gap-1.5">
            <InfoIcon className="size-3" />
            When armed, the bot replies to your incoming WhatsApp messages.
          </span>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

/** Sticky top bar: always-on signal readout on the left, controls on the right. */
export function TelemetryBar() {
  const { data: status } = useWaStatus();
  const desc = describeWaStatus(status?.status);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/70 sm:px-6">
      <MobileNav />
      <div className="lg:hidden">
        <BrandMark withText={false} />
      </div>

      {/* live signal readout */}
      <div className="flex min-w-0 items-center gap-3">
        <Waveform
          mode={desc.wave}
          height={30}
          className="w-20 sm:w-32"
        />
        <SignalChip
          tone={desc.tone}
          label={desc.label}
          pulse={desc.wave === "live"}
        />
        <span className="hidden text-xs text-muted-foreground md:inline">
          {desc.hint}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <BotArm />
        <div className="h-5 w-px bg-border" aria-hidden="true" />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
