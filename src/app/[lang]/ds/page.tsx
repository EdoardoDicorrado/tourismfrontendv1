import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DSGallery } from "./DSGallery";

/**
 * Design System gallery — a LIVING reference of every UI primitive with its
 * variants/sizes/states. Dev-only: returns 404 in production and is linked from
 * nowhere. Reach it at `/<lang>/ds` (e.g. `/it/ds`) while developing.
 *
 * Custode: `design-system-1`. Keep this in sync when you add/change a primitive
 * — it's the single place where the three ui-ux see "what already exists" before
 * writing anything inline.
 */
export const metadata: Metadata = { robots: { index: false, follow: false }, title: "Design System" };

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <DSGallery />;
}
