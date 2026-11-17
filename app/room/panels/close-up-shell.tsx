"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Overlay for close-up views (jobs table, bookshelf, project case). It stays
 * see-through in the middle so the zoomed-in 3D object remains the backdrop.
 */
export function CloseUpShell({
  title,
  hint,
  onClose,
  children,
}: {
  title: string;
  hint?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const closeBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeBtn.current?.focus();
  }, []);
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-40 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, pointerEvents: "none" }}
      transition={{ duration: 0.25 }}
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,14,10,0.15)_0%,rgba(20,14,10,0.55)_70%,rgba(20,14,10,0.75)_100%)]"
        onClick={onClose}
      />
      <header className="relative flex items-start justify-between gap-4 px-5 pt-5 text-[#fbf5ec] sm:px-8 sm:pt-7">
        <div>
          <h2 className="font-display text-[30px] leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] sm:text-[38px]">{title}</h2>
          {hint && <p className="mt-1 text-[14px] text-[#fbf5ec]/75">{hint}</p>}
        </div>
        <button
          ref={closeBtn}
          onClick={onClose}
          aria-label="Close (Esc)"
          className="glass glass-btn size-10 shrink-0 justify-center"
        >
          <X size={17} />
        </button>
      </header>
      <div className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-4 sm:px-8">{children}</div>
    </motion.div>
  );
}
