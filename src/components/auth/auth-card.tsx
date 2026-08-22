import { BrandMark } from "@/components/signal/brand-mark";
import { Waveform } from "@/components/signal/waveform";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-4">
        <BrandMark />
        <Waveform mode="idle" height={40} className="w-52" />
      </div>
      <div className="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
        <div className="mb-5 space-y-1 text-center">
          <p className="eyebrow">Secure channel</p>
          <h1 className="font-display text-xl leading-tight font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {children}
      </div>
      {footer && (
        <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
      )}
    </div>
  );
}
