import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { CredentialsForm } from "@/components/auth/credentials-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Sign in to the console"
      description="Enter your operator credentials to open the dispatch console."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Create one
          </Link>
        </>
      }
    >
      <CredentialsForm mode="login" />
    </AuthCard>
  );
}
