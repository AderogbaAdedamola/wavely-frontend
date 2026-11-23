"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeftIcon,
  CalendarClockIcon,
  Loader2Icon,
  PlugZapIcon,
  UserPlusIcon,
  XIcon,
} from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { CopyButton } from "@/components/common/copy-button";
import { ErrorState } from "@/components/common/query-states";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddByMember,
  useAddByTag,
  useAddMember,
  useBroadcasts,
  useContent,
  useMembers,
  useRemoveMember,
  useSetContent,
} from "@/hooks/use-broadcasts";
import { formatJid } from "@/lib/utils";

export default function BroadcastDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: lists } = useBroadcasts();
  const list = lists?.find((l) => l.id === id);

  if (!Number.isFinite(id)) {
    return (
      <ErrorState error={new Error("That broadcast list doesn't exist.")} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href="/broadcasts"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="size-4" />
          Broadcasts
        </Link>
        <PageHeader
          eyebrow="Dispatch · Broadcast"
          title={list?.name ?? `List #${id}`}
          description="Manage who receives this broadcast and what it says."
          actions={
            <Button asChild size="sm" variant="outline">
              <Link href={`/schedules?list=${id}`}>
                <CalendarClockIcon />
                Schedule a send
              </Link>
            </Button>
          }
        />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <MembersCard listId={id} />
        <MessageCard listId={id} />
      </div>
    </div>
  );
}

function MembersCard({ listId }: { listId: number }) {
  const { data: members, isLoading, isError, error, refetch } =
    useMembers(listId);
  const addMember = useAddMember(listId);
  const addByTag = useAddByTag(listId);
  const addByMember = useAddByMember(listId);
  const removeMember = useRemoveMember(listId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>Everyone who receives this broadcast.</CardDescription>
        <CardAction>
          <Badge variant="secondary">{members?.length ?? 0}</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label>Add by number or JID</Label>
          <AddField
            placeholder="2348012345678"
            buttonLabel="Add"
            pending={addMember.isPending}
            onSubmit={(value, clear) =>
              addMember.mutate(value, { onSuccess: clear })
            }
          />
          <p className="text-xs text-muted-foreground">
            A phone with country code, or a full WhatsApp JID.
          </p>
        </div>

        {/* Imports resolve against WhatsApp — they need a linked line. */}
        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <PlugZapIcon className="size-3.5" />
            Import from WhatsApp — requires a connected line.
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">By contact label</Label>
            <AddField
              placeholder="e.g. customers"
              buttonLabel="Import"
              pending={addByTag.isPending}
              onSubmit={(value, clear) =>
                addByTag.mutate(value, { onSuccess: clear })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">By group member</Label>
            <AddField
              placeholder="Group member's number"
              buttonLabel="Import"
              pending={addByMember.isPending}
              onSubmit={(value, clear) =>
                addByMember.mutate(value, { onSuccess: clear })
              }
            />
          </div>
        </div>

        {/* Member list */}
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !members || members.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No members yet.</p>
        ) : (
          <ul className="max-h-80 divide-y divide-border overflow-y-auto">
            {members.map((jid) => (
              <li
                key={jid}
                className="flex items-center justify-between gap-2 py-2"
              >
                <span className="truncate font-mono text-sm">
                  {formatJid(jid)}
                </span>
                <div className="flex shrink-0 items-center">
                  <CopyButton value={jid} label="Copy JID" />
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeMember.mutate(jid)}
                    disabled={removeMember.isPending}
                    aria-label={`Remove ${jid}`}
                  >
                    <XIcon />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function MessageCard({ listId }: { listId: number }) {
  const { data: content, isLoading, isError, error, refetch } =
    useContent(listId);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message</CardTitle>
        <CardDescription>
          The content delivered to everyone on this list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : isError ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : (
          <MessageEditor
            key={content?.id ?? "empty"}
            listId={listId}
            initialText={content?.text_content ?? ""}
            mediaUrl={content?.media_url ?? null}
          />
        )}
      </CardContent>
    </Card>
  );
}

function MessageEditor({
  listId,
  initialText,
  mediaUrl,
}: {
  listId: number;
  initialText: string;
  mediaUrl: string | null;
}) {
  const save = useSetContent(listId);
  const [text, setText] = useState(initialText);
  const dirty = text !== initialText;
  const hasMessage = !!initialText.trim() || !!mediaUrl;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save.mutate(text);
      }}
      className="space-y-4"
    >
      {!hasMessage && (
        <div className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground">
          No message
        </div>
      )}
      <div className="space-y-1.5">
        <Label htmlFor="messageText">Text</Label>
        <Textarea
          id="messageText"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="min-h-40"
          placeholder="Hi! Here's our update for this week…"
        />
      </div>

      {mediaUrl && (
        <p className="truncate text-xs text-muted-foreground">
          Media attached:{" "}
          <a
            href={mediaUrl}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:text-foreground"
          >
            {mediaUrl}
          </a>
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={!dirty || save.isPending}>
          {save.isPending && <Loader2Icon className="animate-spin" />}
          Save message
        </Button>
      </div>
    </form>
  );
}

/** A single-field add row used for members, labels, and group imports. */
function AddField({
  placeholder,
  buttonLabel,
  pending,
  onSubmit,
}: {
  placeholder: string;
  buttonLabel: string;
  pending: boolean;
  onSubmit: (value: string, clear: () => void) => void;
}) {
  const [value, setValue] = useState("");
  const submit = () => {
    const v = value.trim();
    if (v) onSubmit(v, () => setValue(""));
  };

  return (
    <div className="flex gap-2">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={submit}
        disabled={pending || !value.trim()}
      >
        {pending ? <Loader2Icon className="animate-spin" /> : <UserPlusIcon />}
        {buttonLabel}
      </Button>
    </div>
  );
}
