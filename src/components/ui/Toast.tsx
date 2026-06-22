import type { ReactNode } from "react";

import { FEEDBACK } from "@/components/ui/Alert";
import { cx } from "@/components/ui/buttonVariants";
import { IconButton } from "@/components/ui/IconButton";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Toast — presentational notification card + a fixed `ToastViewport` to stack
 * them (top-center, above everything via `--z-toast`).
 *
 * This is the STRUCTURE only. The queue/auto-dismiss timers and the enter/exit
 * motion are a follow-up to build WITH `animations` (and likely a small client
 * context). Render `<Toast>` inside `<ToastViewport>`.
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

/** Semantic token name → dot background (literal classes so Tailwind emits them). */
const DOT_BG = {
  cta: "bg-cta",
  badge: "bg-badge",
  "warning-strong": "bg-warning-strong",
} as const;

export function Toast({
  variant = "info",
  title,
  children,
  onClose,
  closeLabel = "Cerrar",
  className,
}: {
  variant?: ToastVariant;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cx(
        "pointer-events-auto w-full max-w-sm rounded-card bg-white px-4 py-3 shadow-popover ring-1 ring-stroke/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", DOT_BG[FEEDBACK[variant]])} />
        <div className="flex-1 text-sm">
          {title ? <p className="font-bold text-ink">{title}</p> : null}
          {children ? <p className="text-ink">{children}</p> : null}
        </div>
        {onClose ? (
          <IconButton
            label={closeLabel}
            variant="ghost"
            size="lg"
            onClick={onClose}
            className="-my-2.5 -mr-2.5 shrink-0"
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
    </div>
  );
}

/** Fixed top-center stack for toasts. Click-through except on the cards. */
export function ToastViewport({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={cx(
        "pointer-events-none fixed inset-x-0 top-0 z-[var(--z-toast)] flex flex-col items-center gap-2 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
