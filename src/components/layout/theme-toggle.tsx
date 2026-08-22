"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStarIcon, SunIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Switches between the "Daylight" (light) and "Signal Console" (dark) themes. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // next-themes SSR guard: the resolved theme is only known after mount, so we
  // flip `mounted` once to swap in the correct icon without a hydration mismatch.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to daylight" : "Switch to signal console"}
    >
      {/* Render a stable icon until mounted to avoid a hydration mismatch. */}
      {mounted && isDark ? <SunIcon /> : <MoonStarIcon />}
    </Button>
  );
}
