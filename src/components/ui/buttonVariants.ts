/**
 * Button styling — the single source of truth for the storefront's interactive
 * button states, as a **pure, framework-agnostic** module.
 *
 * This intentionally lives OUTSIDE `Button.tsx` (which is `"use client"` for the
 * framer-motion press feedback). A pure styling helper exported from a
 * `"use client"` module becomes a *client reference*, so calling it from a
 * Server Component throws at render time ("Attempted to call buttonVariants()
 * from the server…"). Server Components (e.g. `StickyBookingBar`, the careers
 * hero/promo CTAs) import `buttonVariants` from HERE; the interactive
 * `Button`/`ButtonLink` wrappers re-use it from the client side. Both share one
 * definition — no duplication, no drift.
 */

/** Tiny class joiner (no clsx in the project). Falsy entries are dropped. */
export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export type ButtonVariant = "primary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Centralized button styling — returns a className usable on ANY element
 * (`<button>`, `<Link>`, `<a>`) so the hover/active treatment stays consistent
 * everywhere.
 *
 * Interactive states (per the design-system convention):
 *  - **hover** → the fill lightens (CTA teal mixed toward white).
 *  - **active/press** → the fill darkens (mixed toward black).
 * Colors are derived from the existing `--color-cta` token via `color-mix`, so
 * no new globals.css tokens are introduced (ui-ux-1 owns the token file). The
 * tactile *scale* on press lives in `Button`/`ButtonLink` (client only).
 */
export function buttonVariants({
  variant = "primary",
  size = "md",
  pill = false,
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  fullWidth?: boolean;
} = {}) {
  const base =
    "inline-flex items-center justify-center text-center font-extrabold transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50";

  const sizes: Record<ButtonSize, string> = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-7 py-3.5 text-base",
  };

  // Hover = lighter, active = darker — now from the named state tokens
  // (`--color-cta-hover/-active`, `--color-badge-hover/-active` in globals.css),
  // the single source for the derived states (no more inline color-mix copies).
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-cta text-white hover:bg-cta-hover active:bg-cta-active",
    outline:
      "border border-cta text-cta " +
      "hover:bg-cta-hover hover:text-white active:bg-cta-active active:text-white",
    ghost: "text-cta hover:bg-soft active:bg-soft-active",
    // Red action (cancel/delete). Same treatment as primary, from the badge
    // tokens — the single source for the destructive button look (previously
    // duplicated in account/ui/SubmitButton).
    destructive: "bg-badge text-white hover:bg-badge-hover active:bg-badge-active",
  };

  return cx(
    base,
    sizes[size],
    variants[variant],
    pill ? "rounded-full" : "rounded-card",
    fullWidth && "w-full",
  );
}
