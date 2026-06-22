"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

import { duration, ease } from "@/lib/motion/tokens";

/**
 * MotionProvider — the single, app-wide motion policy. Mount it once near the
 * root (in `[lang]/layout.tsx`, above the other providers).
 *
 * - `reducedMotion="user"` makes framer-motion honor the OS `prefers-reduced-motion`
 *   for EVERY animation underneath it (search morph, cart drawer, toasts, …):
 *   transform/layout animations are skipped, opacity is kept. This is the
 *   centralized WCAG 2.3.3 strategy — no need to re-check `useReducedMotion()` in
 *   every component (though it's still fine to, e.g. for custom fallbacks).
 * - `transition` sets the project default so any `motion.*` without an explicit
 *   transition decelerates with our token timing instead of framer's default.
 *
 * The CSS-side `@media (prefers-reduced-motion)` fallback in `globals.css` covers
 * non-framer animations (CSS keyframes like the skeleton shimmer).
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: duration.base, ease: ease.entrance }}>
      {children}
    </MotionConfig>
  );
}
