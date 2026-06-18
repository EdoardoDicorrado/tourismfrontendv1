import type { SelectHTMLAttributes } from "react";

import { cx } from "@/components/ui/buttonVariants";
import { inputClass } from "@/components/ui/Input";

/**
 * Select — native `<select>` styled to match {@link Input} (same border, focus,
 * disabled states) with a custom chevron. Native = accessible + mobile-friendly
 * picker. Server-safe; controlled via `value`/`onChange` in a client component.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({ invalid, className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        aria-invalid={invalid || undefined}
        className={cx(inputClass, "appearance-none pr-10", invalid && "border-badge", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/60"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}
