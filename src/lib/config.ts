/** Base origin of the Wavely backend (REST + Socket.io share this origin). */
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");
