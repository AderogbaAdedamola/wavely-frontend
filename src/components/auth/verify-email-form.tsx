"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";

import { useAuth } from "@/components/providers/auth-provider";
import * as authApi from "@/lib/api/auth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type Status = "verifying" | "success" | "error";

/**
 * Consumes the single-use token from the verification link. It verifies once on
 * mount (the link is meant to "just work"); if the user is signed in we refresh
 * their session so the EMAIL_NOT_VERIFIED gate lifts without a re-login.
 */
export function VerifyEmailForm({ token }: { token: string | null }) {
  const { isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<Status>(token ? "verifying" : "error");
  const [message, setMessage] = useState<string | null>(
    token
      ? null
      : "This verification link is missing its token. Open the most recent link from your email.",
  );

  // Fire the verify call exactly once even under StrictMode's double-mount, and
  // only touch state while mounted.
  const started = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (token && !started.current) {
      started.current = true;
      authApi
        .verifyEmail(token)
        .then(async () => {
          if (isAuthenticated) {
            try {
              await refreshUser();
            } catch {
              // Session may have lapsed — they can still sign in fresh.
            }
          }
          if (mounted.current) setStatus("success");
        })
        .catch((err) => {
          if (!mounted.current) return;
          setStatus("error");
          setMessage(
            err instanceof Error
              ? err.message
              : "This link is invalid or has expired.",
          );
        });
    }
    return () => {
      mounted.current = false;
    };
  }, [token, isAuthenticated, refreshUser]);

  if (status === "verifying") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your email…</p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle2Icon className="size-4" />
          <AlertDescription>
            Your email is verified. Your console is ready.
          </AlertDescription>
        </Alert>
        {isAuthenticated ? (
          <Button size="lg" className="w-full" onClick={() => router.replace("/")}>
            Open console
          </Button>
        ) : (
          <Button asChild size="lg" className="w-full">
            <Link href="/login">Continue to sign in</Link>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <XCircleIcon className="size-4" />
        <AlertDescription>{message}</AlertDescription>
      </Alert>
      <Button asChild variant="outline" size="lg" className="w-full">
        <Link href="/login">Back to sign in</Link>
      </Button>
    </div>
  );
}
