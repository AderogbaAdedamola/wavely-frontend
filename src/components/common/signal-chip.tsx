import { cn } from "@/lib/utils";
import { TONE, type Tone } from "@/lib/wa-state";
import { StatusDot } from "@/components/signal/status-dot";

/** A tinted status pill: a coloured dot + label, tuned to a tone. */
export function SignalChip({
  tone,
  label,
  pulse = false,
  className,
}: {
  tone: Tone;
  label: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        TONE[tone].chip,
        className,
      )}
    >
      <StatusDot tone={tone} pulse={pulse} />
      {label}
    </span>
  );
}
