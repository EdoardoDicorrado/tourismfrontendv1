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
        <div className="overflow-clip rounded-[10px]">
          <div className="relative flex h-[214px] items-center justify-center overflow-clip bg-cta">
            <span
              className="absolute h-[265px] w-[265px] rounded-full bg-white/10"
              aria-hidden
            />
            <Image
              src="/images/support-illustration.svg"
              alt=""
              width={341}
              height={300}
              className="relative h-full w-auto object-contain"
            />
          </div>

          <div className="flex flex-col gap-4 bg-soft p-4">
            <h2 className="text-2xl font-extrabold text-ink">{dict.support.title}</h2>
            <p className="text-sm font-medium text-ink">
              {bodyBefore}
              <strong className="font-extrabold">{dict.support.hours}</strong>
              {bodyAfter}
            </p>
            <Button type="button" fullWidth className="gap-2.5">
              {dict.support.cta}
              <Image src="/images/icon-chat-round-dots.svg" alt="" width={25} height={25} />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
