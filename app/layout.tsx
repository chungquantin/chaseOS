import "./global.css";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { baseUrl } from "./sitemap";

// Display serif for names and titles in the room UI
const display = Fraunces({
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Tin Chung | chungquantin",
    template: "%s | chungquantin",
  },
  description:
    "Portfolio and writing from Tin Chung, the software engineer behind chungquantin. Currently building a perpetual exchange at Architect, with prior work across Rover, Polkadot, OpenGuild, ROGUE, blockchain infrastructure, Rust, and AI.",
  keywords: [
    "Tin Chung",
    "chungquantin",
    "builder",
    "researcher",
    "writer",
    "blockchain infrastructure",
    "Web3",
    "Ethereum",
    "Polkadot",
    "decentralized systems",
    "cryptocurrency",
    "smart contracts",
    "DeFi",
    "blockchain research",
    "software engineer",
    "Architect",
    "Rover",
    "Polkadot",
    "OpenGuild",
    "ROGUE",
    "Rust",
  ],
  authors: [{ name: "Tin Chung", url: baseUrl }],
  creator: "Tin Chung",
  publisher: "Tin Chung",
  openGraph: {
    title: "Tin Chung | chungquantin",
    description:
      "Software engineer at Architect, previously at Rover, Polkadot, OpenGuild, and ROGUE. Working across blockchain infrastructure, Rust, DevRel, and AI-adjacent systems.",
    url: baseUrl,
    siteName: "chungquantin",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og`,
        width: 1200,
        height: 630,
        alt: "Tin Chung - chungquantin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tin Chung | chungquantin",
    description:
      "Software engineer at Architect, previously at Rover, Polkadot, OpenGuild, and ROGUE. Working across blockchain infrastructure, Rust, DevRel, and AI-adjacent systems.",
    creator: "@chungquantin",
    images: [`${baseUrl}/og`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: baseUrl,
    types: {
      "application/rss+xml": `${baseUrl}/rss`,
    },
  },
  category: "technology",
  verification: {
    google: "your-google-verification-code", // Add your actual verification code
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const cx = (...classes) => classes.filter(Boolean).join(" ");

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cx(
        "text-black bg-white dark:text-white dark:bg-black",
        GeistSans.variable,
        GeistMono.variable,
        display.variable
      )}
    >
      <body className="min-h-screen antialiased">
        <main className="min-w-0">
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
