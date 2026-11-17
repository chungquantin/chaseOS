"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { BookOpen, Briefcase, CandlestickChart, Mountain, Package, RotateCw } from "lucide-react";
import { idCard, profile } from "app/data/profile";
import { live, type Mood } from "../store";

const SEEN_KEY = "tc-room:intro-v1";

export function hasSeenIntro() {
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return false;
  }
}
export function markIntroSeen() {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* private mode: just show it again next time */
  }
}

/* ================================================================ loading */

const STEPS = [
  "laying the floorboards",
  "stacking past jobs on the table",
  "shelving the essays",
  "bolting on climbing holds",
  "plugging in the console",
  "pouring the coffee",
];

const DOOR = {
  day: "bg-[linear-gradient(180deg,#f0c6a7,#c98b6d)]",
  night: "bg-[linear-gradient(180deg,#1d2650,#080b18)]",
};

/**
 * Shown until the 3D room has drawn. Exits by swinging two doors open
 * onto the room.
 */
export function LoadingScreen({ ready, mood, onDone }: { ready: boolean; mood: Mood; onDone: () => void }) {
  const [progress, setProgress] = useState(0.04);
  const [step, setStep] = useState(0);
  const [opening, setOpening] = useState(false);
  const minTime = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => (minTime.current = true), 1400);
    const t2 = setTimeout(() => setTimedOut(true), 15000); // never trap anyone here
    const tick = setInterval(() => {
      setProgress((p) => (p < 0.9 ? p + (0.9 - p) * 0.06 : p));
      setStep((s) => (s + 1) % STEPS.length);
    }, 420);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearInterval(tick);
    };
  }, []);

  useEffect(() => {
    if (!(ready || timedOut) || opening) return;
    const wait = setInterval(() => {
      if (!minTime.current) return;
      clearInterval(wait);
      setProgress(1);
      setTimeout(() => setOpening(true), 350);
    }, 100);
    return () => clearInterval(wait);
  }, [ready, timedOut, opening]);

  const door = DOOR[mood];
  const dark = mood === "night";

  return (
    <div className="fixed inset-0 z-[60]" aria-busy={!opening} aria-label="Loading the room">
      {/* two doors */}
      {[0, 1].map((side) => (
        <motion.div
          key={side}
          className={`absolute inset-y-0 w-1/2 ${door} ${side ? "right-0" : "left-0"}`}
          style={{ transformOrigin: side ? "right center" : "left center" }}
          animate={opening ? { x: side ? "102%" : "-102%", rotateY: side ? -25 : 25 } : { x: 0 }}
          transition={{ duration: 0.95, ease: [0.7, 0, 0.2, 1], delay: 0.15 }}
          onAnimationComplete={() => opening && side === 1 && onDone()}
        >
          {/* door handle */}
          <span className={`absolute top-[72%] h-16 w-1.5 rounded-full ${dark ? "bg-[#8a7cb8]" : "bg-[#a2614a]"} ${side ? "left-5" : "right-5"}`} />
        </motion.div>
      ))}
      {/* light through the gap as the doors part */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,236,210,0.9),transparent)]"
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={opening ? { opacity: [0, 1, 0], scaleX: [0.2, 3, 8] } : { opacity: 0 }}
        transition={{ duration: 1 }}
      />

      {/* centre: assembling room + progress */}
      <motion.div
        className={`absolute inset-0 flex flex-col items-center justify-center ${dark ? "text-[#efe5d6]" : "text-[#3b2216]"}`}
        animate={opening ? { opacity: 0, scale: 0.96 } : { opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <IsoRoomSketch progress={progress} dark={dark} />
        <p className="font-display mt-7 text-[26px] leading-none">Tin Chung</p>
        <div className={`mt-4 h-[3px] w-56 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-black/10"}`}>
          <motion.div className="h-full rounded-full bg-[var(--lamp)] shadow-[0_0_12px_var(--lamp)]" animate={{ width: `${progress * 100}%` }} transition={{ ease: "easeOut" }} />
        </div>
        <div className="mt-3 h-5 overflow-hidden text-[13px] opacity-75">
          <AnimatePresence mode="wait">
            <motion.p key={progress >= 1 ? "done" : step} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>
              {progress >= 1 ? "come on in" : `${STEPS[step]}…`}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/** Line drawing of the room that fills in with progress. */
function IsoRoomSketch({ progress, dark }: { progress: number; dark: boolean }) {
  const stroke = dark ? "#e8dcff" : "#5a3424";
  const draw = (from: number) => Math.min(1, Math.max(0, (progress - from) / 0.25));
  const pop = (at: number) => (progress > at ? 1 : 0);
  // iso helpers: x→(+cos30, +sin30), z→(-cos30, +sin30)
  const P = (x: number, y: number, z: number) => `${100 + (x - z) * 8.66},${110 + (x + z) * 5 - y * 10}`;
  const blocks: { at: number; x: number; z: number; w: number; d: number; h: number; c: string }[] = [
    { at: 0.3, x: 1, z: 7.5, w: 3.6, d: 2, h: 1.2, c: "#ff7a45" }, // table
    { at: 0.42, x: 0.4, z: 0.4, w: 1.2, d: 3, h: 4.4, c: "#3f6c8f" }, // shelf
    { at: 0.54, x: 4, z: 0.4, w: 5, d: 1.8, h: 1.6, c: "#a8714a" }, // desk
    { at: 0.66, x: 8.4, z: 6.5, w: 1.4, d: 3.5, h: 1.4, c: "#e7d8c1" }, // sofa
    { at: 0.78, x: 8.4, z: 1, w: 1.2, d: 1.2, h: 2.6, c: "#4e7a4b" }, // plant
  ];
  return (
    <svg width="200" height="190" viewBox="0 0 200 190" fill="none" aria-hidden>
      {/* floor */}
      <motion.path
        d={`M${P(0, 0, 0)} L${P(10, 0, 0)} L${P(10, 0, 10)} L${P(0, 0, 10)} Z`}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: draw(0) }}
      />
      {/* walls */}
      <motion.path
        d={`M${P(0, 0, 10)} L${P(0, 6, 10)} L${P(0, 6, 0)} L${P(10, 6, 0)} L${P(10, 0, 0)} M${P(0, 6, 0)} L${P(0, 0, 0)}`}
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: draw(0.12) }}
      />
      {/* furniture pops in */}
      {blocks.map((b, i) => (
        <motion.g key={i} initial={{ opacity: 0, y: -10 }} animate={{ opacity: pop(b.at), y: pop(b.at) ? 0 : -10 }} transition={{ type: "spring", stiffness: 500, damping: 22 }}>
          <path d={`M${P(b.x, b.h, b.z)} L${P(b.x + b.w, b.h, b.z)} L${P(b.x + b.w, b.h, b.z + b.d)} L${P(b.x, b.h, b.z + b.d)} Z`} fill={b.c} />
          <path d={`M${P(b.x, b.h, b.z + b.d)} L${P(b.x + b.w, b.h, b.z + b.d)} L${P(b.x + b.w, 0, b.z + b.d)} L${P(b.x, 0, b.z + b.d)} Z`} fill={b.c} opacity="0.75" />
          <path d={`M${P(b.x + b.w, b.h, b.z)} L${P(b.x + b.w, b.h, b.z + b.d)} L${P(b.x + b.w, 0, b.z + b.d)} L${P(b.x + b.w, 0, b.z)} Z`} fill={b.c} opacity="0.55" />
        </motion.g>
      ))}
    </svg>
  );
}

/* ================================================================ ID card */

function Barcode() {
  return (
    <div
      className="h-8 w-28 opacity-80"
      style={{
        background:
          "repeating-linear-gradient(90deg,#1c1917 0 2px,transparent 2px 4px,#1c1917 4px 5px,transparent 5px 8px,#1c1917 8px 11px,transparent 11px 12px)",
      }}
    />
  );
}

function CardFront() {
  return (
    <div className="flex h-full flex-col">
      <div className="relative h-24 bg-[linear-gradient(120deg,#ff7a45,#e6007a_60%,#7c3aed)] px-5 pt-4 text-white">
        <span className="absolute left-1/2 top-3 h-2.5 w-14 -translate-x-1/2 rounded-full bg-black/25" aria-hidden />
        <p className="pt-3 font-mono text-[10px] uppercase tracking-[0.25em] opacity-90">Identification · Engineer</p>
      </div>
      <div className="relative z-10 -mt-12 flex flex-col items-center px-5">
        <img src={idCard.avatar} alt={idCard.name} className="size-24 rounded-full border-4 border-[#fbf8f1] bg-[#f3eee4] object-cover shadow-md" />
        <h2 className="font-display mt-2 text-[32px] leading-tight text-[#1c1917]">{idCard.name}</h2>
        <p className="text-[14px] text-[#57534e]">
          {idCard.title} · <span className="font-mono text-[12px]">@{profile.handle}</span>
        </p>
      </div>
      <ul className="mt-4 grid gap-2.5 px-5">
        {idCard.pillars.map((p, i) => (
          <motion.li
            key={p.key}
            className="grid grid-cols-[10px_minmax(0,1fr)] items-baseline gap-2.5"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + i * 0.12 }}
          >
            <span className="size-2.5 translate-y-[1px] rounded-full" style={{ background: p.color }} />
            <span>
              <span className="font-display text-[17px] text-[#1c1917]">{p.label}</span>
              <span className="block text-[12.5px] leading-[1.35] text-[#57534e]">{p.line}</span>
            </span>
          </motion.li>
        ))}
      </ul>
      <div className="mt-auto flex items-end justify-between px-5 pb-4 pt-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#a8a29e]">Access</p>
          <p className="font-mono text-[11px] font-semibold text-[#1c1917]">ALL ROOMS</p>
        </div>
        <Barcode />
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="flex h-full flex-col px-5 py-6">
      <p className="font-display text-[20px] text-[#1c1917]">On the record</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {idCard.stats.map((s) => (
          <div key={s.label} className="rounded-xl bg-[#f3eee4] px-3 py-2.5">
            <p className="font-display text-[24px] leading-none text-[#b4521c]">{s.value}</p>
            <p className="text-[11px] text-[#78716c]">{s.label}</p>
          </div>
        ))}
      </div>
      <p className="font-display mt-5 text-[20px] text-[#1c1917]">In this room</p>
      <ul className="mt-2 grid gap-1.5 text-[13px] text-[#44403c]">
        {(
          [
            [Briefcase, "Past jobs, spread on the table"],
            [Package, "Projects in the glass case"],
            [BookOpen, "Essays on the bookshelf"],
            [Mountain, "A climbing wall and a game corner"],
            [CandlestickChart, "Live markets on the desk"],
          ] as const
        ).map(([Icon, text]) => (
          <li key={text} className="flex items-center gap-2">
            <Icon size={14} className="text-[#b4521c]" /> {text}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex gap-3 pt-4 text-[12px] text-[#78716c]">
        <a href={profile.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-[#b4521c]">LinkedIn</a>
        <a href={profile.links.github} target="_blank" rel="noreferrer" className="hover:text-[#b4521c]">GitHub</a>
        <a href={profile.links.x} target="_blank" rel="noreferrer" className="hover:text-[#b4521c]">X</a>
      </div>
    </div>
  );
}

/**
 * A lanyard ID that drops in and swings, tilts toward the pointer, flips to
 * show the back, and shrinks into the HUD badge on "Enter the room".
 */
export function IdCard({ onEnter }: { onEnter: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const sheen = useMotionTemplate`linear-gradient(105deg, transparent ${gx}%, rgba(255,255,255,0.35) calc(${gx}% + 8%), transparent calc(${gx}% + 16%))`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onEnter();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnter]);

  return (
    <motion.div
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      role="dialog"
      aria-label={`${idCard.name}, ${idCard.title}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,12,8,0.25),rgba(20,12,8,0.6))]" />

      {/* lanyard + card swing from the top of the screen */}
      <motion.div
        className="relative flex flex-col items-center"
        style={{ transformOrigin: "50% -60vh" }}
        initial={{ y: "-110vh", rotate: -14 }}
        animate={{ y: 0, rotate: 0 }}
        transition={{ y: { type: "spring", stiffness: 90, damping: 14 }, rotate: { type: "spring", stiffness: 60, damping: 9, delay: 0.15 } }}
      >
        <div
          className="absolute bottom-full h-[60vh] w-7 bg-[linear-gradient(90deg,#c2410c,#ff7a45,#c2410c)]"
          style={{ maskImage: "linear-gradient(to top, black 85%, transparent)" }}
          aria-hidden
        >
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] font-bold tracking-[0.4em] text-white/80" style={{ writingMode: "vertical-rl" }}>
            CHUNGQUANTIN · CHUNGQUANTIN
          </p>
        </div>
        <div className="relative z-10 -mb-2 h-6 w-10 rounded-b-md bg-[linear-gradient(#d1d5db,#9ca3af)] shadow" aria-hidden />

        <motion.div
          layoutId="idcard"
          className="relative"
          style={{ width: "min(340px, 86vw)", height: "min(520px, 70vh)", perspective: 1200 }}
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            ry.set((px - 0.5) * 16);
            rx.set(-(py - 0.5) * 12);
            gx.set(px * 100 - 20);
          }}
          onPointerLeave={() => {
            rx.set(0);
            ry.set(0);
          }}
        >
          <motion.div
            className="relative h-full w-full"
            style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 160, damping: 20 }}
            >
              <div className="absolute inset-0 overflow-hidden rounded-[22px] bg-[#fbf8f1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]" style={{ backfaceVisibility: "hidden" }}>
                <CardFront />
                <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
              </div>
              <div
                className="absolute inset-0 overflow-hidden rounded-[22px] bg-[#fbf8f1] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <CardBack />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div className="relative mt-6 flex items-center gap-2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="glass glass-btn px-4 py-2 text-[14px]"
        >
          <RotateCw size={14} /> {flipped ? "Show the front" : "Flip the card"}
        </button>
        <button
          onClick={onEnter}
          autoFocus
          className="lamp-btn px-5 py-2 text-[14px]"
        >
          Enter the room
        </button>
      </motion.div>
    </motion.div>
  );
}

/** The ID card, shrunk into the HUD. Click to bring it back. */
export function HudBadge({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      layoutId="idcard"
      onClick={onOpen}
      aria-label={`Show ${idCard.name}'s ID card`}
      className="glass flex items-center gap-3 rounded-[18px] p-1.5 text-left sm:pr-4"
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      <img src={idCard.avatar} alt="" className="size-10 rounded-[13px] object-cover ring-1 ring-white/10" />
      <span className="hidden sm:block">
        <span className="font-display block text-[17px] leading-tight">{idCard.name}</span>
        <span className="mt-0.5 flex items-center gap-2 text-[11.5px] leading-tight opacity-70">
          {idCard.pillars.map((p) => (
            <span key={p.key} className="flex items-center gap-1">
              <span className="size-1.5 rounded-full" style={{ background: p.color }} />
              {p.label}
            </span>
          ))}
        </span>
      </span>
    </motion.button>
  );
}

/* ================================================================ guide */

type CoachStep = { title: string; body: string; cta?: string };

/**
 * Three-step first-visit guide. Step 1 completes itself once the visitor
 * actually moves the character.
 */
export function Coach({ onFinish, onGoToJobs }: { onFinish: () => void; onGoToJobs: () => void }) {
  const [i, setI] = useState(0);
  const [touch, setTouch] = useState(false);
  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  const steps: CoachStep[] = [
    {
      title: "Walk around",
      body: touch ? "Tap anywhere on the floor to walk there." : "Use WASD or the arrow keys — or click anywhere on the floor.",
    },
    { title: "Explore", body: "The small glowing diamonds mark things you can use. Walk up to one and press E, or tap it." },
    { title: "Start with my work", body: "Every job I’ve had is on the table in the middle of the room.", cta: "Take me there" },
  ];

  // step 1: wait for real movement
  useEffect(() => {
    if (i !== 0) return;
    const start = { ...live.player };
    const id = setInterval(() => {
      if (Math.hypot(live.player.x - start.x, live.player.z - start.z) > 0.8) setI(1);
    }, 200);
    return () => clearInterval(id);
  }, [i]);

  const s = steps[i];
  return (
    <motion.div
      className="glass pointer-events-auto w-[min(420px,calc(100vw-32px))] rounded-[22px] p-4"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {steps.map((_, k) => (
            <span key={k} className={`h-1.5 rounded-full transition-all ${k === i ? "w-5 bg-[var(--lamp)]" : "w-1.5 bg-current opacity-25"}`} />
          ))}
        </div>
        <button onClick={onFinish} className="glass-btn px-2 py-0.5 text-[12px]">
          Skip tour
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
          <p className="font-display mt-3 text-[19px] leading-tight">{s.title}</p>
          {i === 0 && !touch ? (
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-[14px] leading-6 opacity-80">
              <span className="flex gap-0.5">
                {["W", "A", "S", "D"].map((k) => (
                  <span key={k} className="keycap">{k}</span>
                ))}
              </span>
              or the arrow keys, or click anywhere on the floor.
            </p>
          ) : (
            <p className="mt-1.5 text-[14px] leading-6 opacity-80">{s.body}</p>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="mt-3 flex justify-end gap-2">
        {s.cta ? (
          <button
            onClick={() => {
              onGoToJobs();
              onFinish();
            }}
            className="lamp-btn px-4 py-1.5 text-[13px]"
          >
            {s.cta}
          </button>
        ) : (
          <button onClick={() => setI((k) => k + 1)} className="glass-btn px-4 py-1.5 text-[13px]" style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.14)" }}>
            Next
          </button>
        )}
      </div>
    </motion.div>
  );
}
