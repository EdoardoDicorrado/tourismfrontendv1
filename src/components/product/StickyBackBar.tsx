"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/ui/Container";
import { Chevron } from "@/components/selectors/glyphs";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Mobile sticky "back" bar (Figma 76:14074): a white bar with a back arrow + the
 * (truncated) product title that appears ONCE the gallery image has scrolled
 * above the viewport and stays pinned to the top edge until the `<footer>` comes
 * into view, where it slides away. Tapping it navigates back (history, else the
 * city listing).
 *
 * Driven by two IntersectionObservers (no scroll handler on the main thread),
 * mirroring {@link StickyBookingBar}. The site header is not sticky (it scrolls
 * off), so the bar sits at `top-0`. The slide is a plain CSS transform transition
 * (off under prefers-reduced-motion); a richer entrance is `animations`' to add.
 * Hidden on lg, where the gallery's own back button stays reachable.
 */
export function StickyBackBar({
  title,
  fallbackHref,
  dict,
}: {
  title: string;
  fallbackHref: string;
  dict: Dictionary;
}) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById("gallery-end");
    // Target the SITE footer by id, NOT querySelector("footer"): the first <footer>
    // in the DOM is the off-canvas UserMenu drawer's, which IntersectionObserver
    // reports as intersecting even when translated off-screen → the bar would never show.
    const footer = document.getElementById("site-footer");
    let pastGallery = false;
    let footerIn = false;
    const update = () => setVisible(pastGallery && !footerIn);

    // "past the gallery" = the gallery-end marker has scrolled above the top.
    const galleryObs = new IntersectionObserver(([e]) => {
      pastGallery = !e.isIntersecting && e.boundingClientRect.top < 0;
      update();
    });
    if (anchor) galleryObs.observe(anchor);

    const footerObs = new IntersectionObserver(([e]) => {
      footerIn = e.isIntersecting;
      update();
    });
    if (footer) footerObs.observe(footer);

    return () => {
      galleryObs.disconnect();
      footerObs.disconnect();
    };
  }, []);

  const goBack = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <div
      inert={!visible}
      className={`fixed inset-x-0 top-0 z-[var(--z-header)] border-b border-soft-grey bg-white shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-transform duration-300 motion-reduce:transition-none lg:hidden ${
        visible ? "translate-y-0" : "pointer-events-none -translate-y-full"
      }`}
    >
      <Container>
        <button
          type="button"
          onClick={goBack}
          aria-label={dict.gallery.back}
          className="flex w-full items-center gap-2.5 py-4 text-left"
        >
          <span className="flex size-11 shrink-0 items-center justify-center text-ink">
            <Chevron dir="left" />
          </span>
          <span className="min-w-0 flex-1 truncate text-base font-bold text-ink">{title}</span>
        </button>
      </Container>
    </div>
  );
}
