import Image from "next/image";

import { buttonVariants } from "@/components/ui/buttonVariants";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Careers hero — image backdrop, headline and the primary "apply" CTA.
 * Figma node 447:1453 (Lavora con Noi // Mobile › hero). The CTA scrolls to the
 * application intro (`#candidatura`).
 */
export function CareersHero({ dict }: { dict: Dictionary }) {
  const t = dict.careers.hero;
  return (
    <section className="relative isolate flex min-h-[360px] items-center overflow-hidden border-b border-soft-grey sm:min-h-[440px]">
      <Image
        src="/images/hero-colosseo.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/40 to-black/20"
      />

      <Container className="py-14 sm:py-20">
        <div className="flex max-w-[640px] flex-col items-start gap-5">
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <p className="max-w-[440px] text-base font-medium text-white/90 sm:text-lg">
            {t.subtitle}
          </p>
          <a href="#candidatura" className={buttonVariants({ size: "lg" })}>
            {t.cta}
          </a>
        </div>
      </Container>
    </section>
  );
}
