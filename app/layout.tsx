import "./global.css";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Navbar } from "./components/nav";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Footer from "./components/footer";
import { baseUrl } from "./sitemap";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Chung Quan Tin | Blockchain Developer & Researcher",
    template: "%s | chungtin.eth",
  },
  description:
    "Personal portfolio and blog of Chung Quan Tin (chungtin.eth) - researching and building on the decentralized digital realm. Exploring blockchain technology, Web3, and the future of decentralized systems.",
  keywords: [
    "Chung Quan Tin",
    "chungtin.eth",
    "blockchain developer",
    "Web3",
    "Ethereum",
    "Polkadot",
    "decentralized systems",
    "cryptocurrency",
    "smart contracts",
    "DeFi",
    "blockchain research",
    "software engineer",
  ],
  authors: [{ name: "Chung Quan Tin", url: baseUrl }],
  creator: "Chung Quan Tin",
  publisher: "Chung Quan Tin",
  openGraph: {
    title: "Chung Quan Tin | Blockchain Developer & Researcher",
    description:
      "Researching and building on the decentralized digital realm. Exploring blockchain technology, Web3, and the future of decentralized systems.",
    url: baseUrl,
    siteName: "chungtin.eth",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og`,
        width: 1200,
        height: 630,
        alt: "Chung Quan Tin - Blockchain Developer & Researcher",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Chung Quan Tin | Blockchain Developer & Researcher",
    description:
      "Researching and building on the decentralized digital realm. Exploring blockchain technology, Web3, and the future of decentralized systems.",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
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
        GeistMono.variable
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 lg:mx-auto">
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          {children}
          <Analytics />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
