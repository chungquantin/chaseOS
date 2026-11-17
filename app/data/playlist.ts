/**
 * The room's music. Each YouTube entry plays in a small visible player in
 * the corner (YouTube's rules: the video must stay visible while it plays).
 *
 * To add a song: paste the 11-character id from the YouTube link
 * (youtube.com/watch?v=<id>) and give it a title and artist. Videos whose
 * owners turned off embedding won't play here.
 */
export type Track =
  | { kind: "youtube"; id: string; title: string; artist: string; live?: boolean }
  | { kind: "generative"; id: string; title: string; artist: string };

export const PLAYLIST: Track[] = [
  { kind: "youtube", id: "4xDzrJKXOOY", title: "synthwave radio", artist: "Lofi Girl", live: true },
  { kind: "youtube", id: "lTRiuFIWV54", title: "1 A.M Study Session", artist: "Lofi Girl" },
  { kind: "youtube", id: "7NOSDKb0HlU", title: "Chillhop radio", artist: "Chillhop Music", live: true },
  { kind: "youtube", id: "Dx5qFachd3A", title: "Relaxing jazz piano", artist: "Cafe Music BGM", live: true },
  { kind: "youtube", id: "MV_3Dpw-BRY", title: "Nightcall", artist: "Kavinsky" },
  { kind: "youtube", id: "dX3k_QDnzHE", title: "Midnight City", artist: "M83" },
  { kind: "youtube", id: "sOS9aOIXPEk", title: "Something About Us", artist: "Daft Punk" },
  { kind: "youtube", id: "xMV6l2y67rk", title: "Intro", artist: "The xx" },
  // works offline and without YouTube: synthesised live in the browser
  { kind: "generative", id: "lamplight", title: "Lamplight", artist: "Generative lo-fi" },
];

export const ytThumb = (id: string, size: "mq" | "hq" = "mq") => `https://i.ytimg.com/vi/${id}/${size}default.jpg`;

/** Pull a video id out of anything that looks like a YouTube link (or a bare id). */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s.startsWith("http") ? s : `https://${s}`);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    if (host === "youtu.be") return u.pathname.slice(1, 12) || null;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v");
      if (v) return v.slice(0, 11);
      const m = u.pathname.match(/\/(?:embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[1];
    }
  } catch {
    /* not a URL */
  }
  return null;
}
