import { cn } from "@/lib/utils";

/**
 * Wavely wordmark. The glyph is a single transmitted wave inside an amber tile —
 * the same wave the console header animates, frozen to a logo.
 */
export function BrandMark({
  withText = true,
  className,
}: {
  withText?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M2 12c2-6 4-6 6 0s4 6 6 0 4-6 6 0" />
        </svg>
      </span>
      {withText && (
        <span className="font-display text-[0.98rem] leading-none font-semibold tracking-tight">
          Wavely
        </span>
      )}
    </div>
  );
}
