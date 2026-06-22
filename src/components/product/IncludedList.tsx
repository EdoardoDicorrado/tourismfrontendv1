import { Disclosure } from "@/components/ui/Disclosure";
import type { IncludedList as IncludedListData } from "@/data/product";

/**
 * "Cosa è incluso / Cosa non è incluso" — ONE accordion section (Figma 64:10481):
 * the heading (20px) + chevron, then the included list (green ✓) and, 16px below,
 * the "Cosa non è incluso" sub-heading (16px extrabold, no own chevron) + excluded
 * list (red ✗). A single cta (#007CA2) separator under the whole block.
 * `divided={false}` + own `border-b border-cta` so we colour the line without
 * touching the `Disclosure` primitive. Internal spacing = 16px (Figma gap-[16px]).
 */
export function IncludedList({
  included,
  notIncluded,
  includedTitle,
  notIncludedTitle,
}: {
  included: IncludedListData;
  notIncluded?: IncludedListData;
  includedTitle: string;
  notIncludedTitle: string;
}) {
  return (
    <Disclosure
      defaultOpen
      divided={false}
      className="border-b border-cta"
      summary={<h2 className="text-xl font-extrabold text-ink sm:text-2xl lg:text-3xl">{includedTitle}</h2>}
    >
      <div className="flex flex-col gap-4">
        <ul className="flex flex-col gap-1">
          {included.items.map((item, i) => (
            <li
              key={`inc-${i}-${item}`}
              className="flex items-center gap-2 text-sm font-medium leading-6 text-ink"
            >
              <Mark included />
              {item}
            </li>
          ))}
        </ul>

        {notIncluded && notIncluded.items.length > 0 && (
          <>
            <h3 className="text-base font-extrabold text-ink">{notIncludedTitle}</h3>
            <ul className="flex flex-col gap-1">
              {notIncluded.items.map((item, i) => (
                <li
                  key={`exc-${i}-${item}`}
                  className="flex items-center gap-2 text-sm font-medium leading-6 text-ink"
                >
                  <Mark included={false} />
                  {item}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Disclosure>
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
