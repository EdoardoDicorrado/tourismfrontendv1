"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useRef } from "react";

import { focusRing } from "@/components/ui/buttonVariants";

/** The `<li>` cards of the slider, in DOM order. */
function cards(el: HTMLElement) {
  return Array.from(el.children) as HTMLElement[];
}

/** The `scrollLeft` at which `li` rests on its snap point — used to pick the next
 * card for the arrow. Relative to the ul so a negative `-mx-4` margin cancels out,
 * and MINUS `scroll-padding-left` (the sliders use `scroll-px-4`) so it matches
 * where native snap actually parks: without this the current card stays 16px ahead
 * of `scrollLeft` and the arrow keeps re-selecting it instead of advancing. */
function cardOffset(el: HTMLElement, li: HTMLElement) {
  const pad = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
  return li.offsetLeft - el.offsetLeft - pad;
}

/**
 * Horizontal card slider with a circular "next" arrow that scrolls by exactly
 * one card. The arrow is mobile-only by default; pass `desktopArrow` for sliders
 * that stay horizontal on desktop (e.g. listing "Attrazioni", home reviews).
 * Renders the `<ul>`; callers pass the `<li>` cards as children and the slider
 * utility classes via `className` (incl. `snap-x snap-mandatory scroll-px-4`).
 *
 * Snapping is **native CSS scroll-snap** — the browser settles on a card after a
 * swipe and after the arrow scroll, honouring `scroll-padding`. (An earlier JS
 * re-snap machine fought the CSS snap and ping-ponged forever — "il rimbalzo";
 * removed.) The arrow uses native `el.scrollTo({ left })` to the card's exact
 * snap point (cardOffset accounts for scroll-padding), so the browser never
 * re-aligns afterwards and only THIS slider scrolls (no page nudge).
 * Reduced-motion → instant scroll (WCAG 2.3.3). The arrow shrinks on press.
 */
export function CardSlider({
  children,
  label,
  className = "",
  desktopArrow = false,
}: {
  children: React.ReactNode;
  /** Accessible label for the next-card button. */
  label: string;
  className?: string;
  /**
   * Keep the next-arrow visible on desktop (lg+), for sliders that stay
   * horizontal instead of collapsing into a grid. Default: mobile-only.
   */
  desktopArrow?: boolean;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();

  function next() {
    const el = ref.current;
    if (!el) return;
    const behavior: ScrollBehavior = reduceMotion ? "auto" : "smooth";
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (atEnd) {
      // Loop back to the first card.
      el.scrollTo({ left: 0, behavior });
      return;
    }
    // First card whose start sits to the right of the current scroll position.
    const upcoming = cards(el).find((li) => cardOffset(el, li) > el.scrollLeft + 1);
    if (!upcoming) {
      el.scrollTo({ left: 0, behavior });
      return;
    }
    // Native scroll to the card's exact snap point — cardOffset already accounts
    // for scroll-padding, so mandatory snap never re-aligns afterwards (no
    // "rimbalzo"). Scoped to THIS slider (symmetric with the loop-back above);
    // unlike scrollIntoView it never walks ancestor scrollers / nudges the page.
    el.scrollTo({ left: cardOffset(el, upcoming), behavior });
  }

  return (
    <div className="relative">
      <ul
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label="Carrusel"
        className={className}
      >
        {children}
      </ul>
      <motion.button
        type="button"
        onClick={next}
        aria-label={label}
        whileTap={reduceMotion ? undefined : { scale: 0.82 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        // `y: "-50%"` lives in the motion transform (not a Tailwind class) so it
        // composes with the `whileTap` scale instead of being overwritten by it.
        style={{ y: "-50%" }}
        className={`absolute right-1 top-1/2 flex h-11 w-11 items-center justify-center rounded-full ${focusRing} sm:hidden ${desktopArrow ? "lg:flex" : ""}`}
      >
        <Image
          src="/images/icon-arrow.svg"
          alt=""
          width={40}
          height={40}
          className="-scale-x-100 drop-shadow-md"
        />
      </motion.button>
    </div>
  );
}
