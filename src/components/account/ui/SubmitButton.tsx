"use client";

import type { ReactNode } from "react";

/**
 * Primary submit button with a pending state.
 *
 * The account forms submit via a client `fetch` handler (BFF), not a Server
 * Action, so they own their own `submitting` state (`useState`) and pass it as
 * `loading` — this is more reliable than `useFormStatus`, which only reflects a
 * pending Server Action. When `loading` is true the button is disabled and shows
 * `loadingLabel`.
 *
 * Styling matches the design-system primary button (`bg-cta text-white`,
 * `disabled:opacity-60`). Pass `variant="destructive"` for a red action button.
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

const VARIANT: Record<NonNullable<SubmitButtonProps["variant"]>, string> = {
  primary: "bg-cta text-white hover:bg-[color-mix(in_oklab,var(--color-cta),white_15%)] active:bg-[color-mix(in_oklab,var(--color-cta),black_12%)]",
  destructive: "bg-badge text-white hover:bg-[color-mix(in_oklab,var(--color-badge),white_15%)] active:bg-[color-mix(in_oklab,var(--color-badge),black_12%)]",
};

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
      className={`flex w-full items-center justify-center gap-2 rounded-[10px] px-6 py-3 font-extrabold transition-colors disabled:opacity-60 ${VARIANT[variant]} ${className}`.trim()}
    >
      {loading ? (loadingLabel ?? children) : children}
    </button>
  );
}
