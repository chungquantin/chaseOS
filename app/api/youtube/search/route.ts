import { NextResponse } from "next/server";

/**
 * YouTube search for the computer's YouTube app. Needs YOUTUBE_API_KEY
 * (a YouTube Data API v3 key); without it the app still plays curated
 * videos and pasted links, and this returns 501.
 */
export async function GET(req: Request) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return NextResponse.json({ error: "search_disabled" }, { status: 501 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 100);
  if (!q) return NextResponse.json({ items: [] });

  const api = new URL("https://www.googleapis.com/youtube/v3/search");
  api.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    safeSearch: "moderate",
    maxResults: "18",
    q,
    key,
  }).toString();

  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(6000), next: { revalidate: 3600 } });
    if (!res.ok) return NextResponse.json({ error: "upstream", status: res.status }, { status: 502 });
    const data = (await res.json()) as {
      items?: { id: { videoId: string }; snippet: { title: string; channelTitle: string; liveBroadcastContent: string } }[];
    };
    const items = (data.items ?? []).map((it) => ({
      id: it.id.videoId,
      title: it.snippet.title,
      channel: it.snippet.channelTitle,
      live: it.snippet.liveBroadcastContent === "live",
    }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "unreachable" }, { status: 502 });
  }
}
