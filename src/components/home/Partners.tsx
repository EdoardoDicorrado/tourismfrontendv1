"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Partner logos shown in the "Siamo partner di:" section. Data-driven so real
 * partners can be dropped in later by extending this list — the mobile marquee
 * and the `sm+` grid both render straight from it.
 */
const partners = [
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
  { name: "Musei Vaticani", logo: "/images/partner-musei-vaticani.png", width: 149, height: 81 },
];

/** Seconds for the marquee to advance by one full set of logos. */
const LOOP_DURATION = 25;
/** Auto-scroll resumes this long after the user stops dragging. */
const RESUME_DELAY = 1500;
/** Per-16.7ms decay applied to the release velocity (lower = stops sooner). */
const MOMENTUM_FRICTION = 0.94;
/** Below this speed (px/s) momentum is considered finished. */
const MOMENTUM_MIN = 8;
/** Cap the flick speed (px/s) so a hard swipe can't fling it absurdly fast. */
const MOMENTUM_MAX = 3500;
/** If the finger was still for longer than this (ms) before release, no flick. */
const FLICK_IDLE_MS = 80;

function PartnerLogo({ partner }: { partner: (typeof partners)[number] }) {
  return (
    <div className="flex h-[158px] items-center justify-center rounded-[10px] border border-soft bg-white p-4">
      <Image
        src={partner.logo}
        alt={partner.name}
        width={partner.width}
        height={partner.height}
        className="h-auto w-auto object-contain"
      />
    </div>
  );
}

/**
 * "Siamo partner di:" — partner logos. Figma node 55:3.
 *
 * Mobile: an infinitely looping marquee driven by a `requestAnimationFrame`
 * loop (not a CSS animation) so the user can grab and drag it with the finger.
 * The track holds the list twice and we wrap `offset` modulo one set's width,
 * so the loop is seamless in both directions. Dragging pauses the auto-scroll;
 * it resumes {@link RESUME_DELAY}ms after release. Honours `prefers-reduced-
 * motion` (no auto-scroll; manual drag still allowed).
 *
 * sm+: static grid.
 */
export function Partners({ dict }: { dict: Dictionary }) {
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Width of one set of logos (the track holds two identical sets).
    let period = track.scrollWidth / 2;
    let offset = 0;
    let last = 0;
    let raf = 0;
    let dragging = false;
    let paused = false;
    let momentum = 0; // px/s carried over from a release flick (0 = none)
    let resumeTimer: ReturnType<typeof setTimeout> | null = null;
    let startX = 0;
    let startOffset = 0;
    // Velocity tracking for the release flick.
    let velocity = 0; // px/s
    let lastX = 0;
    let lastT = 0;

    // Keep offset within (-period, 0] so the doubled track always covers the
    // viewport and the wrap point is invisible.
    const normalize = () => {
      if (period <= 0) return;
      offset = offset % period;
      if (offset > 0) offset -= period;
    };
    const apply = () => {
      track.style.transform = `translateX(${offset}px)`;
    };

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = now - last;
      last = now;
      if (!dragging) {
        if (momentum !== 0) {
          // Inertial flick: glide and decay (frame-rate independent friction).
          offset += momentum * (dt / 1000);
          momentum *= Math.pow(MOMENTUM_FRICTION, dt / 16.67);
          if (Math.abs(momentum) < MOMENTUM_MIN) momentum = 0;
          normalize();
          apply();
        } else if (!paused) {
          offset -= (period / LOOP_DURATION) * (dt / 1000);
          normalize();
          apply();
        }
      }
      raf = requestAnimationFrame(tick);
    };

    const onDown = (e: PointerEvent) => {
      dragging = true;
      paused = false;
      momentum = 0;
      if (resumeTimer) {
        clearTimeout(resumeTimer);
        resumeTimer = null;
      }
      startX = e.clientX;
      startOffset = offset;
      lastX = e.clientX;
      lastT = e.timeStamp;
      velocity = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      offset = startOffset + (e.clientX - startX);
      const dtm = e.timeStamp - lastT;
      if (dtm > 0) {
        // Blend instantaneous speed to smooth out jittery samples.
        const inst = ((e.clientX - lastX) / dtm) * 1000;
        velocity = velocity * 0.7 + inst * 0.3;
        lastX = e.clientX;
        lastT = e.timeStamp;
      }
      normalize();
      apply();
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      if (reduce) return; // reduced motion: stay put, nothing to resume
      // Only flick if the finger was actually moving at release.
      const idle = e.timeStamp - lastT;
      momentum = idle > FLICK_IDLE_MS ? 0 : Math.max(-MOMENTUM_MAX, Math.min(MOMENTUM_MAX, velocity));
      paused = true;
      resumeTimer = setTimeout(() => {
        paused = false;
      }, RESUME_DELAY);
    };
    const onResize = () => {
      period = track.scrollWidth / 2;
      normalize();
      apply();
    };

    if (!reduce) raf = requestAnimationFrame(tick);

    track.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      if (resumeTimer) clearTimeout(resumeTimer);
      track.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className="py-3 sm:py-6">
      <Container>
        <p className="text-xs font-semibold text-cta">{dict.partners.eyebrow}</p>
        <h2 className="text-2xl font-extrabold text-ink">{dict.partners.title}</h2>

        {/* Mobile: draggable infinite marquee. The full-bleed wrapper masks the
            overflow so logos flow off both screen edges; the doubled list +
            modulo wrap make the loop seamless. `touch-pan-y` keeps vertical
            page scroll while we own horizontal drags. The second set is
            aria-hidden (decorative duplicate). */}
        <div className="-mx-4 mt-4 overflow-hidden sm:hidden">
          <ul
            ref={trackRef}
            onDragStart={(e) => e.preventDefault()}
            className="flex w-max cursor-grab touch-pan-y select-none active:cursor-grabbing [&_img]:pointer-events-none"
          >
            {[...partners, ...partners].map((partner, i) => (
              <li
                key={i}
                className="mr-4 w-[197px] shrink-0"
                aria-hidden={i >= partners.length}
              >
                <PartnerLogo partner={partner} />
              </li>
            ))}
          </ul>
        </div>

        {/* sm+: static grid (no animation). */}
        <ul className="mt-4 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {partners.map((partner, i) => (
            <li key={i}>
              <PartnerLogo partner={partner} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
