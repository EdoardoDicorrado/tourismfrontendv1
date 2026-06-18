import Image from "next/image";

import { formatDateLong, formatMoney } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { CartItem } from "@/lib/cart/types";

/**
 * Read-only list of booked items, shared by the cart and checkout summary.
 * Pass `onRemove` to show a remove action (cart); omit it for a static summary.
 */
export function OrderItems({
  items,
  lang,
  dict,
  onRemove,
  compact = false,
}: {
  items: CartItem[];
  lang: Locale;
  dict: Dictionary;
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <ul className="flex flex-col divide-y divide-soft-grey">
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
          {item.image && (
            <span
              className={`relative shrink-0 overflow-hidden rounded-[10px] ${
                compact ? "h-16 w-16" : "h-20 w-20 sm:h-24 sm:w-24"
              }`}
            >
              <Image src={item.image} alt="" fill sizes="96px" className="object-cover" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            <p className="font-bold leading-snug text-ink">{item.title}</p>
            <p className="text-sm text-ink/70">{item.optionTitle}</p>
            <p className="mt-1 text-sm text-ink/70">
              {dict.cart.dateLabel}:{" "}
              <span className="font-semibold text-ink">{formatDateLong(item.date, lang)}</span>
              {"  ·  "}
              {dict.cart.timeLabel}: <span className="font-semibold text-ink">{item.slot}</span>
            </p>
            <p className="mt-1 text-sm text-ink/60">
              {item.lines.map((l) => `${l.qty} ${l.label}`).join("  ·  ")}
            </p>
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="mt-1.5 text-sm font-bold text-badge hover:underline"
              >
                {dict.cart.remove}
              </button>
            )}
          </div>
          <p className="shrink-0 font-extrabold text-ink">{formatMoney(item.total, lang)}</p>
        </li>
      ))}
    </ul>
  );
}
