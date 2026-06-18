import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Disclosure — collapsible section built on native `<details>/<summary>` (the
 * Footer accordion / product "Cosa è incluso" pattern). Native = accessible and
 * works without JS; the chevron rotates with a baseline CSS transition.
 *
 * The smooth height animation on open/close is `animations`' to add (native
 * details snaps open). Structure/markup live here.
 */
export function Disclosure({
  summary,
  children,
  defaultOpen = false,
  className,
}: {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  return (
    <details open={defaultOpen} className={cx("group border-b border-stroke/30", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 py-3 font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {summary}
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="size-5 shrink-0 text-ink/60 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <div className="pb-3 text-sm text-ink/80">{children}</div>
    </details>
  );
}
