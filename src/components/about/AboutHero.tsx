import Image from "next/image";

import { Container } from "@/components/ui/Container";
import { socialLinks } from "@/data/home";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Chi siamo" hero — image backdrop, headline and the social row.
 * Figma node 447:1236.
 */
export function AboutHero({ dict }: { dict: Dictionary }) {
  const t = dict.about.hero;
  return (
    <section className="relative isolate flex min-h-[340px] items-end overflow-hidden border-b border-soft-grey sm:min-h-[420px]">
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
        className="absolute inset-0 -z-10 bg-gradient-to-t from-black/65 via-black/30 to-transparent"
      />

      <Container className="py-10 sm:py-14">
        <div className="flex max-w-[640px] flex-col gap-5">
          <h1 className="text-3xl font-bold leading-tight text-white drop-shadow-sm sm:text-4xl lg:text-5xl">
            {t.title}
          </h1>
          <div className="flex items-center gap-4" aria-label={t.socialLabel}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                {/* Dimensioni intrinseche reali (la "f" di Facebook è 1:2) + h-6 w-auto: niente stretch. */}
                <Image src={s.icon} alt="" width={s.w} height={s.h} className="h-6 w-auto" unoptimized />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
