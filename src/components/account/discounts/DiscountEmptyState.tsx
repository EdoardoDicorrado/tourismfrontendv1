import type { ReactNode } from "react";

/**
 * Empty-state for the discount-code views (list/usage/products). Reuses the
 * dashed-border, soft-tinted box from the design system (`ResultsGrid` empty
 * state). The message is passed in already localized.
 */
export function DiscountEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[10px] border border-dashed border-stroke bg-soft/40 py-14 text-center">
      <p className="max-w-md text-sm text-ink/70">{children}</p>
    </div>
  );
}
