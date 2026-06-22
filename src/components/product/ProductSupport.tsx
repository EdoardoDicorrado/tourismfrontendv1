import Image from "next/image";

import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Assistenza" — support section on the product page (Figma 64:10517). A soft
 * panel (#def3fb, rounded-panel, p-16): title + 24/7 copy + full-width cta
 * "Ottieni supporto". NOT an accordion — it's always shown (static). A cta
 * (#007CA2) separator sits below it (between this section and "Punto di
 * incontro"), with 16px above/below like the other section dividers.
 *
 * Distinct from the home `SupportBanner` (teal gecko banner): the product page
 * uses this compact soft panel inline among the editorial sections.
 */
export function ProductSupport({ dict }: { dict: Dictionary }) {
  const [bodyBefore, bodyAfter] = dict.support.body.split("{hours}");

  return (
    <section className="border-b border-cta py-4">
      <div className="flex flex-col gap-4 rounded-panel bg-soft p-4">
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">{dict.support.shortTitle}</h2>
        <p className="text-base font-medium leading-6 text-ink">
          {bodyBefore}
          <strong className="font-extrabold">{dict.support.hours}</strong>
          {bodyAfter}
        </p>
        <Button type="button" fullWidth className="gap-2.5">
          {dict.support.cta}
          <Image src="/images/icon-chat-round-dots.svg" alt="" width={25} height={25} />
        </Button>
      </div>
    </section>
  );
}
