import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { CredentialsForm } from "@/components/auth/credentials-form";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create an operator account"
      description="Set up credentials to run your own WhatsApp line from the console."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </>
      }
    >
      <CredentialsForm mode="register" />
    </AuthCard>
  );
}
