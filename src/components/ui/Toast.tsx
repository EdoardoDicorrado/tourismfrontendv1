import type { ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Toast — presentational notification card + a fixed `ToastViewport` to stack
 * them (bottom-center, above everything via `--z-toast`).
 *
 * This is the STRUCTURE only. The queue/auto-dismiss timers and the enter/exit
 * motion are a follow-up to build WITH `animations` (and likely a small client
 * context). Render `<Toast>` inside `<ToastViewport>`.
 */
export type ToastVariant = "success" | "error" | "warning" | "info";

const DOT: Record<ToastVariant, string> = {
  success: "bg-cta",
  error: "bg-badge",
  warning: "bg-warning",
  info: "bg-ink/40",
};

export function Toast({
  variant = "info",
  title,
  children,
  onClose,
  className,
}: {
  variant?: ToastVariant;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={cx(
        "pointer-events-auto w-full max-w-sm rounded-card bg-white px-4 py-3 shadow-popover ring-1 ring-stroke/20",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cx("mt-1.5 size-2 shrink-0 rounded-full", DOT[variant])} />
        <div className="flex-1 text-sm">
          {title ? <p className="font-bold text-ink">{title}</p> : null}
          {children ? <p className="text-ink/70">{children}</p> : null}
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1 text-ink/50 transition-colors hover:bg-soft hover:text-ink"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Fixed bottom-center stack for toasts. Click-through except on the cards. */
export function ToastViewport({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cx(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[var(--z-toast)] flex flex-col items-center gap-2 p-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
