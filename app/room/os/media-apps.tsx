"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Globe,
  Lock,
  Pause,
  Play,
  RotateCw,
  Search,
  SkipBack,
  SkipForward,
} from "lucide-react";
import { PLAYLIST, parseYouTubeId, ytThumb } from "app/data/playlist";
import { media, useMedia } from "../media";

/* =============================================================== Music */

export function MusicApp() {
  const index = useMedia((s) => s.index);
  const playing = useMedia((s) => s.playing);
  const track = PLAYLIST[index];
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(120%_90%_at_50%_0%,#1c1c1c,#0a0a0a)] text-[#fafafa] @min-[560px]:flex-row">
      <div className="flex shrink-0 flex-col items-center justify-center gap-4 p-6 @min-[560px]:w-[46%]">
        <div className="relative aspect-square w-full max-w-[220px] overflow-hidden rounded-[22px] shadow-[0_24px_60px_-20px_rgba(230,0,122,0.55)]">
          {track.kind === "youtube" ? (
            <img src={ytThumb(track.id, "hq")} alt="" className="size-full scale-[1.35] object-cover" />
          ) : (
            <div className="size-full bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#f0a04b_45%,#171717)]" />
          )}
        </div>
        <div className="w-full text-center">
          <p className="font-display truncate text-[22px] leading-tight">{track.title}</p>
          <p className="truncate text-[13px] opacity-65">{track.artist}</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={media.prev} aria-label="Previous song" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
            <SkipBack size={18} />
          </button>
          <button onClick={media.toggle} aria-label={playing ? "Pause" : "Play"} className="lamp-btn size-12 justify-center p-0">
            {playing ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={media.next} aria-label="Next song" className="grid size-10 place-items-center rounded-full hover:bg-white/10">
            <SkipForward size={18} />
          </button>
        </div>
        <p className="text-center text-[11.5px] opacity-50">The video plays in the corner of the room.</p>
      </div>
      <ul className="min-h-0 flex-1 overflow-y-auto border-white/10 p-2 @min-[560px]:border-l">
        {PLAYLIST.map((t, i) => (
          <li key={t.id}>
            <button
              onClick={() => media.select(i)}
              aria-current={i === index}
              className={`flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/[0.07] ${i === index ? "bg-white/10" : ""}`}
            >
              <span className="w-5 shrink-0 text-center text-[12px] tabular-nums opacity-50">{i + 1}</span>
              {t.kind === "youtube" ? (
                <img src={ytThumb(t.id)} alt="" loading="lazy" className="aspect-video w-16 shrink-0 rounded-md object-cover" />
              ) : (
                <span className="aspect-video w-16 shrink-0 rounded-md bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#f0a04b_45%,#171717)]" />
              )}
              <span className="min-w-0">
                <span className={`block truncate text-[13.5px] font-medium ${i === index ? "text-[#ffc27d]" : ""}`}>{t.title}</span>
                <span className="block truncate text-[12px] opacity-60">
                  {t.artist}
                  {t.kind === "youtube" && t.live ? ", live" : ""}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================================================= YouTube */

type Video = { id: string; title: string; channel: string; live?: boolean };

const HOME: Video[] = PLAYLIST.filter((t) => t.kind === "youtube").map((t) => ({
  id: t.id,
  title: t.title,
  channel: t.artist,
  live: t.kind === "youtube" ? t.live : false,
}));

function VideoCard({ v, onPlay }: { v: Video; onPlay: () => void }) {
  return (
    <button onClick={onPlay} className="group text-left">
      <span className="relative block aspect-video overflow-hidden rounded-xl bg-black/40">
        <img src={ytThumb(v.id)} alt="" loading="lazy" className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        {v.live && <span className="absolute bottom-1.5 left-1.5 rounded bg-[#f0a04b] px-1.5 py-px text-[10.5px] font-semibold text-[#1a1206]">LIVE</span>}
      </span>
      <span className="mt-2 block text-[13px] font-medium leading-snug text-[#f1f1f1]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {v.title}
      </span>
      <span className="block truncate text-[12px] text-[#aaa]">{v.channel}</span>
    </button>
  );
}

export function YouTubeApp() {
  const [query, setQuery] = useState("");
  const [watching, setWatching] = useState<Video | null>(null);
  const [results, setResults] = useState<Video[] | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const watch = (v: Video) => {
    // one soundtrack at a time
    if (media.get().playing) media.pause();
    setWatching(v);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const id = parseYouTubeId(q);
    if (id) {
      watch({ id, title: "YouTube video", channel: "" });
      return;
    }
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(q)}`);
      if (res.status === 501) {
        setNote("Search isn’t switched on for this computer. Paste a YouTube link instead, or pick something below.");
        setResults(null);
      } else if (!res.ok) {
        setNote("YouTube didn’t answer. Try again in a moment.");
      } else {
        const d = (await res.json()) as { items: Video[] };
        setResults(d.items);
        if (d.items.length === 0) setNote(`Nothing found for “${q}”.`);
      }
    } catch {
      setNote("YouTube didn’t answer. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  const list = results ?? HOME;

  return (
    <div className="flex h-full flex-col bg-[#0a0a0a] text-white">
      <form onSubmit={submit} className="flex shrink-0 items-center gap-3 border-b border-white/10 px-4 py-2.5">
        <button
          type="button"
          onClick={() => {
            setWatching(null);
            setResults(null);
            setNote(null);
          }}
          className="flex shrink-0 items-center gap-1.5"
          aria-label="YouTube home"
        >
          <svg viewBox="0 0 28 20" className="h-[18px] w-auto" aria-hidden>
            <rect width="28" height="20" rx="5" fill="#f0a04b" />
            <path d="M11 6v8l7-4-7-4Z" fill="#0a0a0a" />
          </svg>
          <span className="hidden text-[15px] font-semibold tracking-tight @min-[420px]:inline">YouTube</span>
        </button>
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-white/15 bg-[#121212] px-3.5 py-1.5 focus-within:border-[#f0a04b]">
          <Search size={15} className="shrink-0 opacity-60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search, or paste a YouTube link"
            aria-label="Search YouTube or paste a link"
            className="min-w-0 flex-1 bg-transparent text-[13.5px] outline-none placeholder:text-white/40"
            style={{ outline: "none" }}
          />
          {busy && <RotateCw size={13} className="animate-spin opacity-60" />}
        </label>
      </form>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {watching && (
          <div className="p-3 @min-[640px]:p-5">
            <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
              <iframe
                key={watching.id}
                src={`https://www.youtube-nocookie.com/embed/${watching.id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                title={watching.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="size-full border-0"
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[16px] font-semibold leading-snug">{watching.title}</p>
                {watching.channel && <p className="text-[13px] text-[#aaa]">{watching.channel}</p>}
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${watching.id}`}
                target="_blank"
                rel="noreferrer"
                className="flex shrink-0 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[12.5px] hover:bg-white/15"
              >
                Open on YouTube <ArrowUpRight size={13} />
              </a>
            </div>
          </div>
        )}
        {note && <p className="px-4 pt-4 text-[13px] text-[#aaa]">{note}</p>}
        <p className="px-4 pb-1 pt-4 text-[15px] font-semibold">{results ? "Results" : watching ? "Up next" : "From the room’s playlist"}</p>
        <div className="grid grid-cols-1 gap-x-3 gap-y-5 p-4 pt-2 @min-[460px]:grid-cols-2 @min-[780px]:grid-cols-3">
          {list
            .filter((v) => v.id !== watching?.id)
            .map((v) => (
              <VideoCard key={v.id} v={v} onPlay={() => watch(v)} />
            ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================= Browser */

type Bookmark = { title: string; url: string; color: string; letter: string };

const BOOKMARKS: Bookmark[] = [
  { title: "Wikipedia", url: "https://en.m.wikipedia.org/wiki/Special:Random", color: "#171717", letter: "W" },
  { title: "Hacker News", url: "https://news.ycombinator.com/", color: "#f0a04b", letter: "Y" },
  { title: "The Rust Book", url: "https://doc.rust-lang.org/book/", color: "#a65f0c", letter: "R" },
  { title: "docs.rs", url: "https://docs.rs", color: "#262626", letter: "D" },
  { title: "Polkadot", url: "https://polkadot.com", color: "#f0a04b", letter: "P" },
  { title: "AI Keeper", url: "https://chungquantin.github.io/ai-keeper/", color: "#262626", letter: "A" },
  { title: "React", url: "https://react.dev", color: "#404040", letter: "R" },
  { title: "Map", url: "https://www.openstreetmap.org/export/embed.html?bbox=-40,-45,170,70&layer=mapnik", color: "#737373", letter: "M" },
];

/** Typed text → a URL: real URLs as-is, everything else becomes a Wikipedia search. */
function toUrl(input: string) {
  const s = input.trim();
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(s)) return `https://${s}`;
  return `https://en.m.wikipedia.org/w/index.php?search=${encodeURIComponent(s)}`;
}

type Page = { url: string; state: "checking" | "ok" | "blocked" | "error" };

export function BrowserApp() {
  const [history, setHistory] = useState<string[]>([]);
  const [pos, setPos] = useState(-1);
  const [page, setPage] = useState<Page | null>(null);
  const [field, setField] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const current = pos >= 0 ? history[pos] : null;

  // check each page can be framed before showing it
  useEffect(() => {
    if (!current) {
      setPage(null);
      return;
    }
    setField(current);
    let alive = true;
    setPage({ url: current, state: "checking" });
    fetch(`/api/frame-check?url=${encodeURIComponent(current)}`)
      .then((r) => r.json())
      .then((d: { embeddable: boolean; reason?: string; finalUrl?: string }) => {
        if (!alive) return;
        if (d.embeddable) setPage({ url: d.finalUrl ?? current, state: "ok" });
        else setPage({ url: current, state: d.reason === "unreachable" || d.reason === "invalid" ? "error" : "blocked" });
      })
      .catch(() => alive && setPage({ url: current, state: "ok" })); // checker unavailable: just try
    return () => {
      alive = false;
    };
  }, [current, reloadKey]);

  const go = (raw: string) => {
    const url = toUrl(raw);
    setHistory((h) => [...h.slice(0, pos + 1), url]);
    setPos((p) => p + 1);
  };

  let host = "";
  try {
    host = current ? new URL(current).hostname.replace(/^www\./, "") : "";
  } catch {}

  return (
    <div className="flex h-full flex-col bg-white text-[#0a0a0a]">
      {/* toolbar */}
      <div className="flex shrink-0 items-center gap-1 border-b border-black/[0.08] bg-[#f2f2f2] px-2 py-1.5">
        <button onClick={() => setPos((p) => p - 1)} disabled={pos < 0} aria-label="Back" className="grid size-7 place-items-center rounded-md hover:bg-black/5 disabled:opacity-30">
          <ArrowLeft size={15} />
        </button>
        <button onClick={() => setPos((p) => p + 1)} disabled={pos >= history.length - 1} aria-label="Forward" className="grid size-7 place-items-center rounded-md hover:bg-black/5 disabled:opacity-30">
          <ArrowRight size={15} />
        </button>
        <button onClick={() => setReloadKey((k) => k + 1)} disabled={!current} aria-label="Reload" className="grid size-7 place-items-center rounded-md hover:bg-black/5 disabled:opacity-30">
          <RotateCw size={14} />
        </button>
        <form
          className="mx-1 flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-white px-3 py-1 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.08)] focus-within:shadow-[inset_0_0_0_2px_#f0a04b]"
          onSubmit={(e) => {
            e.preventDefault();
            if (field.trim()) go(field);
            input.current?.blur();
          }}
        >
          {current?.startsWith("https") ? <Lock size={12} className="shrink-0 opacity-50" /> : <Search size={12} className="shrink-0 opacity-50" />}
          <input
            ref={input}
            value={field}
            onChange={(e) => setField(e.target.value)}
            onFocus={(e) => e.target.select()}
            placeholder="Search Wikipedia or type a web address"
            aria-label="Address"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[13px] outline-none"
            style={{ outline: "none" }}
          />
        </form>
        {current && (
          <a href={current} target="_blank" rel="noreferrer" aria-label="Open in a new tab" className="grid size-7 place-items-center rounded-md hover:bg-black/5">
            <ArrowUpRight size={15} />
          </a>
        )}
      </div>

      {/* page */}
      <div className="relative min-h-0 flex-1">
        {!page && (
          <div className="h-full overflow-y-auto bg-[radial-gradient(120%_80%_at_50%_0%,#fff7ea,#ffffff_60%)] px-6 py-10">
            <p className="font-display text-center text-[30px]">Where to?</p>
            <p className="mt-1 text-center text-[13px] text-[#737373]">Search Wikipedia from the address bar, or open a bookmark.</p>
            <div className="mx-auto mt-8 grid max-w-[560px] grid-cols-3 gap-4 @min-[520px]:grid-cols-4">
              {BOOKMARKS.map((b) => (
                <button key={b.title} onClick={() => go(b.url)} className="group flex flex-col items-center gap-2 rounded-2xl p-2 hover:bg-black/[0.04]">
                  <span className="font-display grid size-14 place-items-center rounded-2xl text-[22px] text-white shadow-[0_8px_18px_-10px_rgba(0,0,0,0.5)]" style={{ background: b.color }}>
                    {b.letter}
                  </span>
                  <span className="text-center text-[12.5px] leading-tight">{b.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        {page?.state === "checking" && (
          <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden bg-[#f0a04b]/20">
            <div className="h-full w-1/3 animate-[browser-load_1s_ease-in-out_infinite] bg-[#f0a04b]" />
          </div>
        )}
        {page?.state === "ok" && (
          <iframe
            key={`${page.url}#${reloadKey}`}
            src={page.url}
            title={host}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            referrerPolicy="no-referrer"
            className="size-full border-0 bg-white"
          />
        )}
        {(page?.state === "blocked" || page?.state === "error") && (
          <div className="grid h-full place-items-center p-8 text-center">
            <div className="max-w-[380px]">
              <Globe size={34} className="mx-auto opacity-30" />
              <p className="font-display mt-4 text-[22px]">{page.state === "blocked" ? `${host} can’t open in here` : `Couldn’t reach ${host || "that page"}`}</p>
              <p className="mt-2 text-[13.5px] leading-6 text-[#737373]">
                {page.state === "blocked"
                  ? "This site doesn’t allow other pages to show it inside a frame. You can still open it in a real tab."
                  : "Check the address and try again, or open it in a real tab."}
              </p>
              <a href={page.url} target="_blank" rel="noreferrer" className="lamp-btn mt-5 px-4 py-2 text-[13px]">
                Open {host || "page"} in a new tab <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
