import { UsersIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * Surfaces SECURITY.md finding #5: AI persona and command permissions are
 * currently global — shared by every account on the server, not per-user.
 */
export function GlobalConfigNote({ className }: { className?: string }) {
  return (
    <Alert
      className={cn(
        "border-warn/30 bg-warn/8 text-foreground [&>svg]:text-warn",
        className,
      )}
    >
      <UsersIcon />
      <AlertTitle>Affects all accounts</AlertTitle>
      <AlertDescription className="text-muted-foreground">
        These settings are stored globally on the server, so changes apply to
        every account — not just yours. Per-account scoping is planned.
      </AlertDescription>
    </Alert>
  );
}
