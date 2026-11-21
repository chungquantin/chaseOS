"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Captions, CaptionsOff, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { FilmDef } from "./types";

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/**
 * Plays a FilmDef: a 3D scene driven by one clock, with a voice-over, captions
 * and chapters. The audio is the master clock while it plays; the scene is a
 * pure function of the clock, so pausing and scrubbing just work.
 */
export default function FilmPlayer({ film, title, badge }: { film: FilmDef; title: string; badge?: React.ReactNode }) {
  const clock = useRef(0);
  const audio = useRef<HTMLAudioElement>(null);
  const audioLive = useRef(false);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const playingRef = useRef(true);
  playingRef.current = playing;
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [needsTap, setNeedsTap] = useState(false);

  const startAudio = useCallback(() => {
    const a = audio.current;
    if (!a || !film.narration) return;
    a.currentTime = clock.current;
    a.play()
      .then(() => {
        audioLive.current = true;
        setNeedsTap(false);
      })
      .catch(() => {
        audioLive.current = false;
        setNeedsTap(true);
      });
  }, [film.narration]);

  // autoplay; reduced motion starts paused on a finished-looking frame
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      clock.current = 5;
      setT(5);
      setPlaying(false);
      return;
    }
    startAudio();
    return () => audio.current?.pause();
  }, [startAudio]);

  useEffect(() => {
    if (audio.current) audio.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let shown = -1;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (playingRef.current) {
        const a = audio.current;
        if (a && audioLive.current && !a.paused) clock.current = Math.min(film.duration, a.currentTime);
        else clock.current = Math.min(film.duration, clock.current + dt);
        if (clock.current >= film.duration) {
          setPlaying(false);
          audio.current?.pause();
          audioLive.current = false;
        }
      }
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
      if (audio.current) audio.current.currentTime = clock.current;
    },
    [film.duration]
  );

  const toggle = () => {
    if (clock.current >= film.duration - 0.05) {
      seek(0);
      setPlaying(true);
      startAudio();
      return;
    }
    if (playing) {
      setPlaying(false);
      audio.current?.pause();
      audioLive.current = false;
    } else {
      setPlaying(true);
      startAudio();
    }
  };

  const ended = t >= film.duration - 0.05;
  const chapterIndex = Math.max(0, film.chapters.map((c) => c.at).filter((at) => t >= at).length - 1);
  const caption = film.captions.find((c) => t >= c.from && t <= c.to);
  const segEnd = (i: number) => (i + 1 < film.chapters.length ? film.chapters[i + 1].at : film.duration);

  return (
    <>
    <div className="group relative aspect-video overflow-hidden rounded-[22px] border border-white/10 bg-[#0a1128] shadow-[0_40px_100px_-40px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)]">
      <div className="absolute inset-0" onClick={toggle}>
        <Canvas shadows dpr={[1, 1.6]} camera={{ fov: 36, near: 0.1, far: 220, position: [15, 12, 23] }} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <film.Scene clock={clock} />
        </Canvas>
      </div>
      {film.narration && <audio ref={audio} src={film.narration} preload="auto" onEnded={() => (audioLive.current = false)} />}

      {/* top: what you're watching */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-[#050914]/70 to-transparent p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {badge}
          <div className="hidden min-w-0 leading-tight sm:block">
            <p className="truncate text-[12.5px] font-medium text-white sm:text-[14px]">{title}</p>
            <p className="truncate text-[11.5px] text-[#cbd5e1]/80">
              <span className="tabular-nums" style={{ color: film.accent }}>
                {chapterIndex + 1}/{film.chapters.length}
              </span>{" "}
              {film.chapters[chapterIndex].title}
            </p>
          </div>
        </div>
        <div className="pointer-events-auto flex items-center gap-1.5">
          <IconBtn label={captionsOn ? "Hide captions" : "Show captions"} on={captionsOn} onClick={() => setCaptionsOn((v) => !v)}>
            {captionsOn ? <Captions size={16} /> : <CaptionsOff size={16} />}
          </IconBtn>
          {film.narration && (
            <IconBtn label={muted ? "Unmute narration" : "Mute narration"} on={!muted} onClick={() => setMuted((v) => !v)}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </IconBtn>
          )}
        </div>
      </div>

      {/* paused / ended / sound blocked: a big play button */}
      <AnimatePresence>
        {(!playing || needsTap) && (
          <motion.button
            key="big"
            onClick={toggle}
            aria-label={ended ? "Replay" : "Play with sound"}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-full border border-white/20 bg-[#0a1128]/70 py-2 pl-2 pr-2 text-[14px] text-white sm:py-2.5 sm:pl-3 sm:pr-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <span className="grid size-10 place-items-center rounded-full text-[#0a1128]" style={{ background: film.accent }}>
              {ended ? <RotateCcw size={17} strokeWidth={2.4} /> : <Play size={17} strokeWidth={2.4} className="translate-x-px" />}
            </span>
            <span className="hidden sm:inline">{ended ? "Watch again" : needsTap && playing ? "Tap for sound" : "Play"}</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* captions */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] hidden sm:block bg-gradient-to-t from-[#050914]/90 via-[#050914]/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-4 bottom-[4.6rem] hidden sm:inset-x-8 sm:bottom-[5.4rem] sm:block">
        <AnimatePresence mode="wait">
          {captionsOn && caption && (
            <motion.div key={caption.text} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3 }} className="max-w-[40rem]">
              <p className="font-display text-[20px] leading-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)] sm:text-[32px]">{caption.text}</p>
              {caption.sub && <p className="mt-1.5 text-[12.5px] leading-snug text-[#dbe4f5] drop-shadow sm:text-[15px]">{caption.sub}</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* controls: play, chapter-segmented scrub bar, time */}
      <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0a1128]/70 px-2.5 py-2 text-[#e2e8f0] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:gap-4 sm:px-3">
        <button
          onClick={toggle}
          aria-label={ended ? "Replay" : playing ? "Pause" : "Play"}
          className="grid size-9 shrink-0 place-items-center rounded-full text-[#0a1128] transition-transform active:scale-95"
          style={{ background: film.accent }}
        >
          {ended ? <RotateCcw size={15} strokeWidth={2.4} /> : playing ? <Pause size={15} strokeWidth={2.4} /> : <Play size={15} strokeWidth={2.4} className="translate-x-px" />}
        </button>

        <div className="relative min-w-0 flex-1">
          <div className="flex gap-1">
            {film.chapters.map((c, i) => {
              const len = segEnd(i) - c.at;
              const fill = Math.min(1, Math.max(0, (t - c.at) / len));
              return (
                <button
                  key={c.at}
                  onClick={() => seek(c.at)}
                  aria-label={`Jump to ${c.title}`}
                  style={{ flex: len }}
                  className="group/seg min-w-0 text-left"
                >
                  <span className={`hidden truncate pb-1 text-[10.5px] transition-colors sm:block ${i === chapterIndex ? "text-white" : "text-white/45 group-hover/seg:text-white/80"}`}>{c.title}</span>
                  <span className="relative block h-1 overflow-hidden rounded-full bg-white/15">
                    <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${fill * 100}%`, background: film.accent }} />
                  </span>
                </button>
              );
            })}
          </div>
          <input
            type="range"
            min={0}
            max={film.duration}
            step={0.01}
            value={t}
            onChange={(e) => seek(Number(e.target.value))}
            aria-label="Seek"
            className="absolute inset-x-0 bottom-[-4px] h-3 w-full cursor-pointer opacity-0"
          />
        </div>

        <span className="shrink-0 text-[11.5px] tabular-nums text-white/70">
          {fmt(t)} <span className="opacity-50">/ {fmt(film.duration)}</span>
        </span>
      </div>
    </div>
    {/* phones: captions sit under the picture instead of over it */}
    {captionsOn && caption && (
      <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 sm:hidden">
        <p className="font-display text-[18px] leading-tight text-white">{caption.text}</p>
        {caption.sub && <p className="mt-1 text-[12.5px] leading-snug text-[#dbe4f5]/80">{caption.sub}</p>}
      </div>
    )}
    </>
  );
}

function IconBtn({ children, label, on, onClick }: { children: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={`grid size-8 place-items-center rounded-full border border-white/15 backdrop-blur-md transition-colors ${on ? "bg-white/15 text-white" : "bg-black/30 text-white/55"}`}
    >
      {children}
    </button>
  );
}
