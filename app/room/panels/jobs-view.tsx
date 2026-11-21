"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, MapPin } from "lucide-react";
import { chapters, cvSummary, type Chapter, type ChapterId } from "app/data/career";
import { beliefs, idCard, profile } from "app/data/profile";
import { BuildFlow, LogoTile } from "./build-flow";
import { CloseUpShell } from "./close-up-shell";
import { HAS_FILM } from "./film/registry";

// the animated stories pull in three.js scenes: load them only when a job has one
const FilmFor = dynamic(() => import("./film/film-for"), {
  ssr: false,
  loading: () => <div className="aspect-video animate-pulse rounded-2xl bg-white/5" />,
});

/* ------------------------------------------------------------ career data */

type LaneId = "blockchain" | "ai" | "gtm";

const LANES: Record<LaneId, { label: string; color: string }> = {
  blockchain: { label: "Blockchain", color: "#e6007a" },
  ai: { label: "AI & data", color: "#3fb8ff" },
  gtm: { label: "Community & GTM", color: "#f59e0b" },
};

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

/** "Feb 2022 – Dec 2022" / "2023 – 2026" / "2026 –" → the start, as a fractional year. */
function startOf(period: string): number {
  const m = period.split(/[–-]/)[0].trim().match(/([a-z]{3})?[a-z]*\s*(\d{4})/i);
  if (!m) return 0;
  return Number(m[2]) + (m[1] ? MONTHS.indexOf(m[1].toLowerCase()) : 0) / 12;
}

/** Résumé first, then jobs oldest → newest, the way a career reads. */
const ORDER: (ChapterId | "resume")[] = ["resume", ...[...chapters].sort((a, b) => startOf(a.period) - startOf(b.period)).map((c) => c.id)];

const card =
  "rounded-2xl border border-white/10 bg-[#0f1430]/75 p-5 text-[#f3e6d0] shadow-[0_24px_60px_-30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-6";

/* ------------------------------------------------------------------- tabs */

function Tabs({ selected, onSelect }: { selected: ChapterId | "resume"; onSelect: (id: ChapterId | "resume") => void }) {
  return (
    <div role="tablist" aria-label="Jobs" className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
      {ORDER.map((id) => {
        const c = id === "resume" ? null : chapters.find((x) => x.id === id)!;
        const on = selected === id;
        const color = c ? LANES[TRACK[c.id]].color : "#f3d79c";
        return (
          <button
            key={id}
            role="tab"
            aria-selected={on}
            onClick={() => onSelect(id)}
            ref={(el) => {
              if (el && on) el.scrollIntoView({ inline: "center", block: "nearest" });
            }}
            className="group relative flex shrink-0 snap-start items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-4 text-left transition-colors"
            style={{
              borderColor: on ? color : "rgba(255,255,255,0.1)",
              background: on ? `color-mix(in srgb, ${color} 22%, #0f1430)` : "rgba(15,20,48,0.55)",
              color: "#f3e6d0",
            }}
          >
            {c ? (
              <LogoTile org={c.org} size={28} name={c.company} />
            ) : (
              <img src={idCard.avatar} alt="" className="size-7 rounded-[22%] object-cover" />
            )}
            <span className="leading-tight">
              <span className="block text-[13px] font-medium">{c ? c.company : "Résumé"}</span>
              <span className="block text-[10.5px] tabular-nums opacity-60">{c ? c.period : "the short version"}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------- job pages */

/** What the hero shows for a job that has no film yet. */
function Poster({ c, color }: { c: Chapter; color: string }) {
  return (
    <div
      className="relative flex aspect-video flex-col justify-between overflow-hidden rounded-2xl border border-white/10 p-5 sm:p-7"
      style={{ background: `radial-gradient(120% 130% at 12% 0%, color-mix(in srgb, ${c.org.brand} 70%, #0f1430), #0b1020 70%)` }}
    >
      <div className="flex items-start justify-between">
        <LogoTile org={c.org} size={64} name={c.company} />
        <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[11.5px] text-[#f3e6d0]/80">Animated story coming soon</span>
      </div>
      <div>
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
          {c.symbol.name}
        </p>
        <p className="font-display mt-2 max-w-[30rem] text-[19px] leading-snug text-[#fff4e6] sm:text-[24px]">{c.symbol.why}</p>
      </div>
    </div>
  );
}

function Facts({ c, color }: { c: Chapter; color: string }) {
  return (
    <aside className={`${card} flex flex-col`}>
      <div className="flex items-center gap-3.5">
        <LogoTile org={c.org} size={52} name={c.company} />
        <div className="min-w-0">
          <h3 className="font-display text-[30px] leading-none sm:text-[34px]">{c.company}</h3>
          <p className="mt-1.5 text-[14px] text-[#f3e6d0]/80">{c.role}</p>
        </div>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] tabular-nums">
        <span style={{ color }}>{c.period}</span>
        {c.location && (
          <span className="flex items-center gap-1 text-[#f3e6d0]/60">
            <MapPin size={12} /> {c.location}
          </span>
        )}
        {c.founding && <span className="rounded-full border border-[#f59e0b]/50 px-2 py-px text-[10.5px] font-semibold text-[#f59e0b]">Founding team</span>}
      </p>
      <p className="mt-4 text-[15px] leading-[1.6] text-[#fff4e6]/90">{c.summary}</p>

      {c.metrics.length > 0 && (
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
          {c.metrics.map((m) => (
            <div key={m.label}>
              <p className="font-display text-[26px] leading-none tabular-nums sm:text-[30px]" style={{ color }}>
                {m.value}
              </p>
              <p className="mt-1.5 text-[11.5px] leading-4 text-[#f3e6d0]/60">{m.label}</p>
            </div>
          ))}
        </div>
      )}

      {c.stack.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {c.stack.map((s) => (
            <span key={s} className="rounded-full border border-white/12 bg-white/[0.04] px-2.5 py-0.5 text-[11.5px] text-[#f3e6d0]/80">
              {s}
            </span>
          ))}
        </div>
      )}

      <div className="mt-auto pt-5 text-[12.5px] leading-snug text-[#f3e6d0]/65">
        <p>{c.org.oneLiner}</p>
        {c.org.website && (
          <a href={c.org.website} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 underline decoration-white/25 underline-offset-2 hover:text-white">
            {new URL(c.org.website).hostname.replace("www.", "")} <ArrowUpRight size={12} />
          </a>
        )}
      </div>
    </aside>
  );
}

function Details({ c, color }: { c: Chapter; color: string }) {
  if (!c.built && c.bullets.length === 0) return null;
  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-2">
      {c.built && (
        <section className={card}>
          <div className="space-y-3">
            <BuildFlow built={c.built} color={color} dark />
            {c.alsoBuilt?.map((b) => (
              <BuildFlow key={b.title} built={b} color={color} also dark />
            ))}
          </div>
        </section>
      )}
      {c.bullets.length > 0 && (
        <section className={card}>
          <h4 className="font-display text-[22px]">What I did</h4>
          <ol className="mt-3 space-y-3">
            {c.bullets.map((b, i) => (
              <li key={b} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2.5 text-[14px] leading-6 text-[#f3e6d0]/85">
                <span className="mt-0.5 grid size-5 place-items-center rounded-full text-[10.5px] font-semibold tabular-nums text-[#0b1020]" style={{ background: color }}>
                  {i + 1}
                </span>
                {b}
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function JobPage({ c }: { c: Chapter }) {
  const color = LANES[TRACK[c.id]].color;
  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <div className="min-w-0">{HAS_FILM.has(c.id) ? <FilmFor id={c.id} /> : <Poster c={c} color={color} />}</div>
        <Facts c={c} color={color} />
      </div>
      <Details c={c} color={color} />
    </>
  );
}

function ResumePage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <section className={card}>
        <img src={idCard.avatar} alt={idCard.name} className="size-16 rounded-[22%] object-cover shadow-md" />
        <h3 className="font-display mt-4 text-[34px] leading-none">{idCard.name}</h3>
        <p className="mt-1.5 text-[14px] text-[#f3e6d0]/80">{idCard.title}</p>
        <p className="mt-4 text-[16px] leading-[1.6] text-[#fff4e6]/90">{profile.headline}</p>
        <p className="mt-3 text-[14px] leading-7 text-[#f3e6d0]/70">{cvSummary}</p>
        <div className="mt-5 flex flex-wrap gap-2 text-[13px]">
          {[
            ["LinkedIn", profile.links.linkedin],
            ["GitHub", profile.links.github],
            ["X", profile.links.x],
          ].map(([label, href]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 hover:border-[#f59e0b] hover:text-white">
              {label} <ArrowUpRight size={12} />
            </a>
          ))}
        </div>
      </section>
      <section className={card}>
        <div className="grid grid-cols-2 gap-4 border-b border-white/10 pb-5">
          {idCard.stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-[30px] leading-none text-[#f3d79c]">{s.value}</p>
              <p className="mt-1.5 text-[12px] text-[#f3e6d0]/60">{s.label}</p>
            </div>
          ))}
        </div>
        <h4 className="font-display mt-5 text-[22px]">Working beliefs</h4>
        <div className="mt-3 space-y-4">
          {beliefs.map((b) => (
            <div key={b.title}>
              <p className="text-[14.5px] font-semibold text-[#fff4e6]">{b.title}</p>
              <p className="mt-0.5 text-[13.5px] leading-6 text-[#f3e6d0]/70">{b.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------- view */

export function JobsView({ onClose, initial }: { onClose: () => void; initial?: ChapterId }) {
  const [selected, setSelected] = useState<ChapterId | "resume">(initial ?? ORDER[ORDER.length - 1]);
  const i = ORDER.indexOf(selected);

  // arrows step along the career (unless you're using the film's seek bar)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest?.("input, textarea")) return;
      const d = e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0;
      if (!d) return;
      const n = ORDER[i + d];
      if (n) setSelected(n);
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [i]);

  const c = selected === "resume" ? null : chapters.find((x) => x.id === selected)!;

  return (
    <CloseUpShell title="Past jobs" hint={`${chapters.length} roles across blockchain, AI and community. Pick one, or use ← →.`} onClose={onClose}>
      <div className="mx-auto max-w-[1120px]">
        <Tabs selected={selected} onSelect={setSelected} />
        <div className="mt-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
            >
              {c ? <JobPage c={c} /> : <ResumePage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </CloseUpShell>
  );
}

