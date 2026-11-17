"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cvSummary, jobDocuments, type JobDocument } from "app/data/career";
import { beliefs, profile } from "app/data/profile";
import { BuildFlow, LogoTile } from "./build-flow";
import { CloseUpShell } from "./close-up-shell";

/** Same scatter feel as the papers on the 3D table. */
const TILT = [-2.5, 1.8, -1.2, 2.6, -2, 1.4, -0.8, 2.2, -1.6];

function Stamp() {
  return (
    <span className="absolute bottom-3 right-3 rotate-[-8deg] rounded border-2 border-[#c2410c]/70 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-[#c2410c]/80">
      Founding
    </span>
  );
}

function PaperCard({ doc, i, onOpen }: { doc: JobDocument; i: number; onOpen: () => void }) {
  return (
    <motion.button
      layoutId={`doc-${doc.id}`}
      onClick={onOpen}
      className="relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-[4px] bg-[#fbf8f1] p-4 pt-6 text-left text-[#1c1917] shadow-[0_2px_4px_rgba(0,0,0,0.12),0_14px_30px_-10px_rgba(0,0,0,0.45)]"
      initial={{ opacity: 0, y: 40, rotate: TILT[i % TILT.length] * 3 }}
      animate={{ opacity: 1, y: 0, rotate: TILT[i % TILT.length] }}
      whileHover={{ y: -8, rotate: 0, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 380, damping: 30, delay: i * 0.035 }}
    >
      <span className="absolute inset-x-0 top-0 h-2" style={{ background: doc.accent }} />
      {doc.chapter?.founding && <Stamp />}
      {doc.chapter ? (
        <span className="mb-2">
          <LogoTile org={doc.chapter.org} size={34} />
        </span>
      ) : (
        <img src="/brand/profile-avatar.png" alt="" className="mb-2 size-[34px] rounded-[22%] object-cover" />
      )}
      <span className="font-display text-[23px] leading-tight sm:text-[25px]">{doc.title}</span>
      <span className="mt-1 text-[13px] leading-snug text-[#57534e]">{doc.subtitle}</span>
      <span className="mt-2 text-[12px] font-medium tabular-nums" style={{ color: doc.accent }}>
        {doc.period}
      </span>
      <span className="mt-auto grid gap-1.5" aria-hidden>
        {[90, 70, 85, 55].map((w, k) => (
          <span key={k} className="h-1.5 rounded-full bg-[#e7e2d8]" style={{ width: `${w}%` }} />
        ))}
      </span>
    </motion.button>
  );
}

function ResumeBody() {
  return (
    <>
      <p className="text-[20px] font-medium leading-snug">{profile.headline}</p>
      <p className="mt-3 text-[15px] leading-7 text-[#44403c]">{cvSummary}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-[13px]">
        {[
          ["LinkedIn", profile.links.linkedin],
          ["GitHub", profile.links.github],
          ["X", profile.links.x],
        ].map(([label, href]) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" className="rounded-full border border-black/10 px-3 py-1 hover:border-[#e2571f]">
            {label} ↗
          </a>
        ))}
      </div>
      <h4 className="font-display mt-7 text-[20px]">Working beliefs</h4>
      <div className="mt-2 grid gap-4">
        {beliefs.map((b) => (
          <div key={b.title}>
            <p className="font-medium">{b.title}</p>
            <p className="mt-0.5 text-[14px] leading-6 text-[#57534e]">{b.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function JobBody({ doc }: { doc: JobDocument }) {
  const c = doc.chapter!;
  return (
    <>
      <p className="text-[14px] text-[#57534e]">
        {c.role}
        {c.location && <span className="text-[#a8a29e]"> · {c.location}</span>}
      </p>
      <p className="mt-2 text-[19px] font-medium leading-snug">{c.summary}</p>

      {/* about the company */}
      <div className="mt-4 flex gap-3 rounded-xl border border-black/[0.07] p-3.5">
        <LogoTile org={c.org} size={44} />
        <div className="min-w-0">
          <p className="font-display text-[16px]">About {c.company}</p>
          <p className="mt-0.5 text-[14px] leading-snug">{c.org.oneLiner}</p>
          {c.org.facts.length > 0 && (
            <ul className="mt-1.5 grid gap-0.5 text-[12.5px] leading-5 text-[#57534e]">
              {c.org.facts.map((f) => (
                <li key={f}>· {f}</li>
              ))}
            </ul>
          )}
          {c.org.website && (
            <a href={c.org.website} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[12px] text-[#78716c] underline decoration-black/20 underline-offset-2 hover:text-[#b4521c]">
              {new URL(c.org.website).hostname.replace("www.", "")}
            </a>
          )}
        </div>
      </div>

      {c.built && (
        <div className="mt-4">
          <BuildFlow built={c.built} color={doc.accent} />
          {c.alsoBuilt?.map((b) => (
            <div key={b.title} className="mt-2.5">
              <BuildFlow built={b} color={doc.accent} also />
            </div>
          ))}
        </div>
      )}
      {c.metrics.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {c.metrics.map((m) => (
            <div key={m.label} className="rounded-lg bg-[#f3eee4] px-3 py-2">
              <div className="font-display text-[22px] leading-none tabular-nums" style={{ color: doc.accent }}>
                {m.value}
              </div>
              <div className="text-[11px] leading-4 text-[#78716c]">{m.label}</div>
            </div>
          ))}
        </div>
      )}
      {c.bullets.length > 0 && (
        <ul className="mt-5 grid gap-2.5">
          {c.bullets.map((b) => (
            <li key={b} className="grid grid-cols-[14px_minmax(0,1fr)] text-[14px] leading-6 text-[#44403c]">
              <span style={{ color: doc.accent }}>•</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-1.5">
        {c.stack.map((s) => (
          <span key={s} className="rounded-full bg-[#f3eee4] px-2.5 py-0.5 text-[12px] text-[#57534e]">
            {s}
          </span>
        ))}
        <a href={c.href} target="_blank" rel="noreferrer" className="ml-auto text-[13px] text-[#78716c] hover:text-[#e2571f]">
          {new URL(c.href).hostname.replace("www.", "")}
        </a>
      </div>
    </>
  );
}

function Document({
  doc,
  index,
  total,
  onPrev,
  onNext,
  onBack,
}: {
  doc: JobDocument;
  index: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  onBack: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-8" onClick={onBack}>
      <motion.div
        className="absolute inset-0 bg-[#140e0a]/55 backdrop-blur-[3px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      <motion.article
        layoutId={`doc-${doc.id}`}
        onClick={(e) => e.stopPropagation()}
        className="relative flex max-h-[92vh] w-full max-w-[680px] flex-col overflow-hidden rounded-[6px] bg-[#fbf8f1] text-[#1c1917] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]"
        transition={{ type: "spring", stiffness: 340, damping: 32 }}
      >
        <span className="absolute inset-x-0 top-0 h-2.5" style={{ background: doc.accent }} />
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-8 sm:px-10">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="font-display text-[36px] leading-none">{doc.title}</h3>
            <span className="shrink-0 text-[13px] font-medium tabular-nums" style={{ color: doc.accent }}>
              {doc.chapter?.period ?? doc.subtitle}
            </span>
          </div>
          {doc.chapter?.founding && (
            <p className="mt-2 inline-block rounded border border-[#c2410c]/60 px-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-[#c2410c]">
              Founding team
            </p>
          )}
          <div className="mt-4">{doc.chapter ? <JobBody doc={doc} /> : <ResumeBody />}</div>
        </div>
        <footer className="flex items-center justify-between gap-2 border-t border-black/10 px-3 py-2.5">
          <button onClick={onBack} className="rounded-full px-3 py-1.5 text-[13px] text-[#57534e] hover:bg-black/5">
            Back to table
          </button>
          <div className="flex items-center gap-1">
            <button onClick={onPrev} disabled={!onPrev} aria-label="Previous document" className="grid size-8 place-items-center rounded-full hover:bg-black/5 disabled:opacity-30">
              <ArrowLeft size={16} />
            </button>
            <span className="w-12 text-center text-[12px] tabular-nums text-[#78716c]">
              {index + 1}/{total}
            </span>
            <button onClick={onNext} disabled={!onNext} aria-label="Next document" className="grid size-8 place-items-center rounded-full hover:bg-black/5 disabled:opacity-30">
              <ArrowRight size={16} />
            </button>
          </div>
        </footer>
      </motion.article>
    </div>
  );
}

export function JobsView({ onClose }: { onClose: () => void }) {
  const docs = useMemo(jobDocuments, []);
  const [open, setOpen] = useState<number | null>(null);

  // Esc / arrows act on the open document before the room sees them
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open === null) return;
      if (e.key === "Escape") setOpen(null);
      else if (e.key === "ArrowLeft") setOpen((i) => (i! > 0 ? i! - 1 : i));
      else if (e.key === "ArrowRight") setOpen((i) => (i! < docs.length - 1 ? i! + 1 : i));
      else return;
      e.stopPropagation();
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, docs.length]);

  return (
    <CloseUpShell title="Past jobs" hint="Everything I’ve worked on, on one table. Pick a document to read." onClose={onClose}>
      <div className="mx-auto grid max-w-[920px] grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-5">
        {docs.map((doc, i) => (
          <PaperCard key={doc.id} doc={doc} i={i} onOpen={() => setOpen(i)} />
        ))}
      </div>
      <AnimatePresence>
        {open !== null && (
          <Document
            key="doc"
            doc={docs[open]}
            index={open}
            total={docs.length}
            onBack={() => setOpen(null)}
            onPrev={open > 0 ? () => setOpen(open - 1) : undefined}
            onNext={open < docs.length - 1 ? () => setOpen(open + 1) : undefined}
          />
        )}
      </AnimatePresence>
    </CloseUpShell>
  );
}
