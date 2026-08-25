"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle2Icon, Loader2Icon, MailWarningIcon } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import * as authApi from "@/lib/api/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

/**
 * Shown in place of the console when the signed-in user's email isn't verified.
 * The backend gates every functional route behind verification (403
 * EMAIL_NOT_VERIFIED), so we block here and offer the two things that move the
 * user forward: re-check after clicking the emailed link, or resend it.
 */
export function VerifyEmailNotice() {
  const { email, refreshUser, logout } = useAuth();
  const [rechecking, setRechecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  async function onRecheck() {
    setRechecking(true);
    setError(null);
    setNotice(null);
    try {
      await refreshUser();
      // Verified → RequireAuth re-renders the console and unmounts us. Still here
      // means the link hasn't been clicked (or a stale link was used).
      if (mounted.current) {
        setNotice("Not verified yet. Open the latest link in your email, then re-check.");
      }
    } catch {
      // A 401 here means the session ended — the provider handles the redirect.
    } finally {
      if (mounted.current) setRechecking(false);
    }
  }

  async function onResend() {
    if (!email) return;
    setResending(true);
    setError(null);
    setNotice(null);
    try {
      const { message } = await authApi.resendVerification(email);
      setNotice(message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't resend just now.");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="grid min-h-svh place-items-center px-4 py-10">
      <AuthCard
        title="Verify your email"
        description="Confirm your address to activate the console."
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5 rounded-lg bg-secondary/60 p-3 text-sm">
            <MailWarningIcon className="mt-0.5 size-4 shrink-0 text-signal" />
            <p className="text-muted-foreground">
              We sent a verification link to{" "}
              <span className="font-mono text-foreground">{email}</span>. Click
              it, then re-check below.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {notice && (
            <Alert>
              <CheckCircle2Icon className="size-4" />
              <AlertDescription>{notice}</AlertDescription>
            </Alert>
          )}

          <Button
            size="lg"
            className="w-full"
            onClick={onRecheck}
            disabled={rechecking}
          >
            {rechecking && <Loader2Icon className="animate-spin" />}
            I&apos;ve verified — continue
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={onResend}
            disabled={resending || !email}
          >
            {resending && <Loader2Icon className="animate-spin" />}
            Resend verification email
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={logout}
          >
            Sign out
          </Button>
        </div>
      </AuthCard>
    </div>
  );
}
