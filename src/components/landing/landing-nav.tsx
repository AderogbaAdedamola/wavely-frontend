"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { BrandMark } from "@/components/signal/brand-mark";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

const LINKS = [
  { href: "#capabilities", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#preview", label: "Preview" },
];

export function LandingNav() {
  const { ready, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  // Auth lives in localStorage (client-only); render the signed-out CTAs until
  // mount so the server and first client paint agree (no hydration mismatch).
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  const authed = mounted && ready && isAuthenticated;

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/welcome"
          className="rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          aria-label="Wavely home"
        >
          <BrandMark />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {authed ? (
            <Button asChild size="sm">
              <Link href="/">Open console</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="max-sm:hidden">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
