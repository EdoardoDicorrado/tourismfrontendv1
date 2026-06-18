"use client";

import type { ReactNode } from "react";

import { buttonVariants, cx } from "@/components/ui/buttonVariants";

/**
 * Primary submit button with a pending state.
 *
 * The account forms submit via a client `fetch` handler (BFF), not a Server
 * Action, so they own their own `submitting` state (`useState`) and pass it as
 * `loading` — this is more reliable than `useFormStatus`, which only reflects a
 * pending Server Action. When `loading` is true the button is disabled and shows
 * `loadingLabel`.
 *
 * Styling comes from the Design System `buttonVariants` (single source of truth):
 * `variant="primary"` (cta) or `variant="destructive"` (badge red), size `md`,
 * full-width. This wrapper only adds the loading/disabled logic on top — the
 * tactile press-scale lives in the `Button` primitive (animations) and is
 * intentionally omitted here.
 */
export interface SubmitButtonProps {
  children: ReactNode;
  /** Shown (and button disabled) while a submit is in flight. */
  loading?: boolean;
  loadingLabel?: ReactNode;
  /** Also disable for non-loading reasons (e.g. invalid form). */
  disabled?: boolean;
  variant?: "primary" | "destructive";
  /** Defaults to "submit". */
  type?: "submit" | "button";
  onClick?: () => void;
  className?: string;
}

export function SubmitButton({
  children,
  loading = false,
  loadingLabel,
  disabled = false,
  variant = "primary",
  type = "submit",
  onClick,
  className = "",
}: SubmitButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      aria-busy={loading || undefined}
      className={cx(buttonVariants({ variant, size: "md", fullWidth: true }), "gap-2", className)}
    >
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
