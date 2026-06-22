/**
 * Motion tokens — the JS/framer-motion mirror of the CSS custom properties in
 * `globals.css` (`--duration-*`, `--ease-*`). ONE source of truth, shared with
 * `design-system`: keep these two files in sync.
 *
 * Unit note: framer-motion uses SECONDS; the CSS side uses ms. So `base = 0.3`
 * here mirrors `--duration-base: 300ms` there.
 *
 * Use these instead of magic numbers in any framer transition:
 *   transition={{ duration: duration.base, ease: ease.entrance }}
 */

/** Durations in SECONDS (framer-motion unit). Mirror of `--duration-*`. */
export const duration = {
  fast: 0.15, // hover/tap, color feedback     (--duration-fast 150ms)
  base: 0.3, //  fade/reveal, page transition  (--duration-base 300ms)
  slow: 0.6, //  backdrop, emphasis            (--duration-slow 600ms)
  morph: 1.2, // shared-element search morph    (--duration-morph 1200ms)
} as const;

/**
 * Cubic-bezier control points — mirror of `--ease-entrance` / `--ease-emphasized`.
 * Typed as a 4-tuple so they drop straight into framer's `ease`.
 */
export const ease = {
  entrance: [0, 0, 0.2, 1] as [number, number, number, number], // decelerate — entrate/reveal
  standard: [0.4, 0, 0.2, 1] as [number, number, number, number], // accel-decel — bidirezionale (accordion open/close); curva già usata da Faq/FooterSection
  emphasized: [0.65, 0, 0.35, 1] as [number, number, number, number], // in-out marcato
} as const;

/**
 * Snappy slide / sheet spring — near-critically damped (minimal overshoot). The
 * recurring "slide" feel shared by the Popover bottom-sheet and the ProductGallery
 * swipe. JS-only (not expressible as a CSS curve, so it has no globals.css twin).
 */
export const spring = { type: "spring", stiffness: 320, damping: 34 } as const;

/** Stagger step (seconds) for orchestrating list/grid entrances. */
export const stagger = {
  children: 0.07, // 0.06–0.08 range per liste/griglie
} as const;
