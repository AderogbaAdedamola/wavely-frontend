import type { NextConfig } from "next";

// The real Wavely backend origin. Read server-side only (no NEXT_PUBLIC_ prefix) and
// used to proxy browser traffic below, so the browser never makes a cross-origin
// request and CORS never applies. Falls back to a local backend for offline dev.
const BACKEND_ORIGIN = (
  process.env.BACKEND_ORIGIN ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:3000"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  // Same-origin proxy: the browser calls /api/* and /socket.io/* on this Next server,
  // which forwards them to the backend. Server-to-server traffic has no CORS, so the
  // backend's FRONTEND_URL allow-list no longer needs to match the frontend's origin.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_ORIGIN}/api/:path*` },
      // Socket.io polling hits the base path (/socket.io, no trailing segment),
      // which /socket.io/:path* does not match — so proxy the base path too.
      { source: "/socket.io", destination: `${BACKEND_ORIGIN}/socket.io/` },
      {
        source: "/socket.io/:path*",
        destination: `${BACKEND_ORIGIN}/socket.io/:path*`,
      },
    ];
  },
};

export default nextConfig;
