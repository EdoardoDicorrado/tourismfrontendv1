import Image from "next/image";
import Link from "next/link";

import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { Attraction } from "@/data/listing";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Attrazioni più popolari" — Figma mobile node 64:2864. Small attraction cards
 * (125×100 rounded image + name label) in a horizontal scroll-snap slider on
 * mobile, wrapping into a row from sm up. Each card **links to that attraction's
 * dedicated listing** (`/attivita/{city}/attrazione/{slug}`) — a page that shows
 * only the activities for that attraction.
 */
export function Attractions({
  lang,
  citta,
  dict,
  attractions,
}: {
  lang: Locale;
  citta: string;
  dict: Dictionary;
  attractions: Attraction[];
}) {
  return (
    <section className="py-8 sm:py-12">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl lg:text-3xl">
          {dict.attractions.title}
        </h2>

        {/* Desktop (Edoardo): le attrazioni RESTANO uno slider con la freccia "next"
            della home (CardSlider, `desktopArrow`), NON una griglia statica. Mobile
            congelato: stesse classi base/sm, cambia solo il ramo lg (slider invece di grid). */}
        <CardSlider
          label={dict.common.nextCard}
          desktopArrow
          className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 lg:flex-nowrap lg:gap-10 lg:overflow-x-auto lg:scroll-px-0"
        >
          {attractions.map((a) => (
            <li key={a.slug} className="shrink-0 snap-start lg:w-[330px]">{/* ds-guard-ignore: card slider attrazione 330px = Figma 221:4839, fuori type-scale */}
              <Link
                href={`/${lang}/attivita/${citta}/attrazione/${a.slug}`}
                className="group flex w-[125px] flex-col items-start gap-2 focus-visible:outline-none lg:w-full lg:gap-6"
              >
                <div className="relative h-[100px] w-[125px] overflow-hidden rounded-[10px] border border-soft bg-white transition-colors group-hover:border-cta group-focus-visible:border-cta lg:aspect-[330/327] lg:h-auto lg:w-full">
                  <Image
                    src={a.image}
                    alt={a.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, 125px"
                    className="object-cover"
                  />
                </div>
                <h3 className="w-full truncate text-base font-bold text-ink transition-colors group-hover:text-cta lg:text-xl lg:font-extrabold">
                  {a.name}
                </h3>
                {/* Descrizione: solo-desktop (Figma 221:4839). Su mobile la card mostra
                    solo il nome → resta nascosta, mobile congelato. */}
                <p className="hidden w-full text-base text-ink/70 lg:line-clamp-3 lg:block">
                  {a.description}
                </p>
              </Link>
            </li>
          ))}
        </CardSlider>
      </Container>
    </section>
  );
}
