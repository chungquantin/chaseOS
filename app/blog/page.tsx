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

export default function Page() {
  const posts = getBlogPosts().sort(
    (a, b) =>
      new Date(b.metadata.publishedAt).getTime() -
      new Date(a.metadata.publishedAt).getTime()
  );

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <section className="editorial-shell mx-auto min-h-screen w-full max-w-[720px] px-5 py-5 sm:px-6">
        <header className="flex items-center justify-between text-[15px] leading-6">
          <Link href="/" className="font-medium text-[#171717]">
            chungquantin
          </Link>
          <nav className="flex items-center gap-4 text-[#77756f]">
            <Link className="portfolio-link" href="/">
              Home
            </Link>
            <a
              className="portfolio-link"
              href="https://www.linkedin.com/in/chungquantin/"
            >
              LinkedIn
            </a>
          </nav>
        </header>

        <div className="pt-28 sm:pt-36">
          <p className="text-[15px] text-[#8a8985]">{posts.length} notes</p>
          <h1 className="editorial-page-title mt-8 max-w-[650px] text-[38px] font-medium leading-[1.06] tracking-normal text-[#171717] sm:text-[56px] sm:leading-[1.02]">
            Writing about systems that are easier to build than explain.
          </h1>
          <p className="mt-10 max-w-[620px] text-[18px] leading-8 text-[#3d3c38] sm:text-[20px] sm:leading-9">
            Notes on blockchain infrastructure, protocol design, developer
            education, open source engineering, and the small interface choices
            that make technical ideas legible.
          </p>
        </div>

        <div className="mt-24 grid gap-5 border-t border-dashed border-[#d8d5cd] pt-9 sm:mt-32">
          {posts.map((post, index) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="editorial-work-row group grid grid-cols-[36px_minmax(0,1fr)] gap-5 py-3"
            >
              <span className="font-mono text-[13px] text-[#aaa8a1]">
                {index}
              </span>
              <span>
                <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-[20px] font-medium leading-6 text-[#171717]">
                    {post.metadata.title}
                  </span>
                  <span className="text-[14px] text-[#77756f]">
                    {formatDate(post.metadata.publishedAt)}
                  </span>
                </span>
                <span className="mt-1 block text-[15px] leading-6 text-[#77756f]">
                  {post.metadata.summary}
                </span>
              </span>
            </Link>
          ))}
        </div>

        <footer className="flex items-center justify-between pb-6 pt-24 text-[15px] text-[#8a8985]">
          <span>chungquantin.com/writing</span>
          <Link className="portfolio-link" href="/rss">
            RSS
          </Link>
        </footer>
      </section>
    </main>
  );
}
