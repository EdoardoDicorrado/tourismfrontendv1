"use client";

import { useId, useState, type ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Tooltip — small contextual hint shown on hover AND focus (keyboard-accessible),
 * linked to the trigger via `aria-describedby`. Content must be short text. For a
 * rich/interactive popover use `Popover` instead.
 *
 * The show/hide is an instant toggle (structure only); a fade/scale is
 * `animations`' to layer on if wanted.
 */
export function Tooltip({
  content,
  children,
  className,
}: {
  content: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? id : undefined}>{children}</span>
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cx(
            "absolute bottom-full left-1/2 z-[var(--z-toast)] mb-2 -translate-x-1/2",
            "whitespace-nowrap rounded-card bg-ink px-2 py-1 text-xs font-medium text-white shadow-popover",
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
