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

export function formatDateTime(iso: string, timeZone?: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    ...(timeZone ? { timeZone } : {}),
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

export function toZonedInputValue(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}`;
}

export function localInputToWallTime(value: string): string {
  return value.replace("T", " ");
}

export function getTimeZoneOptions(): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : [];
  return [...new Set(["UTC", ...supported])].sort();
}

const COUNTRY_CODES =
  "AD AE AF AG AI AL AM AO AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BW BY BZ CA CC CD CG CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG ER ES ET FI FJ FK FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GT GU GW GY HK HN HR HT HU ID IE IL IM IN IO IQ IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW";

const COUNTRY_NAMES = new Intl.DisplayNames(["en"], { type: "region" });

export function getCountryOptions(): { value: string; label: string }[] {
  return [...new Set(COUNTRY_CODES.split(" "))]
    .map((value) => ({ value, label: COUNTRY_NAMES.of(value) ?? value }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function getTimeZoneCityLabel(timeZone: string): string {
  if (timeZone === "UTC") return "UTC";

  const knownLabels: Record<string, string> = {
    "Africa/Accra": "Accra, Ghana",
    "Africa/Cairo": "Cairo, Egypt",
    "Africa/Johannesburg": "Johannesburg, South Africa",
    "Africa/Lagos": "Lagos, Nigeria",
    "Africa/Nairobi": "Nairobi, Kenya",
    "America/Chicago": "Chicago, United States",
    "America/Los_Angeles": "Los Angeles, United States",
    "America/Mexico_City": "Mexico City, Mexico",
    "America/New_York": "New York, United States",
    "America/Sao_Paulo": "São Paulo, Brazil",
    "America/Toronto": "Toronto, Canada",
    "America/Vancouver": "Vancouver, Canada",
    "Asia/Dubai": "Dubai, United Arab Emirates",
    "Asia/Kolkata": "Mumbai, India",
    "Asia/Seoul": "Seoul, South Korea",
    "Asia/Singapore": "Singapore",
    "Asia/Tokyo": "Tokyo, Japan",
    "Australia/Sydney": "Sydney, Australia",
    "Europe/Berlin": "Berlin, Germany",
    "Europe/London": "London, United Kingdom",
    "Europe/Paris": "Paris, France",
    "Pacific/Auckland": "Auckland, New Zealand",
  };
  const knownLabel = knownLabels[timeZone];
  if (knownLabel) return knownLabel;

  const parts = timeZone.split("/");
  const city = (parts.pop() ?? timeZone).replaceAll("_", " ");
  const area = parts.at(-1)?.replaceAll("_", " ");
  return area ? `${city}, ${area}` : city;
}

export function getTimeZoneGroup(timeZone: string): string {
  const region = timeZone.split("/")[0];
  const groups: Record<string, string> = {
    Africa: "Africa",
    America: "The Americas",
    Antarctica: "Antarctica",
    Arctic: "Arctic",
    Asia: "Asia",
    Atlantic: "Atlantic",
    Australia: "Australia",
    Europe: "Europe",
    Indian: "Indian Ocean",
    Pacific: "Pacific",
    UTC: "Other",
  };
  return groups[region] ?? "Other";
}

export function getTimeZoneOffset(timeZone: string): string {
  const offset = new Intl.DateTimeFormat("en", {
    timeZone,
    timeZoneName: "longOffset",
  })
    .formatToParts(new Date())
    .find((part) => part.type === "timeZoneName")?.value;

  if (!offset || offset === "GMT" || offset === "GMT+00:00") {
    return "UTC+00:00";
  }
  return offset.replace(/^GMT/, "UTC");
}

export function isValidTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch (error) {
    if (error instanceof RangeError) return false;
    throw error;
  }
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
