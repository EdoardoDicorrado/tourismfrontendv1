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
 * "Perché scegliere Tourismotion?" — four benefit cards in a mobile
 * horizontal scroller plus the "Unisciti al team" CTA pointing to the careers
 * page. Figma nodes 447:1284 / 447:1318.
 */
export function WhyChooseUs({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.about.why;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink">{t.title}</h2>

        <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-4 px-4 pb-1">
          {t.items.map((item, i) => (
            <li
              key={item.title}
              className="flex w-[267px] shrink-0 snap-start flex-col gap-6 overflow-hidden rounded-card bg-soft p-4"
            >
              <Image
                src={ICONS[i]}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="h-[42px] w-[42px]"
              />
              <div className="flex flex-col gap-2 text-ink">
                <h3 className="text-base font-semibold leading-normal">{item.title}</h3>
                <p className="text-sm font-medium leading-normal">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <ButtonLink href={`/${lang}/lavora-con-noi`} size="lg" fullWidth className="mt-6">
          {dict.about.cta}
        </ButtonLink>
      </Container>
    </section>
  );
}
