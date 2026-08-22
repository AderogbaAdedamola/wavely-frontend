import type { WaStatus } from "./types";

/**
 * The console speaks in "signal" terms. Every WhatsApp connection state maps
 * to a tone (which colour it wears), a one-line hint, and a waveform mode
 * (how the signature waveform behaves). This is the single source of truth
 * so the telemetry bar, sidebar dot, and connection page never drift apart.
 */

export type Tone = "live" | "warn" | "standby" | "danger" | "signal";
export type WaveMode = "flat" | "idle" | "live";

export interface WaDescriptor {
  label: string;
  hint: string;
  tone: Tone;
  wave: WaveMode;
}

export function describeWaStatus(status: WaStatus | undefined): WaDescriptor {
  switch (status) {
    case "connected":
      return {
        label: "Connected",
        hint: "Line is live and receiving.",
        tone: "live",
        wave: "live",
      };
    case "connecting":
      return {
        label: "Connecting",
        hint: "Negotiating with WhatsApp…",
        tone: "warn",
        wave: "idle",
      };
    case "requires_scan":
      return {
        label: "Awaiting scan",
        hint: "Scan the code to link a line.",
        tone: "warn",
        wave: "idle",
      };
    case "disconnected":
    default:
      return {
        label: "Offline",
        hint: "No line linked.",
        tone: "standby",
        wave: "flat",
      };
  }
}

interface ToneClasses {
  /** Foreground text colour. */
  text: string;
  /** Solid dot / marker background. */
  dot: string;
  /** Soft tinted chip (background + text). */
  chip: string;
  /** Hex-bearing CSS var for canvas/SVG fills. */
  varName: string;
}

export const TONE: Record<Tone, ToneClasses> = {
  live: {
    text: "text-live",
    dot: "bg-live",
    chip: "bg-live/12 text-live",
    varName: "var(--live)",
  },
  warn: {
    text: "text-warn",
    dot: "bg-warn",
    chip: "bg-warn/15 text-warn",
    varName: "var(--warn)",
  },
  standby: {
    text: "text-standby",
    dot: "bg-standby",
    chip: "bg-standby/15 text-standby",
    varName: "var(--standby)",
  },
  danger: {
    text: "text-destructive",
    dot: "bg-destructive",
    chip: "bg-destructive/12 text-destructive",
    varName: "var(--destructive)",
  },
  signal: {
    text: "text-signal",
    dot: "bg-signal",
    chip: "bg-signal/12 text-signal",
    varName: "var(--signal)",
  },
};
