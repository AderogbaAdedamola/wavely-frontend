import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ------------------------------------------------------------------ *
 * WhatsApp JID helpers
 * A JID looks like `2348012345678@s.whatsapp.net` (a line) or
 * `120363...@g.us` (a group). We show operators something readable
 * while keeping the raw value one copy-click away.
 * ------------------------------------------------------------------ */

export type JidKind = "phone" | "group" | "unknown";

export function jidUser(jid: string): string {
  return jid.includes("@") ? jid.slice(0, jid.indexOf("@")) : jid;
}

export function jidKind(jid: string): JidKind {
  if (jid.includes("@g.us")) return "group";
  if (jid.includes("@s.whatsapp.net") || jid.includes("@c.us")) return "phone";
  return "unknown";
}

/** Group a run of digits into readable triples for display only. */
function groupDigits(digits: string): string {
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
}

/** Human-friendly label for a JID. Falls back to the raw value. */
export function formatJid(jid: string): string {
  if (!jid) return "";
  const user = jidUser(jid);
  switch (jidKind(jid)) {
    case "phone":
      return `+${groupDigits(user)}`;
    case "group":
      return `Group ·${user.slice(-6)}`;
    default:
      return jid;
  }
}

/* ------------------------------------------------------------------ *
 * Time helpers
 * ------------------------------------------------------------------ */

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });
const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "seconds" },
  { amount: 60, unit: "minutes" },
  { amount: 24, unit: "hours" },
  { amount: 7, unit: "days" },
  { amount: 4.34524, unit: "weeks" },
  { amount: 12, unit: "months" },
  { amount: Number.POSITIVE_INFINITY, unit: "years" },
];

/** "in 3 hours" / "2 days ago", relative to now. */
export function relativeTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  let duration = (d.getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return formatDateTime(iso);
}

/** Value for a `datetime-local` input from an ISO string (local time). */
export function toLocalInputValue(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

/** Convert a `datetime-local` value (local time) to an ISO 8601 string. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

export function initials(name: string | null | undefined): string {
  if (!name) return "··";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Compact count formatting: 1200 -> "1.2k". */
export function compactNumber(n: number): string {
  return new Intl.NumberFormat(undefined, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
