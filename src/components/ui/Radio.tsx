import type { InputHTMLAttributes, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Radio — native radio input styled like {@link Checkbox} but round. Group them
 * by sharing the same `name`. With `label`, renders a clickable `<label>` row.
 * Server-safe; controlled via `checked`/`onChange` in a client component.
 */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  hint?: ReactNode;
  invalid?: boolean;
}

const dotClass =
  "size-5 shrink-0 border border-stroke accent-cta " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

export function Radio({ label, hint, invalid, className, id, ...props }: RadioProps) {
  const input = (
    <input
      id={id}
      type="radio"
      aria-invalid={invalid || undefined}
      className={cx(dotClass, invalid && "border-badge", !label && className)}
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
