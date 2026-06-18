import type { ElementType, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Typography primitives — one place for the heading scale so section titles stop
 * being written with scattered `text-xl font-extrabold text-ink` strings.
 *
 * - `Eyebrow`  — small teal label above a title (e.g. "OFFERTE").
 * - `SectionTitle` — the recurring section heading (Raleway ExtraBold, ink).
 * - `Heading`  — generic heading with an explicit visual `size`, decoupled from
 *   the semantic tag (`as`) so you keep correct document outline + the right look.
 *
 * Pure presentational, server-safe. Colors/weights come from tokens only.
 */

type HeadingSize = "xl" | "2xl" | "3xl";

const HEADING_SIZE: Record<HeadingSize, string> = {
  xl: "text-xl", // 20px — section titles (Figma default)
  "2xl": "text-2xl", // 24px
  "3xl": "text-3xl sm:text-4xl", // hero-ish
};

export function Heading({
  children,
  as,
  size = "xl",
  className,
}: {
  children: ReactNode;
  /** Semantic tag — default `h2`. Keep it correct for the page outline. */
  as?: ElementType;
  size?: HeadingSize;
  className?: string;
}) {
  const Tag = as ?? "h2";
  return (
    <Tag className={cx(HEADING_SIZE[size], "font-extrabold text-ink", className)}>
      {children}
    </Tag>
  );
}

/** The standard section heading used across home/listing/product sections. */
export function SectionTitle({
  children,
  as = "h2",
  className,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
}) {
  return (
    <Heading as={as} size="xl" className={className}>
      {children}
    </Heading>
  );
}

/** Small teal uppercase label that sits above a SectionTitle. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cx("text-xs font-semibold uppercase tracking-wide text-cta", className)}>
      {children}
    </span>
  );
}
