"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ComponentProps } from "react";

/** Tiny class joiner (no clsx in the project). Falsy entries are dropped. */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Centralized button styling — the single source of truth for the storefront's
 * interactive states. Returns a className usable on ANY element (`<button>`,
 * `<Link>`, `<a>`) so the hover/active treatment stays consistent everywhere.
 *
 * Interactive states (per the design-system convention):
 *  - **hover** → the fill lightens (CTA teal mixed toward white).
 *  - **active/press** → the fill darkens (mixed toward black).
 * Colors are derived from the existing `--color-cta` token via `color-mix`, so
 * no new globals.css tokens are introduced (ui-ux-1 owns the token file). The
 * tactile *scale* on press lives in {@link Button}/{@link ButtonLink} below.
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
} = {}) {
  const base =
    "inline-flex items-center justify-center text-center font-extrabold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50";

  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-7 py-3.5 text-base",
  };

  // Hover = lighter, active = darker — both derived from the CTA token.
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-cta text-white " +
      "hover:bg-[color-mix(in_oklab,var(--color-cta),white_15%)] " +
      "active:bg-[color-mix(in_oklab,var(--color-cta),black_12%)]",
    outline:
      "border border-cta text-cta " +
      "hover:bg-[color-mix(in_oklab,var(--color-cta),white_15%)] hover:text-white " +
      "active:bg-[color-mix(in_oklab,var(--color-cta),black_12%)] active:text-white",
    ghost:
      "text-cta " +
      "hover:bg-soft " +
      "active:bg-[color-mix(in_oklab,var(--color-soft),black_8%)]",
  };

  return cx(
    base,
    sizes[size],
    variants[variant],
    pill ? "rounded-full" : "rounded-[10px]",
    fullWidth && "w-full",
  );
}

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
