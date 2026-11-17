import Link from "next/link";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { baseUrl } from "app/sitemap";

export const metadata = {
  title: "Writing",
  description:
    "Essays and technical notes from Tin Chung on blockchain infrastructure, protocol design, Ethereum, Polkadot, AI, and decentralized systems.",
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
    title: "Writing | chungquantin",
    description:
      "Essays and technical notes on blockchain infrastructure, protocol design, and decentralized systems.",
    url: `${baseUrl}/blog`,
    siteName: "chungquantin",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og?title=${encodeURIComponent("Writing")}`,
        width: 1200,
        height: 630,
        alt: "Writing - chungquantin",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Writing | chungquantin",
    description:
      "Essays and technical notes on blockchain infrastructure, protocol design, and decentralized systems.",
    creator: "@chungquantin",
    images: [`${baseUrl}/og?title=${encodeURIComponent("Writing")}`],
  },
  alternates: {
    canonical: `${baseUrl}/blog`,
    types: {
      "application/rss+xml": `${baseUrl}/rss`,
    },
  },
};

/** The bookshelf view opens automatically on /blog (see RoomExperience). */
export default function Page() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );

  return (
    <div className="sr-only">
      <h1>Writing</h1>
      <p>
        Notes on blockchain infrastructure, protocol design, developer
        education, open source engineering, and the small interface choices
        that make technical ideas legible.
      </p>
      <ul>
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`}>{post.metadata.title}</Link>{" "}
            ({formatDate(post.metadata.publishedAt)}): {post.metadata.summary}
          </li>
        ))}
      </ul>
    </div>
  );
}
