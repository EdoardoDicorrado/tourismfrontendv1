"use client";

import { useRouter } from "next/navigation";

import { Chevron } from "@/components/selectors/glyphs";

/**
 * Circular back button overlaid on the article hero — same affordance as the
 * product gallery (Figma): a white pill with a left chevron. Goes back through
 * in-app history, falling back to the blog index on a deep link / refresh.
 */
export function BlogBackButton({ fallbackHref, label }: { fallbackHref: string; label: string }) {
  const router = useRouter();
  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };
  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={label}
      className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-white/90 active:scale-95"
    >
      <Chevron dir="left" />
    </button>
  );
}
