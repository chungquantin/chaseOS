"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, FileText, MapPin } from "lucide-react";
import { chapters, cvSummary, type Chapter, type ChapterId } from "app/data/career";
import { beliefs, idCard, profile } from "app/data/profile";
import { BuildFlow, LogoTile } from "./build-flow";
import { CloseUpShell } from "./close-up-shell";

/* ------------------------------------------------------------ timeline data */

type LaneId = "blockchain" | "ai" | "gtm";

const LANES: { id: LaneId; label: string; color: string }[] = [
  { id: "blockchain", label: "Blockchain", color: "#e6007a" },
  { id: "ai", label: "AI & data", color: "#3fb8ff" },
  { id: "gtm", label: "Community & GTM", color: "#f59e0b" },
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

const laneColor = (id: LaneId) => LANES.find((l) => l.id === id)!.color;

/* ------------------------------------------------------------- career line */

const ROW_H = 34;

function CareerLine({ selected, onSelect }: { selected: ChapterId | "resume"; onSelect: (id: ChapterId | "resume") => void }) {
  const { ribbons, rows, from, to } = useMemo(layoutRibbons, []);
  const span = to - from;
  const pct = (y: number) => `${((y - from) / span) * 100}%`;
  const years = Array.from({ length: to - from + 1 }, (_, i) => from + i);
  const scroller = useRef<HTMLDivElement>(null);

  // on phones the line scrolls sideways: start at the present
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, []);

  return (
    <div className="wood-board rounded-[18px] p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="font-display engraved text-[18px] sm:text-[20px]">The career line</p>
        <button
          onClick={() => onSelect("resume")}
          aria-pressed={selected === "resume"}
          className="paper-chip flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-semibold"
        >
          <FileText size={14} /> Résumé
        </button>
      </div>

      <div ref={scroller} className="mt-2 overflow-x-auto pb-1 [scrollbar-width:thin]">
        <div className="grid min-w-[640px] grid-cols-[112px_minmax(0,1fr)] gap-x-3">
          {/* year axis */}
          <span />
          <div className="engraved relative h-6 text-[11px] font-semibold tabular-nums">
            {years.map((y) => (
              <span key={y} className="absolute -translate-x-1/2" style={{ left: pct(y) }}>
                {y}
              </span>
            ))}
          </div>

          {LANES.map((lane) => (
            <div key={lane.id} className="contents">
              <div className="flex items-center py-2">
                <span className="brass-plate flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-[11.5px] font-semibold leading-tight">
                  <span className="size-2 shrink-0 rounded-full shadow-[inset_0_1px_1px_rgba(0,0,0,0.4)]" style={{ background: lane.color }} />
                  {lane.label}
                </span>
              </div>
              <div className="relative" style={{ height: rows[lane.id] * ROW_H + 14 }}>
                {/* the track: a groove routed along the board */}
                <span className="groove absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-black/25" />
                {/* year marks */}
                {years.map((y) => (
                  <span key={y} className="groove absolute inset-y-1 w-px bg-black/20" style={{ left: pct(y) }} />
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
                        className="wood-block absolute flex items-center gap-1.5 overflow-hidden rounded-[7px] pl-[3px] pr-2.5 text-left text-[12px] font-semibold"
                        style={
                          {
                            "--block": lane.color,
                            left: pct(r.start),
                            width: `max(30px, calc(${pct(r.end)} - ${pct(r.start)}))`,
                            top: 4 + r.row * ROW_H,
                            height: ROW_H - 8,
                            color: on ? "#1b1206" : "#fff4e6",
                          } as React.CSSProperties
                        }
                        whileHover={on ? undefined : { y: -2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <LogoTile org={r.c.org} size={ROW_H - 10} />
                        <span className="truncate">{r.c.company}</span>
                      </motion.button>
                    );
                  })}
                {/* the present: a brass rod */}
                <span className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-gradient-to-r from-[#f3d79c] to-[#a8813c] shadow-[1px_0_2px_rgba(0,0,0,0.5)]" style={{ left: pct(NOW) }} />
              </div>
            </div>
          ))}
          <span />
          <div className="relative h-5">
            <span className="brass-plate absolute top-0.5 -translate-x-1/2 whitespace-nowrap rounded-[4px] px-1.5 text-[10.5px] font-bold" style={{ left: pct(NOW) }}>
              now
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- dossier */

function Stamp() {
  return (
    <span className="inline-block rotate-[-6deg] rounded-[3px] border-2 border-[#c2410c]/70 px-2 py-0.5 text-[11px] font-bold tracking-[0.08em] text-[#c2410c]/85">
      Founding team
    </span>
  );
}

function IdentityPage({ c, color }: { c: Chapter; color: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <LogoTile org={c.org} size={64} />
        {c.founding && <Stamp />}
      </div>
      <h3 className="font-display mt-4 text-[34px] leading-[1.05] sm:text-[40px]">{c.company}</h3>
      <p className="mt-1.5 text-[15px] font-medium">{c.role}</p>
      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#78716c]">
        <span className="tabular-nums" style={{ color }}>
          {c.period}
        </span>
        {c.location && (
          <span className="flex items-center gap-1">
            <MapPin size={12} /> {c.location}
          </span>
        )}
      </p>
      <p className="mt-5 text-[17px] leading-[1.55] text-[#292524]">{c.summary}</p>

      <div className="mt-6 rounded-xl bg-[#f3eee4] p-4">
        <p className="text-[12px] font-semibold text-[#78716c]">About {c.company}</p>
        <p className="mt-1 text-[14px] leading-snug">{c.org.oneLiner}</p>
        {c.org.facts.length > 0 && (
          <ul className="mt-2.5 space-y-1.5">
            {c.org.facts.map((f) => (
              <li key={f} className="flex gap-2 text-[13px] leading-[1.45] text-[#57534e]">
                <span className="mt-[7px] size-1.5 shrink-0 rounded-full" style={{ background: color }} />
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
            className="mt-3 inline-flex items-center gap-1 text-[12.5px] text-[#57534e] underline decoration-black/20 underline-offset-2 hover:text-[#b4521c]"
          >
            {new URL(c.org.website).hostname.replace("www.", "")} <ArrowUpRight size={12} />
          </a>
        )}
      </div>

      {c.stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {c.stack.map((s) => (
            <span key={s} className="rounded-full border border-black/10 px-2.5 py-0.5 text-[12px] text-[#57534e]">
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
        <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-black/[0.08] pb-5 sm:grid-cols-3">
          {c.metrics.map((m) => (
            <div key={m.label}>
              <p className="font-display text-[30px] leading-none tabular-nums" style={{ color }}>
                {m.value}
              </p>
              <p className="mt-1.5 text-[12px] leading-4 text-[#78716c]">{m.label}</p>
            </div>
          ))}
        </div>
      )}
      {c.built && (
        <div className={c.metrics.length > 0 ? "mt-5" : ""}>
          <BuildFlow built={c.built} color={color} />
          {c.alsoBuilt?.map((b) => (
            <div key={b.title} className="mt-2.5">
              <BuildFlow built={b} color={color} also />
            </div>
          ))}
        </div>
      )}
      {c.bullets.length > 0 && (
        <>
          <p className="font-display mt-6 text-[19px]">What I did</p>
          <ol className="mt-3 space-y-3">
            {c.bullets.map((b, i) => (
              <li key={b} className="grid grid-cols-[26px_minmax(0,1fr)] gap-2 text-[14px] leading-6 text-[#44403c]">
                <span
                  className="grid size-[22px] place-items-center rounded-full text-[11px] font-semibold tabular-nums text-white"
                  style={{ background: color }}
                >
                  {i + 1}
                </span>
                {b}
              </li>
            ))}
          </ol>
        </>
      )}
      {!c.built && c.bullets.length === 0 && c.metrics.length === 0 && (
        <p className="text-[14px] leading-6 text-[#78716c]">The details of this role are being written up.</p>
      )}
    </div>
  );
}

function ResumeSpread() {
  return (
    <>
      <div className="flex flex-col">
        <img src={idCard.avatar} alt={idCard.name} className="size-16 rounded-[22%] object-cover shadow-md" />
        <h3 className="font-display mt-4 text-[34px] leading-[1.05] sm:text-[40px]">{idCard.name}</h3>
        <p className="mt-1.5 text-[15px] font-medium">{idCard.title}</p>
        <p className="mt-5 text-[17px] leading-[1.55] text-[#292524]">{profile.headline}</p>
        <p className="mt-3 text-[14.5px] leading-7 text-[#44403c]">{cvSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[13px]">
          {[
            ["LinkedIn", profile.links.linkedin],
            ["GitHub", profile.links.github],
            ["X", profile.links.x],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-black/10 px-3 py-1 hover:border-[#e2571f]">
              {label} <ArrowUpRight size={12} />
            </a>
          ))}
        </div>
      </div>
      <div className="flex flex-col">
        <div className="grid grid-cols-2 gap-4 border-b border-black/[0.08] pb-5">
          {idCard.stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-[30px] leading-none text-[#b4521c]">{s.value}</p>
              <p className="mt-1.5 text-[12px] text-[#78716c]">{s.label}</p>
            </div>
          ))}
        </div>
        <p className="font-display mt-6 text-[19px]">Working beliefs</p>
        <div className="mt-3 space-y-4">
          {beliefs.map((b) => (
            <div key={b.title}>
              <p className="text-[14.5px] font-semibold">{b.title}</p>
              <p className="mt-0.5 text-[14px] leading-6 text-[#57534e]">{b.body}</p>
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
  const color = c ? laneColor(TRACK[c.id]) : "#f59e0b";
  return (
    <div className="relative">
      <AnimatePresence mode="popLayout" custom={dir} initial={false}>
        <motion.article
          key={id}
          custom={dir}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 60, rotate: d * 1.2 }),
            center: { opacity: 1, x: 0, rotate: 0 },
            exit: (d: number) => ({ opacity: 0, x: d * -60, rotate: d * -1.2 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
          className="relative mt-7"
        >
          {/* folder tab: colour and name of the track it runs on */}
          <span
            className="folder-tab absolute -top-7 left-5 flex h-7 items-center gap-1.5 px-3.5 text-[12px] font-semibold text-[#1b1206]"
            style={{ background: color }}
          >
            {c ? LANES.find((l) => l.id === TRACK[c.id])!.label : "Résumé"}
          </span>
          <div className="paper-stack relative rounded-[6px] rounded-tl-none text-[#1c1917]">
          <span className="absolute inset-x-0 top-0 h-1 rounded-tr-[6px]" style={{ background: color }} />
          <div className="grid gap-8 px-5 pb-6 pt-7 sm:px-8 md:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] md:gap-0">
            {c ? (
              <>
                <div className="md:pr-8">
                  <IdentityPage c={c} color={color} />
                </div>
                <div className="md:border-l md:border-dashed md:border-black/[0.12] md:pl-8">
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

      <div className="mt-3 flex items-center justify-center gap-2">
        <button onClick={onPrev} disabled={!onPrev} aria-label="Earlier job" className="glass glass-btn size-9 justify-center disabled:opacity-30">
          <ArrowLeft size={16} />
        </button>
        <span className="glass rounded-full px-3 py-1.5 text-[12px] tabular-nums">{position}</span>
        <button onClick={onNext} disabled={!onNext} aria-label="Later job" className="glass glass-btn size-9 justify-center disabled:opacity-30">
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

export function JobsView({ onClose, initial }: { onClose: () => void; initial?: ChapterId }) {
  const [selected, setSelected] = useState<ChapterId | "resume">(initial ?? ORDER[ORDER.length - 1]);
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
