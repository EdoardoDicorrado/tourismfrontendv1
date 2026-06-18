import Image from "next/image";

import type { MeetingPoint as MeetingPointData } from "@/data/product";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/** "Punto di incontro" — static map + open-in-maps link. Figma 64:10544. */
export function MeetingPoint({ data, dict }: { data: MeetingPointData; dict: Dictionary }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{dict.product.meetingPoint}</h2>
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
    </section>
  );
}
