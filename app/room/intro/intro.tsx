"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { RotateCw } from "lucide-react";
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
  day: "bg-[linear-gradient(180deg,#ffffff,#e5e5e5)]",
  night: "bg-[linear-gradient(180deg,#171717,#000000)]",
};

/**
 * Shown until the 3D room has drawn. Exits by swinging two doors open
 * onto the room.
 *
 * Everything that moves while we wait (the character, the bar) is a CSS
 * animation on transform/opacity. Those run on the compositor, so they keep
 * going at full frame rate even while the main thread is busy compiling the
 * 3D room. React only ticks the tiny step label.
 */
export function LoadingScreen({ ready, mood, onDone }: { ready: boolean; mood: Mood; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [opening, setOpening] = useState(false);
  const [done, setDone] = useState(false);
  const minTime = useRef(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => (minTime.current = true), 1400);
    const t2 = setTimeout(() => setTimedOut(true), 15000); // never trap anyone here
    const tick = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1000);
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
      setDone(true);
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
          {/* seam where the doors meet */}
          <span
            className={`absolute inset-y-0 w-px ${dark ? "bg-white/15" : "bg-black/10"} ${side ? "left-0" : "right-0"}`}
            style={{ maskImage: "linear-gradient(to bottom, black, transparent 28%, transparent 72%, black)" }}
          />
        </motion.div>
      ))}
      {/* light through the gap as the doors part */}
      <motion.div
        className="absolute inset-y-0 left-1/2 w-24 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,236,210,0.9),transparent)]"
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={opening ? { opacity: [0, 1, 0], scaleX: [0.2, 3, 8] } : { opacity: 0 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        className="pointer-events-none absolute inset-0"
        animate={{ opacity: opening ? 0 : 1 }}
        transition={{ duration: 0.45, delay: opening ? 0.1 : 0 }}
      >
        <Backdrop dark={dark} />
      </motion.div>

      {/* centre: me at work + progress */}
      <motion.div
        className={`absolute inset-0 flex flex-col items-center justify-center pb-[14vh] ${dark ? "text-[#f5f5f5]" : "text-[#0a0a0a]"}`}
        animate={opening ? { opacity: 0, scale: 0.96 } : { opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Workbench dark={dark} />
        <p className="font-display mt-5 text-[26px] leading-none">Tin Chung</p>
        <div className={`relative mt-4 h-[3px] w-56 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-black/10"}`}>
          <div className="lc-bar absolute inset-0 rounded-full bg-[var(--lamp)]" />
          <div className={`absolute inset-0 bg-[var(--lamp)] transition-opacity duration-300 ${done ? "opacity-100" : "opacity-0"}`} />
        </div>
        <div className="mt-3 h-5 overflow-hidden text-[13px] opacity-75">
          <AnimatePresence mode="wait">
            <motion.p key={done ? "done" : step} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }} transition={{ duration: 0.2 }}>
              {done ? "come on in" : `${STEPS[step]}…`}
            </motion.p>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

/** mulberry32: small seeds still give well-spread values from the first draw. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A tileable strip of flat-shaded towers with lit windows, as an SVG data URI. */
function skylineUri(seed: number, w: number, h: number, minH: number, maxH: number, body: string, lit: string, litChance: number) {
  const r = seeded(seed);
  let s = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>`;
  let x = 0;
  while (x < w) {
    const bw = Math.min(w - x, Math.round(28 + r() * 70));
    const bh = Math.round(minH + r() * (maxH - minH));
    const y = h - bh;
    const roof = r();
    // body — either a plain tower, a stepped setback, or a slanted roof
    if (roof < 0.18 && bw > 50) {
      // stepped setback
      const stepIn = Math.round(bw * 0.3);
      const stepUp = Math.round(bh * 0.25);
      s += `<rect x='${x}' y='${y + stepUp}' width='${bw}' height='${bh - stepUp}' fill='${body}'/>`;
      s += `<rect x='${x + stepIn / 2}' y='${y}' width='${bw - stepIn}' height='${stepUp + 2}' fill='${body}'/>`;
    } else if (roof < 0.3 && bw > 44) {
      // slanted roof
      const slope = 14 + Math.round(r() * 10);
      s += `<polygon points='${x},${y + slope} ${x + bw},${y} ${x + bw},${h} ${x},${h}' fill='${body}'/>`;
    } else {
      s += `<rect x='${x}' y='${y}' width='${bw}' height='${bh}' fill='${body}'/>`;
    }
    // vertical shade on the right third — cheap faceted look
    s += `<rect x='${x + bw * 0.66}' y='${y}' width='${bw * 0.34}' height='${bh}' fill='#000' opacity='0.22'/>`;
    // top edge highlight
    s += `<rect x='${x}' y='${y}' width='${bw}' height='2' fill='#fff' opacity='0.1'/>`;
    // rooftop clutter: antenna, water tank or AC unit
    if (bw > 36) {
      const pick = r();
      if (pick < 0.3) {
        // antenna
        s += `<rect x='${x + bw / 2 - 1}' y='${y - 16}' width='2' height='16' fill='${body}'/>`;
        s += `<rect x='${x + bw / 2 - 4}' y='${y - 18}' width='8' height='2' fill='${body}'/>`;
      } else if (pick < 0.45) {
        // water tank
        s += `<rect x='${x + bw / 2 - 8}' y='${y - 12}' width='16' height='12' fill='${body}'/>`;
        s += `<rect x='${x + bw / 2 - 10}' y='${y - 14}' width='20' height='3' fill='${body}'/>`;
      } else if (pick < 0.6) {
        // AC unit
        s += `<rect x='${x + bw / 2 - 10}' y='${y - 6}' width='20' height='6' fill='${body}'/>`;
      }
    }
    // windows on a grid
    const cols = Math.floor((bw - 12) / 12);
    const rows = Math.min(14, Math.floor((bh - 20) / 16));
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < rows; k++) {
        if (r() < litChance) s += `<rect x='${x + 8 + c * 12}' y='${y + 14 + k * 16}' width='5' height='7' rx='1' fill='${lit}' opacity='${(0.5 + r() * 0.5).toFixed(2)}'/>`;
      }
    }
    x += bw;
  }
  s += "</svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
}

/** Hand-placed constellations + a sparse scatter. */
function starsUri(seed: number, w: number, h: number) {
  const r = seeded(seed);
  let s = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>`;

  // sparse background scatter
  for (let i = 0; i < 90; i++) {
    const x = Math.round(r() * w);
    const y = Math.round(r() * h * 0.85);
    const z = r() < 0.15 ? 2 : 1;
    const o = (0.35 + r() * 0.45).toFixed(2);
    s += `<rect x='${x}' y='${y}' width='${z}' height='${z}' fill='#fff' opacity='${o}'/>`;
  }

  // a handful of bright stars with a tiny 4-point glint
  const brights: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < 9; i++) {
    const x = 60 + Math.round(r() * (w - 120));
    const y = 40 + Math.round(r() * (h * 0.6));
    const rad = 1.4 + r() * 1.2;
    brights.push({ x, y, r: rad });
    s += `<circle cx='${x}' cy='${y}' r='${rad}' fill='#fff' opacity='0.95'/>`;
    const g = rad + 3.5;
    s += `<polygon points='${x},${y - g} ${x + 1},${y - 1} ${x + g},${y} ${x + 1},${y + 1} ${x},${y + g} ${x - 1},${y + 1} ${x - g},${y} ${x - 1},${y - 1}' fill='#fff' opacity='0.5'/>`;
  }

  // thin lines connecting a few nearby bright stars — constellation hint
  for (let i = 0; i < brights.length - 1; i++) {
    const a = brights[i];
    const b = brights[i + 1];
    const d = Math.hypot(a.x - b.x, a.y - b.y);
    if (d < 160) {
      s += `<line x1='${a.x}' y1='${a.y}' x2='${b.x}' y2='${b.y}' stroke='#fff' stroke-opacity='0.1' stroke-width='1'/>`;
    }
  }

  s += "</svg>";
  return `url("data:image/svg+xml,${encodeURIComponent(s)}")`;
}

const DIAMONDS = Array.from({ length: 11 }, (_, i) => {
  const r = seeded(40 + i * 7);
  return { left: 4 + r() * 92, size: 6 + r() * 8, dur: 9 + r() * 7, delay: -r() * 14, dx: (r() - 0.5) * 80 };
});

/**
 * Night city (or warm day city) behind the loader, in the same flat-shaded
 * low-poly style as the room. Two skyline strips drift at different speeds for
 * depth; stars twinkle, a moon floats, and glowing diamonds, like the ones you
 * can interact with in the room, rise. All of it is transform/opacity only.
 */
function Backdrop({ dark }: { dark: boolean }) {
  const art = useMemo(
    () =>
      dark
        ? {
            far: skylineUri(11, 1100, 260, 70, 190, "#1f1f1f", "#e5e5e5", 0.12),
            near: skylineUri(23, 900, 230, 60, 170, "#0a0a0a", "#ffc27d", 0.3),
            starsA: starsUri(5, 1000, 560),
            starsB: starsUri(9, 1000, 560),
          }
        : {
            far: skylineUri(11, 1100, 260, 70, 190, "#d9d9d9", "#ffffff", 0.14),
            near: skylineUri(23, 900, 230, 60, 170, "#b5b5b5", "#ffffff", 0.3),
            starsA: "",
            starsB: "",
          },
    [dark],
  );

  return (
    <div className={`lb ${dark ? "lb-night" : "lb-day"}`} aria-hidden>
      <div className="lb-glow lb-glow-a" />
      <div className="lb-glow lb-glow-b" />
      {dark && (
        <>
          <div className="lb-stars lb-stars-a" style={{ backgroundImage: art.starsA }} />
          <div className="lb-stars lb-stars-b" style={{ backgroundImage: art.starsB }} />
          <span className="lb-shoot" />
          <span className="lb-shoot lb-shoot-b" />
        </>
      )}
      {!dark && (
        <>
          <span className="lb-cloud lb-cloud-a" />
          <span className="lb-cloud lb-cloud-b" />
          <span className="lb-cloud lb-cloud-c" />
        </>
      )}
      <div className="lb-orb">
        <span className="lb-orb-glow" />
        <span className="lb-orb-body" />
      </div>
      <div className="lb-sky lb-far" style={{ backgroundImage: art.far, ["--tile" as string]: "1100px" }} />
      <div className="lb-sky lb-near" style={{ backgroundImage: art.near, ["--tile" as string]: "900px" }} />
      {DIAMONDS.map((d, i) => (
        <span
          key={i}
          className="lb-diamond"
          style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s`, ["--dx" as string]: `${d.dx}px` }}
        />
      ))}
      <div className="lb-vignette" />
    </div>
  );
}

const CHIPS = [
  { t: "fn main()", c: "#ffc27d", x: 10, y: 86, dx: -14, delay: 0 },
  { t: "0x7a3f", c: "#fafafa", x: 54, y: 58, dx: -6, delay: 1.1 },
  { t: "// shipping", c: "#d4d4d4", x: 198, y: 94, dx: 10, delay: 2.2 },
];

/**
 * The low-poly me, working at a laptop. Built from the same chunky rounded
 * blocks and palette as the 3D character (see scene/chibi.tsx), as plain DOM
 * layers so every motion is a compositor-only transform/opacity animation.
 */
function Workbench({ dark }: { dark: boolean }) {
  return (
    <div className={`lc ${dark ? "lc-night" : "lc-day"}`} aria-hidden>
      <div className="lc-floor" />

      {CHIPS.map((c, i) => (
        <span key={i} className="lc-chip" style={{ left: c.x, top: c.y, color: c.c, animationDelay: `${c.delay}s`, ["--dx" as string]: `${c.dx}px` }}>
          {c.t}
        </span>
      ))}

      {/* plant */}
      <div className="lc-plant">
        <span className="lc-leaf lc-leaf-a" />
        <span className="lc-leaf lc-leaf-b" />
        <span className="lc-leaf lc-leaf-c" />
        <span className="lc-pot pb" />
      </div>

      {/* character */}
      <div className="lc-body">
        <span className="lc-torso pb">
          <i className="lc-pocket" />
        </span>
        <span className="lc-collar pb" />
        <span className="lc-arm lc-arm-l pb">
          <i className="lc-hand pb" />
        </span>
        <span className="lc-arm lc-arm-r pb">
          <i className="lc-hand pb" />
        </span>
        <div className="lc-head">
          <span className="lc-skin pb" />
          <span className="lc-spill" />
          <span className="lc-hair lc-hair-cap pb" />
          <span className="lc-hair lc-hair-l pb" />
          <span className="lc-hair lc-hair-r pb" />
          <span className="lc-hair lc-fringe pb" />
          <span className="lc-cheek lc-cheek-l" />
          <span className="lc-cheek lc-cheek-r" />
          <span className="lc-lens lc-lens-l">
            <i className="lc-eye"><b /></i>
          </span>
          <span className="lc-lens lc-lens-r">
            <i className="lc-eye"><b /></i>
          </span>
          <span className="lc-bridge" />
          <span className="lc-smile" />
        </div>
      </div>

      {/* desk */}
      <span className="lc-desk pb" />
      <span className="lc-desk-front pb" />

      {/* mug */}
      <div className="lc-mug-wrap">
        <span className="lc-steam" />
        <span className="lc-steam lc-steam-b" />
        <span className="lc-mug pb" />
      </div>

      {/* laptop, seen from behind */}
      <div className="lc-laptop">
        <span className="lc-lid pb">
          <i className="lc-rim" />
          <i className="lc-logo" />
        </span>
        <span className="lc-base pb" />
      </div>
    </div>
  );
}

/* ================================================================ ID card */

/**
 * A spiral-bound engineer's notebook, open to one page. Graph paper, a strip
 * of punch holes down the left, a handwritten page header on the right, and
 * a short, first-person paragraph that does the identity. No bullets, no
 * numbers, no sales words.
 */
function CardFront() {
  return (
    <div className="nb-page">
      <NotebookChrome />
      <div className="relative flex h-full gap-5 pl-16 pr-6 py-5">
        {/* avatar + name column */}
        <div className="flex w-[34%] shrink-0 flex-col items-start justify-between">
          <div className="flex items-center gap-3">
            <img
              src={idCard.avatar}
              alt={idCard.name}
              className="size-14 rounded-xl border border-black/10 bg-[#f3eee4] object-cover shadow-sm"
            />
            <div>
              <p className="font-marker text-[24px] leading-none">{idCard.name}</p>
              <p className="font-hand-sc mt-1 text-[12px] uppercase">@{profile.handle}</p>
            </div>
          </div>
          <div className="font-hand-sc text-[12px] uppercase">
            <p>Software Engineer</p>
            <p className="mt-0.5">Ho Chi Minh · Remote</p>
          </div>
        </div>

        {/* body column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-baseline justify-between">
            <h2 className="font-marker text-[32px] leading-none">About me</h2>
            <span className="font-hand-sc text-[12px] uppercase opacity-70">00 / front</span>
          </header>
          <p className="font-hand mt-4 text-[18px] leading-[22px]">
            I like understanding things at the level most people skip. Compilers under query
            languages, state machines under blockchains, kernels under databases. When I like
            something, I write my own version of it.
          </p>
          <p className="font-hand mt-[22px] text-[18px] leading-[22px]">
            That's how I've ended up where I am: writing Rust close to the machine, for data
            systems, blockchains and agents.
          </p>
          <p className="font-hand mt-auto flex items-center justify-end gap-1 text-[16px] opacity-80">
            <span>→</span> chungquantin.com
          </p>
        </div>
      </div>
    </div>
  );
}

function CardBack() {
  return (
    <div className="nb-page">
      <NotebookChrome />
      <div className="relative flex h-full flex-col gap-3 pl-14 pr-6 py-5">
        <header className="flex items-baseline justify-between">
          <h2 className="font-marker text-[30px] leading-none">About this site</h2>
          <span className="font-hand-sc text-[12px] uppercase opacity-70">01 / back</span>
        </header>

        <p className="font-hand mt-2 text-[17px] leading-[1.55]">
          This isn't a portfolio, it's a room.
        </p>
        <p className="font-hand text-[17px] leading-[1.55] opacity-90">
          I grew up in Ho Chi Minh — the city outside — so I built one. The scooters,
          the roofs, the lit windows at night: those are the streets I know.
        </p>
        <p className="font-hand text-[17px] leading-[1.55] opacity-90">
          The room is mine too. The bookshelf holds essays I wrote. The glass case
          holds projects I shipped. The desk is where you'll find my past jobs,
          spread out on paper.
        </p>
        <p className="font-hand text-[17px] leading-[1.55] opacity-90">
          Walk around. WASD, or click the floor. Press E on anything that glows.
        </p>

        <div className="font-hand mt-auto flex items-center justify-between text-[16px] opacity-70">
          <div className="-ml-1 flex items-center">
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="nb-link inline-block rounded-md px-2 py-1"
            >
              LinkedIn
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="nb-link inline-block rounded-md px-2 py-1"
            >
              GitHub
            </a>
            <a
              href={profile.links.x}
              target="_blank"
              rel="noreferrer"
              className="nb-link inline-block rounded-md px-2 py-1"
              aria-label="Twitter / X"
            >
              Twitter
            </a>
          </div>
          <span>→ chungquantin.com</span>
        </div>
      </div>
    </div>
  );
}

/** Punch holes + red margin line + the graph-paper background. */
function NotebookChrome() {
  return (
    <>
      <div className="nb-grid" aria-hidden />
      <div className="nb-margin" aria-hidden />
      <div className="nb-holes" aria-hidden>
        {Array.from({ length: 7 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>
    </>
  );
}

/**
 * A lanyard ID that drops in and swings, tilts gently toward the pointer,
 * flips to show the back, and shrinks into the HUD badge on "Enter the room".
 *
 * The sway is a soft spring on a long transform-origin above the viewport,
 * so the card feels like it's hanging from a cord without any physics loop.
 */
/**
 * A tiny two-pivot pendulum sim for the lanyard.
 *
 *   anchor (top of the strap, fixed off-screen)
 *       │
 *       └──── strap, pivots around the anchor, angle θ₁
 *             │
 *             └── clip / card, pivots around the clip, angle θ₂
 *
 * Both pivots have their own moment of inertia, gravity restoring torque, and
 * viscous damping. The cursor applies a small horizontal nudge to the anchor,
 * as if someone's finger were pushing the top of the strap sideways. On every
 * frame we integrate forward and expose the two angles as MotionValues so the
 * DOM can rotate accordingly.
 */
function usePendulumLanyard() {
  const strapDeg = useMotionValue(0);
  const cardDeg = useMotionValue(0);

  const state = useRef({
    strapAngle: 0, // radians
    strapVel: 0,
    cardAngle: 0,
    cardVel: 0,
    cursor: 0, // -1 to 1 across the viewport
  });

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const s = state.current;

      // Strap: a long, light rod. Restoring torque pulls θ₁ back to the
      // cursor-biased rest angle; damping is low so it swings freely.
      // ~5deg max lean under cursor (half of before), so it's calmer and
      // readable while the cursor is still moving around.
      const strapRest = s.cursor * 0.09;
      const strapK = 60; // much stiffer → faster return, smaller amplitude
      const strapD = 4.5; // more damping → settles in one swing, not three
      const strapAcc = -strapK * (s.strapAngle - strapRest) - strapD * s.strapVel;
      s.strapVel += strapAcc * dt;
      s.strapAngle += s.strapVel * dt;

      // Card: hangs under the clip. Its restoring torque follows the strap's
      // tip, with a lag — that's the overshoot/settle that sells the "mass."
      const cardK = 55;
      const cardD = 5;
      // Lighter coupling so the paper doesn't whip around.
      const inertial = -strapAcc * 0.35;
      const cardAcc = -cardK * (s.cardAngle - s.strapAngle) - cardD * s.cardVel + inertial;
      s.cardVel += cardAcc * dt;
      s.cardAngle += s.cardVel * dt;

      strapDeg.set((s.strapAngle * 180) / Math.PI);
      cardDeg.set((s.cardAngle * 180) / Math.PI);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [cardDeg, strapDeg]);

  return {
    strapDeg,
    cardDeg,
    setCursor(x: number) {
      state.current.cursor = x;
    },
    /** Called on mount or re-entry to add energy to the system. */
    nudge(strength = 0.3) {
      state.current.strapVel += strength;
    },
  };
}

export function IdCard({ onEnter }: { onEnter: () => void }) {
  const [flipped, setFlipped] = useState(false);
  const pendulum = usePendulumLanyard();
  // Paper rotates by the *difference* between the paper's angle and the
  // strap's, so it shares the strap's swing and only adds its own lag.
  const paperHinge = useTransform<number, number>(
    [pendulum.cardDeg, pendulum.strapDeg],
    ([cardA, strapA]) => (cardA ?? 0) - (strapA ?? 0),
  );
  // local pointer over the card drives a smaller 3D tilt (parallax, separate from sway)
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const gx = useMotionValue(50);
  const sheen = useMotionTemplate`linear-gradient(105deg, transparent ${gx}%, rgba(255,194,125,0.35) calc(${gx}% + 8%), transparent calc(${gx}% + 16%))`;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") onEnter();
    };
    const onMove = (e: PointerEvent) => {
      pendulum.setCursor((e.clientX / window.innerWidth) * 2 - 1);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointermove", onMove);
    // calmer entry nudge
    pendulum.nudge(-0.15);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointermove", onMove);
    };
  }, [onEnter, pendulum]);

  return (
    <motion.div
      className="fixed inset-0 z-[55] flex flex-col items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.3 } }}
      role="dialog"
      aria-label={`${idCard.name}, ${idCard.title}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.35),rgba(0,0,0,0.7))]" />

      {/* V-shaped lanyard. The whole rig rotates as one unit around the
          wearer's neck above the viewport (strapDeg). The paper then adds a
          second small rotation relative to the strap, which is the lag you
          see when the lanyard stops moving. */}
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ y: "-110vh", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ y: { type: "spring", stiffness: 90, damping: 14 }, opacity: { duration: 0.2 } }}
        style={{ transformOrigin: "50% -60vh", rotate: pendulum.strapDeg }}
      >
        {/* two straps diverging upward from the clip */}
        <div className="absolute bottom-full h-[60vh] w-[180px]" aria-hidden>
          <div
            className="lanyard-strap absolute bottom-0 left-0 h-full w-7 origin-bottom"
            style={{ transform: "translateX(68px) rotate(-7deg)", transformOrigin: "50% 100%" }}
          >
            <p
              className="lanyard-text absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ writingMode: "vertical-rl" }}
            >
              CHUNGQUANTIN · CHUNGQUANTIN
            </p>
          </div>
          <div
            className="lanyard-strap absolute bottom-0 right-0 h-full w-7 origin-bottom"
            style={{ transform: "translateX(-68px) rotate(7deg)", transformOrigin: "50% 100%" }}
          >
            <p
              className="lanyard-text absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
              style={{ writingMode: "vertical-rl" }}
            >
              CHUNGQUANTIN · CHUNGQUANTIN
            </p>
          </div>
        </div>

        {/* paper hinge: a small extra rotation at the clip. This is the
            "lag" of a real lanyard — the paper keeps swinging after the
            straps have stopped. */}
        <motion.div
          className="relative flex flex-col items-center"
          style={{ transformOrigin: "50% 10px", rotate: paperHinge }}
        >
          <div className="lanyard-clip relative z-10 -mb-3" aria-hidden>
            <span className="clip-arm" />
            <span className="clip-bite" />
            <span className="clip-spring" />
          </div>

          <motion.div
            layoutId="idcard"
            className="relative"
            style={{ width: "min(640px, 92vw)", height: "min(360px, calc(92vw * 9 / 16))", perspective: 1400 }}
            onPointerMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const lx = (e.clientX - r.left) / r.width;
              const ly = (e.clientY - r.top) / r.height;
              ry.set((lx - 0.5) * 6);
              rx.set(-(ly - 0.5) * 4);
              gx.set(lx * 100 - 20);
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
                <div
                  className="absolute inset-0 overflow-hidden rounded-[10px]"
                  style={{ backfaceVisibility: "hidden", pointerEvents: flipped ? "none" : "auto", zIndex: flipped ? 0 : 1 }}
                >
                  <CardFront />
                  <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />
                </div>
                <div
                  className="absolute inset-0 overflow-hidden rounded-[10px]"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", pointerEvents: flipped ? "auto" : "none", zIndex: flipped ? 1 : 0 }}
                >
                  <CardBack />
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div
        className="relative mt-6 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
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
