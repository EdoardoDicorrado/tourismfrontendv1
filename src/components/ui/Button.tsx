"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";

import {
  buttonVariants,
  cx,
  type ButtonSize,
  type ButtonVariant,
} from "@/components/ui/buttonVariants";

// Re-export the pure styling helper + types so existing client imports
// (`import { buttonVariants } from "@/components/ui/Button"`) keep working.
// Server Components MUST import these straight from "@/components/ui/buttonVariants"
// instead — re-exporting through this "use client" module would turn them into
// client references and break server-side rendering.
export { buttonVariants, cx };
export type { ButtonSize, ButtonVariant };

/** Spring used for the press scale — snappy, matches the slider arrow. */
const pressTransition = { type: "spring" as const, stiffness: 600, damping: 22 };

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
};

/**
 * Interactive button with press feedback. On tap/click it briefly shrinks
 * (`whileTap` scale 0.96) and darkens (via the `active:` color above) — the two
 * combine into a clear "pressed" state. Honours `prefers-reduced-motion`: the
 * scale is dropped (only the color change remains), consistent with the rest of
 * the site.
 */
export function Button({
  variant,
  size,
  pill,
  fullWidth,
  className,
  ...props
}: SharedProps & ComponentProps<typeof motion.button>) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={pressTransition}
      className={cx(buttonVariants({ variant, size, pill, fullWidth }), className)}
      {...props}
    />
  );
}

const MotionLink = motion.create(Link);

/**
 * Same look and press feedback as {@link Button}, for navigations rendered as
 * a styled link (`next/link`). Use this instead of `<Link className="bg-cta…">`
 * so CTAs that navigate share the exact hover/active/press behaviour.
 */
export function ButtonLink({
  variant,
  size,
  pill,
  fullWidth,
  className,
  ...props
}: SharedProps & ComponentProps<typeof MotionLink>) {
  const reduce = useReducedMotion();
  return (
    <MotionLink
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={pressTransition}
      className={cx(buttonVariants({ variant, size, pill, fullWidth }), className)}
      {...props}
    />
  );
}
