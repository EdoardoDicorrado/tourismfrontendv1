import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** Icon per benefit card, matched by index to `about.why.items`. */
const ICONS = [
  "/images/icon-star.svg",
  "/images/icon-walking.svg",
  "/images/icon-flexibility.svg",
  "/images/icon-support.svg",
];

/**
 * "Perché scegliere Tourismotion?" — four benefit cards plus the "Unisciti al
 * team" CTA pointing to the careers page. Figma nodes 447:1284 / 447:1318.
 */
export function WhyChooseUs({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const t = dict.about.why;
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.title}</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.items.map((item, i) => (
            <div key={item.title} className="flex flex-col gap-4 rounded-[10px] bg-soft p-5">
              <Image src={ICONS[i]} alt="" width={42} height={42} unoptimized className="h-10 w-10" />
              <div className="mt-auto">
                <h3 className="font-semibold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm text-ink/80">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <ButtonLink href={`/${lang}/lavora-con-noi`} size="lg">
            {dict.about.cta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
