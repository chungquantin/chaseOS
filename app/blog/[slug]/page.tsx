import { notFound } from "next/navigation";
import Link from "next/link";
import { CustomMDX } from "app/components/mdx";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { baseUrl } from "app/sitemap";

export async function generateStaticParams() {
  let posts = getBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    keywords: [
      "blockchain",
      "Web3",
      "Ethereum",
      "cryptocurrency",
      "decentralized",
      "smart contracts",
      "DeFi",
      "technology",
      "programming",
      post.slug,
    ],
    authors: [{ name: "Tin Chung", url: baseUrl }],
    creator: "Tin Chung",
    publisher: "Tin Chung",
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime,
      url: `${baseUrl}/blog/${post.slug}`,
      siteName: "chungquantin",
      locale: "en_US",
      authors: ["Tin Chung"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@chungquantin",
      images: [ogImage],
    },
    alternates: {
      canonical: `${baseUrl}/blog/${post.slug}`,
    },
  };
}

export default function Blog({ params }) {
  let post = getBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-[#171717]">
      <section className="editorial-shell mx-auto min-h-screen w-full max-w-[720px] px-5 py-5 sm:px-6">
        <header className="flex items-center justify-between text-[15px] leading-6">
          <Link href="/" className="font-medium text-[#171717]">
            chungquantin
          </Link>
          <nav className="flex items-center gap-4 text-[#77756f]">
            <Link className="portfolio-link" href="/blog">
              Writing
            </Link>
            <a
              className="portfolio-link"
              href="https://www.linkedin.com/in/chungquantin/"
            >
              LinkedIn
            </a>
          </nav>
        </header>

        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              headline: post.metadata.title,
              datePublished: post.metadata.publishedAt,
              dateModified: post.metadata.publishedAt,
              description: post.metadata.summary,
              image: post.metadata.image
                ? `${baseUrl}${post.metadata.image}`
                : `/og?title=${encodeURIComponent(post.metadata.title)}`,
              url: `${baseUrl}/blog/${post.slug}`,
              author: {
                "@type": "Person",
                name: "Tin Chung",
              },
            }),
          }}
        />

        <div className="pt-28 sm:pt-36">
          <Link className="portfolio-link text-[15px] text-[#8a8985]" href="/blog">
            Writing
          </Link>
          <h1 className="editorial-page-title mt-8 max-w-[650px] text-[38px] font-medium leading-[1.06] tracking-normal text-[#171717] sm:text-[56px] sm:leading-[1.02]">
            {post.metadata.title}
          </h1>
          <p className="mt-8 max-w-[620px] text-[18px] leading-8 text-[#3d3c38]">
            {post.metadata.summary}
          </p>
          <p className="mt-6 text-[15px] text-[#8a8985]">
            {formatDate(post.metadata.publishedAt)}
          </p>
        </div>

        <article className="portfolio-prose prose mt-20 max-w-none border-t border-dashed border-[#d8d5cd] pt-10 sm:mt-24">
          <CustomMDX source={post.content} />
        </article>

        <footer className="flex items-center justify-between pb-6 pt-24 text-[15px] text-[#8a8985]">
          <span>chungquantin.com</span>
          <Link className="portfolio-link" href="/blog">
            All writing
          </Link>
        </footer>
      </section>
    </main>
  );
}
