import type { InputHTMLAttributes, ReactNode } from "react";

import { cx, focusRing } from "@/components/ui/buttonVariants";

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
  focusRing +
  " disabled:cursor-not-allowed disabled:opacity-50";

export function Radio({ label, hint, invalid, className, id, ...props }: RadioProps) {
  const input = (
    <input
      id={id}
      type="radio"
      // `invalid` paints a ring around the native control; programmatic validity
      // belongs on the group (role="radiogroup" aria-invalid), not on each radio
      // (aria-invalid is not supported on role="radio").
      className={cx(dotClass, invalid && "ring-2 ring-badge ring-offset-1", !label && className)}
      {...props}
    />
  );
  if (!label) return input;
  return (
    <label
      htmlFor={id}
      className={cx(
        "flex min-h-11 cursor-pointer items-center gap-2 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
        className,
      )}
    >
      {input}
      <span className="text-sm text-ink">
        <span className="font-medium">{label}</span>
        {hint ? <span className="block text-xs text-ink/60">{hint}</span> : null}
      </span>
    </label>
  );
}
