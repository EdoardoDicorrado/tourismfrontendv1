import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Divider — a hairline separator. Horizontal by default; `orientation="vertical"`
 * for an inline rule; pass `label` for a centered "— or —" style divider.
 */
export function Divider({
  orientation = "horizontal",
  label,
  className,
}: {
  orientation?: "horizontal" | "vertical";
  label?: ReactNode;
  className?: string;
}) {
  // `label` forces a horizontal divider; `orientation` is ignored when a label is set.
  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={cx("flex items-center gap-3 text-xs font-medium text-ink/60", className)}
      >
        <span className="h-px flex-1 bg-stroke/40" />
        {label}
        <span className="h-px flex-1 bg-stroke/40" />
      </div>
    );
  }
  if (orientation === "vertical") {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={cx("inline-block w-px self-stretch bg-stroke/40", className)}
      />
    );
  }
  return <hr className={cx("border-0 border-t border-stroke/40", className)} />;
}
