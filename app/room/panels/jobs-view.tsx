"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, MapPin } from "lucide-react";
import { chapters, cvSummary, type Chapter, type ChapterId } from "app/data/career";
import { beliefs, idCard, profile } from "app/data/profile";
import { BuildFlow } from "./build-flow";
import { BoxStamp, LogoSticker, RubberStamp, Tape, wobble } from "./paper-bits";
import { CloseUpShell } from "./close-up-shell";

/* ------------------------------------------------------------ timeline data */

type LaneId = "blockchain" | "ai" | "gtm";

const LANES: { id: LaneId; label: string; color: string }[] = [
  { id: "blockchain", label: "Blockchain", color: "#f0a04b" },
  { id: "ai", label: "AI & data", color: "#8a8a8a" },
  { id: "gtm", label: "Community & GTM", color: "#a65f0c" },
];

/** Which track each job runs on, by what the work mostly was. */
const TRACK: Record<ChapterId, LaneId> = {
  snowflake: "blockchain",
  rogue: "blockchain",
  amazely: "ai",
  rover: "ai",
  architect: "ai",
  openguild: "gtm",
  polkadot: "gtm",
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const NOW = (() => {
  const d = new Date();
  return d.getFullYear() + d.getMonth() / 12;
})();

/** "Feb 2022 – Dec 2022" / "2023 – 2026" / "2026 –" → fractional years. */
function parsePeriod(period: string): [number, number] {
  const [a, b] = period.split(/[–-]/).map((s) => s.trim());
  const at = (s: string, end: boolean) => {
    const m = s.match(/([a-z]{3})?[a-z]*\s*(\d{4})/i);
    if (!m) return null;
    const year = Number(m[2]);
    const month = m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : end ? 11 : 0;
    return year + (month + (end ? 1 : 0)) / 12;
  };
  const start = at(a, false) ?? NOW;
  const end = b ? at(b, true) : null;
  return [start, Math.min(end ?? NOW, NOW)];
}

type Ribbon = { c: Chapter; lane: LaneId; start: number; end: number; row: number };

function layoutRibbons(): { ribbons: Ribbon[]; rows: Record<LaneId, number>; from: number; to: number } {
  const ribbons: Ribbon[] = [];
  const rows: Record<LaneId, number> = { blockchain: 1, ai: 1, gtm: 1 };
  for (const lane of LANES) {
    const ends: number[] = []; // per row: when it's free again
    chapters
      .filter((c) => TRACK[c.id] === lane.id)
      .map((c) => ({ c, span: parsePeriod(c.period) }))
      .sort((x, y) => x.span[0] - y.span[0])
      .forEach(({ c, span }) => {
        let row = ends.findIndex((e) => e <= span[0] + 0.01);
        if (row === -1) row = ends.push(0) - 1;
        ends[row] = span[1];
        ribbons.push({ c, lane: lane.id, start: span[0], end: Math.max(span[1], span[0] + 0.25), row });
      });
    rows[lane.id] = Math.max(1, ends.length);
  }
  const from = Math.floor(Math.min(...ribbons.map((r) => r.start)));
  return { ribbons, rows, from, to: Math.ceil(NOW + 0.01) };
}

/* ------------------------------------------------------------- career line */

const ROW_H = 36;

/** Washi tape colour for each track: amber, pencil grey, burnt amber. */
const TAPE: Record<LaneId, string> = { blockchain: "#f0a04b", ai: "#b8b2a6", gtm: "#c98a3c" };

function CareerLine({ selected, onSelect }: { selected: ChapterId | "resume"; onSelect: (id: ChapterId | "resume") => void }) {
  const { ribbons, rows, from, to } = useMemo(layoutRibbons, []);
  const span = to - from;
  const pct = (y: number) => `${((y - from) / span) * 100}%`;
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const scroller = useRef<HTMLDivElement>(null);

  // on phones the line scrolls sideways: start at the present
  useEffect(() => {
    const el = scroller.current;
    if (el && el.scrollWidth - el.clientWidth > 40) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div className="kraft-board relative rounded-[10px] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="font-marker text-[22px] leading-none sm:text-[26px]">The career line</p>
        <button
          onClick={() => onSelect("resume")}
          aria-pressed={selected === "resume"}
          className="washi-btn relative shrink-0"
        >
          <span className="washi font-hand flex items-center gap-1.5 px-4 py-1.5 text-[16px] font-bold text-[#2a1f14]" style={{ "--tape": "#fafafa" } as React.CSSProperties}>
            <FileText size={14} /> Résumé
          </span>
        </button>
      </div>

      <div ref={scroller} className="mt-2 overflow-x-auto overflow-y-hidden pb-1 [scrollbar-color:rgba(42,31,20,0.35)_transparent] [scrollbar-width:thin]">
        <div className="grid min-w-[680px] grid-cols-[150px_minmax(0,1fr)] gap-x-3 px-2 pr-4">
          {/* year axis, pencilled in */}
          <span />
          <div className="font-hand relative h-7 text-[15px] font-bold tabular-nums opacity-80">
            {years.map((y) => (
              <span key={y} className="absolute -translate-x-1/2" style={{ left: pct(y) }}>
                {y}
              </span>
            ))}
          </div>

          {LANES.map((lane) => (
            <div key={lane.id} className="contents">
              <div className="flex items-center py-2">
                <span
                  className="washi font-hand px-3 py-0.5 text-[15px] font-bold leading-tight text-[#2a1f14]"
                  style={{ "--tape": TAPE[lane.id], transform: `rotate(${wobble(lane.id, 3)}deg)` } as React.CSSProperties}
                >
                  {lane.label}
                </span>
              </div>
              <div className="relative" style={{ height: rows[lane.id] * ROW_H + 14 }}>
                {/* pencil guide line + year ticks */}
                <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#2a1f14]/30" />
                {years.map((y) => (
                  <span key={y} className="absolute inset-y-1 w-px border-l border-dashed border-[#2a1f14]/20" style={{ left: pct(y) }} />
                ))}
                {ribbons
                  .filter((r) => r.lane === lane.id)
                  .map((r) => {
                    const on = selected === r.c.id;
                    return (
                      <motion.button
                        key={r.c.id}
                        onClick={() => onSelect(r.c.id)}
                        aria-pressed={on}
                        aria-label={`${r.c.company}, ${r.c.role}, ${r.c.period}`}
                        className="washi-btn absolute text-left"
                        style={{
                          left: pct(r.start),
                          width: `max(34px, calc(${pct(r.end)} - ${pct(r.start)}))`,
                          top: 4 + r.row * ROW_H,
                          height: ROW_H - 8,
                          rotate: wobble(r.c.id, 1.2),
                        }}
                        whileHover={on ? undefined : { y: -2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <span
                          className="washi font-hand flex size-full items-center gap-1.5 overflow-hidden pl-1.5 pr-2.5 text-[15px] font-bold text-[#2a1f14]"
                          style={{ "--tape": TAPE[lane.id] } as React.CSSProperties}
                        >
                          <LogoSticker org={r.c.org} seed={r.c.id} size={ROW_H - 12} />
                          <span className="truncate">{r.c.company}</span>
                        </span>
                      </motion.button>
                    );
                  })}
                {/* the present: a red pencil line */}
                <span className="absolute inset-y-0 w-[2px] -translate-x-1/2 rounded-full bg-[#b4232a]/80" style={{ left: pct(NOW) }} />
              </div>
            </div>
          ))}
          <span />
          <div className="relative h-6">
            <span className="font-marker absolute top-0.5 -translate-x-1/2 whitespace-nowrap text-[15px] text-[#b4232a]" style={{ left: pct(NOW) }}>
              now ↑
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- dossier */

const STAMP_INK = "#1f4fd1";
const RED_INK = "#b4232a";

/** "Feb 2022 – Dec 2022" → "2022", "Jan 2023 – Jul 2024" → "2023–24", "2026 –" → "2026 → NOW" */
function stampYears(period: string) {
  const [a, b] = period.match(/\d{4}/g) ?? [];
  if (!a) return "";
  if (/[–-]\s*$/.test(period.trim())) return `${a} → now`;
  if (!b || a === b) return a;
  return `${a}–${b.slice(2)}`;
}

function IdentityPage({ c }: { c: Chapter }) {
  const place = c.location?.split(",")[0] ?? "";
  return (
    <div className="flex flex-col">
      <div className="relative flex items-start justify-between gap-3">
        <LogoSticker org={c.org} seed={c.id} size={84} />
        <RubberStamp
          seed={c.id}
          top={place ? `${c.company} · ${place}` : c.company}
          middle={stampYears(c.period)}
          color={STAMP_INK}
          size={112}
          className="-mr-1 -mt-1"
        />
      </div>
      <div className="relative mt-4">
        <h3 className="font-marker text-[38px] leading-[1.05] sm:text-[46px]">{c.company}</h3>
        {c.founding && (
          <BoxStamp seed={c.id} color={RED_INK} className="absolute -top-3 right-0 sm:right-6">
            {/co-?founder/i.test(c.role) ? "Co-founder" : "Founding team"}
          </BoxStamp>
        )}
      </div>
      <p className="font-hand mt-1 text-[19px] font-bold leading-[30px]">{c.role}</p>
      <p className="font-hand flex flex-wrap items-center gap-x-3 text-[16px] leading-[30px] opacity-75">
        <span className="tabular-nums">{c.period}</span>
        {c.location && (
          <span className="flex items-center gap-1">
            <MapPin size={13} /> {c.location}
          </span>
        )}
      </p>
      <p className="font-hand mt-[30px] text-[19px] leading-[30px]">{c.summary}</p>

      {/* the company, on an index card taped to the page */}
      <div className="relative mt-8 rotate-[-0.8deg] bg-[#fdfaf0] px-4 pb-4 pt-5 shadow-[0_1px_1px_rgba(60,35,10,0.2),0_8px_18px_-8px_rgba(60,35,10,0.45)] [background-image:linear-gradient(to_bottom,transparent_34px,rgba(190,50,50,0.4)_34px,rgba(190,50,50,0.4)_35px,transparent_35px),repeating-linear-gradient(to_bottom,transparent_0_23px,rgba(70,80,180,0.13)_23px_24px)]">
        <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
        <p className="font-marker text-[15px] leading-none opacity-80">About {c.company}</p>
        <p className="font-hand mt-2.5 text-[16px] leading-[24px]">{c.org.oneLiner}</p>
        {c.org.facts.length > 0 && (
          <ul className="mt-1">
            {c.org.facts.map((f) => (
              <li key={f} className="font-hand flex gap-2 text-[15px] leading-[24px] opacity-85">
                <span className="shrink-0">–</span>
                {f}
              </li>
            ))}
          </ul>
        )}
        {c.org.website && (
          <a
            href={c.org.website}
            target="_blank"
            rel="noreferrer"
            className="font-hand nb-link -ml-2 mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[15px]"
          >
            {new URL(c.org.website).hostname.replace("www.", "")} <ArrowUpRight size={13} />
          </a>
        )}
      </div>

      {c.stack.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-x-2 gap-y-2.5">
          {c.stack.map((s) => (
            <span
              key={s}
              className="washi font-hand px-2.5 py-0.5 text-[15px] font-bold"
              style={{ "--tape": "#fffaf0", transform: `rotate(${wobble(s, 2.5)}deg)` } as React.CSSProperties}
            >
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function WorkPage({ c, color }: { c: Chapter; color: string }) {
  return (
    <div className="flex flex-col">
      {c.metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 pb-5 sm:grid-cols-3">
          {c.metrics.map((m) => (
            <div key={m.label}>
              <p className="font-marker relative inline-block text-[30px] leading-none tabular-nums">
                {/* a highlighter swipe behind the number */}
                <span className="absolute -inset-x-1 bottom-0 top-[45%] -z-10 -rotate-1 rounded-sm opacity-60" style={{ background: color }} />
                {m.value}
              </p>
              <p className="font-hand mt-1.5 text-[15px] leading-5 opacity-75">{m.label}</p>
            </div>
          ))}
        </div>
      )}
      {c.built && (
        <div className={`space-y-6 ${c.metrics.length > 0 ? "border-t border-dashed border-[#2a1f14]/25 pt-5" : ""}`}>
          <BuildFlow built={c.built} color={color} />
          {c.alsoBuilt?.map((b) => <BuildFlow key={b.title} built={b} color={color} also />)}
        </div>
      )}
      {c.bullets.length > 0 && (
        <>
          <p className="font-marker mt-7 text-[22px] leading-none">What I did</p>
          <ol className="mt-3">
            {c.bullets.map((b, i) => (
              <li key={b} className="font-hand grid grid-cols-[26px_minmax(0,1fr)] gap-1 text-[17px] leading-[30px]">
                <span className="font-marker text-[17px] opacity-70">{i + 1}.</span>
                {b}
              </li>
            ))}
          </ol>
        </>
      )}
      {!c.built && c.bullets.length === 0 && c.metrics.length === 0 && (
        <p className="font-hand text-[17px] leading-[30px] opacity-70">Still writing this one up.</p>
      )}
    </div>
  );
}

function ResumeSpread() {
  return (
    <>
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <span className="sticker inline-block rotate-[-4deg] rounded-full p-1.5">
            <img src={idCard.avatar} alt={idCard.name} className="size-20 rounded-full object-cover" />
          </span>
          <RubberStamp seed="resume" top="Tin Chung · Ho Chi Minh" middle="Résumé" color={STAMP_INK} size={108} />
        </div>
        <h3 className="font-marker mt-4 text-[38px] leading-[1.05] sm:text-[46px]">{idCard.name}</h3>
        <p className="font-hand mt-1 text-[19px] font-bold leading-[30px]">{idCard.title}</p>
        <p className="font-hand mt-[30px] text-[19px] leading-[30px]">{profile.headline}</p>
        <p className="font-hand mt-[30px] text-[17px] leading-[30px] opacity-85">{cvSummary}</p>
        <div className="font-hand -ml-2 mt-4 flex flex-wrap text-[17px]">
          {[
            ["LinkedIn", profile.links.linkedin],
            ["GitHub", profile.links.github],
            ["X", profile.links.x],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="nb-link inline-flex items-center gap-1 rounded-md px-2 py-1">
              {label} <ArrowUpRight size={13} />
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-4 pb-5">
          {idCard.stats.map((s) => (
            <div key={s.label}>
              <p className="font-marker relative inline-block text-[30px] leading-none">
                <span className="absolute -inset-x-1 bottom-0 top-[45%] -z-10 -rotate-1 rounded-sm bg-[#f0a04b] opacity-60" />
                {s.value}
              </p>
              <p className="font-hand mt-1.5 text-[15px] opacity-75">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="font-marker mt-4 border-t border-dashed border-[#2a1f14]/25 pt-5 text-[22px] leading-none">Working beliefs</p>
        <div className="mt-3 space-y-3">
          {beliefs.map((b) => (
            <div key={b.title}>
              <p className="font-hand text-[18px] font-bold leading-[30px]">{b.title}</p>
              <p className="font-hand text-[17px] leading-[30px] opacity-85">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function Dossier({
  id,
  dir,
  onPrev,
  onNext,
  position,
}: {
  id: ChapterId | "resume";
  dir: number;
  onPrev?: () => void;
  onNext?: () => void;
  position: string;
}) {
  const c = id === "resume" ? null : chapters.find((x) => x.id === id)!;
  const lane = c ? TRACK[c.id] : null;
  const color = lane ? TAPE[lane] : "#f0a04b";
  return (
    <div className="relative">
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.article
          key={id}
          custom={dir}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 60, rotate: d * 1.5 }),
            center: { opacity: 1, x: 0, rotate: wobble(id, 0.5) },
            exit: (d: number) => ({ opacity: 0, x: d * -60, rotate: d * -1.5 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="legal-sheet-wrap relative mt-6"
        >
          {/* washi tape holding the sheet down, labelled with the track */}
          <span
            className="washi font-hand absolute -top-3 left-8 z-10 px-4 py-1 text-[15px] font-bold text-[#2a1f14] sm:left-16"
            style={{ "--tape": color, transform: "rotate(-3deg)" } as React.CSSProperties}
          >
            {lane ? LANES.find((l) => l.id === lane)!.label : "Résumé"}
          </span>
          <span
            className="washi absolute -top-3 right-10 z-10 h-7 w-20"
            style={{ "--tape": color, transform: "rotate(4deg)" } as React.CSSProperties}
            aria-hidden
          />
          <div className="legal-sheet">
            <div className="relative grid gap-10 pb-8 pl-[calc(var(--m)+18px)] pr-5 pt-10 sm:pr-9 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-0">
              {c ? (
                <>
                  <div className="md:pr-9">
                    <IdentityPage c={c} />
                  </div>
                  <div className="md:border-l md:border-dashed md:border-[#2a1f14]/25 md:pl-9">
                    <WorkPage c={c} color={color} />
                  </div>
                </>
              ) : (
                <ResumeSpread />
              )}
            </div>
          </div>
        </motion.article>
      </AnimatePresence>

      <div className="mt-5 flex items-center justify-center gap-2">
        <button onClick={onPrev} disabled={!onPrev} aria-label="Earlier job" className="paper-chip grid size-9 place-items-center rounded-full disabled:opacity-30">
          <ArrowLeft size={16} />
        </button>
        <span className="font-hand rounded-full bg-[#fafafa] px-3.5 py-1 text-[15px] font-bold text-[#2a1f14] tabular-nums shadow-[0_3px_0_#c4c4c4]">{position}</span>
        <button onClick={onNext} disabled={!onNext} aria-label="Later job" className="paper-chip grid size-9 place-items-center rounded-full disabled:opacity-30">
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- view */

/** Résumé first, then jobs oldest → newest, the way the line reads. */
const ORDER: (ChapterId | "resume")[] = [
  "resume",
  ...[...chapters].sort((a, b) => parsePeriod(a.period)[0] - parsePeriod(b.period)[0]).map((c) => c.id),
];

export function JobsView({ onClose }: { onClose: () => void }) {
  const [selected, setSelected] = useState<ChapterId | "resume">(ORDER[ORDER.length - 1]);
  const [dir, setDir] = useState(1);
  const i = ORDER.indexOf(selected);

  const select = (id: ChapterId | "resume") => {
    setDir(ORDER.indexOf(id) >= i ? 1 : -1);
    setSelected(id);
  };
  const step = (d: number) => {
    const n = i + d;
    if (n < 0 || n >= ORDER.length) return;
    setDir(d);
    setSelected(ORDER[n]);
  };

  // arrows walk the line before the room sees them
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("input, textarea")) return;
      if (e.key === "ArrowLeft") step(-1);
      else if (e.key === "ArrowRight") step(1);
      else return;
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  });

  return (
    <CloseUpShell title="Past jobs" hint={`${chapters.length} roles across blockchain, AI and community. Pick one on the line, or use ← →.`} onClose={onClose}>
      <div className="mx-auto grid max-w-[1080px] gap-4">
        <CareerLine selected={selected} onSelect={select} />
        <Dossier
          id={selected}
          dir={dir}
          position={selected === "resume" ? "Résumé" : `${i} of ${ORDER.length - 1}`}
          onPrev={i > 0 ? () => step(-1) : undefined}
          onNext={i < ORDER.length - 1 ? () => step(1) : undefined}
        />
      </div>
    </CloseUpShell>
  );
}
