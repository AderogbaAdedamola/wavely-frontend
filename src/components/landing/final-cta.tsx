import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Waveform } from "@/components/signal/waveform";
import { Reveal } from "./reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-card ring-1 ring-foreground/10">
          {/* a live transmission strip along the base — the signature, echoed once more */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 opacity-40"
          >
            <Waveform mode="live" height={180} />
          </div>
          <div
            aria-hidden="true"
            className="console-grid pointer-events-none absolute inset-0 opacity-50"
          />

          <div className="relative px-6 py-16 text-center sm:px-10 sm:py-20">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
              Run WhatsApp from one console.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Link your line, arm the bot, and send your first wave in minutes.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/register" data-icon="inline-end">
                  Get started
                  <ArrowRightIcon />
                </Link>
              </Button>
              <Button asChild size="lg" variant="ghost">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
