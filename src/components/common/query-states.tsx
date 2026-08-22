import Link from "next/link";
import { PlugZapIcon, TriangleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./empty-state";

/** A failed request, with the server's message and a retry. */
export function ErrorState({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  const message =
    error instanceof Error ? error.message : "Something went wrong.";
  return (
    <Alert variant="destructive">
      <TriangleAlertIcon />
      <AlertTitle>Couldn&apos;t load this</AlertTitle>
      <AlertDescription>
        {message}
        {onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-2 w-fit"
          >
            Try again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}

/**
 * The 503 case: a feature needs a live WhatsApp line first. Points the operator
 * at the connection screen instead of showing a dead error.
 */
export function ConnectRequired({
  detail = "This needs a linked WhatsApp line. Connect one to continue.",
}: {
  detail?: string;
}) {
  return (
    <EmptyState
      icon={PlugZapIcon}
      title="No line connected"
      description={detail}
      action={
        <Button asChild size="sm">
          <Link href="/connection">Connect WhatsApp</Link>
        </Button>
      }
    />
  );
}
