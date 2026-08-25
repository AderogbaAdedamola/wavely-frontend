import Link from "next/link";
import { ArrowRightIcon, ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignalChip } from "@/components/common/signal-chip";
import { SignalField } from "./signal-field";

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[92svh] flex-col overflow-hidden">
      {/* 3D signal field — the signature, behind everything. */}
      <SignalField />
      {/* Scrim: darken top for nav/headline contrast, blend the field into the
          page at top and bottom while leaving the middle open. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/85 via-background/15 to-background"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-4 py-20 sm:px-6">
        <div className="max-w-2xl">
          <div className="hero-rise flex items-center gap-3">
            <p className="eyebrow">WhatsApp automation console</p>
            <SignalChip tone="live" label="On air" pulse />
          </div>

          <h1
            className="hero-rise mt-5 font-display font-semibold tracking-tight text-foreground"
            style={{
              animationDelay: "80ms",
              fontSize: "clamp(2.75rem, 7vw, 5.25rem)",
              lineHeight: 0.98,
            }}
          >
            Arm your bot.
            <br />
            Broadcast in <span className="text-signal">waves</span>.
          </h1>

          <p
            className="hero-rise mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            Wavely is the operator console for your WhatsApp bot. Link a line,
            arm automated replies, and dispatch broadcasts and scheduled sends —
            all from one signal desk.
          </p>

          <div
            className="hero-rise mt-8 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "240ms" }}
          >
            <Button asChild size="lg">
              <Link href="/register" data-icon="inline-end">
                Get started
                <ArrowRightIcon />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="#how">See how it works</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <a
        href="#capabilities"
        aria-label="Scroll to features"
        className="relative z-10 mx-auto mb-6 flex flex-col items-center gap-1 text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        <span className="font-mono text-[0.62rem] uppercase tracking-[0.2em]">
          Scroll
        </span>
        <ChevronDownIcon className="hint-bob size-4" />
      </a>
    </section>
  );
}
