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
  className,
}: {
  src?: string;
  alt?: string;
  /** Used for the initials fallback and as the image alt when `alt` is empty. */
  name?: string;
  size?: number;
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
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-soft font-bold text-cta",
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
