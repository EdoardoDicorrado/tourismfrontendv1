import Image from "next/image";

import { Container } from "@/components/ui/Container";
import type { AgenciesCopy } from "@/lib/i18n/dictionaries/agencies";

/** Benefit-card icon per item, matched by index to `benefits.items`. */
const ICONS = [
  "/images/icon-catalogo.svg",
  "/images/icon-tour-e-guide.svg",
  "/images/icon-tariffe-prenotazioni.svg",
  "/images/icon-assistenza-supporto.svg",
];

/** "Perché collaborare con Tourismotion?" — 4 benefit cards, horizontal scroll. Figma 447:2767. */
export function AgenciesBenefits({ t }: { t: AgenciesCopy }) {
  return (
    <section className="py-4">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.benefits.title}</h2>

        {/* Same slider pattern as home Reviews: scroll-snap on mobile (cards inset
            16px via -mx-4/px-4 so neither edge touches and the next peeks),
            static grid on sm+. */}
        <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {t.benefits.items.map((item, i) => (
            <li key={item.title} className="w-[267px] shrink-0 snap-start sm:w-auto">
              <article className="flex h-full flex-col items-start gap-4 rounded-card bg-soft p-4">
                <Image
                  src={ICONS[i]}
                  alt=""
                  width={42}
                  height={42}
                  unoptimized
                  className="h-[42px] w-[42px]"
                />
                <div className="flex flex-col gap-2">
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="text-sm font-medium text-ink">{item.body}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
