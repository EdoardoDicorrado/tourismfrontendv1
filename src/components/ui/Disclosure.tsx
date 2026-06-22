"use client";

import { useId, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { cx, focusRing } from "@/components/ui/buttonVariants";
import { CaretDown } from "@/components/ui/icons";
import { duration, ease } from "@/lib/motion/tokens";

/**
 * Disclosure — collapsible section (Footer accordion / product "Cose da sapere"
 * / "Accessibilità" pattern). Trigger + chevron and a separator line; the panel
 * opens/closes with the project's canonical accordion motion — framer-motion
 * `height 0↔auto` + opacity, same feel as {@link Faq}/`FooterSection` — driven by
 * the shared motion tokens. Honours `prefers-reduced-motion` (plain fade, no
 * height change), reinforced app-wide by `<MotionProvider reducedMotion="user">`.
 *
 * Was native `<details>` (snap open); `animations` swapped in the smooth motion
 * the markup invited, keeping the SAME public API and visuals. Now a Client
 * Component (state-driven). Accessible: `<button aria-expanded aria-controls>`.
 *
 * Separator: 1px solid `soft-grey` — matches the Figma accordions
 * (FAQ 64:9708 / product 64:10390). Set `divided={false}` when the parent draws
 * the dividers itself (e.g. a `divide-y divide-soft-grey` wrapper) so the lines
 * don't double up.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  divided = true,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  divided?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const panelId = useId();

  return (
    <div className={cx(divided && "border-b border-soft-grey", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cx(
          "flex w-full cursor-pointer items-center justify-between gap-2 rounded-card py-4 text-left font-semibold text-ink",
          focusRing,
        )}
      >
        {summary}
        {/* Caret glyph condiviso (ui/icons). Rotazione 180° on-open + timing
            (duration.base, reset reduced-motion via globals.css) = dominio animations. */}
        <CaretDown
          open={open}
          className="size-5 shrink-0 text-ink/60 transition-transform duration-[var(--duration-base)]"
        />
      </button>

      {/* `overflow-hidden` clips the content while height animates; the inner
          padding lives on a child so it isn't collapsed by the height tween. */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="content"
            className="overflow-hidden"
            initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: duration.base, ease: ease.standard }}
          >
            <div className="pb-4 text-sm text-ink/80">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
