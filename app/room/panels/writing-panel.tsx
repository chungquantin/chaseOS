"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CloseUpShell } from "./close-up-shell";

export type PostSummary = { slug: string; title: string; date: string; summary?: string };

const SPINES = ["#fafafa", "#f0a04b", "#3a3a3a", "#d4d4d4", "#ffc27d", "#737373", "#e5e5e5", "#c9852f", "#a3a3a3"];

/** Bookshelf close-up: each post is a book. Pull one out to see its cover. */
export function WritingPanel({ posts, onClose }: { posts: PostSummary[]; onClose: () => void }) {
  const pathname = usePathname() ?? "";
  const current = posts.findIndex((p) => pathname === `/blog/${p.slug}`);
  const [picked, setPicked] = useState<number | null>(current >= 0 ? current : null);
  const post = picked !== null ? posts[picked] : null;

  return (
    <CloseUpShell title="Writing" hint={`${posts.length} essays on the shelf. Pull one out.`} onClose={onClose}>
      <div className="mx-auto max-w-[980px]">
        {/* the shelf */}
        <div className="relative overflow-x-auto pb-1">
          <div className="flex min-w-max items-end gap-1.5 px-2 pt-10">
            {posts.map((p, i) => {
              const color = SPINES[i % SPINES.length];
              const h = 240 + ((i * 47) % 70);
              const active = picked === i;
              return (
                <motion.button
                  key={p.slug}
                  onClick={() => setPicked(active ? null : i)}
                  aria-pressed={active}
                  aria-label={p.title}
                  className="relative flex w-[54px] flex-col items-center justify-between rounded-t-[3px] rounded-b-[2px] px-1 py-3 text-white shadow-[inset_-6px_0_10px_-6px_rgba(0,0,0,0.45),inset_4px_0_6px_-5px_rgba(255,255,255,0.35),0_8px_18px_-8px_rgba(0,0,0,0.6)] sm:w-[62px]"
                  style={{ height: h, background: color }}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: active ? -34 : 0, opacity: 1 }}
                  whileHover={{ y: active ? -34 : -14 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30, delay: picked === null ? i * 0.03 : 0 }}
                >
                  <span className="h-1 w-8 rounded bg-white/40" />
                  <span
                    className="max-h-[78%] overflow-hidden font-serif text-[13px] font-semibold leading-tight"
                    style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                  >
                    {p.title}
                  </span>
                  <span className="text-[11px] tabular-nums text-white/75">{p.date.slice(-4)}</span>
                </motion.button>
              );
            })}
          </div>
          <div className="h-4 rounded-sm bg-gradient-to-b from-[#3a3a3a] to-[#1c1c1c] shadow-[0_10px_20px_-8px_rgba(0,0,0,0.6)]" />
        </div>

        {/* the cover of the pulled-out book */}
        <AnimatePresence mode="wait">
          {post && (
            <motion.div
              key={post.slug}
              className="mx-auto mt-6 max-w-[620px] overflow-hidden rounded-[6px] bg-[#fafafa] text-[#0a0a0a] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <div className="h-2" style={{ background: SPINES[picked! % SPINES.length] }} />
              <div className="px-6 py-5 sm:px-8">
                <p className="text-[13px] text-[#737373]">{post.date}</p>
                <h3 className="font-display mt-1 text-[28px] leading-tight">{post.title}</h3>
                {post.summary && <p className="mt-3 text-[15px] leading-7 text-[#404040]">{post.summary}</p>}
                <div className="mt-5 flex items-center justify-between">
                  <Link
                    href={`/blog/${post.slug}`}
                    scroll={false}
                    className="lamp-btn px-5 py-2 text-[14px]"
                  >
                    Open the book
                  </Link>
                  <span className="text-[13px] text-[#a3a3a3]">opens right here</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CloseUpShell>
  );
}
