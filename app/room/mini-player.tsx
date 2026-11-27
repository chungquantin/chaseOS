"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, ListMusic, Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
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
          className="w-[3px] rounded-full bg-[#a65f0c]"
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

/* a small pencil-stroke icon button, for the paper player */
function PaperBtn({
  children,
  onClick,
  label,
  big,
  pressed,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  big?: boolean;
  pressed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className={`grid place-items-center rounded-full border border-[#2a1f14]/40 bg-[#fff2b3]/60 text-[#2a1f14] shadow-[inset_0_-1px_0_rgba(90,55,25,0.25)] transition hover:bg-[#ffc27d]/80 ${
        big ? "size-8" : "size-7"
      } ${pressed ? "bg-[#ffc27d]/80" : ""}`}
    >
      {children}
    </button>
  );
}

/**
 * The room's music player, docked in a corner. YouTube tracks show their
 * video here (it has to stay visible while it plays); the generative track
 * shows a little equaliser instead.
 */
export function MiniPlayer({ hidden, compact = false }: { hidden: boolean; compact?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const index = useMedia((s) => s.index);
  const playing = useMedia((s) => s.playing);
  const engaged = useMedia((s) => s.engaged);
  const [list, setList] = useState(false);
  const [failed, setFailed] = useState(false);
  // folds to a small strip while a panel is open; the visitor can override it
  const [manual, setManual] = useState<boolean | null>(null);
  useEffect(() => setManual(null), [compact]);
  const folded = manual ?? compact;
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
      <div className={`nb-page !h-auto rotate-[-0.6deg] transition-[width] duration-300 ${folded ? "w-[230px]" : "w-[280px] sm:w-[320px]"}`}>
        <div className="nb-grid" aria-hidden />
        <div className="nb-margin !left-[30px]" aria-hidden />
        <div className="nb-holes" aria-hidden />
        <div className={`flex flex-col gap-2 pl-10 pr-3 ${folded ? "py-2" : "py-3"}`}>
          {!folded && (
            <div className="flex items-baseline justify-between">
              <p className="font-marker text-[17px] leading-none">Now playing</p>
              <div className="flex items-center gap-2">
                <Eq on={playing} />
                <button
                  onClick={() => { setManual(true); setList(false); }}
                  aria-label="Fold the music player"
                  className="nb-link rounded-md px-1 text-[#2a1f14]"
                >
                  <ChevronDown size={15} />
                </button>
              </div>
            </div>
          )}
          <div className={`flex items-center ${folded ? "gap-2" : "gap-3"}`}>
            {/* the video, taped to the page. Always mounted so the player survives track changes */}
            <div className={`relative shrink-0 rotate-[-2deg] bg-white shadow-[0_2px_6px_rgba(60,35,10,0.35)] ${folded ? "p-0.5" : "p-1 pb-1.5"}`}>
              {!folded && (
                <span
                  className="absolute -top-2 left-1/2 z-10 h-3.5 w-10 -translate-x-1/2 rotate-[3deg] bg-[#fff8d6]/70 shadow-[0_1px_2px_rgba(60,35,10,0.2)]"
                  aria-hidden
                />
              )}
              <div className={`relative aspect-video overflow-hidden bg-black ${folded ? "w-[64px]" : "w-[96px] sm:w-[112px]"}`}>
                <div ref={host} className={`absolute inset-0 [&>iframe]:size-full ${isYT ? "" : "invisible"}`} />
                {!isYT && (
                  <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#f0a04b_45%,#171717)]" />
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-hand truncate leading-tight ${folded ? "text-[15px]" : "text-[17px]"}`}>{track.title}</p>
              <p className={`font-hand truncate leading-tight opacity-70 ${folded ? "text-[12px]" : "text-[14px]"}`}>
                {track.artist}
                {track.kind === "youtube" && track.live ? " (live)" : ""}
              </p>
            </div>
            {folded && (
              <>
                <PaperBtn onClick={media.toggle} label={playing ? "Pause music" : "Play music"}>
                  {playing ? <Pause size={13} /> : <Play size={13} />}
                </PaperBtn>
                <button
                  onClick={() => setManual(false)}
                  aria-label="Open the music player"
                  className="nb-link -mr-1 rounded-md px-1 text-[#2a1f14]"
                >
                  <ChevronUp size={15} />
                </button>
              </>
            )}
          </div>
          {!folded && (
          <div className="flex items-center gap-1.5">
            <PaperBtn onClick={media.prev} label="Previous song">
              <SkipBack size={13} />
            </PaperBtn>
            <PaperBtn onClick={media.toggle} label={playing ? "Pause music" : "Play music"} big>
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </PaperBtn>
            <PaperBtn onClick={media.next} label="Next song">
              <SkipForward size={13} />
            </PaperBtn>
            <button
              onClick={() => setList((l) => !l)}
              aria-label={list ? "Hide playlist" : "Choose a song"}
              aria-expanded={list}
              className="font-hand nb-link ml-auto flex items-center gap-1 rounded-md px-2 py-1 text-[15px]"
            >
              {list ? <X size={13} /> : <ListMusic size={14} />}
              {list ? "close" : "playlist"}
            </button>
          </div>
          )}
          {failed && isYT && (
            <p className="font-hand text-[14px] leading-snug opacity-75">YouTube didn’t load. Pick Lamplight to keep the music going.</p>
          )}
        <AnimatePresence initial={false}>
          {list && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="-mr-1 max-h-[min(300px,45vh)] overflow-y-auto border-t border-dashed border-[#2a1f14]/30 pt-1"
            >
              {PLAYLIST.map((t, i) => (
                <li key={t.id}>
                  <button
                    onClick={() => media.select(i)}
                    className={`flex w-full items-center gap-2.5 rounded-md p-1 text-left hover:bg-[#a65f0c]/10 ${i === index ? "bg-[#a65f0c]/15" : ""}`}
                    aria-current={i === index}
                  >
                    {t.kind === "youtube" ? (
                      <img src={ytThumb(t.id)} alt="" className="aspect-video w-12 shrink-0 border-2 border-white object-cover shadow-[0_1px_3px_rgba(60,35,10,0.3)]" loading="lazy" />
                    ) : (
                      <span className="aspect-video w-12 shrink-0 border-2 border-white bg-[radial-gradient(circle_at_30%_20%,#ffc27d,#f0a04b_45%,#171717)] shadow-[0_1px_3px_rgba(60,35,10,0.3)]" />
                    )}
                    <span className="min-w-0">
                      <span className="font-hand block truncate text-[15px] leading-tight">{t.title}</span>
                      <span className="font-hand block truncate text-[13px] leading-tight opacity-65">{t.artist}</span>
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
    </div>
  );
}
