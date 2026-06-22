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
  type = "button",
  ...props
}: SharedProps & ComponentProps<typeof motion.button>) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type={type}
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
  disabled,
  ...props
}: SharedProps & { disabled?: boolean } & ComponentProps<typeof MotionLink>) {
  const reduce = useReducedMotion();
  return (
    <MotionLink
      whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
      transition={pressTransition}
      className={cx(
        buttonVariants({ variant, size, pill, fullWidth }),
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : props.tabIndex}
    />
  );
}
