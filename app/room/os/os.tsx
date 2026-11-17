"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Battery, Power, Wifi, X } from "lucide-react";
import { idCard } from "app/data/profile";
import { BUILT_APPS } from "app/data/apps";
import type { PostSummary } from "../panels/writing-panel";
import { APPS, appById, type AppDef, type AppId } from "./apps";
import { AppIcon } from "./my-apps";

/** Persist across opening/closing the computer within one visit. */
let bootedThisVisit = false;
let savedWindows: Win[] | null = null;

type Win = { id: AppId; x: number; y: number; w: number; h: number; z: number; min: boolean; max: boolean; arg?: string };
type Size = { w: number; h: number };

const MENU_H = 30;
/** space kept free for the dock: icons + padding + running dots + gap */
const DOCK_RESERVE = 86;
const DOCK_RESERVE_COMPACT = 74;
/** breathing room between windows and the edges of the work area */
const PAD = 10;
const COMPACT_BELOW = 640;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

function workArea({ w, h }: Size, compact: boolean) {
  const top = MENU_H;
  const bottom = h - (compact ? DOCK_RESERVE_COMPACT : DOCK_RESERVE);
  return { top, bottom, width: w, height: Math.max(0, bottom - top) };
}

/** Where a window actually draws, given the current screen. Never outside the work area. */
function frameOf(win: Win, size: Size, compact: boolean) {
  const a = workArea(size, compact);
  if (compact || win.max) return { x: 0, y: a.top, w: a.width, h: a.height };
  const w = Math.min(win.w, a.width - PAD * 2);
  const h = Math.min(win.h, a.height - PAD * 2);
  // keep at least the title bar reachable when dragged towards an edge
  const x = clamp(win.x, 120 - w, a.width - 120);
  const y = clamp(win.y, a.top + 4, a.bottom - 44);
  return { x, y, w, h };
}

function useSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setSize({ w: r.width, h: r.height });
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/* =========================================================== brand mark */

function Mark({ size = 18 }: { size?: number }) {
  // "TC" monogram inside a rounded lamp-shade shape — RoomOS's own mark
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <path d="M9 5h14l5 13c0 5-5.4 9-12 9S4 23 4 18L9 5Z" fill="currentColor" opacity="0.18" />
      <path d="M9 5h14l5 13c0 5-5.4 9-12 9S4 23 4 18L9 5Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <text x="16" y="21" textAnchor="middle" fontSize="10" fontWeight="700" fill="currentColor" fontFamily="var(--font-display), Georgia, serif">
        TC
      </text>
    </svg>
  );
}

/* ================================================================ boot */

function Boot({ onDone }: { onDone: () => void }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf = 0;
    let done: ReturnType<typeof setTimeout> | undefined;
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 2200);
      // stall a little in the middle, like a real boot
      setP(k < 0.45 ? k * 1.4 : k < 0.6 ? 0.63 : 0.63 + (k - 0.6) * 0.925);
      if (k < 1) raf = requestAnimationFrame(tick);
      else done = setTimeout(onDone, 250);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [onDone]);
  return (
    <motion.div className="absolute inset-0 grid place-items-center bg-black text-white" exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
      <div className="flex flex-col items-center">
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
          <Mark size={76} />
        </motion.div>
        <div className="mt-10 h-[5px] w-44 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white" style={{ width: `${p * 100}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

/* =============================================================== login */

function Login({ onLogin }: { onLogin: () => void }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") onLogin();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, [onLogin]);
  return (
    <motion.div
      className="os-wallpaper absolute inset-0 flex flex-col items-center overflow-hidden text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 backdrop-blur-[18px]" />
      <div className="relative mt-[12vh] text-center sm:mt-[9%]">
        <p className="text-[16px] font-medium opacity-85 sm:text-[18px]">
          {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
        <p className="font-display text-[72px] font-light leading-none tracking-tight sm:text-[88px]">
          {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "")}
        </p>
      </div>
      <div className="relative mb-[12%] mt-auto flex flex-col items-center">
        <img src={idCard.avatar} alt="" className="size-20 rounded-full border border-white/30 object-cover shadow-lg" />
        <p className="font-display mt-3 text-[20px]">{idCard.name}</p>
        <button onClick={onLogin} autoFocus className="lamp-btn mt-4 px-6 py-2 text-[14px]">
          Log in
        </button>
        <p className="mt-2 text-[12px] opacity-60">No password. Press Enter.</p>
      </div>
    </motion.div>
  );
}

/* ============================================================ menu bar */

function MenuBar({ focused, compact, onShutDown }: { focused: AppDef | null; compact: boolean; onShutDown: () => void }) {
  const [now, setNow] = useState(() => new Date());
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return (
    <div
      className="absolute inset-x-0 top-0 z-[500] flex items-center justify-between gap-3 bg-[rgba(18,16,38,0.5)] pl-2 pr-2 text-[13px] text-white backdrop-blur-xl sm:pr-3"
      style={{ height: MENU_H }}
    >
      <div className="relative flex min-w-0 items-center gap-3">
        <button
          onClick={() => setMenu((m) => !m)}
          aria-label="RoomOS menu"
          aria-expanded={menu}
          className="grid h-6 w-7 shrink-0 place-items-center rounded hover:bg-white/15"
        >
          <Mark size={17} />
        </button>
        <span className="truncate font-semibold">{focused?.name ?? "Desktop"}</span>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.12 }}
              className="absolute left-0 top-7 w-60 rounded-xl border border-white/10 bg-[rgba(30,28,56,0.94)] p-1.5 shadow-2xl backdrop-blur-xl"
              onMouseLeave={() => setMenu(false)}
            >
              <p className="px-2.5 py-1.5 text-[12px] opacity-60">RoomOS 1.0 on {idCard.name}’s desk</p>
              <button
                onClick={onShutDown}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left hover:bg-[#ffc27d] hover:text-[#2a1606]"
              >
                <Power size={14} /> Step away from the computer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="flex shrink-0 items-center gap-3 opacity-90">
        {!compact && <Wifi size={15} aria-hidden />}
        {!compact && <Battery size={17} aria-hidden />}
        <span className="tabular-nums">
          {compact ? time : `${now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}  ${time}`}
        </span>
        {compact && (
          <button onClick={onShutDown} aria-label="Step away from the computer" className="grid size-6 place-items-center rounded-full bg-white/15">
            <X size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ================================================================ dock */

const DOCK_BASE = 48;
const DOCK_PEAK = 64;

function DockIcon({
  app,
  mouseX,
  running,
  compact,
  onOpen,
}: {
  app: AppDef;
  mouseX: MotionValue<number>;
  running: boolean;
  compact: boolean;
  onOpen: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const dist = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    return r ? x - (r.left + r.width / 2) : Infinity;
  });
  const size = useSpring(useTransform(dist, [-130, 0, 130], [DOCK_BASE, DOCK_PEAK, DOCK_BASE]), { stiffness: 380, damping: 28 });
  const { Icon } = app;
  return (
    <div className="relative flex shrink-0 flex-col items-center">
      <motion.button
        ref={ref}
        onClick={onOpen}
        aria-label={`Open ${app.name}`}
        className="group relative grid place-items-center rounded-[23%] text-white shadow-[0_6px_14px_-6px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.35)]"
        style={{
          width: compact ? 32 : size,
          height: compact ? 32 : size,
          background: `linear-gradient(160deg, ${app.tint[0]}, ${app.tint[1]})`,
        }}
        whileTap={{ scale: 0.9 }}
      >
        <Icon className="h-[46%] w-[46%] drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]" strokeWidth={1.9} />
        {!compact && (
          <span className="pointer-events-none absolute -top-8 whitespace-nowrap rounded-md bg-[rgba(30,28,56,0.92)] px-2 py-0.5 text-[12px] opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            {app.name}
          </span>
        )}
      </motion.button>
      <span className={`mt-[3px] size-1 rounded-full bg-white/85 transition-opacity ${running ? "opacity-100" : "opacity-0"}`} />
    </div>
  );
}

function Dock({ wins, compact, onOpen }: { wins: Win[]; compact: boolean; onOpen: (id: AppId) => void }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <div className={`absolute inset-x-0 bottom-1.5 z-[400] flex justify-center ${compact ? "px-2" : ""}`}>
      <div
        className={`flex items-end ${compact ? "gap-1" : "gap-2"} rounded-[20px] border border-white/15 bg-[rgba(255,255,255,0.14)] px-2 pb-[3px] pt-2 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] backdrop-blur-2xl ${
          compact ? "max-w-full overflow-x-auto [scrollbar-width:none]" : ""
        }`}
        style={{ height: compact ? 52 : DOCK_BASE + 18 }}
        onMouseMove={compact ? undefined : (e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
      >
        {APPS.map((a, i) => (
          <div key={a.id} className={`flex items-end ${compact ? "gap-1" : "gap-2"}`}>
            {/* a hairline between the "about me" apps and the utilities, like a real dock */}
            {i === 4 && <span className="mb-2 h-9 w-px shrink-0 self-end bg-white/25" aria-hidden />}
            <DockIcon app={a} mouseX={mouseX} compact={compact} running={wins.some((w) => w.id === a.id)} onOpen={() => onOpen(a.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================= windows */

function useDrag(onMove: (dx: number, dy: number) => void) {
  return (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    let lx = e.clientX;
    let ly = e.clientY;
    const move = (ev: PointerEvent) => {
      onMove(ev.clientX - lx, ev.clientY - ly);
      lx = ev.clientX;
      ly = ev.clientY;
    };
    const up = () => {
      target.removeEventListener("pointermove", move);
      target.removeEventListener("pointerup", up);
      target.removeEventListener("pointercancel", up);
    };
    target.addEventListener("pointermove", move);
    target.addEventListener("pointerup", up);
    target.addEventListener("pointercancel", up);
  };
}

type WinActions = {
  focus: () => void;
  close: () => void;
  minimize: () => void;
  toggleMax: () => void;
  move: (dx: number, dy: number) => void;
  resize: (dw: number, dh: number) => void;
  open: (id: AppId, arg?: string) => void;
};

const LIGHTS = [
  { c: "#ff5f57", label: "Close", glyph: "M3.5 3.5l5 5M8.5 3.5l-5 5" },
  { c: "#febc2e", label: "Minimize", glyph: "M3 6h6" },
  { c: "#28c840", label: "Zoom", glyph: "M3.5 6h5M6 3.5v5" },
] as const;

function Window({
  win,
  frame,
  focused,
  compact,
  posts,
  actions,
}: {
  win: Win;
  frame: { x: number; y: number; w: number; h: number };
  focused: boolean;
  compact: boolean;
  posts: PostSummary[];
  actions: WinActions;
}) {
  const app = appById[win.id];
  const drag = useDrag(actions.move);
  const resize = useDrag(actions.resize);
  const full = compact || win.max;
  const { Component } = app;
  const handlers = { Close: actions.close, Minimize: actions.minimize, Zoom: actions.toggleMax };
  return (
    <motion.div
      role="dialog"
      aria-label={app.name}
      className={`absolute flex flex-col overflow-hidden ${full ? "rounded-none" : "rounded-[12px]"} ${
        focused
          ? "shadow-[0_30px_70px_-20px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.14)]"
          : "shadow-[0_16px_40px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)]"
      }`}
      style={{ left: frame.x, top: frame.y, width: frame.w, height: frame.h, zIndex: win.z }}
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={win.min ? { opacity: 0, scale: 0.2, y: 400, pointerEvents: "none" } : { opacity: 1, scale: 1, y: 0, pointerEvents: "auto" }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.15 } }}
      transition={{ type: "spring", stiffness: 420, damping: 34 }}
      onPointerDown={actions.focus}
    >
      {/* title bar */}
      <div
        className={`relative flex h-9 shrink-0 cursor-default select-none items-center border-b px-3 transition-colors ${
          app.dark ? "border-white/[0.06] bg-[#1d2033] text-[#c9cfee]" : "border-black/[0.06] bg-[#efebe4] text-[#57534e]"
        } ${focused ? "" : "opacity-[0.92]"}`}
        onPointerDown={compact ? undefined : drag}
        onDoubleClick={compact ? undefined : actions.toggleMax}
      >
        <div className="group relative z-10 flex gap-2" onPointerDown={(e) => e.stopPropagation()}>
          {LIGHTS.filter((l) => !compact || l.label === "Close").map((l) => (
            <button
              key={l.label}
              onClick={handlers[l.label]}
              aria-label={`${l.label} ${app.name}`}
              className="grid size-3 place-items-center rounded-full shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.25)]"
              style={{ background: focused || compact ? l.c : app.dark ? "#4b4f66" : "#cfc9bf" }}
            >
              <svg viewBox="0 0 12 12" className="size-2.5 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden>
                <path d={l.glyph} stroke="rgba(0,0,0,0.55)" strokeWidth="1.3" strokeLinecap="round" fill="none" />
              </svg>
            </button>
          ))}
        </div>
        <p className="pointer-events-none absolute inset-x-16 truncate text-center text-[13px] font-medium">{app.name}</p>
      </div>
      <div className="@container min-h-0 flex-1">
        <Component posts={posts} open={actions.open} closeSelf={actions.close} arg={win.arg} />
      </div>
      {!full && <div className="absolute bottom-0 right-0 z-10 size-4 cursor-nwse-resize" onPointerDown={resize} aria-hidden />}
    </motion.div>
  );
}

/* ======================================================= desktop icons */

type Shortcut = { key: string; label: string; icon: React.ReactNode; open: () => void };

const ICON_ROW = 100;

function IconButton({ s, compact }: { s: Shortcut; compact: boolean }) {
  return (
    <button
      onDoubleClick={compact ? undefined : s.open}
      onClick={(e) => (compact || e.detail === 0) && s.open()}
      className="group flex w-[84px] flex-col items-center gap-1.5 rounded-lg p-1 text-white focus-visible:bg-white/15"
    >
      {s.icon}
      <span
        className="rounded px-1 text-center text-[12px] leading-[1.25] [text-shadow:0_1px_3px_rgba(0,0,0,0.7)] group-hover:bg-white/15"
        style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}
      >
        {s.label}
      </span>
    </button>
  );
}

/** System shortcuts in the rightmost column, my apps in columns to its left, like icons on a Mac desktop. */
function DesktopIcons({ system, apps, compact, rows }: { system: Shortcut[]; apps: Shortcut[]; compact: boolean; rows: number }) {
  if (compact)
    return (
      <div className="absolute inset-x-0 top-[calc(30px+16px)] z-[5] grid grid-cols-4 justify-items-center gap-y-3 px-3">
        {[...system, ...apps].map((s) => (
          <IconButton key={s.key} s={s} compact />
        ))}
      </div>
    );
  const r = Math.max(1, rows);
  const column = (items: Shortcut[]) => (
    <div className="grid grid-flow-col gap-x-1 [direction:rtl]" style={{ gridTemplateRows: `repeat(${r}, ${ICON_ROW}px)` }}>
      {items.map((s) => (
        <div key={s.key} className="[direction:ltr]">
          <IconButton s={s} compact={false} />
        </div>
      ))}
    </div>
  );
  return (
    <div className="absolute right-3 top-[calc(30px+12px)] z-[5] flex flex-row-reverse items-start gap-x-1">
      {column(system)}
      {column(apps)}
    </div>
  );
}

/* ============================================================== desktop */

function Desktop({ posts, onShutDown }: { posts: PostSummary[]; onShutDown: () => void }) {
  const screen = useRef<HTMLDivElement>(null);
  const size = useSize(screen);
  const compact = size.w > 0 && size.w < COMPACT_BELOW;
  const [wins, setWins] = useState<Win[]>(() => savedWindows ?? []);
  const zTop = useRef(Math.max(10, ...wins.map((w) => w.z)));
  const sizeRef = useRef(size);
  sizeRef.current = size;

  useEffect(() => {
    savedWindows = wins;
  }, [wins]);

  const open = useCallback((id: AppId, rawArg?: string) => {
    // a nonce makes "open the same thing again" still count as a change
    const arg = rawArg ? `${rawArg}@${Date.now()}` : undefined;
    setWins((ws) => {
      zTop.current += 1;
      const existing = ws.find((w) => w.id === id);
      if (existing) return ws.map((w) => (w.id === id ? { ...w, min: false, z: zTop.current, arg: arg ?? w.arg } : w));
      const s = sizeRef.current.w ? sizeRef.current : { w: 1200, h: 760 };
      const a = workArea(s, s.w < COMPACT_BELOW);
      const [dw, dh] = appById[id].size;
      const w = Math.min(dw, a.width - PAD * 2);
      const h = Math.min(dh, a.height - PAD * 2);
      const n = ws.filter((x) => !x.min).length % 5;
      // centred in the work area, cascading a little for each open window
      const x = clamp((a.width - w) / 2 + n * 26 - 52, PAD, a.width - w - PAD);
      const y = clamp(a.top + (a.height - h) / 2 + n * 22 - 44, a.top + PAD, a.bottom - h - PAD);
      return [...ws, { id, x, y, w, h, z: zTop.current, min: false, max: false, arg }];
    });
  }, []);

  // first visit to the desktop: say hello
  useEffect(() => {
    if (!savedWindows || savedWindows.length === 0) {
      const t = setTimeout(() => open("readme"), 350);
      return () => clearTimeout(t);
    }
  }, [open]);

  const update = (id: AppId, fn: (w: Win) => Win) => setWins((ws) => ws.map((w) => (w.id === id ? fn(w) : w)));
  const visible = wins.filter((w) => !w.min);
  const focused = visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)) : null;
  const area = workArea(size, compact);

  const system: Shortcut[] = (["readme", "about", "apps"] as AppId[]).map((id) => {
      const a = appById[id];
      return {
        key: id,
        label: a.name,
        open: () => open(id),
        icon: (
          <span className="grid size-12 place-items-center rounded-[23%] text-white shadow-md" style={{ background: `linear-gradient(160deg, ${a.tint[0]}, ${a.tint[1]})` }}>
            <a.Icon size={22} />
          </span>
        ),
      };
    });
  const apps: Shortcut[] = BUILT_APPS.map((b) => ({
    key: b.id,
    label: b.name,
    open: () => open("apps", b.id),
    icon: <AppIcon app={b} size={48} />,
  }));

  return (
    <motion.div
      ref={screen}
      className="os-wallpaper absolute inset-0 overflow-hidden"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
    >
      <MenuBar focused={focused ? appById[focused.id] : null} compact={compact} onShutDown={onShutDown} />

      {size.w > 0 && <DesktopIcons system={system} apps={apps} compact={compact} rows={Math.floor((area.height - 12) / ICON_ROW)} />}

      {size.w > 0 && (
        <AnimatePresence>
          {wins.map((w) => (
            <Window
              key={w.id}
              win={w}
              frame={frameOf(w, size, compact)}
              focused={focused?.id === w.id}
              compact={compact}
              posts={posts}
              actions={{
                focus: () => {
                  if (focused?.id === w.id) return;
                  zTop.current += 1;
                  update(w.id, (x) => ({ ...x, z: zTop.current }));
                },
                close: () => setWins((ws) => ws.filter((x) => x.id !== w.id)),
                minimize: () => update(w.id, (x) => ({ ...x, min: true })),
                toggleMax: () => update(w.id, (x) => ({ ...x, max: !x.max })),
                move: (dx, dy) =>
                  update(w.id, (x) => {
                    // start from where it's drawn, so a clamped window doesn't jump
                    const f = frameOf(x, sizeRef.current, false);
                    return { ...x, max: false, x: f.x + dx, y: f.y + dy, w: f.w, h: f.h };
                  }),
                resize: (dw, dh) =>
                  update(w.id, (x) => {
                    const f = frameOf(x, sizeRef.current, false);
                    const a = workArea(sizeRef.current, false);
                    return {
                      ...x,
                      x: f.x,
                      y: f.y,
                      w: clamp(f.w + dw, 320, a.width - f.x - PAD),
                      h: clamp(f.h + dh, 220, a.bottom - f.y - PAD),
                    };
                  }),
                open,
              }}
            />
          ))}
        </AnimatePresence>
      )}

      <Dock wins={wins} compact={compact} onOpen={(id) => open(id)} />
    </motion.div>
  );
}

/* ============================================================== root */

/**
 * The desk computer: the camera zooms onto the monitor, the screen boots
 * (first time this visit), you log in, and land on a desktop with apps.
 */
export function ComputerOS({ posts, onClose }: { posts: PostSummary[]; onClose: () => void }) {
  const [phase, setPhase] = useState<"boot" | "login" | "desktop">(bootedThisVisit ? "desktop" : "boot");
  const toLogin = useCallback(() => setPhase("login"), []);
  const toDesktop = useCallback(() => {
    bootedThisVisit = true;
    setPhase("desktop");
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-center sm:p-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.3 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,9,20,0.35),rgba(6,9,20,0.85))]" onClick={onClose} />

      {/* the monitor */}
      <motion.div
        className="relative h-full w-full sm:h-[min(860px,calc(100dvh-40px))] sm:w-[min(1360px,calc(100vw-40px))] sm:rounded-[24px] sm:bg-[linear-gradient(180deg,#2a2d36,#15171d)] sm:p-[12px] sm:shadow-[0_50px_120px_-30px_rgba(0,0,0,0.9),0_0_80px_-20px_rgba(120,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.12)]"
        initial={{ scale: 0.86, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
      >
        <div className="relative h-full w-full overflow-hidden bg-black sm:rounded-[13px]">
          <AnimatePresence mode="wait">
            {phase === "boot" && <Boot key="boot" onDone={toLogin} />}
            {phase === "login" && <Login key="login" onLogin={toDesktop} />}
            {phase === "desktop" && <Desktop key="desk" posts={posts} onShutDown={onClose} />}
          </AnimatePresence>
          {/* screen glare */}
          <div className="pointer-events-none absolute inset-0 z-[700] bg-[linear-gradient(115deg,rgba(255,255,255,0.05),transparent_35%)]" />
        </div>
        {/* on phones the desktop's menu bar carries its own close button */}
        <div className={`absolute right-3 top-3 z-[800] sm:-right-4 sm:-top-4 ${phase === "desktop" ? "hidden sm:block" : ""}`}>
          <button onClick={onClose} aria-label="Step away from the computer (Esc)" className="glass glass-btn size-9 justify-center">
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
