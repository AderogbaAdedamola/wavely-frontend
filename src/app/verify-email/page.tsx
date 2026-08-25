import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export const metadata = {
  title: "Verify your email",
};

// Lives OUTSIDE the (auth) route group on purpose: a signed-in-but-unverified
// user clicks this emailed link while their session is live, and the (auth)
// layout redirects authenticated visitors to "/" — which would swallow the
// token before it's consumed. A self-contained centered shell keeps it public.
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="relative grid min-h-svh place-items-center overflow-hidden px-4 py-10">
      <div
        className="console-grid pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      />
      <AuthCard
        title="Verify your email"
        description="Confirming your address activates your console."
        footer={
          <>
            Back to{" "}
            <Link
              href="/login"
              className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
            >
              sign in
            </Link>
          </>
        }
      >
        <VerifyEmailForm token={token ?? null} />
      </AuthCard>
    </div>
  );
}
