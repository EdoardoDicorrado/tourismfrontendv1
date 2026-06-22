"use client";

import "flag-icons/css/flag-icons.min.css";

import { useMemo, useState } from "react";

import { Popover } from "@/components/ui/Popover";
import { countryName } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";

/** Countries we serve first — drive the phone prefix + invoice country selectors. */
export const COUNTRY_CODES = ["IT", "ES", "MX", "AR", "CO", "CL", "PE", "BR", "FR", "DE", "GB", "US", "PT"];

/** International dial codes, keyed by the country codes above.
 *  ponytail: solo i mercati serviti; per altri paesi basta aggiungere code+dial qui. */
export const DIAL: Record<string, string> = {
  IT: "+39", ES: "+34", MX: "+52", AR: "+54", CO: "+57", CL: "+56", PE: "+51",
  BR: "+55", FR: "+33", DE: "+49", GB: "+44", US: "+1", PT: "+351",
};

function Flag({ code }: { code: string }) {
  return (
    <span
      aria-hidden
      className={`fi fis fi-${code.toLowerCase()} h-[18px] w-[18px] shrink-0 rounded-full ring-1 ring-black/10`}
    />
  );
}

function Caret({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
    >
      <path d="M1 1.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const optionClass = (active: boolean) =>
  `flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-soft ${
    active ? "font-bold text-cta" : "font-medium text-ink"
  }`;

/**
 * Phone dial-prefix selector — Figma checkout (node 221:96). Trigger = current flag +
 * dial code; the panel (language-selector styling) has a search that matches country
 * name OR dial digits, then lists flag · name · dial. Tap an entry to pick its prefix.
 */
export function PhonePrefixSelect({
  value,
  onChange,
  lang,
  searchPlaceholder,
  noResults,
}: {
  value: string;
  onChange: (code: string) => void;
  lang: Locale;
  searchPlaceholder: string;
  noResults: string;
}) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const needle = q.trim().toLowerCase().replace(/^\+/, "");
    if (!needle) return COUNTRY_CODES;
    return COUNTRY_CODES.filter((code) => {
      const name = countryName(code, lang).toLowerCase();
      const dial = (DIAL[code] ?? "").replace("+", "");
      return name.includes(needle) || dial.startsWith(needle) || dial.includes(needle);
    });
  }, [q, lang]);

  return (
    <Popover
      animated
      align="start"
      className="relative shrink-0"
      panelClassName="w-[clamp(240px,80vw,300px)] overflow-hidden rounded-xl border border-soft-grey bg-white text-ink shadow-popover"
      label={searchPlaceholder}
      trigger={({ open, toggle, id }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={id}
          className="flex h-11 shrink-0 items-center gap-2 rounded-badge border border-ink px-2 text-ink"
        >
          <Flag code={value} />
          <span className="text-base font-medium">{DIAL[value] ?? ""}</span>
          <Caret open={open} />
        </button>
      )}
    >
      {({ close }) => (
        <div>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full border-b border-soft-grey px-4 py-2.5 text-sm text-ink outline-none placeholder:text-ink/40"
          />
          <ul role="menu" className="max-h-64 overflow-y-auto py-1">
            {results.length === 0 ? (
              <li className="px-4 py-3 text-sm text-ink/50">{noResults}</li>
            ) : (
              results.map((code) => (
                <li key={code} role="none">
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={code === value}
                    onClick={() => {
                      onChange(code);
                      setQ("");
                      close();
                    }}
                    className={optionClass(code === value)}
                  >
                    <Flag code={code} />
                    <span className="flex-1 truncate">{countryName(code, lang)}</span>
                    <span className="text-xs font-semibold text-ink/60">{DIAL[code]}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </Popover>
  );
}

/**
 * Invoice country selector — dropdown styled like the language switcher (Popover
 * menu, flag · name), inside a trigger that matches the other checkout fields
 * (bordered box, label that turns cta on focus).
 */
export function CountrySelect({
  id,
  label,
  value,
  onChange,
  lang,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
  lang: Locale;
}) {
  return (
    <Popover
      animated
      align="stretch"
      className="group relative flex w-full flex-col gap-1 rounded-card border border-ink p-2 transition-colors focus-within:border-cta"
      panelClassName="overflow-hidden rounded-xl border border-soft-grey bg-white text-ink shadow-popover"
      labelledBy={id}
      trigger={({ open, toggle, id: panelId }) => (
        <>
          <span id={id} className="text-xs font-bold text-ink transition-colors group-focus-within:text-cta">
            {label}
          </span>
          <button
            type="button"
            onClick={toggle}
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-center gap-3 bg-transparent text-left text-base font-medium leading-[22px] text-ink outline-none"
          >
            <Flag code={value} />
            <span className="flex-1 truncate">{countryName(value, lang)}</span>
            <Caret open={open} />
          </button>
        </>
      )}
    >
      {({ close }) => (
        <ul role="menu" className="max-h-64 overflow-y-auto py-1">
          {COUNTRY_CODES.map((code) => (
            <li key={code} role="none">
              <button
                type="button"
                role="menuitemradio"
                aria-checked={code === value}
                onClick={() => {
                  onChange(code);
                  close();
                }}
                className={optionClass(code === value)}
              >
                <Flag code={code} />
                <span className="flex-1 truncate">{countryName(code, lang)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  );
}
