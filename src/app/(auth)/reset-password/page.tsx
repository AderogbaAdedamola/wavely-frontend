import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = {
  title: "Set a new password",
};

// The reset token arrives as a `?token=` query param in the emailed link. Read
// it on the server and hand it to the client form (no useSearchParams/Suspense).
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your operator account."
      footer={
        <>
          Changed your mind?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Back to sign in
          </Link>
        </>
      }
    >
      <ResetPasswordForm token={token ?? null} />
    </AuthCard>
  );
}
