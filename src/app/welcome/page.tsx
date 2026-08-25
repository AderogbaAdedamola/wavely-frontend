import type { Metadata } from "next";

import { LandingNav } from "@/components/landing/landing-nav";
import { Hero } from "@/components/landing/hero";
import { Capabilities } from "@/components/landing/capabilities";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ConsolePreview } from "@/components/landing/console-preview";
import { FinalCta } from "@/components/landing/final-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

const description =
  "Wavely is the operator console for your WhatsApp bot. Link a line, arm automated replies, and dispatch broadcasts and scheduled sends from one signal desk.";

// Only override title/description/canonical here. Leaving openGraph/twitter to
// inherit from the root layout keeps the file-based OG card image and the
// summary_large_image card — Next merges these objects shallowly, so redefining
// them here would drop the image and downgrade the Twitter card.
export const metadata: Metadata = {
  // Renders as "Run WhatsApp from one console — Wavely" via the root template.
  title: "Run WhatsApp from one console",
  description,
  alternates: { canonical: "/welcome" },
};

export default function WelcomePage() {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <Capabilities />
        <HowItWorks />
        <ConsolePreview />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}
