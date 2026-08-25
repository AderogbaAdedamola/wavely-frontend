"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Fades + lifts its children into view once, when they scroll into the
 * viewport. Under `prefers-reduced-motion` (or before mount) the children are
 * simply shown — no transform, no transition — so content is never gated on JS
 * or motion. `delay` staggers siblings (ms).
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  // Loosely typed: a union `as` would otherwise collapse the ref to an
  // impossible intersection of element ref types.
  const Tag = as as React.ElementType;
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) {
      // Feature detection on mount: SSR/no-JS renders shown; honor reduced motion.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShown(true);
      return;
    }
    // Only now do we commit to animating — SSR/no-JS always renders shown.
    setAnimate(true);

    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      style={animate ? { transitionDelay: `${delay}ms` } : undefined}
      className={cn(
        animate && "transition-all duration-700 ease-out will-change-[opacity,transform]",
        animate && !shown && "translate-y-4 opacity-0",
        (shown || !animate) && "translate-y-0 opacity-100",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
