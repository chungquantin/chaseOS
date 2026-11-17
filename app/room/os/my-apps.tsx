"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, ChevronLeft, Star } from "lucide-react";
import { BUILT_APPS, type BuiltApp } from "app/data/apps";
import { languageColor } from "app/data/projects";
import { useProjects } from "../use-projects";

const clamp2 = { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as const;

/** Square app icon: the real one on a white tile, or a monogram in the app's colour. */
export function AppIcon({ app, size = 48 }: { app: BuiltApp; size?: number }) {
  const radius = Math.round(size * 0.23);
  if (app.icon)
    return (
      <span
        className="grid shrink-0 place-items-center bg-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ width: size, height: size, borderRadius: radius }}
      >
        <img src={app.icon} alt="" className="object-contain" style={{ width: size * 0.62, height: size * 0.62 }} />
      </span>
    );
  return (
    <span
      className="font-display grid shrink-0 place-items-center text-white shadow-[0_4px_10px_-4px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.3)]"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        fontSize: size * 0.46,
        background: `linear-gradient(150deg, color-mix(in srgb, ${app.color} 75%, white), ${app.color} 55%, color-mix(in srgb, ${app.color} 60%, black))`,
      }}
    >
      {app.name.slice(0, 1)}
    </span>
  );
}

/** The app's screenshot, or a branded panel when there isn't one. */
function Shot({ app, className = "" }: { app: BuiltApp; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: app.color }}>
      {app.screenshot ? (
        <img src={app.screenshot} alt={`${app.name} screenshot`} className="size-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]" />
      ) : (
        <div
          className="grid size-full place-items-center"
          style={{ background: `radial-gradient(120% 120% at 20% 0%, color-mix(in srgb, ${app.color} 55%, white), ${app.color} 55%, color-mix(in srgb, ${app.color} 55%, black))` }}
        >
          <div className="flex flex-col items-center gap-3 text-white">
            <AppIcon app={app} size={64} />
            <p className="font-display text-[22px] drop-shadow">{app.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ app, featured, onOpen }: { app: BuiltApp; featured: boolean; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className={`group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-[0_1px_2px_rgba(0,0,0,0.06),0_8px_24px_-14px_rgba(0,0,0,0.3)] ring-1 ring-black/[0.06] transition-shadow hover:shadow-[0_1px_2px_rgba(0,0,0,0.06),0_16px_36px_-16px_rgba(0,0,0,0.4)] ${
        featured ? "@min-[560px]:col-span-2" : ""
      }`}
    >
      <Shot app={app} className={featured ? "aspect-[1200/630] @min-[560px]:aspect-[2.6/1]" : "aspect-[1200/630]"} />
      <div className="flex items-start gap-3 p-3.5">
        <AppIcon app={app} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-[15px] font-semibold text-[#1c1917]">{app.name}</p>
            <span className="shrink-0 rounded-full bg-[#f3eee4] px-2 py-0.5 text-[11px] text-[#78716c]">{app.kind}</span>
          </div>
          <p className="mt-1 text-[13px] leading-[1.45] text-[#57534e]" style={clamp2}>
            {app.tagline}
          </p>
        </div>
      </div>
    </button>
  );
}

function Detail({ app, onBack }: { app: BuiltApp; onBack: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 overflow-y-auto bg-[#fbfaf7] text-[#1c1917]"
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
    >
      <div className="sticky top-0 z-10 flex items-center border-b border-black/[0.06] bg-[#fbfaf7]/90 px-3 py-2 backdrop-blur">
        <button onClick={onBack} className="flex items-center gap-1 rounded-full px-2 py-1 text-[13px] text-[#57534e] hover:bg-black/5">
          <ChevronLeft size={15} /> All apps
        </button>
      </div>
      <div className="p-4 @min-[560px]:p-6">
        <Shot app={app} className="aspect-[1200/630] rounded-xl ring-1 ring-black/[0.06]" />
        <div className="mt-5 flex flex-col gap-4 @min-[520px]:flex-row @min-[520px]:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <AppIcon app={app} size={60} />
            <div className="min-w-0">
              <h2 className="font-display text-[26px] leading-tight">{app.name}</h2>
              <p className="text-[13px] text-[#78716c]">
                {app.kind}
                {app.from ? `, ${app.from.startsWith("Made") || app.from.startsWith("Side") ? app.from.toLowerCase() : `at ${app.from}`}` : ""}
              </p>
            </div>
          </div>
          <a href={app.url} target="_blank" rel="noreferrer" className="lamp-btn shrink-0 self-start px-4 py-2 text-[13px] @min-[520px]:self-auto">
            Open {app.host} <ArrowUpRight size={14} />
          </a>
        </div>

        <p className="mt-5 max-w-[62ch] text-[14.5px] leading-7 text-[#44403c]">{app.about}</p>

        <div className="mt-5 grid gap-3 @min-[600px]:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="rounded-2xl bg-white p-4 ring-1 ring-black/[0.06]">
            <p className="font-display text-[17px]">What I built</p>
            <ul className="mt-2.5 space-y-2">
              {app.built.map((b) => (
                <li key={b} className="flex gap-2.5 text-[13.5px] leading-[1.5] text-[#44403c]">
                  <span className="mt-[3px] grid size-4 shrink-0 place-items-center rounded-full text-white" style={{ background: app.color }}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            {app.stats && app.stats.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {app.stats.map((s) => (
                  <div key={s.label} className="rounded-2xl bg-[#f3eee4] px-3.5 py-3">
                    <p className="font-display text-[22px] leading-none" style={{ color: `color-mix(in srgb, ${app.color} 70%, black)` }}>
                      {s.value}
                    </p>
                    <p className="mt-1 text-[11.5px] text-[#78716c]">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              {app.tags.map((t) => (
                <span key={t} className="rounded-full border border-black/10 bg-white px-2.5 py-1 text-[12px] text-[#57534e]">
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OpenSource() {
  const { status, projects } = useProjects();
  if (status === "error" || (status === "ready" && projects.length === 0)) return null;
  return (
    <section className="mt-7">
      <h3 className="font-display px-1 text-[19px]">Open source</h3>
      <p className="px-1 text-[12.5px] text-[#78716c]">My most-starred repositories on GitHub.</p>
      {status === "loading" && <p className="px-1 py-4 text-[13px] text-[#a8a29e]">Loading from GitHub…</p>}
      <div className="mt-2 grid gap-1 @min-[520px]:grid-cols-2">
        {projects.map((p) => (
          <a key={p.fullName} href={p.url} target="_blank" rel="noreferrer" className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-black/[0.04]">
            <span className="mt-1 size-2.5 shrink-0 rounded-full" style={{ background: languageColor(p.language) }} />
            <span className="min-w-0">
              <span className="block truncate text-[14px] font-semibold">{p.name}</span>
              <span className="block text-[12.5px] leading-[1.4] text-[#78716c]" style={clamp2}>
                {p.description ?? "No description yet."}
              </span>
              <span className="mt-0.5 flex items-center gap-2 text-[11.5px] text-[#a8a29e]">
                {p.language && <span>{p.language}</span>}
                {p.stars > 0 && (
                  <span className="flex items-center gap-0.5">
                    <Star size={10} fill="currentColor" /> {p.stars}
                  </span>
                )}
              </span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

/** "My apps": a gallery of what I've built, with a detail page for each. */
export function MyApps({ arg }: { arg?: string }) {
  const target = arg?.split("@")[0] ?? null;
  const [selected, setSelected] = useState<string | null>(target);
  // opening a desktop icon while the window is already up jumps to that app
  useEffect(() => {
    if (target) setSelected(target);
  }, [arg, target]);
  const app = BUILT_APPS.find((a) => a.id === selected);
  return (
    <div className="relative h-full overflow-hidden bg-[#fbfaf7] text-[#1c1917]">
      <div className="h-full overflow-y-auto p-4 @min-[560px]:p-6" aria-hidden={!!app}>
        <h2 className="font-display px-1 text-[26px] leading-tight">Things I’ve built</h2>
        <p className="mt-1 px-1 text-[13px] text-[#78716c]">What I’ve shipped, and the part I built in each.</p>
        <div className="mt-4 grid gap-3 @min-[560px]:grid-cols-2">
          {BUILT_APPS.map((a, i) => (
            <Card key={a.id} app={a} featured={i === 0} onOpen={() => setSelected(a.id)} />
          ))}
        </div>
        <OpenSource />
      </div>
      <AnimatePresence>{app && <Detail key={app.id} app={app} onBack={() => setSelected(null)} />}</AnimatePresence>
    </div>
  );
}
