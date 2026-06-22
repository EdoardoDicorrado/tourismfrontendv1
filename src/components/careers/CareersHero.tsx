"use client";

import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Careers hero — pixel-perfect to Figma "Lavora con Noi // Mobile" (447:1453):
 * a full-bleed photo on top, then the headline + subtitle + the primary
 * "Candidati ora" CTA (smooth-scrolls to `#posizioni-aperte`).
 */
export function CareersHero({ dict }: { dict: Dictionary }) {
  const t = dict.careers.hero;

  // Smooth-scroll to the open-roles section (same pattern as CareersSearch /
  // StickyBookingBar). Native hash stays as the no-JS / reduced-motion fallback.
  const scrollToPositions = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById("posizioni-aperte");
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  return (
    <section className="flex flex-col gap-4 pb-4">
      <div className="relative h-[178px] w-full overflow-hidden">
        <Image
          src="/images/hero-lavora-con-noi.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>
      <Container className="flex flex-col items-start gap-4">
        <h1 className="text-[32px] font-bold leading-tight text-ink">{t.title}</h1>
        <p className="text-sm font-medium text-ink">{t.subtitle}</p>
        <a
          href="#posizioni-aperte"
          onClick={scrollToPositions}
          className="flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-extrabold text-white transition-[color,transform] hover:bg-cta-hover active:scale-[0.98] active:bg-cta-active"
        >
          {t.cta}
        </a>
      </Container>
    </section>
  );
}
