import "./global.css";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Kalam, Permanent_Marker } from "next/font/google";
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

// Notebook ink: a steady felt-tip print for the body of the ID card
const notebookBody = Kalam({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-notebook",
  display: "swap",
});

// Notebook marker: thick Sharpie for titles and section headings
const notebookMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-marker",
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
        display.variable,
        notebookBody.variable,
        notebookMarker.variable
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
