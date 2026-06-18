"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

import { Popover } from "@/components/ui/Popover";
import {
  LOCALE_LABELS,
  LOCALE_SHORT,
  locales,
  withLocale,
  type Locale,
} from "@/lib/i18n/config";

const COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Persist the choice so `proxy.ts` honors it on the next visit. */
function persistLocale(locale: Locale) {
  document.cookie = `${COOKIE}=${locale}; path=/; max-age=${ONE_YEAR}`;
}

/**
 * Locale switcher. Navigates to the same page under the chosen locale prefix and
 * persists the choice in the NEXT_LOCALE cookie (read by `proxy.ts` on future
 * visits). Two looks: `header` (compact, on white) and `footer` (boxed, on cta).
 */
export function LanguageSwitcher({
  current,
  variant = "header",
}: {
  current: Locale;
  variant?: "header" | "footer";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(locale: Locale, close: () => void) {
    close();
    if (locale === current) return;
    persistLocale(locale);
    startTransition(() => router.push(withLocale(pathname, locale)));
  }

  return (
    <Popover
      animated
      align={variant === "header" ? "end" : "stretch"}
      className={variant === "footer" ? "relative w-full" : "relative"}
      panelClassName="min-w-[180px] overflow-hidden rounded-xl border border-soft-grey bg-white py-1 text-ink shadow-lg"
      trigger={({ open, toggle, id }) =>
        variant === "header" ? (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={id}
            disabled={isPending}
            className="flex h-11 w-11 items-center justify-center gap-2 text-cta disabled:opacity-60 sm:w-auto sm:px-1"
          >
            <Image src="/images/icon-language.svg" alt="" width={24} height={24} unoptimized />
            <span className="hidden text-sm font-semibold sm:inline">
              {LOCALE_SHORT[current]} / EUR
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={id}
            disabled={isPending}
            className="flex w-full items-center justify-between rounded-[10px] bg-white px-4 py-2.5 text-cta disabled:opacity-60"
          >
            <span className="font-semibold">{LOCALE_LABELS[current]}</span>
            <Image
              src="/images/icon-chevron-down.svg"
              alt=""
              width={16}
              height={10}
              className={open ? "rotate-180 transition-transform" : "transition-transform"}
            />
          </button>
        )
      }
    >
      {({ close }) => (
        <ul role="menu">
          {locales.map((locale) => {
            const active = locale === current;
            return (
              <li key={locale} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  onClick={() => choose(locale, close)}
                  className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-left text-sm hover:bg-soft ${
                    active ? "font-bold text-cta" : "font-medium text-ink"
                  }`}
                >
                  <span>{LOCALE_LABELS[locale]}</span>
                  <span className="text-xs font-semibold text-rate">{LOCALE_SHORT[locale]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Popover>
  );
}
