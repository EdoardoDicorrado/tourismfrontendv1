import type { ComponentPropsWithoutRef, ElementType } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Card — the storefront surface primitive. Replaces the
 * `rounded-panel border border-soft-grey bg-white` (white panel) and
 * `rounded-card bg-soft` (tinted) blocks that were inlined across auth, account,
 * product and listing pages.
 *
 * - `variant="white"` (default): bordered white panel — auth/account/forms.
 * - `variant="soft"`: tinted `bg-soft` card — info blocks, list items.
 *
 * Server-safe (no hooks). Polymorphic via `as` for correct semantics, e.g.
 * `<Card as="article">`, `<Card as="fieldset">`, `<Card as="section">`.
 * Radius/border/bg come from tokens — never inline arbitrary radii again.
 */
type CardVariant = "white" | "soft";
type CardPadding = "none" | "sm" | "md" | "lg";

const VARIANT: Record<CardVariant, string> = {
  white: "rounded-panel border border-soft-grey bg-white",
  soft: "rounded-card bg-soft",
};

const PADDING: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export interface CardProps extends ComponentPropsWithoutRef<"div"> {
  /** Element to render (default `div`). Use for semantics: article/section/fieldset. */
  as?: ElementType;
  variant?: CardVariant;
  padding?: CardPadding;
}

export function Card({ as: Tag = "div", variant = "white", padding = "md", className, ...props }: CardProps) {
  return <Tag className={cx(VARIANT[variant], PADDING[padding], className)} {...props} />;
}
