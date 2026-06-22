import Image from "next/image";

import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Locale } from "@/lib/i18n/config";
import type { AffiliatesCopy } from "@/lib/i18n/dictionaries/affiliates";

/** Audience-chip icon per item, matched by index to `audience.items`. From Figma 447:3685. */
const ICONS = [
  "/images/affiliati/aud-blogger.svg",
  "/images/affiliati/aud-creator.svg",
  "/images/affiliati/aud-influencer.svg",
  "/images/affiliati/aud-portali.svg",
  "/images/affiliati/aud-community.svg",
];

/** "A chi è rivolto?" — audience chips + the "Diventa affiliato" CTA. Figma 447:3683. */
export function AffiliatesAudience({ lang, t }: { lang: Locale; t: AffiliatesCopy }) {
  return (
    <section className="py-4">
      <Container className="flex flex-col gap-4">
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{t.audience.title}</h2>
        <ul className="grid grid-cols-2 gap-4">
          {t.audience.items.map((item, i) => (
            <li key={item} className="flex items-center gap-2 rounded-card bg-soft p-4 last:col-span-2">
              <Image
                src={ICONS[i]}
                alt=""
                width={42}
                height={42}
                unoptimized
                className="h-[42px] w-[42px] shrink-0"
              />
              <span className="text-base font-extrabold leading-tight text-ink">{item}</span>
            </li>
          ))}
        </ul>
        <ButtonLink href={`/${lang}/partner/affiliati/candidati`} size="lg" fullWidth>
          {t.hero.cta}
        </ButtonLink>
      </Container>
    </section>
  );
}
