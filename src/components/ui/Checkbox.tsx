import type { InputHTMLAttributes, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Checkbox — native input (accessible, form-native) styled with the CTA accent.
 * With `label`, renders a clickable `<label>` row (+ optional `hint`), matching
 * the advanced-filters checkbox look. Server-safe; pass `checked`/`onChange` for
 * a controlled checkbox inside a client component.
 */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
}

const boxClass =
  "size-5 shrink-0 rounded-badge border border-stroke accent-cta " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Checkbox({ label, hint, invalid, className, id, ...props }: CheckboxProps) {
  const input = (
    <input
      id={id}
      type="checkbox"
      aria-invalid={invalid || undefined}
      className={cx(boxClass, invalid && "border-badge", !label && className)}
      {...props}
    />
  );
  if (!label) return input;
  return (
    <label htmlFor={id} className={cx("flex cursor-pointer items-start gap-2", className)}>
      {input}
      <span className="text-sm text-ink">
        <span className="font-medium">{label}</span>
        {hint ? <span className="block text-xs text-ink/60">{hint}</span> : null}
      </span>
    </label>
  );
}
