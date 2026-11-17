import Link from "next/link";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { chapters, cvSummary } from "app/data/career";
import { beliefs, profile } from "app/data/profile";

export default function Page() {
  const posts = getBlogPosts()
    .sort(
      (a, b) =>
        new Date(b.metadata.publishedAt).getTime() -
        new Date(a.metadata.publishedAt).getTime()
    )
    .map((post) => ({
      slug: post.slug,
      title: post.metadata.title,
      summary: post.metadata.summary,
      date: formatDate(post.metadata.publishedAt),
    }));

  return (
    <>
      {/* The room itself lives in app/(room)/layout.tsx. Crawlable, screen-reader copy of what the room contains. */}
      <div className="sr-only">
        <h1>
          {profile.name} ({profile.handle}): {profile.role}
        </h1>
        <p>{profile.headline}</p>
        <p>{cvSummary}</p>
        <h2>Experience</h2>
        {[...chapters].reverse().map((c) => (
          <section key={c.id}>
            <h3>
              <a href={c.href}>{c.company}</a>: {c.role}, {c.period}
            </h3>
            <p>{c.summary}</p>
            <ul>
              {c.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </section>
        ))}
        <h2>Working beliefs</h2>
        {beliefs.map((b) => (
          <p key={b.title}>
            {b.title}: {b.body}
          </p>
        ))}
        <h2>Writing</h2>
        <ul>
          {posts.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
