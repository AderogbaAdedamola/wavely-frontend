"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";
import { BrandMark } from "@/components/signal/brand-mark";
import { Waveform } from "@/components/signal/waveform";

/**
 * Client-side route guard for the console. Waits until the token has been read
 * from storage (`ready`) before deciding, so a valid session never flashes the
 * login screen on reload.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [ready, isAuthenticated, router]);

  if (!ready || !isAuthenticated) {
    return (
      <div className="grid min-h-svh place-items-center">
        <div className="flex w-56 flex-col items-center gap-4">
          <BrandMark />
          <Waveform mode="idle" height={40} className="opacity-70" />
          <p className="eyebrow">Establishing link…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
