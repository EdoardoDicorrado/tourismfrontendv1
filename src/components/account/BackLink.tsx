"use client";

import { useRouter } from "next/navigation";

/**
 * "Torna indietro" affordance shown top-left above every Area Riservata page
 * title (in {@link AccountLayout}). Uses browser history so it always returns to
 * wherever the user came from — no per-page parent route to thread through.
 */
export function BackLink({ label }: { label: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-cta hover:underline"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden className="shrink-0">
        <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </button>
  );
}
