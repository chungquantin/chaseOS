"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ListMusic, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { PLAYLIST, ytThumb } from "app/data/playlist";
import { media, useMedia } from "./media";

/* ---------------------------------------------------------------- YT API */

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      host?: string;
      videoId?: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: unknown }) => void;
        onStateChange?: (e: { data: number }) => void;
        onError?: (e: { data: number }) => void;
      };
    }
  ) => unknown;
};

let apiPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  const w = window as unknown as { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void };
  if (w.YT?.Player) return Promise.resolve(w.YT);
  apiPromise ??= new Promise((resolve, reject) => {
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve(w.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    s.onerror = () => {
      apiPromise = null;
      reject(new Error("YouTube API failed to load"));
    };
    document.head.appendChild(s);
  });
  return apiPromise;
}

/* ------------------------------------------------------------- component */

function Eq({ on }: { on: boolean }) {
  return (
    <span className="flex h-3 items-end gap-[2px]" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-[#ffc27d]"
          style={{
            height: on ? "100%" : "30%",
            animation: on ? `eq ${0.6 + i * 0.17}s ease-in-out ${i * 0.1}s infinite alternate` : "none",
            transformOrigin: "bottom",
          }}
        />
      ))}
    </span>
  );
}

/**
 * The room's music player, docked in a corner. YouTube tracks show their
 * video here (it has to stay visible while it plays); the generative track
 * shows a little equaliser instead.
 */
export function MiniPlayer({ hidden }: { hidden: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const index = useMedia((s) => s.index);
  const playing = useMedia((s) => s.playing);
  const engaged = useMedia((s) => s.engaged);
  const [list, setList] = useState(false);
  const [failed, setFailed] = useState(false);
  const track = PLAYLIST[index];
  const isYT = track.kind === "youtube";

  // one YouTube player for the whole visit
  useEffect(() => {
    let player: { destroy(): void } | null = null;
    let cancelled = false;
    const mount = document.createElement("div");
    host.current?.appendChild(mount);
    const first = PLAYLIST.find((t) => t.kind === "youtube");
    loadYouTubeApi()
      .then((YT) => {
        if (cancelled) return;
        player = new YT.Player(mount, {
          host: "https://www.youtube-nocookie.com",
          width: "100%",
          height: "100%",
          videoId: media.track().kind === "youtube" ? media.track().id : first?.id,
          playerVars: { playsinline: 1, rel: 0, modestbranding: 1, controls: 0, disablekb: 1, iv_load_policy: 3 },
          events: {
            onReady: (e) => media.attach(e.target as Parameters<typeof media.attach>[0]),
            onStateChange: (e) => media.onYouTubeState(e.data),
            onError: () => media.onYouTubeError(),
          },
        }) as { destroy(): void };
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
      media.detach();
      player?.destroy();
    };
  }, []);

  const show = engaged && !hidden;

  return (
    <div
      className={`fixed z-[45] transition-[opacity,transform] duration-300 max-sm:right-3 max-sm:top-[64px] sm:bottom-5 sm:right-5 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      aria-hidden={!show}
      data-music-toggle
    >
      <div className="glass w-[260px] overflow-hidden rounded-2xl p-1.5 text-[var(--hud-text,#f4ecff)] sm:w-[300px]">
        <div className="flex items-center gap-2.5">
          {/* the video: always mounted so the player survives track changes */}
          <div className="relative aspect-video w-[104px] shrink-0 overflow-hidden rounded-xl bg-black sm:w-[128px]">
            <div ref={host} className={`absolute inset-0 [&>iframe]:size-full ${isYT ? "" : "invisible"}`} />
            {!isYT && (
              <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#e6007a_55%,#2a1d5c)]">
                <Eq on={playing} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pr-1">
            <div className="flex items-center gap-1.5">
              <Eq on={playing} />
              <p className="truncate text-[13px] font-semibold">{track.title}</p>
            </div>
            <p className="truncate text-[11.5px] opacity-70">
              {track.artist}
              {track.kind === "youtube" && track.live ? " (live)" : ""}
            </p>
            <div className="mt-1 flex items-center gap-0.5">
              <button onClick={media.prev} aria-label="Previous song" className="glass-btn size-7 justify-center p-0">
                <SkipBack size={13} />
              </button>
              <button onClick={media.toggle} aria-label={playing ? "Pause music" : "Play music"} className="glass-btn size-8 justify-center p-0">
                {playing ? <Pause size={15} /> : <Play size={15} />}
              </button>
              <button onClick={media.next} aria-label="Next song" className="glass-btn size-7 justify-center p-0">
                <SkipForward size={13} />
              </button>
              <button
                onClick={() => setList((l) => !l)}
                aria-label={list ? "Hide playlist" : "Choose a song"}
                aria-expanded={list}
                className={`glass-btn ml-auto size-7 justify-center p-0 ${list ? "bg-white/15" : ""}`}
              >
                {list ? <X size={13} /> : <ListMusic size={14} />}
              </button>
            </div>
          </div>
        </div>
        {failed && isYT && <p className="px-1.5 pt-1.5 text-[11.5px] opacity-75">YouTube didn’t load. Pick Lamplight to keep the music going.</p>}
        <AnimatePresence initial={false}>
          {list && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-1.5 max-h-[min(320px,50vh)] overflow-y-auto"
            >
              {PLAYLIST.map((t, i) => (
                <li key={t.id}>
                  <button
                    onClick={() => media.select(i)}
                    className={`flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-white/10 ${i === index ? "bg-white/[0.12]" : ""}`}
                    aria-current={i === index}
                  >
                    {t.kind === "youtube" ? (
                      <img src={ytThumb(t.id)} alt="" className="aspect-video w-14 shrink-0 rounded-md object-cover" loading="lazy" />
                    ) : (
                      <span className="aspect-video w-14 shrink-0 rounded-md bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#e6007a_55%,#2a1d5c)]" />
                    )}
                    <span className="min-w-0">
                      <span className="block truncate text-[12.5px] font-medium">{t.title}</span>
                      <span className="block truncate text-[11px] opacity-65">{t.artist}</span>
                    </span>
                    {i === index && playing && <span className="ml-auto pr-1"><Eq on /></span>}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
