"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import {
  AppWindow,
  BookOpen,
  CandlestickChart,
  Compass,
  FileText,
  Music2,
  Newspaper,
  RefreshCw,
  SquareTerminal,
  UserRound,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import { BUILT_APPS } from "app/data/apps";
import { chapters } from "app/data/career";
import { idCard, mascot, profile } from "app/data/profile";
import { MarketsTerminal } from "../panels/markets-panel";
import type { PostSummary } from "../panels/writing-panel";
import { media } from "../media";
import { PLAYLIST } from "app/data/playlist";
import { BrowserApp, MusicApp, YouTubeApp } from "./media-apps";
import { room } from "../store";
import { MyApps } from "./my-apps";

export type AppId = "readme" | "about" | "apps" | "stories" | "browser" | "youtube" | "news" | "markets" | "terminal" | "music";

export type AppProps = {
  posts: PostSummary[];
  /** what to show when opened from elsewhere, e.g. a specific app in "My apps" */
  arg?: string;
  open: (id: AppId) => void;
  closeSelf: () => void;
};

export type AppDef = {
  id: AppId;
  name: string;
  Icon: LucideIcon;
  /** icon tile gradient */
  tint: [string, string];
  /** default window size */
  size: [number, number];
  dark?: boolean;
  Component: ComponentType<AppProps>;
};

/* ------------------------------------------------------------- Read me */

function ReadMe({ open }: AppProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#ffffff] px-5 py-6 text-[#171717] @min-[480px]:px-7">
      <h1 className="font-display text-[30px] leading-tight">Hi, I’m Tin.</h1>
      <p className="mt-3 max-w-[54ch] text-[15px] leading-7">
        This is the computer on my desk. I’m a software engineer working across blockchain infrastructure, AI
        inference, and go-to-market for developer products. Everything here is real work.
      </p>
      <p className="mt-4 text-[15px] leading-7">A few places to start:</p>
      <div className="mt-3 grid gap-2 @min-[440px]:grid-cols-2">
        {(
          [
            ["about", "About me", "Who I am, in one window"],
            ["apps", "My apps", "Liquid Inference, AX, AI Keeper and more"],
            ["stories", "Stories", "Essays on chains, data and infra"],
            ["terminal", "Terminal", "Type help and poke around"],
          ] as const
        ).map(([id, title, line]) => (
          <button
            key={id}
            onClick={() => open(id)}
            className="rounded-xl border border-black/[0.08] bg-white px-4 py-3 text-left transition-colors hover:border-[#f0a04b] hover:bg-[#fff7ea]"
          >
            <span className="font-display block text-[17px]">{title}</span>
            <span className="text-[13px] text-[#737373]">{line}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* --------------------------------------------------------------- About */

function About({ closeSelf }: AppProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#fafafa] text-[#0a0a0a]">
      <div className="relative h-28 bg-[radial-gradient(120%_140%_at_20%_0%,#ffc27d_0%,#f0a04b_40%,#0a0a0a_100%)]" />
      <div className="-mt-12 px-5 pb-7 @min-[520px]:px-7">
        <img src={mascot.fist} alt={idCard.name} className="relative size-24 rounded-[28px] border-4 border-[#fafafa] object-cover shadow-md" />
        <h1 className="font-display mt-3 text-[32px] leading-none">{idCard.name}</h1>
        <p className="mt-1.5 text-[14px] text-[#525252]">
          {idCard.title}, @{profile.handle}
        </p>
        <p className="mt-4 max-w-[60ch] text-[15px] leading-7 text-[#404040]">{profile.headline}</p>
        <div className="mt-5 grid gap-2.5 @min-[600px]:grid-cols-3">
          {idCard.pillars.map((p) => (
            <div key={p.key} className="rounded-2xl border border-black/[0.07] bg-white p-4">
              <span className="block h-1 w-8 rounded-full" style={{ background: p.color }} />
              <p className="font-display mt-2.5 text-[18px]">{p.label}</p>
              <p className="mt-1 text-[13px] leading-5 text-[#525252]">{p.line}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2.5 @min-[600px]:grid-cols-4">
          {idCard.stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-[#f2f2f2] px-4 py-3">
              <p className="font-display text-[26px] leading-none text-[#a65f0c]">{s.value}</p>
              <p className="mt-1 text-[12px] text-[#737373]">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              closeSelf();
              room.use("jobs");
            }}
            className="lamp-btn px-4 py-2 text-[13px]"
          >
            Look through my past jobs
          </button>
          {[
            ["LinkedIn", profile.links.linkedin],
            ["GitHub", profile.links.github],
            ["X", profile.links.x],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-3.5 py-2 text-[13px] hover:border-[#f0a04b]">
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Stories */

function Stories({ posts }: AppProps) {
  return (
    <div className="h-full overflow-y-auto bg-[#ffffff] text-[#0a0a0a]">
      <ul className="divide-y divide-black/[0.06]">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} scroll={false} className="group block px-6 py-4 hover:bg-[#fff7ea]">
              <p className="text-[12.5px] text-[#a3a3a3]">{p.date}</p>
              <p className="font-display mt-0.5 text-[20px] leading-snug group-hover:text-[#a65f0c]">{p.title}</p>
              {p.summary && (
                <p className="mt-1 text-[13.5px] leading-6 text-[#525252]" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                  {p.summary}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------------------------------------------------------- News */

type Story = { objectID: string; title: string; url: string | null; points: number; num_comments: number; author: string };

function News(_: AppProps) {
  const [state, setState] = useState<{ status: "loading" | "ready" | "error"; items: Story[] }>({ status: "loading", items: [] });
  const load = () => {
    setState((s) => ({ ...s, status: "loading" }));
    fetch("https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=30")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setState({ status: "ready", items: d.hits ?? [] }))
      .catch(() => setState({ status: "error", items: [] }));
  };
  useEffect(load, []);
  return (
    <div className="flex h-full flex-col bg-[#fafafa] text-[#0a0a0a]">
      <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-2.5">
        <p className="text-[13px] text-[#737373]">What engineers are reading right now, from the Hacker News front page.</p>
        <button onClick={load} aria-label="Refresh" className="grid size-7 place-items-center rounded-full hover:bg-black/5">
          <RefreshCw size={14} className={state.status === "loading" ? "animate-spin" : ""} />
        </button>
      </div>
      <ol className="min-h-0 flex-1 overflow-y-auto">
        {state.items.map((s, i) => {
          const href = s.url ?? `https://news.ycombinator.com/item?id=${s.objectID}`;
          let host = "news.ycombinator.com";
          try {
            host = new URL(href).hostname.replace("www.", "");
          } catch {}
          return (
            <li key={s.objectID} className="grid grid-cols-[28px_minmax(0,1fr)] gap-1 border-b border-black/[0.04] px-5 py-3">
              <span className="pt-0.5 text-[13px] tabular-nums text-[#d4d4d4]">{i + 1}</span>
              <span>
                <a href={href} target="_blank" rel="noreferrer" className="text-[14.5px] font-medium leading-snug hover:text-[#a65f0c]">
                  {s.title}
                </a>
                <span className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] text-[#a3a3a3]">
                  <span>{host}</span>
                  <span>{s.points} points</span>
                  <a href={`https://news.ycombinator.com/item?id=${s.objectID}`} target="_blank" rel="noreferrer" className="hover:text-[#737373]">
                    {s.num_comments} comments
                  </a>
                </span>
              </span>
            </li>
          );
        })}
        {state.status === "error" && <li className="px-5 py-8 text-[13px] text-[#a3a3a3]">Couldn’t reach Hacker News. Press refresh to try again.</li>}
        {state.status === "loading" && state.items.length === 0 && <li className="px-5 py-8 text-[13px] text-[#a3a3a3]">Fetching the front page…</li>}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------- Markets */

function Markets(_: AppProps) {
  return <MarketsTerminal />;
}

/* ------------------------------------------------------------ Terminal */

type Line = { kind: "in" | "out"; text: string };

const NEOFETCH = (posts: number) => [
  "   _______      tin@room",
  "  /       \\     --------",
  " /  T  C   \\    OS: RoomOS 1.0",
  " \\_________/    Shell: lamplight-sh",
  "     | |        Jobs: " + chapters.length + "  Posts: " + posts,
  "    _|_|_       Focus: " + idCard.pillars.map((p) => p.label).join(", "),
];

function Terminal({ posts, open }: AppProps) {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: "RoomOS lamplight-sh. Type help to see what you can do." },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIndex, setHIndex] = useState(-1);
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [lines]);

  const run = (raw: string) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const out: string[] = [];
    switch ((cmd ?? "").toLowerCase()) {
      case "":
        break;
      case "help":
        out.push(
          "whoami      who is this",
          "jobs        every role, newest first",
          "posts       what I’ve written",
          "apps        things I’ve built",
          "open <app>  about, apps, stories, browser, youtube, news, markets, music",
          "neofetch    system info",
          "music       play or pause the room music",
          "next        skip to the next song",
          "date        today",
          "clear       clean the screen"
        );
        break;
      case "whoami":
        out.push(`${idCard.name}, ${idCard.title}.`, profile.headline);
        break;
      case "jobs":
        [...chapters].reverse().forEach((c) => out.push(`${c.period.padEnd(20)} ${c.company} · ${c.role}`));
        break;
      case "posts":
      case "ls":
        posts.forEach((p) => out.push(`${p.date.padEnd(20)} ${p.title}`));
        break;
      case "open": {
        const id = (args[0] ?? "").toLowerCase() as AppId;
        if (APPS.some((a) => a.id === id)) {
          open(id);
          out.push(`opening ${id}…`);
        } else out.push("open what? try: open about");
        break;
      }
      case "apps":
        BUILT_APPS.forEach((a) => out.push(`${a.name.padEnd(18)} ${a.host}`));
        out.push("type: open apps");
        break;
      case "neofetch":
        out.push(...NEOFETCH(posts.length));
        break;
      case "music": {
        const was = media.get().playing;
        media.toggle();
        out.push(was ? "music paused" : `playing: ${PLAYLIST[media.get().index].title}, ${PLAYLIST[media.get().index].artist}`);
        break;
      }
      case "next":
        media.next();
        out.push(`playing: ${PLAYLIST[media.get().index].title}, ${PLAYLIST[media.get().index].artist}`);
        break;
      case "date":
        out.push(new Date().toString());
        break;
      case "sudo":
        out.push("nice try.");
        break;
      case "clear":
        setLines([]);
        return;
      default:
        out.push(`${cmd}: command not found. Type help.`);
    }
    setLines((l) => [...l, { kind: "in", text: raw }, ...out.map((text) => ({ kind: "out" as const, text }))]);
  };

  return (
    <div
      className="h-full overflow-y-auto bg-[#0a0a0a] px-4 py-3 font-mono text-[13px] leading-6 text-[#e5e5e5]"
      onClick={() => input.current?.focus()}
    >
      {lines.map((l, i) =>
        l.kind === "in" ? (
          <p key={i}>
            <span className="text-[#ffc27d]">tin@room</span> <span className="text-[#8a8a8a]">~ %</span> {l.text}
          </p>
        ) : (
          <p key={i} className="whitespace-pre-wrap text-[#a3a3a3]">
            {l.text}
          </p>
        )
      )}
      <form
        className="flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(value);
          if (value.trim()) setHistory((h) => [value, ...h]);
          setHIndex(-1);
          setValue("");
        }}
      >
        <span className="text-[#ffc27d]">tin@room</span> <span className="text-[#8a8a8a]">~ %</span>
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              const n = Math.min(history.length - 1, hIndex + 1);
              if (n >= 0) {
                setHIndex(n);
                setValue(history[n]);
              }
              e.preventDefault();
            } else if (e.key === "ArrowDown") {
              const n = hIndex - 1;
              setHIndex(n);
              setValue(n >= 0 ? history[n] : "");
              e.preventDefault();
            }
          }}
          autoFocus
          spellCheck={false}
          aria-label="Terminal command"
          className="min-w-0 flex-1 bg-transparent caret-[#ffc27d] outline-none"
          style={{ outline: "none", boxShadow: "none" }}
        />
      </form>
      <div ref={end} />
    </div>
  );
}

/* ------------------------------------------------------------ registry */

function MyAppsWindow({ arg }: AppProps) {
  return <MyApps arg={arg} />;
}

export const APPS: AppDef[] = [
  { id: "readme", name: "Read me", Icon: FileText, tint: ["#ffe3b8", "#f0a04b"], size: [580, 500], Component: ReadMe },
  { id: "about", name: "About me", Icon: UserRound, tint: ["#ffc27d", "#f0a04b"], size: [720, 600], Component: About },
  { id: "apps", name: "My apps", Icon: AppWindow, tint: ["#7a7a7a", "#262626"], size: [860, 660], Component: MyAppsWindow },
  { id: "stories", name: "Stories", Icon: BookOpen, tint: ["#ffd9a6", "#c9852f"], size: [560, 600], Component: Stories },
  { id: "browser", name: "Browser", Icon: Compass, tint: ["#6b6b6b", "#222222"], size: [980, 680], Component: () => <BrowserApp /> },
  { id: "youtube", name: "YouTube", Icon: Youtube, tint: ["#5a5a5a", "#1a1a1a"], size: [940, 680], dark: true, Component: () => <YouTubeApp /> },
  { id: "news", name: "News", Icon: Newspaper, tint: ["#ffc27d", "#e0892a"], size: [620, 600], Component: News },
  { id: "markets", name: "Markets", Icon: CandlestickChart, tint: ["#6b6b6b", "#1f1f1f"], size: [860, 560], dark: true, Component: Markets },
  { id: "terminal", name: "Terminal", Icon: SquareTerminal, tint: ["#5a5a5a", "#161616"], size: [620, 400], dark: true, Component: Terminal },
  { id: "music", name: "Music", Icon: Music2, tint: ["#7a7a7a", "#1c1c1c"], size: [720, 520], dark: true, Component: () => <MusicApp /> },
];

export const appById = Object.fromEntries(APPS.map((a) => [a.id, a])) as Record<AppId, AppDef>;

