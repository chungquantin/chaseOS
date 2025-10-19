import { BlogPosts } from "app/components/posts";
import { baseUrl } from "app/sitemap";

export const metadata = {
  title: "Blog",
  description:
    "Thoughts and insights on blockchain technology, Web3, decentralized systems, and the future of the digital realm. Explore my latest articles and research on Ethereum, Polkadot, smart contracts, and more.",
  keywords: [
    "blockchain blog",
    "Web3 articles",
    "Ethereum",
    "Polkadot",
    "cryptocurrency",
    "decentralized systems",
    "smart contracts",
    "DeFi",
    "technology blog",
    "blockchain research",
  ],
  openGraph: {
    title: "Blog | chungtin.eth",
    description:
      "Thoughts and insights on blockchain technology, Web3, and decentralized systems.",
    url: `${baseUrl}/blog`,
    siteName: "chungtin.eth",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og?title=${encodeURIComponent("Blog")}`,
        width: 1200,
        height: 630,
        alt: "Blog - chungtin.eth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog | chungtin.eth",
    description:
      "Thoughts and insights on blockchain technology, Web3, and decentralized systems.",
    creator: "@chungquantin",
    images: [`${baseUrl}/og?title=${encodeURIComponent("Blog")}`],
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
    types: {
      "application/rss+xml": `${baseUrl}/rss`,
    },
  },
};

export default function Page() {
  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">My Blog</h1>
      <BlogPosts onPostClick={() => {}} posts={[]} />
    </section>
  );
}
