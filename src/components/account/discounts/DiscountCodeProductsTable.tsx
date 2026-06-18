import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { DiscountCodeProduct } from "@/lib/account/types";

/**
 * Products a discount code applies to, rendered as responsive cards (no real
 * `<table>` in the repo): product name + status pill. Read-only.
 *
 * When the offer has no product scope it applies to ALL the agency's products —
 * the backend signals this with `all_products: true` and an empty list, which we
 * surface as a single informational banner (`allProducts`) instead of rows.
 */
export function DiscountCodeProductsTable({
  rows,
  allProducts,
  dict,
}: {
  rows: DiscountCodeProduct[];
  allProducts: boolean;
  dict: Dictionary["account"]["discountCodeProducts"];
}) {
  if (allProducts) {
    return (
      <p className="rounded-[15px] border border-dashed border-stroke bg-soft/40 px-5 py-4 text-sm text-ink/70">
        {dict.allProducts}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-[15px] border border-soft-grey bg-white px-5 py-4"
        >
          <span className="font-bold text-ink">{row.name ?? "—"}</span>
          {row.status ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-soft px-3 py-1 text-xs font-semibold text-ink">
              <span className="text-ink/60">{dict.colStatus}:</span>
              {row.status}
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
