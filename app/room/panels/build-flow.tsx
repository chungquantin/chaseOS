"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import type { Chapter } from "app/data/career";

/** Company logo, or a monogram tile when there isn't one (or it fails to load). */
export function LogoTile({ org, size = 40, name }: { org: Chapter["org"]; size?: number; name?: string }) {
  const [broken, setBroken] = useState(false);
  return org.logo && !broken ? (
    <span
      className="grid shrink-0 place-items-center overflow-hidden rounded-[22%] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.12),inset_0_0_0_1px_rgba(0,0,0,0.06)]"
      style={{ width: size, height: size }}
    >
      <img src={org.logo} alt="" className="h-[78%] w-[78%] object-contain" onError={() => setBroken(true)} />
    </span>
  ) : (
    <span
      className="grid shrink-0 place-items-center rounded-[22%] font-serif font-bold text-white shadow-[0_1px_2px_rgba(0,0,0,0.15)]"
      style={{ width: size, height: size, background: org.brand, fontSize: size * 0.42 }}
    >
      {org.monogram ?? name?.slice(0, 1) ?? "•"}
    </span>
  );
}

/**
 * "What I built", drawn by hand on the page: wonky boxes joined by inked
 * arrows (top-to-bottom on phones), with packets running along them.
 */
export function BuildFlow({ built, color, also }: { built: NonNullable<Chapter["built"]>; color: string; also?: boolean }) {
  return (
    <div>
      <p className="font-marker text-[20px] leading-tight">{also ? "Also built" : "What I built"}</p>
      <p className="font-hand mt-0.5 text-[16px] opacity-80">{built.title}</p>
      <div className="mt-3 flex flex-col items-stretch sm:flex-row sm:items-center">
        {built.flow.map((node, i) => (
          <Fragment key={node.label}>
            {i > 0 && (
              <span className="relative mx-auto h-6 w-[2px] shrink-0 sm:mx-0 sm:h-[2px] sm:w-6" aria-hidden>
                <span className="absolute inset-0 rounded-full bg-[#2a1f14]/60" />
                <span className="absolute -bottom-[3px] -left-[3px] size-0 border-x-[4px] border-t-[6px] border-x-transparent border-t-[#2a1f14]/60 sm:-right-[4px] sm:bottom-auto sm:left-auto sm:-top-[3px] sm:border-y-[4px] sm:border-l-[6px] sm:border-r-0 sm:border-y-transparent sm:border-l-[#2a1f14]/60 sm:border-t-transparent" />
                <span className="flow-packet absolute -left-[2px] top-0 size-[6px] rounded-full sm:-top-[2px] sm:left-0" style={{ background: color, animationDelay: `${i * 0.25}s` }} />
              </span>
            )}
            <motion.div
              className="hand-box min-w-0 flex-1 bg-[#fff6c9]/45 px-2 py-1.5 text-center"
              style={{ rotate: `${((i * 37) % 5) - 2}deg` }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.08 }}
            >
              <p className="font-hand text-[15px] font-bold leading-tight">{node.label}</p>
              {node.note && <p className="font-hand mt-0.5 text-[13px] leading-tight opacity-70">{node.note}</p>}
            </motion.div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
