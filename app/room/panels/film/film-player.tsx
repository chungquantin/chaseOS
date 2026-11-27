"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import { Captions, CaptionsOff, Volume2, VolumeX } from "lucide-react";
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

  // VCR tape counter, e.g. 0:42 → "0:00:42"
  const counter = (s: number) => `0:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const mode = ended ? "STOP ■" : playing ? "PLAY ▶" : "PAUSE ❚❚";

  return (
    <>
    {/* the TV: a CRT in a plastic bezel */}
    <div className="vhs-tv rounded-[18px] p-2.5 sm:p-3.5">
    <div className={`vhs-screen group relative aspect-video overflow-hidden rounded-[14px_14px_14px_14px/18px_18px_18px_18px] bg-[#0a0d14] ${playing ? "" : "vhs-paused"}`}>
      <div className="vhs-picture absolute inset-0" onClick={toggle}>
        <Canvas shadows dpr={[1, 1.25]} camera={{ fov: 36, near: 0.1, far: 220, position: [15, 12, 23] }} gl={{ antialias: false, powerPreference: "high-performance" }}>
          <film.Scene clock={clock} />
        </Canvas>
      </div>
      {film.narration && <audio ref={audio} src={film.narration} preload="auto" onEnded={() => (audioLive.current = false)} />}

      {/* tape artefacts over the picture: scanlines, noise, a rolling tracking band, glass */}
      <div className="vhs-scanlines pointer-events-none absolute inset-0" aria-hidden />
      <div className="vhs-noise pointer-events-none absolute -inset-[50%]" aria-hidden />
      <div className="vhs-tracking pointer-events-none absolute inset-x-0 h-[9%]" aria-hidden />
      <div className="vhs-glass pointer-events-none absolute inset-0" aria-hidden />

      {/* VCR on-screen display */}
      <div className="vhs-osd pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3 sm:p-5">
        <div className="leading-[0.95]">
          <p className="text-[20px] sm:text-[30px]">{mode}</p>
          <p className="mt-1 text-[15px] opacity-90 sm:text-[22px]">
            CH {chapterIndex + 1} · {film.chapters[chapterIndex].title.toUpperCase()}
          </p>
        </div>
        <div className="flex items-start gap-3 text-right leading-[0.95]">
          <div className="hidden sm:block">
            <p className="text-[30px]">SP</p>
            <p className="mt-1 text-[22px] tabular-nums">{counter(t)}</p>
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
      </div>

      {/* paused / ended / sound blocked */}
      <AnimatePresence>
        {(!playing || needsTap) && (
          <motion.button
            key="big"
            onClick={toggle}
            aria-label={ended ? "Replay" : "Play with sound"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="vhs-osd vhs-blink absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-current bg-[#0018a8]/70 px-4 py-1 text-[24px] sm:px-6 sm:text-[36px]"
          >
            {ended ? "↺ REWIND" : needsTap && playing ? "▶ PRESS FOR SOUND" : "▶ PLAY"}
          </motion.button>
        )}
      </AnimatePresence>

      {/* captions, as VCR subtitles */}
      <div className="pointer-events-none absolute inset-x-4 bottom-4 hidden text-center sm:inset-x-10 sm:bottom-6 sm:block">
        <AnimatePresence mode="wait">
          {captionsOn && caption && (
            <motion.div key={caption.text} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              <p className="vhs-osd inline bg-black/75 px-2 text-[26px] leading-[1.15] [box-decoration-break:clone] sm:text-[34px]">{caption.text}</p>
              {caption.sub && (
                <p className="mt-1.5">
                  <span className="vhs-osd bg-black/75 px-2 text-[18px] leading-[1.2] !text-[#ffe38a] [box-decoration-break:clone] sm:text-[22px]">{caption.sub}</span>
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
    </div>

    {/* the deck: a cassette label + VCR transport keys */}
    <div className="vhs-deck mt-3 flex flex-wrap items-center gap-3 rounded-[10px] px-3 py-2.5 sm:flex-nowrap sm:gap-4 sm:px-4">
      <div className="vhs-label hidden min-w-0 shrink-0 items-center gap-2 px-3 py-1 sm:flex">
        {badge}
        <div className="min-w-0 leading-tight">
          <p className="font-marker truncate text-[15px] !text-[#1a120a]">{title}</p>
          <p className="font-hand text-[12px] opacity-75">T-120 · VHS · {fmt(film.duration)}</p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <DeckKey label="Rewind 10 seconds" onClick={() => seek(clock.current - 10)}>◀◀</DeckKey>
        <DeckKey label={ended ? "Replay" : playing ? "Pause" : "Play"} onClick={toggle} wide lit={playing}>
          {ended ? "↺" : playing ? "❚❚" : "▶"}
        </DeckKey>
        <DeckKey label="Fast-forward 10 seconds" onClick={() => seek(clock.current + 10)}>▶▶</DeckKey>
      </div>

      {/* tape position: chapters as segments of the reel */}
      <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
        <div className="flex gap-1">
          {film.chapters.map((c, i) => {
            const len = segEnd(i) - c.at;
            const fill = Math.min(1, Math.max(0, (t - c.at) / len));
            return (
              <button key={c.at} onClick={() => seek(c.at)} aria-label={`Jump to ${c.title}`} style={{ flex: len }} className="group/seg min-w-0 text-left">
                <span className={`vhs-lcd hidden truncate pb-1 text-[15px] leading-none transition-opacity sm:block ${i === chapterIndex ? "opacity-100" : "opacity-40 group-hover/seg:opacity-75"}`}>
                  {c.title}
                </span>
                <span className="relative block h-1.5 overflow-hidden rounded-[1px] bg-black/60 shadow-[inset_0_1px_1px_rgba(0,0,0,0.8)]">
                  <span className="absolute inset-y-0 left-0 bg-[#ffb347] shadow-[0_0_6px_#ffb347]" style={{ width: `${fill * 100}%` }} />
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

      <span className="vhs-lcd shrink-0 rounded-[3px] bg-black/70 px-2 py-0.5 text-[20px] leading-none tabular-nums shadow-[inset_0_1px_2px_rgba(0,0,0,0.9)]">
        {counter(t)}
      </span>
    </div>

    {/* phones: captions sit under the picture instead of over it */}
    {captionsOn && caption && (
      <div className="mt-3 bg-black px-4 py-3 sm:hidden">
        <p className="vhs-osd text-[22px] leading-tight">{caption.text}</p>
        {caption.sub && <p className="vhs-osd mt-1 text-[17px] leading-snug !text-[#ffe38a]">{caption.sub}</p>}
      </div>
    )}
    </>
  );
}

function DeckKey({ children, label, onClick, wide, lit }: { children: React.ReactNode; label: string; onClick: () => void; wide?: boolean; lit?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} className={`vhs-key relative grid h-9 place-items-center text-[13px] font-bold ${wide ? "w-14" : "w-11"}`}>
      {children}
      {lit !== undefined && <span className={`absolute right-1.5 top-1 size-1.5 rounded-full ${lit ? "bg-[#ff4d3d] shadow-[0_0_6px_#ff4d3d]" : "bg-[#5a2a24]"}`} aria-hidden />}
    </button>
  );
}

function IconBtn({ children, label, on, onClick }: { children: React.ReactNode; label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={on}
      className={`grid size-8 place-items-center rounded-[4px] border border-white/30 transition-colors ${on ? "bg-white/20 text-white" : "bg-black/40 text-white/55"}`}
    >
      {children}
    </button>
  );
}
