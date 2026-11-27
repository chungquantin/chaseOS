"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Star } from "lucide-react";
import { languageColor } from "app/data/projects";
import { profile } from "app/data/profile";
import { useProjects } from "../use-projects";
import { CloseUpShell } from "./close-up-shell";
import { BoxStamp, Tape, wobble } from "./paper-bits";

/** Language colours, faded like old ink so they sit on aged card stock. */
const inked = (lang: string | null) => `color-mix(in srgb, ${languageColor(lang)} 45%, #4a2a10)`;

/** Display-case close-up: each repo is a card pulled from an old library catalogue. */
export function ProjectsView({ onClose }: { onClose: () => void }) {
  const { status, projects } = useProjects();
  return (
    <CloseUpShell title="Projects" hint="Things I’ve built and shipped in the open." onClose={onClose}>
      <div className="mx-auto max-w-[1040px]">
        {status === "loading" && <p className="font-hand text-center text-[17px] !text-white/75">Pulling the cards…</p>}
        {status === "error" && (
          <p className="font-hand text-center text-[17px] !text-white/80">
            Couldn’t reach GitHub right now.{" "}
            <a className="underline" href={profile.links.github} target="_blank" rel="noreferrer">
              See them on GitHub ↗
            </a>
          </p>
        )}
        <div className="grid grid-cols-1 gap-x-6 gap-y-8 pt-3 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const ink = inked(p.language);
            const tilt = wobble(p.fullName, 1.6);
            return (
              <motion.a
                key={p.fullName}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="catalog-card group relative flex min-h-[210px] flex-col text-[#2a1f14]"
                initial={{ opacity: 0, y: 24, rotate: tilt * 2 }}
                animate={{ opacity: 1, y: 0, rotate: tilt }}
                whileHover={{ y: -6, rotate: 0 }}
                transition={{ type: "spring", stiffness: 380, damping: 30, delay: i * 0.04 }}
              >
                <Tape className="-top-2.5 left-1/2 -translate-x-1/2" style={{ rotate: `${wobble(p.name, 6)}deg` }} />

                {/* call number + language stamp, like the head of a catalogue card */}
                <div className="flex items-start justify-between gap-2 px-5 pt-4">
                  <span className="font-hand-sc text-[13px] uppercase">No. {String(i + 1).padStart(3, "0")}</span>
                  <BoxStamp seed={p.fullName} color={ink} className="!text-[13px]">
                    {p.language ?? "misc"}
                  </BoxStamp>
                </div>

                <div className="flex flex-1 flex-col px-5 pb-6 pt-1">
                  <h3 className="font-marker break-words text-[24px] leading-[1.1] transition-colors group-hover:!text-[#a65f0c]">{p.name}</h3>
                  <p
                    className="font-hand mt-2 overflow-hidden text-[16px] leading-[24px]"
                    style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}
                  >
                    {p.description ?? "No description yet."}
                  </p>

                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    {p.topics.length > 0 ? (
                      <div className="flex flex-wrap gap-x-1.5 gap-y-2">
                        {p.topics.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="washi font-hand px-2 py-0.5 text-[13px] font-bold"
                            style={{ "--tape": "#f4ead2", transform: `rotate(${wobble(t, 3)}deg)` } as React.CSSProperties}
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span />
                    )}
                    {p.stars > 0 && (
                      <span className="font-marker flex shrink-0 items-center gap-1 text-[18px] leading-none !text-[#b4232a]">
                        <Star size={14} fill="currentColor" /> {p.stars}
                      </span>
                    )}
                  </div>
                </div>

                {/* the rod hole every catalogue card has */}
                <span className="absolute bottom-2 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#1a120a]/85 shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]" aria-hidden />
              </motion.a>
            );
          })}
        </div>
        <p className="mt-8 text-center">
          <a
            className="font-hand nb-link inline-flex items-center gap-1 rounded-md px-3 py-1 text-[18px] !text-[#f4ead2] [text-shadow:none]"
            href={profile.links.github}
            target="_blank"
            rel="noreferrer"
          >
            More in the GitHub drawer <ArrowUpRight size={15} />
          </a>
        </p>
      </div>
    </CloseUpShell>
  );
}
