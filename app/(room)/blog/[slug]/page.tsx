import { notFound } from "next/navigation";
import { BookReader } from "app/room/panels/book-reader";
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
    <>
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
      {/* key: remount (back to page 1) when moving between posts */}
      <BookReader
        key={post.slug}
        title={post.metadata.title}
        summary={post.metadata.summary}
        date={formatDate(post.metadata.publishedAt)}
      >
        <CustomMDX source={post.content} />
      </BookReader>
    </>
  );
}
