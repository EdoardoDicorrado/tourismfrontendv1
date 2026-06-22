import Image from "next/image";
import Link from "next/link";

import { CardSlider } from "@/components/ui/CardSlider";
import { Container } from "@/components/ui/Container";
import type { Destination } from "@/data/home";
import { fill, type Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Destinazioni più popolari" — destination cards. Figma node 1:671 / card 1:676.
 *
 * Mobile: horizontal scroll-snap slider of 267px cards (the next peeks).
 * sm+: static 3-column grid. Each card mirrors Figma — white fill with a 1px
 * soft-blue border, 10px radius; image at a 267×214 ratio with the discount
 * badge inset 16px; "16 + Esperienze" (SemiBold 12px CTA), the city name
 * (ExtraBold 24px), rating (ExtraBold 20px + 26px star) and a Medium 14px blurb.
 */
export function Destinations({
  lang,
  dict,
  destinations,
}: {
  lang: Locale;
  dict: Dictionary;
  destinations: Destination[];
}) {
  return (
    <section className="py-3 sm:py-12">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink">{dict.destinations.title}</h2>

        <CardSlider
          label={dict.common.nextCard}
          className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3"
        >
          {destinations.map((d) => (
            <li key={d.slug} className="w-[267px] shrink-0 snap-start sm:w-auto">
              <Link
                href={`/${lang}/attivita/${d.slug}`}
                aria-label={d.name}
                className="group block h-full"
              >
                <article className="flex h-full flex-col overflow-clip rounded-[10px] border border-soft bg-white transition-colors group-hover:border-cta">
                <div className="relative aspect-[267/214] w-full">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    sizes="(max-width: 768px) 80vw, 33vw"
                    className="object-cover"
                  />
                  {d.badge && (
                    <span className="absolute left-4 top-4 flex items-center gap-1 rounded-[5px] bg-badge px-2 py-1 text-sm font-extrabold leading-none text-white">
                      <Image src="/images/icon-percent.svg" alt="" width={13} height={12} />
                      {d.badge}
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="text-xs font-semibold text-cta">
                        {fill(dict.destinations.experiences, { count: String(d.experiences) })}
                      </span>
                      <h3 className="text-2xl font-extrabold uppercase leading-none text-ink">
                        {d.name}
                      </h3>
                    </div>
                    <span className="flex shrink-0 items-center gap-2 text-xl font-extrabold text-ink">
                      {d.rating.toFixed(1)}
                      <Image src="/images/icon-star.svg" alt="" width={26} height={26} />
                    </span>
                  </div>
                  <p className="line-clamp-2 text-sm font-medium text-ink">{d.description}</p>
                </div>
                </article>
              </Link>
            </li>
          ))}
        </CardSlider>
      </Container>
    </section>
  );
}
