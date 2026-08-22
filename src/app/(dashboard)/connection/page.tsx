"use client";

import { useState } from "react";
import { Loader2Icon, PowerIcon, QrCodeIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import { PageHeader } from "@/components/common/page-header";
import { CopyButton } from "@/components/common/copy-button";
import { SignalChip } from "@/components/common/signal-chip";
import { Waveform } from "@/components/signal/waveform";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  useConnect,
  useLogout,
  usePair,
  useQr,
  useResetHard,
  useWaStatus,
} from "@/hooks/use-wa";
import { describeWaStatus } from "@/lib/wa-state";
import type { WaStatus } from "@/lib/types";

export default function ConnectionPage() {
  const { data, isLoading } = useWaStatus();
  const status = data?.status;
  const desc = describeWaStatus(status);
  const connected = status === "connected";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Connection"
        title="Link a line"
        description="Connect a WhatsApp number to this console — the bot runs on the linked line."
        actions={
          <SignalChip tone={desc.tone} label={desc.label} pulse={connected} />
        }
      />

      {isLoading ? (
        <Skeleton className="h-56 w-full rounded-xl" />
      ) : connected ? (
        <LinkedPanel />
      ) : (
        <LinkingPanel status={status} />
      )}

      <MaintenanceCard />
    </div>
  );
}

/** The connected state — a live readout plus a soft unlink. */
function LinkedPanel() {
  const logout = useLogout();
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div className="flex items-center gap-4">
          <Waveform mode="live" height={44} className="w-28" />
          <div>
            <p className="font-display text-xl leading-none font-semibold text-live">
              Linked
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This console is connected and receiving.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          {logout.isPending ? <Loader2Icon className="animate-spin" /> : <PowerIcon />}
          Unlink device
        </Button>
      </CardContent>
    </Card>
  );
}

/** Not connected — offer QR and pairing-code linking side by side. */
function LinkingPanel({ status }: { status?: WaStatus }) {
  const [started, setStarted] = useState(false);
  const connect = useConnect();
  const scanning = status === "requires_scan";
  const connecting = status === "connecting";

  const { data: qrData } = useQr(scanning || started);
  const qr = qrData?.qr ?? null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link this console</CardTitle>
        <CardDescription>
          Open WhatsApp on your phone → Settings → Linked devices, then use one
          of the methods below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="qr">
          <TabsList variant="line">
            <TabsTrigger value="qr">Scan QR</TabsTrigger>
            <TabsTrigger value="pair">Pairing code</TabsTrigger>
          </TabsList>

          <TabsContent value="qr" className="pt-5">
            <QrTab
              qr={qr}
              waiting={connecting || ((scanning || started) && !qr)}
              generating={connect.isPending}
              onGenerate={() => {
                setStarted(true);
                connect.mutate();
              }}
            />
          </TabsContent>

          <TabsContent value="pair" className="pt-5">
            <PairTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function QrTab({
  qr,
  waiting,
  generating,
  onGenerate,
}: {
  qr: string | null;
  waiting: boolean;
  generating: boolean;
  onGenerate: () => void;
}) {
  if (qr) {
    return (
      <div className="flex flex-col items-center gap-4">
        {/* QR stays light-on-dark regardless of theme, for scan reliability. */}
        <div className="rounded-xl bg-white p-4 ring-1 ring-foreground/10">
          <QRCodeSVG
            value={qr}
            size={216}
            fgColor="#0b1a22"
            bgColor="#ffffff"
            level="M"
            marginSize={0}
          />
        </div>
        <ol className="w-full max-w-xs space-y-1 text-sm text-muted-foreground">
          <li>1 · Open WhatsApp → Linked devices → Link a device.</li>
          <li>2 · Point your phone at this code.</li>
          <li>3 · The console updates the moment it links.</li>
        </ol>
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-sm text-muted-foreground">
        <Loader2Icon className="size-6 animate-spin text-signal" />
        Waiting for a code…
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground">
        <QrCodeIcon className="size-5" />
      </span>
      <p className="max-w-sm text-sm text-muted-foreground">
        Generate a QR code, then scan it from WhatsApp&apos;s linked-devices
        screen.
      </p>
      <Button onClick={onGenerate} disabled={generating}>
        {generating && <Loader2Icon className="animate-spin" />}
        Generate QR
      </Button>
    </div>
  );
}

function PairTab() {
  const [phone, setPhone] = useState("");
  const pair = usePair();
  const code = pair.data?.code;
  const digits = phone.replace(/\D/g, "");

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <div className="flex gap-2">
          <Input
            id="phone"
            inputMode="tel"
            placeholder="2348012345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <Button
            onClick={() => pair.mutate(digits)}
            disabled={pair.isPending || digits.length < 8}
          >
            {pair.isPending && <Loader2Icon className="animate-spin" />}
            Get code
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Include your country code, digits only.
        </p>
      </div>

      {code && (
        <div className="rounded-lg bg-muted/60 p-4 text-center ring-1 ring-foreground/10">
          <p className="eyebrow">Pairing code</p>
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            <span className="font-mono text-2xl font-semibold tracking-[0.25em]">
              {code}
            </span>
            <CopyButton value={code} label="Copy pairing code" />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            In WhatsApp → Linked devices → Link with phone number, enter this
            code.
          </p>
        </div>
      )}
    </div>
  );
}

/** Always-available escape hatch: wipe stored credentials. */
function MaintenanceCard() {
  const reset = useResetHard();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance</CardTitle>
        <CardDescription>
          Wipe stored WhatsApp credentials for this account. Use this only if
          linking gets stuck — you&apos;ll need to link a device again.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={reset.isPending}>
              {reset.isPending && <Loader2Icon className="animate-spin" />}
              Reset session
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset the WhatsApp session?</AlertDialogTitle>
              <AlertDialogDescription>
                This clears the stored credentials for your line. The bot goes
                offline until you link a device again.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => reset.mutate()}
              >
                Reset session
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
