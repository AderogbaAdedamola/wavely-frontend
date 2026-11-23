import {
  CalendarClockIcon,
  MegaphoneIcon,
  MessageCircleIcon,
} from "lucide-react";

import { Waveform } from "@/components/signal/waveform";
import { SignalChip } from "@/components/common/signal-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Reveal } from "./reveal";

const TILES = [
  { icon: MegaphoneIcon, label: "Broadcast lists", value: "3" },
  { icon: CalendarClockIcon, label: "Pending sends", value: "2" },
  { icon: MessageCircleIcon, label: "Reply style", value: "Aria" },
];

export function ConsolePreview() {
  return (
    <section
      id="preview"
      className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28"
    >
      <Reveal className="max-w-2xl">
        <p className="eyebrow">The desk</p>
        <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          This is the console
        </h2>
        <p className="mt-4 text-muted-foreground">
          One screen for the whole line — live status, the arm switch, and your
          next dispatch. Here&apos;s the control center you land on after signing
          in.
        </p>
      </Reveal>

      {/* Static product shot, built from the real console components. The frame is
          decorative and inert (aria-hidden + pointer-events-none) — the working
          controls live inside the app; the page's real CTAs are elsewhere. */}
      <Reveal delay={80} className="mt-10">
        <div
          aria-hidden="true"
          className="pointer-events-none overflow-hidden rounded-2xl bg-card/60 p-2 shadow-2xl shadow-foreground/5 ring-1 ring-foreground/10 select-none sm:p-3"
        >
          {/* window chrome */}
          <div className="flex items-center gap-2 px-2 pt-1 pb-2">
            <span className="flex gap-1.5">
              <span className="size-2.5 rounded-full bg-standby/40" />
              <span className="size-2.5 rounded-full bg-standby/40" />
              <span className="size-2.5 rounded-full bg-standby/40" />
            </span>
            <span className="ml-1 font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
              wavely — control center
            </span>
          </div>

          <div className="space-y-4 rounded-xl bg-background p-4 sm:p-5">
            {/* Transmission panel — mirrors the dashboard hero */}
            <div className="relative overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
              <div className="console-grid absolute inset-0 opacity-70" />
              <div className="relative grid gap-6 p-5 lg:grid-cols-[1.7fr_1fr]">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="eyebrow">Line status</p>
                      <p className="font-display text-3xl leading-none font-semibold tracking-tight text-live">
                        On air
                      </p>
                    </div>
                    <SignalChip tone="live" label="On air" pulse />
                  </div>

                  <Waveform mode="live" height={112} />

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">
                      Linked and listening. Broadcasts send instantly.
                    </p>
                    <Button size="sm" variant="outline" tabIndex={-1}>
                      Manage line
                    </Button>
                  </div>
                </div>

                {/* Bot arm panel */}
                <div className="flex flex-col justify-between gap-4 rounded-lg bg-background/70 p-4 ring-1 ring-foreground/10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="eyebrow">Bot</p>
                      <p className="font-display text-2xl leading-none font-semibold tracking-tight text-signal">
                        Armed
                      </p>
                    </div>
                    <Switch defaultChecked tabIndex={-1} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Replying to incoming messages on your line.
                  </p>
                  <span className="text-sm font-medium text-foreground">
                    Tune behavior →
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry tiles */}
            <div className="grid gap-4 sm:grid-cols-3">
              {TILES.map((t) => (
                <Card key={t.label} size="sm">
                  <CardContent className="flex items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                      <t.icon className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="font-display text-xl leading-none font-semibold tracking-tight">
                        {t.value}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t.label}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
