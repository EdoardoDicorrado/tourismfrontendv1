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
    <section className="py-4">
      <Container className="flex flex-col items-start gap-4">
        <h2 className="w-full text-2xl font-extrabold leading-normal text-ink">{t.title}</h2>

        <div className="relative h-[146px] w-full overflow-hidden rounded-[15px]">
          <Image
            src="/images/about-numeri.png"
            alt={t.imageAlt}
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <dl className="flex w-full flex-col items-start gap-4 rounded-[15px] bg-soft p-4">
          {t.items.map((item) => (
            <div key={item.label} className="flex w-full flex-col items-start gap-2">
              <dt className="whitespace-nowrap text-xl font-bold text-cta">{item.value}</dt>
              <dd className="w-full text-base font-medium leading-normal text-ink">{item.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
