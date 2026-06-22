"use client";

import {
  Children,
  cloneElement,
  useId,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Tooltip — small contextual hint shown on hover AND focus (keyboard-accessible),
 * linked to the trigger via `aria-describedby`. On touch (mobile phase) a tap
 * opens it; `Escape` dismisses it without moving focus (WCAG 1.4.13).
 * `children` MUST be a single focusable element (e.g. a button/link): the
 * `aria-describedby` link and the open/close handlers are cloned directly onto
 * it. Content must be short text. For a rich/interactive popover use `Popover`.
 *
 * The show/hide is an instant toggle (structure only); a fade/scale is
 * `animations`' to layer on if wanted.
 */
function chain<E>(theirs: ((e: E) => void) | undefined, ours: (e: E) => void) {
  return (e: E) => {
    theirs?.(e);
    ours(e);
  };
}

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

  const child = Children.only(children) as ReactElement<HTMLAttributes<HTMLElement>>;
  // Hover + keyboard focus + tap all open it; blur / mouse-leave / Escape close it.
  const trigger = cloneElement(child, {
    "aria-describedby": open ? id : child.props["aria-describedby"],
    onMouseEnter: chain(child.props.onMouseEnter, () => setOpen(true)),
    onMouseLeave: chain(child.props.onMouseLeave, () => setOpen(false)),
    onFocus: chain(child.props.onFocus, () => setOpen(true)),
    onBlur: chain(child.props.onBlur, () => setOpen(false)),
    onClick: chain(child.props.onClick, () => setOpen(true)),
    onKeyDown: chain(child.props.onKeyDown, (e) => {
      if (e.key === "Escape") setOpen(false);
    }),
  });

  return (
    <span className="relative inline-flex">
      {trigger}
      {open ? (
        <span
          role="tooltip"
          id={id}
          className={cx(
            "absolute bottom-full left-1/2 z-[var(--z-toast)] mb-2 -translate-x-1/2",
            "max-w-[min(16rem,calc(100vw-2rem))] whitespace-normal break-words rounded-card bg-ink px-2 py-1 text-xs font-medium text-white shadow-popover",
            className,
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
