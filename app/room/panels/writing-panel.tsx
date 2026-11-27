"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CloseUpShell } from "./close-up-shell";
import { BoxStamp, Tape, wobble } from "./paper-bits";

export type PostSummary = { slug: string; title: string; date: string; summary?: string };

/**
 * Old cloth bindings. All dark enough that the cream label and gilt lettering
 * stay readable on every one of them.
 */
const CLOTH = ["#5b1f1c", "#1f2f4a", "#24402e", "#4a2e1c", "#3d2342", "#2b2b2e", "#6b4a16", "#16363a", "#5a2a14"];

/** Bookshelf close-up: each post is an old cloth-bound book. Pull one out to see its library card. */
export function WritingPanel({ posts, onClose }: { posts: PostSummary[]; onClose: () => void }) {
  const pathname = usePathname() ?? "";
  const current = posts.findIndex((p) => pathname === `/blog/${p.slug}`);
  const [picked, setPicked] = useState<number | null>(current >= 0 ? current : null);
  const post = picked !== null ? posts[picked] : null;

  return (
    <CloseUpShell title="Writing" hint={`${posts.length} essays on the shelf. Pull one out.`} onClose={onClose}>
      <div className="mx-auto max-w-[1000px]">
        {/* the shelf */}
        <div className="relative overflow-x-auto pb-1 [scrollbar-width:thin]">
          <div className="mx-auto flex w-max items-end gap-[3px] px-3 pt-12">
            {posts.map((p, i) => {
              const cloth = CLOTH[i % CLOTH.length];
              const h = 262 + ((i * 47) % 64);
              const w = 58 + ((i * 29) % 3) * 6;
              const active = picked === i;
              return (
                <motion.button
                  key={p.slug}
                  onClick={() => setPicked(active ? null : i)}
                  aria-pressed={active}
                  aria-label={p.title}
                  className="book-spine relative flex flex-col items-center"
                  style={{ height: h, width: w, "--cloth": cloth } as React.CSSProperties}
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: active ? -38 : 0, opacity: 1, rotate: active ? 0 : wobble(p.slug, 0.6) }}
                  whileHover={{ y: active ? -38 : -14 }}
                  transition={{ type: "spring", stiffness: 420, damping: 30, delay: picked === null ? i * 0.03 : 0 }}
                >
                  {/* gilt bands near the head */}
                  <span className="book-gilt mt-3 h-[3px] w-[70%]" />
                  <span className="book-gilt mt-[3px] h-px w-[70%]" />

                  {/* the paper title label */}
                  <span className="book-label mt-3 flex min-h-0 flex-1 items-center justify-center px-1 py-2.5" style={{ width: w - 18 }}>
                    <span
                      className="font-hand overflow-hidden font-bold leading-[1.15] !text-[#1f160d]"
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", maxHeight: "100%", fontSize: p.title.length > 70 ? 12 : p.title.length > 45 ? 13 : 14.5 }}
                    >
                      {p.title}
                    </span>
                  </span>

                  {/* gilt year at the foot */}
                  <span className="book-gilt mt-3 h-px w-[70%]" />
                  <span className="book-gilt-text mb-2.5 mt-1.5 text-[13px] tabular-nums">{p.date.slice(-4)}</span>
                </motion.button>
              );
            })}
          </div>
          {/* a wooden shelf board */}
          <div className="book-shelf h-5 rounded-[2px]" />
        </div>

        {/* the pulled-out book's library card */}
        <AnimatePresence mode="wait">
          {post && (
            <motion.div
              key={post.slug}
              className="catalog-card relative mx-auto mt-10 max-w-[640px] text-[#2a1f14]"
              initial={{ opacity: 0, y: 16, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: wobble(post.slug, 0.8) }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.22 }}
            >
              <Tape className="-top-2.5 left-1/2 -translate-x-1/2 rotate-[-3deg]" />
              <div className="flex items-start justify-between gap-3 px-6 pt-4 sm:px-8">
                <span className="font-hand-sc text-[13px] uppercase">
                  Shelf W · No. {String((picked ?? 0) + 1).padStart(3, "0")}
                </span>
                <BoxStamp seed={post.slug} color="#1f4fd1" className="!text-[13px]">
                  {post.date}
                </BoxStamp>
              </div>
              <div className="px-6 pb-7 pt-3 sm:px-8">
                <span className="mb-3 block h-2 w-16 rounded-[1px]" style={{ background: CLOTH[picked! % CLOTH.length] }} aria-hidden />
                <h3 className="font-marker text-[26px] leading-[1.15] sm:text-[30px]">{post.title}</h3>
                {post.summary && <p className="font-hand mt-3 text-[17px] leading-[24px]">{post.summary}</p>}
                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <Link href={`/blog/${post.slug}`} scroll={false} className="lamp-btn px-5 py-2 text-[14px]">
                    Open the book
                  </Link>
                  <span className="font-hand text-[15px] opacity-60">opens right here</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </CloseUpShell>
  );
}
