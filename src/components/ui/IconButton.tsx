import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/components/ui/buttonVariants";

/**
 * IconButton — round icon-only button (slider arrows, the 28px glyph buttons,
 * close ×, etc.). `label` is REQUIRED → becomes `aria-label` (icon buttons have
 * no text). Server-safe; the tactile press-scale is `animations`' to add on top.
 */
export type IconButtonVariant = "solid" | "soft" | "outline" | "ghost";
export type IconButtonSize = "sm" | "md" | "lg";

const SIZE: Record<IconButtonSize, string> = {
  sm: "size-7", // 28px
  md: "size-9", // 36px
  lg: "size-11", // 44px (WCAG target)
};

const VARIANT: Record<IconButtonVariant, string> = {
  solid: "bg-cta text-white hover:bg-cta-hover active:bg-cta-active",
  soft: "bg-soft text-cta hover:bg-cta-hover hover:text-white",
  outline: "border border-cta text-cta hover:bg-cta-hover hover:text-white",
  ghost: "text-ink hover:bg-soft",
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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cta focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
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
