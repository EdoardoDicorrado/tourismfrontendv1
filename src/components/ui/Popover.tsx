"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * Anchored dropdown popover. Closes on outside-click and Escape.
 *
 * Render-prop API:
 *  - `trigger({ open, toggle, id })` renders the anchor (give it `aria-expanded`).
 *  - `children({ close })` renders the panel content.
 *
 * `animated` (opt-in) gives the panel a "pop" entrance/exit (scale + fade from the
 * trigger corner). Off by default so the other popovers keep their instant toggle.
 *
 * `sheet` (opt-in) switches the presentation to a **bottom sheet**: the panel
 * slides up from the bottom of the screen over a dimmed backdrop (rendered in a
 * portal so it's never clipped by an ancestor). Use for mobile pickers
 * (calendar, participants). `align`/`panelClassName` are ignored in sheet mode.
 *
 * All motion honours `prefers-reduced-motion` (plain opacity fade, no slide/scale).
 */
export function Popover({
  trigger,
  children,
  align = "stretch",
  className = "relative",
  panelClassName = "",
  animated = false,
  sheet = false,
}: {
  trigger: (state: { open: boolean; toggle: () => void; id: string }) => React.ReactNode;
  children: (state: { close: () => void }) => React.ReactNode;
  align?: "stretch" | "start" | "end";
  className?: string;
  panelClassName?: string;
  animated?: boolean;
  sheet?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const close = () => setOpen(false);

  // Portals need the DOM; only render the sheet after mount (avoids SSR mismatch).
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    // Sheet closes via its backdrop, not document-wide outside-click (the panel
    // lives in a portal, outside `ref`, so the pointer check would misfire).
    if (!sheet) document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, sheet]);

  // Lock background scroll while the sheet is open.
  useEffect(() => {
    if (!sheet || !open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet, open]);

  if (sheet) {
    return (
      <div ref={ref} className={className}>
        {trigger({ open, toggle: () => setOpen((o) => !o), id })}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-50 bg-black/40"
                  onClick={close}
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0.12 : 0.22, ease: "easeOut" }}
                />
              )}
              {open && (
                <motion.div
                  key="panel"
                  id={id}
                  role="dialog"
                  aria-modal="true"
                  className={`fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[680px] ${panelClassName}`}
                  initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
                  animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
                  transition={
                    reduceMotion
                      ? { duration: 0.12 }
                      : { type: "spring", stiffness: 320, damping: 34 }
                  }
                  // Drag-to-dismiss: si trascina il pannello verso il BASSO per chiudere
                  // (il grabber in alto lo segnala). Su = bloccato (dragElastic top 0);
                  // giù = rubber-band. Al rilascio, oltre soglia o flick veloce → close,
                  // altrimenti spring-back a y:0 (constraints top/bottom = 0).
                  drag="y"
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  dragMomentum={false}
                  onDragEnd={(_event, info) => {
                    if (info.offset.y > 120 || info.velocity.y > 600) close();
                  }}
                >
                  {children({ close })}
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </div>
    );
  }

  const pos = align === "stretch" ? "left-0 right-0" : align === "end" ? "right-0" : "left-0";
  // Pop scales out from the corner nearest the trigger.
  const origin = align === "end" ? "top right" : align === "start" ? "top left" : "top center";
  const panelClass = `absolute z-40 mt-2 ${pos} ${panelClassName}`;

  return (
    <div ref={ref} className={className}>
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {animated ? (
        <AnimatePresence>
          {open && (
            <motion.div
              id={id}
              role="dialog"
              className={panelClass}
              style={{ transformOrigin: origin }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }}
              transition={
                reduceMotion
                  ? { duration: 0.12 }
                  : { type: "spring", duration: 0.3, bounce: 0.45 }
              }
            >
              {children({ close: () => setOpen(false) })}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        open && (
          <div id={id} role="dialog" className={panelClass}>
            {children({ close: () => setOpen(false) })}
          </div>
        )
      )}
    </div>
  );
}
