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
    <section className="flex flex-col gap-4 pb-4 lg:relative lg:block lg:min-h-[560px] lg:pb-0">{/* ds-guard-ignore: hero desktop min-h Figma 605:1025 */}
      {/* Desktop (Figma 605:1026): immagine a SINISTRA, full-bleed, metà larghezza,
          tutta l'altezza dell'hero. Mobile invariato: foto full-bleed in alto. */}
      <div className="relative h-[178px] w-full overflow-hidden lg:absolute lg:inset-y-0 lg:left-0 lg:h-full lg:w-1/2 lg:rounded-r-panel">{/* ds-guard-ignore: hero img h-178 grandfathered (mobile) */}
        <Image
          src="/images/hero-lavora-con-noi.jpg"
          alt=""
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      {/* Desktop (Figma 605:1027): testo nella metà DESTRA del container, centrato
          verticalmente; CTA a larghezza contenuto. Mobile invariato. */}
      <Container className="flex flex-col items-start gap-4 lg:grid lg:min-h-[560px] lg:grid-cols-2 lg:gap-0">{/* ds-guard-ignore: hero desktop min-h Figma */}
        <div className="flex w-full flex-col items-start gap-4 lg:col-start-2 lg:justify-center lg:gap-6 lg:py-16 lg:pl-12">
          <h1 className="text-[32px] font-bold leading-tight text-ink lg:text-[52px]">{t.title}</h1>{/* ds-guard-ignore: hero title 32/56px Figma, fuori type-scale */}
          <p className="text-sm font-medium text-ink lg:text-lg">{t.subtitle}</p>
          <a
            href="#posizioni-aperte"
            onClick={scrollToPositions}
            className="flex w-full items-center justify-center rounded-card bg-cta py-4 text-base font-extrabold text-white transition-[color,transform] hover:bg-cta-hover active:scale-[0.98] active:bg-cta-active lg:w-auto lg:px-12"
          >
            {t.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
