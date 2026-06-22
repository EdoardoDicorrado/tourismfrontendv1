import Image from "next/image";

import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Assistenza" — support section on the product page.
 *
 * Mobile (Figma 64:10517): compact soft panel — title + 24/7 copy + full-width cta.
 * Desktop (Figma 221:7755 "Promo"): horizontal banner — gecko illustration on the
 * left (418×350) + content on the right (title 40px, body 24px, auto-width cta),
 * bg soft, rounded-panel, gap-40. Mirrors the home `SupportBanner` desktop layout.
 * A cta separator sits below it (16px above/below) like the other editorial dividers.
 */
export function ProductSupport({ dict }: { dict: Dictionary }) {
  const [bodyBefore, bodyAfter] = dict.support.body.split("{hours}");

  return (
    <section className="border-b border-cta py-4">
      {/* Mobile = pannello compatto (congelato). Desktop = banner orizzontale con
          illustrazione gecko a sinistra (lg:p-0 toglie il padding del pannello,
          il gap-10 e il box illustrazione danno il respiro). */}
      <div className="overflow-clip rounded-panel bg-soft p-4 lg:flex lg:items-center lg:gap-10 lg:p-0">
        {/* Illustrazione gecko: SOLO desktop (Figma 221:7756, 418×350). Mobile invariato. */}
        <div className="relative hidden h-[350px] w-[418px] shrink-0 items-center justify-center lg:flex">{/* ds-guard-ignore: box illustrazione Figma desktop 418x350, nessun token */}
          <Image
            src="/images/support-illustration.svg"
            alt=""
            width={341}
            height={300}
            className="h-full w-auto object-contain"
          />
        </div>

        <div className="flex flex-col gap-4 lg:flex-1 lg:py-8 lg:pr-10">
          <h2 className="text-xl font-extrabold text-ink sm:text-2xl lg:text-[33px] lg:font-bold">{dict.support.shortTitle}</h2>{/* ds-guard-ignore: titolo Figma desktop 40px, fuori type-scale */}
          <p className="text-base font-medium leading-6 text-ink lg:text-xl">
            {bodyBefore}
            <strong className="font-extrabold">{dict.support.hours}</strong>
            {bodyAfter}
          </p>
          <Button type="button" fullWidth className="gap-2.5 lg:w-auto lg:self-start">
            {dict.support.cta}
            <Image src="/images/icon-chat-round-dots.svg" alt="" width={25} height={25} />
          </Button>
        </div>
      </div>
    </section>
  );
}
