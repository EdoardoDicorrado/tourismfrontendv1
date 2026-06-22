import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * SearchPill — the rounded-full white search field container (home hero, listing,
 * search overlay, /cerca). ONE chrome (height 44px, border, radius, padding,
 * elevation) so the bar doesn't drift per page (it was reimplemented 4 ways with
 * shadow-lg/sm + different sizing). Compose the inner content (input/label/button)
 * as children; pass the leading icon via `leadingIcon`. Polymorphic via `as`
 * (button/label/div/form). Elevation from the token `shadow-card`, not shadow-lg/sm.
 */
export interface SearchPillProps extends ComponentPropsWithoutRef<"div"> {
  as?: ElementType;
  leadingIcon?: ReactNode;
}

export function SearchPill({ as: Tag = "div", leadingIcon, className, children, ...props }: SearchPillProps) {
  return (
    <Tag
      className={cx(
        "flex h-11 w-full items-center gap-2.5 rounded-full border border-stroke bg-white px-4 text-left shadow-card",
        className,
      )}
      {...props}
    >
      {leadingIcon ? <span className="shrink-0 text-ink/60">{leadingIcon}</span> : null}
      {children}
    </Tag>
  );
}
