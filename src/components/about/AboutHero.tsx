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
    <section className="relative isolate flex min-h-[415px] flex-col justify-end overflow-hidden border-b border-soft-grey lg:min-h-[605px]">{/* ds-guard-ignore: altezza hero Figma desktop 605px, nessun token */}
      <Image
        src="/images/about-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[rgba(0,0,0,0.4)] from-[39.289%] to-transparent to-[52.386%]"
      />

      <Container className="py-6 lg:py-24">
        <div className="flex flex-col gap-4 lg:items-center lg:gap-6">
          <h1 className="text-headline font-bold leading-[normal] break-words text-white lg:whitespace-nowrap lg:text-center lg:text-display lg:font-extrabold">
            {t.title}
          </h1>
          <div className="flex items-center gap-3 lg:justify-center lg:gap-6" aria-label={t.socialLabel}>
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="opacity-90 transition-opacity hover:opacity-100"
              >
                {/* Dimensioni intrinseche reali (la "f" di Facebook è 1:2) + h-6 w-auto: niente stretch. */}
                <Image src={s.icon} alt="" width={s.w} height={s.h} className="h-6 w-auto lg:h-12" unoptimized />
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
