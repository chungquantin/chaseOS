"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/** Modal shell shared by every in-room panel. */
export function PanelShell({
  title,
  eyebrow,
  onClose,
  children,
  tone = "paper",
  wide = false,
}: {
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  tone?: "paper" | "terminal";
  wide?: boolean;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtn.current?.focus();
  }, []);

  const dark = tone === "terminal";
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-end justify-center p-3 sm:items-center sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      // drop pointer events immediately so a closing backdrop can't eat clicks
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-[#0f0e0c]/45 backdrop-blur-[2px]" onClick={onClose} />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "relative flex max-h-[88vh] w-full flex-col overflow-hidden rounded-[18px]",
          wide ? "max-w-[960px]" : "max-w-[680px]",
          dark
            ? "bg-[#0b0f14] text-[#e6edf3] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]"
            : "bg-[#fbf8f1] text-[#1b1a17] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55),0_0_0_1px_rgba(0,0,0,0.06)]",
        ].join(" ")}
        initial={{ y: 24, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 16, scale: 0.98, transition: { duration: 0.16 } }}
        transition={{ type: "spring", stiffness: 420, damping: 34 }}
      >
        <header
          className={[
            "flex items-start justify-between gap-4 border-b px-6 py-4",
            dark ? "border-white/10" : "border-black/10",
          ].join(" ")}
        >
          <div>
            {eyebrow && (
              <p className={["text-[12.5px]", dark ? "text-[#7d889b]" : "text-[#8a8579]"].join(" ")}>
                {eyebrow}
              </p>
            )}
            <h2 className="font-display mt-0.5 text-[26px] leading-tight">{title}</h2>
          </div>
          <button
            ref={closeBtn}
            onClick={onClose}
            aria-label="Close (Esc)"
            className={[
              "grid size-8 shrink-0 place-items-center rounded-full transition-colors",
              dark ? "hover:bg-white/10" : "hover:bg-black/5",
            ].join(" ")}
          >
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </motion.div>
    </motion.div>
  );
}
