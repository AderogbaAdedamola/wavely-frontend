"use client";

import { RefreshCwIcon, UsersRoundIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { CopyButton } from "@/components/common/copy-button";
import { EmptyState } from "@/components/common/empty-state";
import { ConnectRequired, ErrorState } from "@/components/common/query-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useGroups } from "@/hooks/use-groups";
import { ApiError } from "@/lib/api/client";
import { cn, formatJid } from "@/lib/utils";
import type { Group } from "@/lib/types";

export default function GroupsPage() {
  const { data, isLoading, isError, error, isFetching, refetch } = useGroups();
  const needsConnection =
    error instanceof ApiError && error.isConnectionRequired;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Dispatch"
        title="Groups"
        description="Groups your linked line belongs to. Copy an ID to target one in a schedule."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCwIcon className={cn(isFetching && "animate-spin")} />
            Refresh
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : needsConnection ? (
        <ConnectRequired detail="Groups load from your live WhatsApp line. Connect one to see them." />
      ) : isError ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={UsersRoundIcon}
          title="No groups"
          description="This line isn't in any groups yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}

function GroupCard({ group }: { group: Group }) {
  return (
    <Card size="sm">
      <CardContent className="space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 truncate font-heading text-sm font-medium">
            {group.subject || "Untitled group"}
          </p>
          {group.isCommunity && (
            <Badge variant="secondary" className="shrink-0">
              Community
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <UsersRoundIcon className="size-3.5" />
            {group.size} {group.size === 1 ? "member" : "members"}
          </span>
          {group.isCommunityAnnounce && <span>Announcements</span>}
        </div>

        <div className="flex items-center gap-1 border-t border-border/70 pt-2">
          <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
            {formatJid(group.id)}
          </span>
          <CopyButton value={group.id} label="Copy group ID" size="icon-xs" />
        </div>
      </CardContent>
    </Card>
  );
}
