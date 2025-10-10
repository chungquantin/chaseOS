import { getBlogPosts } from "app/blog/utils";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const recent = searchParams.get("recent") === "true";

  let posts = getBlogPosts();

  // Sort all posts by date (newest first)
  posts = posts.sort((a, b) => {
    const dateA = new Date(a.metadata.publishedAt);
    const dateB = new Date(b.metadata.publishedAt);
    return dateB.getTime() - dateA.getTime();
  });

  // Filter for recent posts (past 2 months) if requested
  if (recent) {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

    posts = posts.filter((post) => {
      const postDate = new Date(post.metadata.publishedAt);
      return postDate >= twoMonthsAgo;
    });
  }

  return NextResponse.json(posts);
}
