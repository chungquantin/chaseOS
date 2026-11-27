"use client";

import { useId, useState, type CSSProperties, type ReactNode } from "react";
import type { Chapter } from "app/data/career";

/** Small stable pseudo-random number from a string, so each company keeps its own tilt. */
export function wobble(seed: string, range: number) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return (((h >>> 0) % 1000) / 1000 - 0.5) * 2 * range;
}

/** The company logo as a die-cut vinyl sticker, slightly crooked. */
export function LogoSticker({ org, seed, size = 72, round, name }: { org: Chapter["org"]; seed: string; size?: number; round?: boolean; name?: string }) {
  const [broken, setBroken] = useState(false);
  const pad = Math.max(3, Math.round(size * 0.08));
  return (
    <span
      className={`sticker inline-grid shrink-0 place-items-center ${round ? "rounded-full" : "rounded-[24%]"}`}
      style={{ width: size, height: size, padding: pad, transform: `rotate(${wobble(seed, 7)}deg)` }}
    >
      {org.logo && !broken ? (
        <img src={org.logo} alt="" onError={() => setBroken(true)} className={`size-full object-contain ${round ? "rounded-full" : "rounded-[20%]"}`} />
      ) : (
        <span
          className={`grid size-full place-items-center font-serif font-bold text-white ${round ? "rounded-full" : "rounded-[20%]"}`}
          style={{ background: org.brand, fontSize: size * 0.42 }}
        >
          {org.monogram ?? name?.slice(0, 1) ?? "•"}
        </span>
      )}
    </span>
  );
}

/**
 * A round rubber stamp: company name around the rim, a word across the
 * middle, the year underneath. Ink is uneven, like a real stamp.
 */
export function RubberStamp({
  top,
  middle,
  bottom,
  color = "#b4232a",
  size = 118,
  seed,
  className = "",
  style,
}: {
  top: string;
  middle: string;
  bottom?: string;
  color?: string;
  size?: number;
  seed: string;
  className?: string;
  style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const rim = top.toUpperCase();
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={`ink-stamp pointer-events-none select-none ${className}`}
      style={{ transform: `rotate(${wobble(seed, 14)}deg)`, ...style }}
      aria-hidden
    >
      <defs>
        <path id={`${id}-arc`} d="M 60 60 m -40 0 a 40 40 0 1 1 80 0 a 40 40 0 1 1 -80 0" />
        <filter id={`${id}-ink`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={Math.abs(Math.round(wobble(seed, 50)))} result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.8 0 0 0 1.75" result="holes" />
          <feComposite in="SourceGraphic" in2="holes" operator="in" />
        </filter>
      </defs>
      <g filter={`url(#${id}-ink)`} fill="none" stroke={color} style={{ color }}>
        <circle cx="60" cy="60" r="55" strokeWidth="3.5" />
        <circle cx="60" cy="60" r="49" strokeWidth="1.2" />
        <text
          fill={color}
          stroke="none"
          fontSize={rim.length > 16 ? 8.5 : 10}
          fontWeight={700}
          letterSpacing={rim.length > 16 ? 1 : 2}
          style={{ fontFamily: "var(--font-notebook), Kalam, cursive" }}
        >
          <textPath href={`#${id}-arc`} startOffset="25%" textAnchor="middle">
            ★ {rim} ★
          </textPath>
        </text>
        <rect x="14" y="51" width="92" height="20" stroke={color} strokeWidth="2.2" transform="rotate(-6 60 60)" />
        <text
          x="60"
          y="66"
          fill={color}
          stroke="none"
          fontSize={middle.length > 9 ? 10.5 : 13}
          textAnchor="middle"
          transform="rotate(-6 60 60)"
          style={{ fontFamily: "var(--font-marker), 'Permanent Marker', cursive" }}
        >
          {middle.toUpperCase()}
        </text>
        {bottom && (
          <text x="60" y="88" fill={color} stroke="none" fontSize="9.5" fontWeight={700} textAnchor="middle" letterSpacing="1.5" style={{ fontFamily: "var(--font-notebook), Kalam, cursive" }}>
            {bottom}
          </text>
        )}
      </g>
    </svg>
  );
}

/** A rectangular ink stamp, e.g. "FOUNDING TEAM". */
export function BoxStamp({ children, color = "#b4232a", seed, className = "" }: { children: ReactNode; color?: string; seed: string; className?: string }) {
  return (
    <span
      className={`ink-stamp font-marker inline-block border-[2.5px] px-2.5 pb-0.5 pt-1 text-[15px] uppercase leading-none tracking-[0.06em] ${className}`}
      style={{
        color,
        borderColor: color,
        borderRadius: "3px 6px 2px 5px",
        transform: `rotate(${wobble(seed + "box", 9)}deg)`,
        textShadow: "none",
        WebkitMaskImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.4 0 0 0 1.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        maskImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.4 0 0 0 1.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    >
      {children}
    </span>
  );
}

/** A short strip of clear tape, used to hold things onto the page. */
export function Tape({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <span className={`clear-tape pointer-events-none absolute z-10 block h-5 w-16 ${className}`} style={style} aria-hidden />;
}
