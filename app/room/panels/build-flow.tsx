"use client";

import { Fragment } from "react";
import { motion } from "framer-motion";
import type { Chapter } from "app/data/career";

/** Company logo, or a monogram tile when there isn't one. */
export function LogoTile({ org, size = 40 }: { org: Chapter["org"]; size?: number }) {
  return org.logo ? (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-[22%] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      style={{ width: size, height: size }}
    >
      <img src={org.logo} alt="" className="h-[78%] w-[78%] object-contain" />
    </span>
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-[22%] font-serif font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
      style={{ width: size, height: size, background: org.brand, fontSize: size * 0.42 }}
    >
      {org.monogram}
    </span>
  );
}

/**
 * "What I built", drawn as a left-to-right pipeline (top-to-bottom on
 * phones) with packets flowing between stages.
 */
export function BuildFlow({ built, color, also }: { built: NonNullable<Chapter["built"]>; color: string; also?: boolean }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-[#f6f1e7] p-4">
      <p className="font-display text-[18px] leading-tight">{also ? "Also built" : "What I built"}</p>
      <p className="mt-0.5 text-[13.5px] text-[#57534e]">{built.title}</p>
      <div className="mt-3 flex flex-col items-stretch sm:flex-row sm:items-center">
        {built.flow.map((node, i) => (
          <Fragment key={node.label}>
            {i > 0 && (
              <span className="relative mx-auto h-5 w-px shrink-0 bg-black/15 sm:mx-0 sm:h-px sm:w-5" aria-hidden>
                <span className="flow-packet absolute -left-[3px] top-0 size-[7px] rounded-full sm:-top-[3px] sm:left-0" style={{ background: color, animationDelay: `${i * 0.25}s` }} />
              </span>
            )}
            <motion.div
              className="min-w-0 flex-1 rounded-lg bg-white px-2.5 py-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.08)]"
              style={{ borderTop: `3px solid ${color}` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <p className="text-[12.5px] font-semibold leading-tight">{node.label}</p>
              {node.note && <p className="mt-0.5 text-[11px] leading-tight text-[#78716c]">{node.note}</p>}
            </motion.div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
