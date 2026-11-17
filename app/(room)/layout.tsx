import type { ReactNode } from "react";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { RoomExperience } from "app/room/room-experience";

/**
 * The room is a shared layout for "/", "/blog" and "/blog/[slug]", so the 3D
 * scene stays mounted while the URL changes. Each page only adds what's
 * specific to it (an open book, crawlable copy) as children.
 */
export default function RoomLayout({ children }: { children: ReactNode }) {
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

  return <RoomExperience posts={posts}>{children}</RoomExperience>;
}
