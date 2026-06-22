import "flag-icons/css/flag-icons.min.css";

import { cx } from "@/components/ui/buttonVariants";
import { flagCountry } from "@/components/ui/lang-flags";

/**
 * Flag — circular flag for a spoken language (ISO 639-1 code, e.g. `"it"`, `"en"`).
 * Built on `flag-icons` (the square 1×1 set) clipped to a circle. Pure CSS →
 * **server-safe** (no `"use client"`, no JS, no `next/image`).
 *
 * Language→country mapping lives in `lang-flags.ts`. A code without a mapping
 * falls back to an uppercased-code chip, so whatever the CRM sends still renders.
 *
 * Use {@link FlagStack} for the "first N flags + `+N`" row used on the cards and
 * the product header.
 */
export function Flag({
  code,
  size = 18,
  title,
  decorative = false,
  className,
}: {
  code: string;
  /** Diameter in px (default 18, matching the cards / product header). */
  size?: number;
  /** Accessible/hover label; defaults to the uppercased code. */
  title?: string;
  /** Hide from the a11y tree — e.g. inside a `FlagStack` that carries the label. */
  decorative?: boolean;
  className?: string;
}) {
  const country = flagCountry(code);
  const label = title ?? code.toUpperCase();
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : ({ role: "img", "aria-label": label } as const);

  // No flag asset for this language → graceful fallback chip, sized like a flag.
  if (!country) {
    return (
      <span
        {...a11y}
        title={label}
        style={{ width: size, height: size }}
        className={cx(
          "inline-flex shrink-0 items-center justify-center rounded-full bg-soft text-2xs font-semibold leading-none text-ink ring-1 ring-black/10",
          className,
        )}
      >
        {code.toUpperCase()}
      </span>
    );
  }

  return (
    <span
      {...a11y}
      title={label}
      style={{ width: size, height: size }}
      className={cx(`fi fis fi-${country} shrink-0 rounded-full ring-1 ring-black/10`, className)}
    />
  );
}

/**
 * FlagStack — a row of language flags: the first `max` as circular flags, the rest
 * collapsed into a `+N` bubble. Carries one combined `aria-label` (the individual
 * flags are decorative). Renders nothing when `codes` is empty (so the row only
 * shows when the CRM provides languages).
 */
export function FlagStack({
  codes,
  max = 3,
  size = 18,
  className,
}: {
  codes: string[];
  /** Max flags shown before collapsing into `+N` (default 3). */
  max?: number;
  /** Flag diameter in px (default 18). */
  size?: number;
  className?: string;
}) {
  if (!codes?.length) return null;

  const visible = codes.slice(0, max);
  const extra = codes.length - visible.length;

  return (
    <div
      role="img"
      aria-label={codes.map((c) => c.toUpperCase()).join(", ")}
      className={cx("flex shrink-0 items-center gap-2", className)}
    >
      {visible.map((code) => (
        <Flag key={code} code={code} size={size} decorative />
      ))}
      {extra > 0 && (
        <span
          aria-hidden
          title={codes.slice(max).join(", ").toUpperCase()}
          style={{ height: size, minWidth: size }}
          className="flex items-center justify-center rounded-full bg-soft px-1 text-2xs font-extrabold leading-none text-ink ring-1 ring-black/10"
        >
          +{extra}
        </span>
      )}
    </div>
  );
}
