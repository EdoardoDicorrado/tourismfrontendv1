import Image from "next/image";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Hai bisogno di una mano?" support CTA. Figma node 447:911.
 * A 10px-radius card: a teal banner with the gecko mascot on top, then a
 * soft-blue panel with the heading, body and a FULL-WIDTH teal "Ottieni
 * supporto" button (Bold 16px white + chat glyph).
 */
export function SupportBanner({ dict }: { dict: Dictionary }) {
  const [bodyBefore, bodyAfter] = dict.support.body.split("{hours}");

  return (
    <section className="border-b border-soft-grey py-3 sm:py-6">
      <Container>
        <div className="overflow-clip rounded-card lg:flex lg:items-center lg:gap-10 lg:rounded-panel lg:bg-soft">
          <div className="relative flex h-[214px] items-center justify-center overflow-clip bg-cta lg:h-[350px] lg:w-[418px] lg:shrink-0 lg:bg-transparent">{/* ds-guard-ignore: box illustrazione Figma desktop 418x350, nessun token */}
            <span aria-hidden className="absolute h-[265px] w-[265px] rounded-full bg-white/10 lg:hidden" />{/* ds-guard-ignore: cerchio decorativo mobile 265px, nessun token */}
            <Image
              src="/images/support-illustration.svg"
              alt=""
              width={341}
              height={300}
              className="relative h-full w-auto object-contain"
            />
          </div>

          <div className="flex flex-col gap-4 bg-soft p-4 lg:flex-1 lg:bg-transparent lg:p-0">
            <h2 className="text-2xl font-extrabold text-ink lg:text-3xl lg:font-bold">{dict.support.title}</h2>
            <p className="text-sm font-medium text-ink lg:text-lg">
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
      </Container>
    </section>
  );
}
