"use client";

import { useId, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { duration, ease, spring } from "@/lib/motion/tokens";
import { useFocusTrap } from "@/components/ui/useFocusTrap";

// Portal mount guard: false on server + first hydration, true after mount —
// without set-state-in-effect (same pattern as Popover).
const noopSubscribe = () => () => {};

/**
 * Modal / Drawer — the shared shell for full-screen dialogs. Owns the backdrop,
 * scroll-lock, Escape, focus move-in/restore AND the Tab focus-trap (via
 * {@link useFocusTrap}), rendered in a portal so it's never clipped.
 *
 * Use this instead of hand-rolling `role="dialog"` + scroll-lock + Esc in each
 * overlay — the bespoke ones (CartDrawer/LoginModal/ProductGallery/UserMenu/
 * SearchOverlay) declare `aria-modal` but DON'T trap Tab; this gives the trap for
 * free. For the bottom-sheet picker variant use `Popover sheet` instead.
 *
 *  - `variant="center"` — centered dialog (login, confirm). scale+fade.
 *  - `variant="drawer"` — right-edge drawer (cart, account menu). slide-x.
 *
 * Pass an accessible name via `label` or `labelledBy`. All motion honours
 * `prefers-reduced-motion` (plain fade).
 */
export function Modal({
  open,
  onClose,
  children,
  variant = "center",
  label,
  labelledBy,
  className = "",
  backdropClassName = "",
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  variant?: "center" | "drawer";
  label?: string;
  labelledBy?: string;
  /** Extra classes on the panel. */
  className?: string;
  /** Extra classes on the backdrop. */
  backdropClassName?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const reduceMotion = useReducedMotion();
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useFocusTrap(open, ref, onClose);

  if (!mounted) return null;

  const drawer = variant === "drawer";
  const panelPos = drawer
    ? "right-0 top-0 h-full w-full max-w-sm rounded-l-sheet"
    : "left-1/2 top-1/2 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-sheet";

  // Enter/exit per variant; reduced-motion collapses to opacity only.
  const motionProps = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      }
    : drawer
      ? {
          initial: { x: "100%" },
          animate: { x: 0 },
          exit: { x: "100%" },
          transition: spring,
        }
      : {
          initial: { opacity: 0, scale: 0.92 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.96 },
          transition: { type: "spring" as const, duration: duration.base, bounce: 0.35 },
        };

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="backdrop"
          className={`fixed inset-0 z-[var(--z-overlay)] bg-ink/40 ${backdropClassName}`}
          onClick={onClose}
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
          ref={ref}
          id={id}
          role="dialog"
          aria-modal="true"
          aria-label={label}
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={`fixed z-[var(--z-modal)] bg-white shadow-sheet outline-none ${panelPos} ${className}`}
          {...motionProps}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
