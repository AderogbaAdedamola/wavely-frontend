import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
});

// Absolute base for OG/canonical URLs. Set NEXT_PUBLIC_SITE_URL to the deployed
// origin in production; the localhost fallback keeps dev/build working.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const description =
  "Arm your WhatsApp bot, broadcast in waves, schedule sends, and tune its AI persona — all from one operator console.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Wavely — WhatsApp automation console",
    template: "%s — Wavely",
  },
  description,
  applicationName: "Wavely",
  keywords: [
    "WhatsApp automation",
    "WhatsApp bot",
    "WhatsApp broadcast",
    "bulk messaging",
    "scheduled messages",
    "WhatsApp console",
    "chatbot",
    "Wavely",
  ],
  authors: [{ name: "Wavely" }],
  creator: "Wavely",
  openGraph: {
    type: "website",
    siteName: "Wavely",
    title: "Wavely — WhatsApp automation console",
    description,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Wavely — WhatsApp automation console",
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
