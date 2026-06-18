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
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      <ul className="flex flex-col gap-2">
        {data.items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-base text-ink/80">
            <Mark included={included} />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function Mark({ included }: { included: boolean }) {
  return included ? (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M4 10.5l3.5 3.5 8.5-8.5" stroke="#007ca2" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mt-0.5 shrink-0" aria-hidden>
      <path d="M5 5l10 10M15 5L5 15" stroke="#91a0b7" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
