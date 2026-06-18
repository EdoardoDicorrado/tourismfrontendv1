import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Numeri che raccontano la nostra storia" — banner image and the key stats.
 * Figma node 447:1265.
 */
export function AboutStats({ dict }: { dict: Dictionary }) {
  const t = dict.about.stats;
  return (
    <section className="bg-soft/40 py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>

        <div className="relative mt-6 h-48 overflow-hidden rounded-[15px] sm:h-64">
          <Image
            src="/images/card-tour-guidato.png"
            alt={t.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <dl className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {t.items.map((item) => (
            <div key={item.label}>
              <dt className="text-xl font-bold text-cta sm:text-2xl">{item.value}</dt>
              <dd className="mt-1 text-base text-ink/80">{item.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
