"use client";

import { cn } from "@/lib/utils";
import { TONE, type Tone } from "@/lib/wa-state";

export function StatusDot({
  tone,
  pulse = false,
  className,
}: {
  tone: Tone;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block size-2 shrink-0 rounded-full",
        TONE[tone].dot,
        TONE[tone].text,
        pulse && "signal-pulse",
        className,
      )}
    />
  );
}
