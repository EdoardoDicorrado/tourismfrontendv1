"use client";

import { useId, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Chevron that flips when its section is open. White on the teal footer. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-300 lg:hidden ${open ? "rotate-180" : ""}`}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Collapsible footer section: ExtraBold 20px title + chevron over a white divider.
 * Client disclosure (button + aria-expanded/controls) so the open/close can animate
 * fluidly via framer-motion — native <details> hides its content on close, which
 * can't be animated reliably across browsers. Open by default (was <details open>).
 * Honours `prefers-reduced-motion` (falls back to a plain opacity fade, no height).
 *
 * Desktop (lg+): NOT collapsible — the chevron hides and the toggle is inert, so
 * every column stays expanded as a static footer column (Figma desktop 221:3229).
 * ponytail: stays-open relies on `defaultOpen`; a section a mobile user collapsed
 * before resizing up to lg keeps that state — acceptable edge, not worth forcing.
 */
export function FooterSection({
  title,
  defaultOpen = true,
  className = "",
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const id = useId();

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full cursor-pointer items-center justify-between border-b border-white pb-2 text-left lg:cursor-default lg:pointer-events-none"
      >
        <span className="text-xl font-extrabold">{title}</span>
        <Chevron open={open} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={id}
            key="content"
            className="overflow-hidden"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
