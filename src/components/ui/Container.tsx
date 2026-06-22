import type { ReactNode } from "react";

import { cx } from "./buttonVariants";

/** Centered content wrapper with the site's max width and horizontal padding. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-[var(--container-site)] px-4 sm:px-6 lg:px-4", className)}>
      {children}
    </div>
  );
}
