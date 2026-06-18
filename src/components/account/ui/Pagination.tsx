import Link from "next/link";

/**
 * Numbered, link-based pagination derived from the list `meta`
 * (`current_page`, `per_page`, `total`). Renders nothing when there is a single
 * page. The page number is set as a query param on `baseHref` — callers should
 * include any other active params (tab/q) in `baseHref` so they're preserved,
 * e.g. `baseHref="/it/area/prenotazioni?tab=current"` and `param="page"`.
 *
 * No client state; pure server component. Buttons reuse the outline-pill look
 * from the design system (active page = `bg-ink text-white` like an active chip).
 */
export interface PaginationProps {
  current_page: number;
  per_page: number;
  total: number;
  /** Base href; the page param is appended preserving existing query string. */
  baseHref: string;
  /** Query-param name for the page, defaults to "page". */
  param?: string;
  /** Accessible label for the nav landmark. */
  ariaLabel?: string;
}

function hrefWithPage(baseHref: string, param: string, page: number): string {
  const sep = baseHref.includes("?") ? "&" : "?";
  return `${baseHref}${sep}${param}=${page}`;
}

export function Pagination({
  current_page,
  per_page,
  total,
  baseHref,
  param = "page",
  ariaLabel = "Pagination",
}: PaginationProps) {
  const pageCount = per_page > 0 ? Math.ceil(total / per_page) : 0;
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
  const base =
    "flex h-10 min-w-10 items-center justify-center rounded-[10px] px-3 text-sm font-extrabold transition-colors";

  return (
    <nav aria-label={ariaLabel} className="mt-8 flex justify-center">
      <ul className="flex flex-wrap items-center gap-2">
        {pages.map((page) => {
          const on = page === current_page;
          return (
            <li key={page}>
              {on ? (
                <span aria-current="page" className={`${base} bg-ink text-white`}>
                  {page}
                </span>
              ) : (
                <Link
                  href={hrefWithPage(baseHref, param, page)}
                  className={`${base} border border-stroke text-ink hover:border-cta hover:text-cta`}
                >
                  {page}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
