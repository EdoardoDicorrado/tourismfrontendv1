import { fieldInputClass } from "@/components/account/ui";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

/**
 * Filter form for the discount-code list: two text inputs (code + name) that
 * submit a GET to the same route, mirroring the `/cerca` search-form pattern.
 * Server component (no client state) — the submitted query string drives the
 * server-side filtering in `getDiscountCodes`. `defaultValue` keeps the current
 * filters visible after navigation. Submitting resets pagination (no `page`
 * field), matching the backend's filter-then-paginate behaviour.
 */
export function DiscountCodesSearch({
  action,
  code,
  name,
  dict,
}: {
  action: string;
  code: string;
  name: string;
  dict: Dictionary["account"]["discountCodes"];
}) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <label htmlFor="dc-code" className="mb-1 block text-sm font-bold text-ink">
          {dict.searchCode}
        </label>
        <input
          id="dc-code"
          name="code"
          type="text"
          defaultValue={code}
          className={fieldInputClass}
        />
      </div>
      <div className="flex-1">
        <label htmlFor="dc-name" className="mb-1 block text-sm font-bold text-ink">
          {dict.searchName}
        </label>
        <input
          id="dc-name"
          name="name"
          type="text"
          defaultValue={name}
          className={fieldInputClass}
        />
      </div>
      <Button type="submit" size="md">
        {dict.search}
      </Button>
    </form>
  );
}
