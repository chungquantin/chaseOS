"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

type Geo = {
  /** text column (page) width, px */
  pageW: number;
  /** gap between columns = outer margin of one page + inner margin of the next */
  gap: number;
  /** text height per page, px */
  h: number;
  /** margin around the text block, px */
  m: number;
  perView: 1 | 2;
};

const FOOTER = 34;

/**
 * A post rendered as an open book. The article flows into CSS columns exactly
 * one page wide; we translate the column strip by one spread per page turn.
 * Content is server-rendered (children), so it stays crawlable.
 */
export function BookReader({
  title,
  summary,
  date,
  children,
}: {
  title: string;
  summary?: string;
  date: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const flow = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLSpanElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [pages, setPages] = useState(1);
  const [spread, setSpread] = useState(0);
  const [turn, setTurn] = useState<{ dir: 1 | -1; id: number } | null>(null);

  const close = useCallback(() => router.push("/blog", { scroll: false }), [router]);

  /* ---------------- layout: page size, then page count ---------------- */
  const measure = useCallback(() => {
    const f = frame.current;
    if (!f) return;
    const { width, height } = f.getBoundingClientRect();
    const two = width >= 760;
    const m = two ? 44 : 22;
    const pageW = Math.floor(two ? width / 2 - 2 * m : width - 2 * m);
    setGeo({ pageW, gap: 2 * m, h: Math.floor(height - 2 * m - FOOTER), m, perView: two ? 2 : 1 });
  }, []);

  const count = useCallback(() => {
    if (!geo || !flow.current || !end.current) return;
    // both rects include the page-turn transform, so their difference is the
    // true distance from the first column to the last one
    const offset = end.current.getBoundingClientRect().left - flow.current.getBoundingClientRect().left;
    const step = geo.pageW + geo.gap;
    setPages(Math.max(1, Math.floor((offset + 1) / step) + 1));
  }, [geo]);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (frame.current) ro.observe(frame.current);
    return () => ro.disconnect();
  }, [measure]);

  useLayoutEffect(() => {
    count();
  }, [count, geo]);

  // images and fonts change the flow after first paint
  useEffect(() => {
    const el = flow.current;
    if (!el) return;
    const onLoad = () => {
      count();
      // embeds (iframes) grab focus when they load; keep arrows on the book
      if (document.activeElement?.tagName === "IFRAME") root.current?.focus({ preventScroll: true });
    };
    el.addEventListener("load", onLoad, true);
    document.fonts?.ready.then(onLoad);
    return () => el.removeEventListener("load", onLoad, true);
  }, [count]);

  const spreads = geo ? Math.ceil(pages / geo.perView) : 1;
  useEffect(() => {
    if (spread > spreads - 1) setSpread(Math.max(0, spreads - 1));
  }, [spread, spreads]);

  /* ---------------- navigation ---------------- */
  const go = useCallback(
    (dir: 1 | -1) => {
      setSpread((s) => {
        const next = Math.min(spreads - 1, Math.max(0, s + dir));
        if (next !== s) setTurn({ dir, id: Date.now() });
        return next;
      });
    },
    [spreads]
  );

  useEffect(() => {
    root.current?.focus({ preventScroll: true });
    // the iframe may finish loading after us and take focus; take it back
    const t = setTimeout(() => {
      if (document.activeElement?.tagName === "IFRAME") root.current?.focus({ preventScroll: true });
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    // capture phase: handle keys before the room's own shortcuts
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") go(1);
      else if (e.key === "ArrowLeft" || e.key === "PageUp") go(-1);
      else if (e.key === "Escape") close();
      else return;
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [go, close]);

  const swipeX = useRef<number | null>(null);
  const lastWheel = useRef(0);

  const step = geo ? geo.pageW + geo.gap : 0;
  const first = spread * (geo?.perView ?? 1) + 1;
  const last = Math.min(pages, first + (geo?.perView ?? 1) - 1);

  return (
    <motion.div
      ref={root}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-3 pb-4 pt-14 outline-none sm:px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-[#140e0a]/60 backdrop-blur-[3px]" onClick={close} />

      {/* top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-3 px-4 py-3 text-[#fbf5ec] sm:px-6">
        <button onClick={close} className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1.5 text-[13px] backdrop-blur-md hover:bg-black/45">
          <ArrowLeft size={14} /> Back to the shelf
        </button>
        <p className="hidden truncate text-[13px] text-[#fbf5ec]/75 sm:block">{title}</p>
        <button onClick={close} aria-label="Close book (Esc)" className="grid size-8 place-items-center rounded-full bg-black/30 backdrop-blur-md hover:bg-black/45">
          <X size={16} />
        </button>
      </div>

      {/* the book */}
      <motion.div
        role="document"
        aria-label={title}
        className="relative"
        style={{
          width: "min(1180px, calc(100vw - 24px))",
          height: "min(800px, calc(100dvh - 120px))",
          perspective: 2400,
        }}
        initial={{ y: 30, rotateX: 8, opacity: 0 }}
        animate={{ y: 0, rotateX: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 26 }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse") swipeX.current = e.clientX;
        }}
        onPointerUp={(e) => {
          if (swipeX.current === null) return;
          const dx = e.clientX - swipeX.current;
          swipeX.current = null;
          if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* cover */}
        <div className="absolute inset-0 rounded-[14px] bg-[linear-gradient(135deg,#8a4632,#5e2d20)] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75)]" />
        {/* stacked page edges */}
        <div className="absolute inset-x-[10px] bottom-[4px] top-[12px] rounded-[6px] bg-[#e9dfcc]" />
        <div className="absolute inset-x-[10px] bottom-[7px] top-[11px] rounded-[6px] bg-[#f1e8d7]" />

        {/* paper */}
        <div
          ref={frame}
          onScroll={(e) => {
            e.currentTarget.scrollLeft = 0;
            e.currentTarget.scrollTop = 0;
          }}
          onWheel={(e) => {
            // wheel / trackpad turns pages, one per gesture
            const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
            const now = performance.now();
            if (Math.abs(d) < 12 || now - lastWheel.current < 450) return;
            lastWheel.current = now;
            go(d > 0 ? 1 : -1);
          }}
          className="book-paper absolute inset-[10px] overflow-hidden rounded-[6px]"
          data-two={geo?.perView === 2 || undefined}
        >
          <div
            ref={flow}
            className="book-flow absolute"
            style={
              geo
                ? {
                    left: geo.m,
                    top: geo.m,
                    width: geo.perView * geo.pageW + (geo.perView - 1) * geo.gap,
                    height: geo.h,
                    columnWidth: geo.pageW,
                    columnGap: geo.gap,
                    columnFill: "auto",
                    transform: `translateX(${-spread * geo.perView * step}px)`,
                    ["--page-h" as string]: `${geo.h}px`,
                  }
                : { visibility: "hidden" }
            }
          >
            <header className="book-title-page">
              <p className="book-kicker">chungquantin · writing</p>
              <h1>{title}</h1>
              <p className="book-date">{date}</p>
              {summary && <p className="book-summary">{summary}</p>}
              <p className="book-ornament" aria-hidden>
                ❦
              </p>
            </header>
            <div className="book-prose">{children}</div>
            <span ref={end} className="block h-px" aria-hidden />
          </div>

          {/* folios */}
          {geo && (
            <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-between px-8 font-serif text-[12px] text-[#a89b85]">
              <span>{first}</span>
              {geo.perView === 2 && last > first && <span>{last}</span>}
            </div>
          )}

          {/* a page sweeping over during a turn */}
          <AnimatePresence>
            {turn && geo && (
              <motion.div
                key={turn.id}
                className="book-turning absolute bottom-0 top-0"
                // forward: the right page lifts off the spine; back: the left page does
                style={{
                  width: geo.perView === 2 ? "50%" : "100%",
                  left: geo.perView === 2 && turn.dir === 1 ? "50%" : 0,
                  transformOrigin: turn.dir === 1 ? "left center" : "right center",
                }}
                initial={{ rotateY: 0, opacity: 1 }}
                animate={{ rotateY: turn.dir === 1 ? -180 : 180, opacity: 0.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
                onAnimationComplete={() => setTurn(null)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* side arrows (desktop) */}
        <button
          onClick={() => go(-1)}
          disabled={spread === 0}
          aria-label="Previous page"
          className="absolute -left-2 top-1/2 hidden size-11 -translate-x-full -translate-y-1/2 place-items-center rounded-full bg-[#fbf5ec]/90 text-[#3b2a1e] shadow-lg transition-opacity hover:bg-white disabled:opacity-0 md:grid"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={() => go(1)}
          disabled={spread >= spreads - 1}
          aria-label="Next page"
          className="absolute -right-2 top-1/2 hidden size-11 -translate-y-1/2 translate-x-full place-items-center rounded-full bg-[#fbf5ec]/90 text-[#3b2a1e] shadow-lg transition-opacity hover:bg-white disabled:opacity-0 md:grid"
        >
          <ChevronRight size={20} />
        </button>
      </motion.div>

      {/* bottom controls */}
      <div className="relative mt-3 flex items-center gap-3 text-[#fbf5ec]">
        <button onClick={() => go(-1)} disabled={spread === 0} aria-label="Previous page" className="grid size-8 place-items-center rounded-full bg-black/30 disabled:opacity-30 md:hidden">
          <ChevronLeft size={16} />
        </button>
        <span className="text-[12.5px] tabular-nums text-[#fbf5ec]/80">
          {first === last ? `page ${first}` : `pages ${first}–${last}`} of {pages}
        </span>
        <button onClick={() => go(1)} disabled={spread >= spreads - 1} aria-label="Next page" className="grid size-8 place-items-center rounded-full bg-black/30 disabled:opacity-30 md:hidden">
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
