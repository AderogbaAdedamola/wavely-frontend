import Link from "next/link";

import { BrandMark } from "@/components/signal/brand-mark";

const YEAR = new Date().getFullYear();

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            The operator console for your WhatsApp bot. Not affiliated with,
            endorsed by, or connected to WhatsApp or Meta.
          </p>
        </div>
        <nav className="flex items-center gap-1" aria-label="Footer">
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Get started
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <p className="font-mono text-[0.62rem] tracking-[0.16em] text-muted-foreground uppercase">
            © {YEAR} Wavely
          </p>
        </div>
      </div>
    </footer>
  );
}
