import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx, focusRing } from "@/components/ui/buttonVariants";

/**
 * IconButton — round icon-only button (slider arrows, glyph buttons, close ×,
 * back, stepper, etc.). THE single source for every icon button: pass a shared
 * glyph from `@/components/ui/icons` as children. `label` is REQUIRED → becomes
 * `aria-label`. Server-safe; the tactile press-scale is `animations`' to add on top.
 *
 * Variants: `solid`/`soft`/`outline`/`ghost` (on light surfaces), `elevated`
 * (white + shadow, floats over a photo — e.g. the gallery back button), `on-media`
 * (translucent white on a dark photo/lightbox), `danger` (destructive, e.g. remove).
 */
export type IconButtonVariant =
  | "solid"
  | "soft"
  | "outline"
  | "ghost"
  | "elevated"
  | "on-media"
  | "danger";
export type IconButtonSize = "sm" | "md" | "lg";

const SIZE: Record<IconButtonSize, string> = {
  sm: "size-7", // 28px
  md: "size-9", // 36px
  lg: "size-11", // 44px (WCAG target)
};

const VARIANT: Record<IconButtonVariant, string> = {
  solid: "bg-cta text-white hover:bg-cta-hover active:bg-cta-active",
  soft: "bg-soft text-cta hover:bg-cta-hover hover:text-white active:bg-cta-active active:text-white",
  outline:
    "border border-cta text-cta hover:bg-cta-hover hover:text-white active:bg-cta-active active:text-white",
  ghost: "text-ink hover:bg-soft active:bg-soft-active",
  elevated: "bg-white text-ink shadow-card hover:bg-soft",
  "on-media": "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20",
  // ds-guard-ignore-next-line: tint rosso tenue per l'icona ghost distruttiva — nessun token -hover si adatta a un bottone solo-icona trasparente
  danger: "text-badge hover:bg-badge/10 active:bg-badge/15",
};

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Required accessible name (icon buttons have no visible text). */
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  children: ReactNode;
}

export function IconButton({
  label,
  variant = "ghost",
  size = "md",
  type = "button",
  className,
  children,
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-colors",
        focusRing,
        "disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-50",
        SIZE[size],
        VARIANT[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
