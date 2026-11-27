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
 * arrows. The flow runs down the page when its column is narrow and across
 * when there is room, decided by the container rather than the viewport.
 */
export function BuildFlow({ built, color, also }: { built: NonNullable<Chapter["built"]>; color: string; also?: boolean }) {
  return (
    <div className="build-flow">
      <p className="font-marker text-[20px] leading-tight">{also ? "Also built" : "What I built"}</p>
      <p className="font-hand mt-0.5 text-[16px] opacity-80">{built.title}</p>
      <div className="build-flow-track mt-3">
        {built.flow.map((node, i) => (
          <Fragment key={node.label}>
            {i > 0 && (
              <span className="flow-link relative shrink-0" aria-hidden>
                <span className="flow-link-line absolute inset-0 rounded-full bg-[#2a1f14]/60" />
                <span className="flow-link-head absolute" />
                <span className="flow-packet absolute rounded-full" style={{ background: color, animationDelay: `${i * 0.25}s` }} />
              </span>
            )}
            <motion.div
              className="hand-box build-node min-w-0 bg-[#fff6c9]/45 px-2.5 py-1.5 text-center"
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
