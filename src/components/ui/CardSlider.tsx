"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Gap between cards — matches the `gap-4` (16px) used by every caller. */
const GAP = 16;

/** Distance to scroll for one card: card width + gap (fallback: 80% viewport). */
function cardStep(el: HTMLElement) {
  const first = el.querySelector<HTMLElement>("li");
  return first ? first.offsetWidth + GAP : Math.round(el.clientWidth * 0.8);
}

/**
 * Animate `el.scrollLeft` to `target` over `duration` ms with a JS rAF loop.
 *
 * We can't rely on native `scrollTo({ behavior: "smooth" })` here because the
 * list uses `scroll-snap-type: x mandatory`: mandatory snapping cancels the
 * native smooth animation and makes the card jump instantly. So we disable snap
 * for the duration of the tween and restore it at the end — we always land
 * exactly on a card boundary, so restoring `mandatory` causes no extra jump.
 */
function animateScrollTo(
  el: HTMLElement,
  target: number,
  duration: number,
  onDone?: () => void,
) {
  const start = el.scrollLeft;
  const delta = target - start;
  if (delta === 0) {
    onDone?.();
    return;
  }
  const prevSnap = el.style.scrollSnapType;
  el.style.scrollSnapType = "none";
  let startTime: number | null = null;
  const step = (now: number) => {
    if (startTime === null) startTime = now;
    const t = Math.min(1, (now - startTime) / duration);
    el.scrollLeft = start + delta * easeOutCubic(t);
    if (t < 1) {
      requestAnimationFrame(step);
    } else {
      el.style.scrollSnapType = prevSnap;
      onDone?.();
    }
  };
  requestAnimationFrame(step);
}

/**
 * Horizontal card slider with a circular "next" arrow that scrolls by exactly
 * one card (mobile only — on `sm+` the list becomes a static grid and the arrow
 * is hidden). Renders the `<ul>`; callers pass the `<li>` cards as children and
 * the same slider utility classes they used before via `className`.
 *
 * The arrow reuses `icon-arrow.svg` (the circular ink-bordered chevron),
 * mirrored to point right. At the end it loops back to the first card so the
 * single arrow stays useful. Tapping it slides with a fast animated scroll
 * (~350ms) instead of jumping — see {@link animateScrollTo}. The arrow also
 * shrinks briefly on press (`whileTap`) for tactile feedback.
 *
 * After a manual swipe we re-snap to the nearest card with a JS tween, so the
 * list always settles exactly on a card boundary instead of resting on the
 * arbitrary offset the finger left it at (native CSS snap proved unreliable on
 * touch with momentum scrolling).
 */
export function CardSlider({
  children,
  label,
  className = "",
}: {
  children: React.ReactNode;
  /** Accessible label for the next-card button. */
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLUListElement>(null);
  const reduceMotion = useReducedMotion();
  // True while WE drive the scroll (arrow tap or settle tween); blocks the
  // manual-snap handler from fighting our own animation.
  const programmatic = useRef(false);

  // Snap to the nearest card after the user finishes a manual swipe. We watch
  // for the scroll going idle (≈110ms without a scroll event) rather than
  // relying on CSS `scroll-snap`, which leaves the list on the dragged offset
  // on touch devices with momentum scrolling.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let idle: ReturnType<typeof setTimeout> | null = null;

    const settle = () => {
      if (programmatic.current) return;
      const step = cardStep(el);
      if (step <= 0) return;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const target = Math.max(0, Math.min(maxScroll, Math.round(el.scrollLeft / step) * step));
      if (Math.abs(target - el.scrollLeft) < 1) return;
      if (reduceMotion) {
        el.scrollLeft = target;
        return;
      }
      programmatic.current = true;
      animateScrollTo(el, target, 250, () => {
        programmatic.current = false;
      });
    };

    const onScroll = () => {
      if (programmatic.current) return;
      if (idle) clearTimeout(idle);
      idle = setTimeout(settle, 110);
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      if (idle) clearTimeout(idle);
    };
  }, [reduceMotion]);

  function next() {
    const el = ref.current;
    if (!el) return;
    const step = cardStep(el);
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    const target = atEnd ? 0 : el.scrollLeft + step;
    // Honour reduced-motion: snap instantly, no slide animation (WCAG 2.3.3).
    if (reduceMotion) {
      el.scrollLeft = target;
      return;
    }
    programmatic.current = true;
    animateScrollTo(el, target, 350, () => {
      programmatic.current = false;
    });
  }

  return (
    <div className="relative">
      <ul ref={ref} className={className}>
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
        className="absolute right-1 top-1/2 flex h-11 w-11 items-center justify-center sm:hidden"
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
