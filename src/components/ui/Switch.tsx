"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cx, focusRing } from "@/components/ui/buttonVariants";

/**
 * Switch — accessible toggle (`role="switch"` + `aria-checked`). Controlled:
 * pass `checked` and `onChange(next)`. With `label`, the whole row is clickable.
 *
 * The knob uses a baseline CSS `transition` (transform/colors only → 60fps-safe).
 * Richer motion (spring) is `animations`' to layer on if wanted — keep it here as
 * a plain transition so the control is usable on its own.
 */
type SwitchProps = {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  id?: string;
  label?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "onChange" | "children">;

export function Switch({
  checked,
  onChange,
  disabled,
  id,
  label,
  className,
  ...rest
}: SwitchProps) {
  const toggle = (
    <button
      {...rest}
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cx(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
        focusRing,
        "disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-cta" : "bg-stroke",
        !label && className,
      )}
    >
      <span
        className={cx(
          "inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
          checked ? "translate-x-5.5" : "translate-x-0.5",
        )}
      />
    </button>
  );
  if (!label) return toggle;
  return (
    <label
      htmlFor={id}
      className={cx(
        "flex min-h-11 items-center gap-3",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className,
      )}
    >
      {toggle}
      <span className="text-sm font-medium text-ink">{label}</span>
    </label>
  );
}
