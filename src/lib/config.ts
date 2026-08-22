/** Base origin for browser API + Socket.io calls. Empty = same-origin, so requests hit
 *  the Next.js proxy in next.config.ts, which forwards them to the backend server-side
 *  (no CORS). Set NEXT_PUBLIC_API_BASE_URL to an absolute URL only for direct calls. */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || ""
).replace(/\/$/, "");
