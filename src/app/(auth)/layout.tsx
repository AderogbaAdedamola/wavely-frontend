"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/providers/auth-provider";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && isAuthenticated) router.replace("/");
  }, [ready, isAuthenticated, router]);

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-10">
      <div
        className="console-grid pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      {children}
    </div>
  );
}
