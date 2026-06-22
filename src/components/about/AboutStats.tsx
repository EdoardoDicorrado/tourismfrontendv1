import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Numeri chiave + immagine. Mobile (Figma 447:1265): titolo, immagine, pannello
 * stat (allineate a sinistra). Desktop (Figma 605:836): titolo full + griglia 2col
 * — pannello stat CENTRATO a SINISTRA (700), immagine a DESTRA (700). Additivo:
 * a mobile il wrapper è `display:contents` (ordine DOM = immagine→pannello,
 * congelato); su desktop diventa griglia con `order` invertito.
 */
export function AboutStats({ dict }: { dict: Dictionary }) {
  const t = dict.about.stats;
  return (
    <section className="py-4 lg:py-10">
      <Container className="flex flex-col items-start gap-4 lg:gap-12">
        <h2 className="w-full text-2xl font-extrabold leading-normal text-ink lg:text-title lg:font-bold">{t.title}</h2>

        <div className="contents lg:grid lg:w-full lg:grid-cols-2 lg:items-stretch lg:gap-10">
          <div className="relative h-[146px] w-full overflow-hidden rounded-panel lg:order-2 lg:h-full">{/* ds-guard-ignore: immagine mobile 146px, nessun token (desktop lg:h-full) */}
            <Image
              src="/images/about-numeri.jpg"
              alt={t.imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 700px"
              className="object-cover"
            />
          </div>

          <dl className="flex w-full flex-col items-start gap-4 rounded-panel bg-soft p-4 lg:order-1 lg:items-center lg:justify-center lg:gap-12 lg:p-10">
            {t.items.map((item) => (
              <div
                key={item.label}
                className="flex w-full flex-col items-start gap-2 lg:w-auto lg:items-center"
              >
                <dt className="whitespace-nowrap text-xl font-bold text-cta lg:text-headline">{item.value}</dt>
                <dd className="w-full text-base font-medium leading-normal text-ink lg:w-auto lg:text-center lg:text-xl">
                  {item.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </Container>
    </section>
  );
}
