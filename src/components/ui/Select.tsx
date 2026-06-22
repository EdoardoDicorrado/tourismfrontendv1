import type { SelectHTMLAttributes } from "react";

import { cx } from "@/components/ui/buttonVariants";
import { inputClass } from "@/components/ui/Input";
import { CaretDown } from "@/components/ui/icons";

/**
 * Select — native `<select>` styled to match {@link Input} (same border, focus,
 * disabled states) with a custom chevron. Native = accessible + mobile-friendly
 * picker. Server-safe; controlled via `value`/`onChange` in a client component.
 */
export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  /** Extra classes on the inner `<select>` control (visual/control utilities). */
  selectClassName?: string;
}

export function Select({ invalid, className, selectClassName, children, ...props }: SelectProps) {
  return (
    <div className={cx("relative", className)}>
      <select
        aria-invalid={invalid || undefined}
        className={cx(
          inputClass,
          "appearance-none pr-10",
          invalid ? "border-badge" : "border-stroke",
          selectClassName,
        )}
        {...props}
      >
        {children}
      </select>
      <CaretDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink/60" />
    </div>
  );
}
