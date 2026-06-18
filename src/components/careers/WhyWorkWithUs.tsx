import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Perché lavorare con noi" — intro copy, a team image and the "Cosa offriamo"
 * benefit list. Figma node 447:1466.
 */
export function WhyWorkWithUs({ dict }: { dict: Dictionary }) {
  const t = dict.careers.why;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>
            {t.body.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-ink/90">
                {paragraph}
              </p>
            ))}

            <div className="mt-2">
              <h3 className="border-b border-ink pb-2 text-xl font-extrabold text-ink">
                {t.offerTitle}
              </h3>
              <ul className="mt-4 flex flex-col gap-3">
                {t.offer.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-base text-ink/90">
                    <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cta" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="order-first lg:order-none lg:sticky lg:top-8">
            <div className="relative h-56 overflow-hidden rounded-[15px] sm:h-72 lg:h-[440px]">
              <Image
                src="/images/card-tour-guidato.png"
                alt={t.imageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
