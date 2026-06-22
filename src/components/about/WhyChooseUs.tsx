import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Icon per benefit card, matched by index to `about.why.items`. */
const ICONS = [
  "/images/about-why-1.svg",
  "/images/about-why-2.svg",
  "/images/about-why-3.svg",
  "/images/about-why-4.svg",
];

/**
 * "Perché scegliere Tourismotion?" — benefit cards + careers CTA.
 * Mobile (Figma 447:1284): scroller orizzontale di card 267px. Desktop (Figma
 * 605:859): griglia 2×2 di card 700px (icona 60, titolo 32, body 24, p-40,
 * gap-48) + bottone "Unisciti al team" full-width. Additivo lg: → mobile congelato.
 */
export function WhyChooseUs({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.about.why;
  return (
    <section className="py-12 sm:py-16 lg:py-10">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink lg:text-title lg:font-bold">{t.title}</h2>

        <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 lg:mx-0 lg:mt-6 lg:grid lg:grid-cols-2 lg:gap-10 lg:overflow-visible lg:px-0 lg:pb-0">
          {t.items.map((item, i) => (
            <li key={item.title} className="flex w-[267px] shrink-0 snap-start flex-col gap-6 overflow-hidden rounded-card bg-soft p-4 lg:w-auto lg:gap-12 lg:p-10">{/* ds-guard-ignore: card scroller mobile 267px, nessun token */}
              <Image
                src={ICONS[i]}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="lg:size-15"
              />
              <div className="flex flex-col gap-2 text-ink lg:gap-4">
                <h3 className="text-base font-semibold leading-normal lg:text-headline">{item.title}</h3>
                <p className="text-sm font-medium leading-normal lg:text-xl">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <ButtonLink href={`/${lang}/lavora-con-noi`} size="lg" fullWidth className="mt-6 lg:mt-10">
          {dict.about.cta}
        </ButtonLink>
      </Container>
    </section>
  );
}
