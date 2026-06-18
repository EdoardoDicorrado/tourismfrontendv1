"use client";

import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Switch — accessible toggle (`role="switch"` + `aria-checked`). Controlled:
 * pass `checked` and `onChange(next)`. With `label`, the whole row is clickable.
 *
 * The knob uses a baseline CSS `transition` (transform/colors only → 60fps-safe).
 * Richer motion (spring) is `animations`' to layer on if wanted — keep it here as
 * a plain transition so the control is usable on its own.
 */
export function Switch({
  checked,
  onChange,
  disabled,
  id,
  label,
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: ReactNode;
  className?: string;
}) {
  const toggle = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-cta" : "bg-stroke",
        !label && className,
      )}
    >
      <span
        className={cx(
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
  if (!label) return toggle;
  return (
    <label htmlFor={id} className={cx("flex cursor-pointer items-center gap-3", className)}>
      {toggle}
      <span className="text-sm font-medium text-ink">{label}</span>
    </label>
  );
}
