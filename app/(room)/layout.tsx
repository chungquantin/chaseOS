import type { ReactNode } from "react";
import { preload } from "react-dom";
import { TEXTURE_FILES } from "app/room/scene/texture-files";
import { formatDate, getBlogPosts } from "app/blog/utils";
import { RoomExperience } from "app/room/room-experience";

/**
 * The room is a shared layout for "/", "/blog" and "/blog/[slug]", so the 3D
 * scene stays mounted while the URL changes. Each page only adds what's
 * specific to it (an open book, crawlable copy) as children.
 */
export default function RoomLayout({ children }: { children: ReactNode }) {
  // start the scene's textures downloading now, not after the 3D code arrives
  for (const href of Object.values(TEXTURE_FILES)) preload(href, { as: "image", fetchPriority: "low" });

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
