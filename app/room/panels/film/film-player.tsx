"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Pause, Play, RotateCcw } from "lucide-react";
import type { FilmDef } from "./types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Plays a FilmDef: a 3D scene driven by a single clock, with captions, chapter
 * markers and a scrubber. Pausing and scrubbing work because the scene is a
 * pure function of the clock.
 */
export default function FilmPlayer({ film }: { film: FilmDef }) {
  const clock = useRef(0);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing;

  // reduced motion: don't autoplay, show a finished-looking frame instead
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clock.current = 5;
      setT(5);
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        clock.current = Math.min(film.duration, clock.current + dt);
        if (clock.current >= film.duration) setPlaying(false);
      }
      // the UI only needs ~15 updates a second
      if (Math.abs(clock.current - shown) > 0.066) {
        shown = clock.current;
        setT(clock.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [film.duration]);

  const seek = useCallback(
    (v: number) => {
      clock.current = Math.min(film.duration, Math.max(0, v));
      setT(clock.current);
    },
    [film.duration]
  );
  const toggle = () => {
    if (clock.current >= film.duration - 0.05) seek(0);
    setPlaying((p) => !p);
  };

  const ended = t >= film.duration - 0.05;
  const chapter = [...film.chapters].reverse().find((c) => t >= c.at) ?? film.chapters[0];
  const chapterIndex = film.chapters.indexOf(chapter);
  const caption = film.captions.find((c) => t >= c.from && t <= c.to);

  return (
    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.85)]">
      <div className="absolute inset-0" onClick={toggle}>
        <Canvas dpr={[1, 1.5]} camera={{ fov: 36, near: 0.1, far: 140, position: [9, 7.5, 15] }} gl={{ antialias: true }}>
          <film.Scene clock={clock} />
        </Canvas>
      </div>

      {/* chapter chip */}
      <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/10 bg-[#0b1220]/70 py-1 pl-1 pr-3 text-[12px] text-[#e2e8f0] backdrop-blur-md sm:left-4 sm:top-4">
        <span className="grid size-5 place-items-center rounded-full text-[11px] font-semibold text-[#0b1220]" style={{ background: film.accent }}>
          {chapterIndex + 1}
        </span>
        {chapter.title}
      </div>

      {/* captions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-[#050914]/85 via-[#050914]/35 to-transparent" />
      <div className="pointer-events-none absolute inset-x-4 bottom-[3.6rem] sm:inset-x-6 sm:bottom-[4.4rem]">
        <AnimatePresence mode="wait">
          {caption && (
            <motion.div
              key={caption.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="max-w-[34rem]"
            >
              <p className="font-display text-[20px] leading-tight text-white drop-shadow sm:text-[28px]">{caption.text}</p>
              {caption.sub && <p className="mt-1 text-[12.5px] leading-snug text-[#cbd5e1] sm:text-[14.5px]">{caption.sub}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls */}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-full border border-white/10 bg-[#0b1220]/75 py-1.5 pl-1.5 pr-4 text-[#e2e8f0] backdrop-blur-md sm:inset-x-4 sm:bottom-4">
        <button
          onClick={toggle}
          aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
          className="grid size-8 shrink-0 place-items-center rounded-full text-[#0b1220] transition-transform active:scale-95"
          style={{ background: film.accent }}
        >
          {ended ? <RotateCcw size={14} strokeWidth={2.4} /> : playing ? <Pause size={14} strokeWidth={2.4} /> : <Play size={14} strokeWidth={2.4} className="translate-x-px" />}
        </button>
        <div className="relative h-5 min-w-0 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/15" />
          <div className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full" style={{ width: `${(t / film.duration) * 100}%`, background: film.accent }} />
          {film.chapters.slice(1).map((c) => (
            <span key={c.at} className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-white/50" style={{ left: `${(c.at / film.duration) * 100}%` }} />
          ))}
          <input
            type="range"
            min={0}
            max={film.duration}
            step={0.01}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <span className="pointer-events-none absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${(t / film.duration) * 100}%` }} />
        </div>
        <span className="shrink-0 text-[11.5px] tabular-nums opacity-75">
          {fmt(t)} / {fmt(film.duration)}
        </span>
      </div>
    </div>
  );
}
