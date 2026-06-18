import { fieldInputClass } from "@/components/account/ui";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Free-text search over the booking code. Implemented as a plain GET form (no
 * client JS needed): submitting navigates to `action?q=…`, which the bookings
 * page reads from `searchParams`. The current `tab` is preserved via a hidden
 * field so search stays inside the active tab. Server component.
 */
export function BookingSearch({
  action,
  q,
  tab,
  dict,
}: {
  /** Form target, e.g. `/it/area/prenotazioni`. */
  action: string;
  q: string;
  tab: string;
  dict: Dictionary["account"];
}) {
  return (
    <form action={action} method="get" className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="tab" value={tab} />
      <input
        type="search"
        name="q"
        defaultValue={q}
        placeholder={dict.bookings.searchPlaceholder}
        aria-label={dict.bookings.searchPlaceholder}
        className={`${fieldInputClass} max-w-[360px] flex-1`}
      />
      <Button type="submit" size="sm">
        {dict.bookings.search}
      </Button>
    </form>
  );
}
