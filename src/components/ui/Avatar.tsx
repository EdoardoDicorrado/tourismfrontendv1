import Image from "next/image";

import { cx } from "@/components/ui/buttonVariants";

/**
 * Avatar — round user image with an initials fallback (review authors, account
 * menu). Pass `src` for a photo, or just `name` to render initials on a soft
 * background. Server-safe.
 */
export function Avatar({
  src,
  alt = "",
  name,
  size = 40,
  decorative = false,
  className,
}: {
  src?: string;
  alt?: string;
  /** Used for the initials fallback and as the image alt when `alt` is empty. */
  name?: string;
  size?: number;
  /** Hide from the a11y tree — e.g. when a visible name already sits beside it. */
  decorative?: boolean;
  className?: string;
}) {
  const initials = name
    ? name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "";
  // Image branch carries its own alt; only the initials branch needs a name here.
  const a11y = decorative
    ? ({ "aria-hidden": true } as const)
    : !src && name
      ? ({ role: "img", "aria-label": name } as const)
      : null;
  return (
    <span
      {...(a11y ?? {})}
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-soft font-bold text-ink",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {src ? (
        <Image src={src} alt={alt || name || ""} width={size} height={size} className="size-full object-cover" />
      ) : (
        <span aria-hidden>{initials}</span>
      )}
    </span>
  );
}
