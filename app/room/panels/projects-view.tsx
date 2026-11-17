"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { languageColor } from "app/data/projects";
import { profile } from "app/data/profile";
import { useProjects } from "../use-projects";
import { CloseUpShell } from "./close-up-shell";

/** Display-case close-up: each repo is a product box. */
export function ProjectsView({ onClose }: { onClose: () => void }) {
  const { status, projects } = useProjects();
  return (
    <CloseUpShell title="Projects" hint="Things I’ve built and shipped in the open." onClose={onClose}>
      <div className="mx-auto max-w-[980px]">
        {status === "loading" && <p className="text-center text-[14px] text-white/70">Unpacking the boxes…</p>}
        {status === "error" && (
          <p className="text-center text-[14px] text-white/80">
            Couldn’t reach GitHub right now.{" "}
            <a className="underline" href={profile.links.github} target="_blank" rel="noreferrer">
              See them on GitHub ↗
            </a>
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p, i) => {
            const color = languageColor(p.language);
            return (
              <motion.a
                key={p.fullName}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group relative flex min-h-[180px] flex-col overflow-hidden rounded-[10px] bg-[#fbf8f1] text-[#1c1917] shadow-[0_2px_4px_rgba(0,0,0,0.1),0_18px_40px_-14px_rgba(0,0,0,0.6)]"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 380, damping: 30, delay: i * 0.04 }}
              >
                {/* box "lid" in the language colour */}
                <div className="flex items-center justify-between px-4 py-2" style={{ background: color }}>
                  <span className="text-[12px] font-semibold text-black/70">
                    {p.language ?? "project"}
                  </span>
                  {p.stars > 0 && (
                    <span className="flex items-center gap-1 text-[12px] font-semibold tabular-nums text-black/70">
                      <Star size={11} fill="currentColor" /> {p.stars}
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col px-4 py-3">
                  <h3 className="font-display text-[22px] leading-tight group-hover:text-[#b4521c]">{p.name}</h3>
                  <p className="mt-1.5 overflow-hidden text-[13px] leading-5 text-[#57534e]" style={{ display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>{p.description ?? "No description yet."}</p>
                  {p.topics.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1 pt-3">
                      {p.topics.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full bg-[#f3eee4] px-2 py-0.5 text-[11px] text-[#78716c]">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.a>
            );
          })}
        </div>
        <p className="mt-6 text-center text-[13px] text-white/75">
          <a className="hover:underline" href={profile.links.github} target="_blank" rel="noreferrer">
            More on GitHub
          </a>
        </p>
      </div>
    </CloseUpShell>
  );
}
