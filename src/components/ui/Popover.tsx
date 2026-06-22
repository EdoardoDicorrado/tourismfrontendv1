"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useDragControls, useReducedMotion } from "framer-motion";

import { duration, ease, spring } from "@/lib/motion/tokens";
import { useFocusTrap } from "@/components/ui/useFocusTrap";
import { useIsDesktop } from "@/components/ui/useMediaQuery";

// Mount guard for portals: `false` on the server + first hydration render, `true`
// after mount — without setting state in an effect (avoids the extra render the
// `useState`+`useEffect` pattern caused, and the `react-hooks/set-state-in-effect` lint).
const noopSubscribe = () => () => {};

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
 * `responsive` (opt-in, desktop phase) = bottom-sheet below `lg` (1024px),
 * anchored dropdown at `lg`+ — the mobile shape stays byte-identical to `sheet`,
 * desktop swaps to the anchored branch (uses {@link useIsDesktop}). `align`/
 * `animated`/`panelClassName` apply on the desktop (anchored) side. A bare `sheet`
 * stays a sheet at every width; pass `responsive` instead when a picker should
 * anchor on desktop.
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
  responsive = false,
  label,
  labelledBy,
}: {
  trigger: (state: { open: boolean; toggle: () => void; id: string }) => React.ReactNode;
  children: (state: { close: () => void }) => React.ReactNode;
  align?: "stretch" | "start" | "end";
  className?: string;
  panelClassName?: string;
  animated?: boolean;
  sheet?: boolean;
  responsive?: boolean;
  /** Accessible name for the dialog/sheet panel (sets `aria-label`). */
  label?: string;
  /** ID of an element that labels the dialog/sheet panel (sets `aria-labelledby`). */
  labelledBy?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  // Desktop phase: `responsive` is a sheet below lg, anchored at lg+. SSR/first
  // paint = mobile (sheet), so it stays identical to a bare `sheet` until the
  // desktop swap. A bare `sheet` is a sheet at every width.
  const isDesktop = useIsDesktop();
  const asSheet = sheet || (responsive && !isDesktop);
  // Drag-to-dismiss del bottom sheet: il grabber in alto avvia il drag via questi
  // controls, così la chiusura a trascinamento è affidabile anche quando il corpo
  // dello sheet è pieno di controlli (steppers, calendario) che mangerebbero il gesto.
  const dragControls = useDragControls();
  const close = () => setOpen(false);

  // Portals need the DOM; only render the sheet after mount (avoids SSR mismatch).
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  // The sheet is a modal: scroll-lock + Escape + focus move-in/restore + Tab
  // trap all come from the shared hook (single source — see useFocusTrap).
  useFocusTrap(asSheet && open, panelRef, close);

  // Anchored dropdown only: close on outside-click + Escape. (The sheet closes
  // via its backdrop / Esc-from-the-hook; its panel lives in a portal outside
  // `ref`, so the pointer check would misfire.)
  useEffect(() => {
    if (!open || asSheet) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, asSheet]);

  if (asSheet) {
    return (
      <div ref={ref} className={className}>
        {trigger({ open, toggle: () => setOpen((o) => !o), id })}
        {mounted &&
          createPortal(
            <AnimatePresence>
              {open && (
                <motion.div
                  key="backdrop"
                  className="fixed inset-0 z-[var(--z-overlay)] bg-ink/40"
                  onClick={close}
                  aria-hidden
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: reduceMotion ? 0 : duration.fast, ease: ease.entrance }}
                />
              )}
              {open && (
                <motion.div
                  key="panel"
                  ref={panelRef}
                  id={id}
                  role="dialog"
                  aria-modal="true"
                  aria-label={label}
                  aria-labelledby={labelledBy}
                  tabIndex={-1}
                  // pt-2 reserves the grabber zone (top-2 + h-1.5 ⇒ 8–14px) so a
                  // consumer's own header padding (e.g. pt-3) no longer collides with it.
                  // ds-guard-ignore-next-line: max-w-[680px] = larghezza max sheet (già in baseline pre-pt-2)
                  className={`fixed inset-x-0 bottom-0 z-[var(--z-sheet)] mx-auto w-full max-w-[680px] rounded-t-sheet bg-white pt-2 shadow-sheet outline-none ${panelClassName}`}
                  initial={reduceMotion ? { opacity: 0 } : { y: "100%" }}
                  animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { y: "100%" }}
                  transition={reduceMotion ? { duration: 0 } : spring}
                  // Drag-to-dismiss: si trascina verso il BASSO per chiudere. Il drag si
                  // avvia dal grabber (dragControls, sotto) E dal corpo del pannello. Su =
                  // bloccato (dragElastic top 0); giù = rubber-band. Al rilascio, oltre
                  // soglia o flick veloce → close, altrimenti spring-back a y:0.
                  drag="y"
                  dragControls={dragControls}
                  dragConstraints={{ top: 0, bottom: 0 }}
                  dragElastic={{ top: 0, bottom: 0.5 }}
                  dragMomentum={false}
                  onDragEnd={(_event, info) => {
                    if (info.offset.y > 120 || info.velocity.y > 600) close();
                  }}
                >
                  {/* Grabber: affordance + handle del drag-to-dismiss. onPointerDown avvia
                      il drag (touchAction:none cattura il gesto verticale QUI, così trascinare
                      dal pomello chiude sempre, anche se il corpo è pieno di controlli).
                      aria-hidden: decorativo — la chiusura accessibile resta Esc/backdrop/×.
                      Colore/size = token soft-grey; spec visiva fine → design-system. */}
                  <div
                    aria-hidden
                    onPointerDown={(e) => dragControls.start(e)}
                    style={{ touchAction: "none" }}
                    className="absolute left-1/2 top-2 z-10 h-1.5 w-10 -translate-x-1/2 cursor-grab rounded-full bg-soft-grey active:cursor-grabbing"
                  />
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
  const panelClass = `absolute z-[var(--z-dropdown)] mt-2 ${pos} ${panelClassName}`;

  return (
    <div ref={ref} className={className}>
      {trigger({ open, toggle: () => setOpen((o) => !o), id })}
      {animated ? (
        <AnimatePresence>
          {open && (
            <motion.div
              id={id}
              role="dialog"
              aria-label={label}
              aria-labelledby={labelledBy}
              className={panelClass}
              style={{ transformOrigin: origin }}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: -6 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: -4 }}
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : // pop bouncy one-off: durata dal token, bounce 0.45 = carattere "pop"
                    { type: "spring", duration: duration.base, bounce: 0.45 }
              }
            >
              {children({ close: () => setOpen(false) })}
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        open && (
          <div
            id={id}
            role="dialog"
            aria-label={label}
            aria-labelledby={labelledBy}
            className={panelClass}
          >
            {children({ close: () => setOpen(false) })}
          </div>
        )
      )}
    </div>
  );
}
