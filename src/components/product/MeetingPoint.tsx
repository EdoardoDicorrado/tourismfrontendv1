import Image from "next/image";

import { Disclosure } from "@/components/ui/Disclosure";
import type { MeetingPoint as MeetingPointData } from "@/data/product";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * "Punto di incontro" accordion (Figma 64:10548): collapsible section with a
 * chevron, static map and open-in-maps link, and a cta (#007CA2) separator below
 * (the line above comes from the previous accordion's `border-b`). `divided={false}`
 * + own `border-b border-cta` so we colour the line without touching the primitive.
 */
export function MeetingPoint({ data, dict }: { data: MeetingPointData; dict: Dictionary }) {
  return (
    <Disclosure
      defaultOpen
      divided={false}
      className="border-b border-cta"
      summary={<h2 className="text-xl font-extrabold text-ink sm:text-2xl">{dict.product.meetingPoint}</h2>}
    >
      <div className="flex flex-col gap-3">
        <p className="text-base text-ink/80">{data.text}</p>

        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[15px] border border-stroke-2">
          <Image src={data.mapImage} alt={dict.product.mapAlt} fill sizes="(max-width: 1024px) 100vw, 760px" className="object-cover" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <Image src="/images/icon-map-pin.svg" alt="" width={48} height={48} />
          </span>
        </div>

        <a
          href={data.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 self-start text-sm font-bold text-cta"
        >
          <Image src="/images/icon-map-open.svg" alt="" width={20} height={20} />
          {dict.product.openInMaps}
        </a>
      </div>
    </Disclosure>
  );
}
