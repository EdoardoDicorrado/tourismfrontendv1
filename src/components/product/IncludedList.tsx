import type { IncludedList as IncludedListData } from "@/data/product";

/** "Cosa è incluso / non è incluso" checklist. Figma 64:10481 / 64:10517. */
export function IncludedList({
  data,
  included,
  title,
}: {
  data: IncludedListData;
  included: boolean;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className={`font-extrabold text-ink ${included ? "text-xl sm:text-2xl" : "text-base"}`}>
        {title}
      </h2>
      <ul className="flex flex-col gap-1">
        {data.items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm font-medium leading-6 text-ink">
            <Mark included={included} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Figma 64:10489/10504: filled dot — green (#238D00) included, dark red (#8D0000) excluded. */
function Mark({ included }: { included: boolean }) {
  return (
    <span
      className={`h-[11px] w-[11px] shrink-0 rounded-full ${included ? "bg-[#238D00]" : "bg-[#8D0000]"}`}
      aria-hidden
    />
  );
}
