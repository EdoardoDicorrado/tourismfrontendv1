"use client";

import { useState } from "react";

import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/lib/i18n/dictionaries";

const inputClass =
  "w-full rounded-[10px] border border-stroke bg-white px-4 py-3 text-ink outline-none transition-colors focus:border-cta";

/**
 * Customer sign-in form. The storefront auth API on tatanka3 does not exist yet
 * (see CLAUDE.md), so this is a UI-only preview: every action surfaces the
 * "coming soon" notice instead of authenticating. Wire it to a BFF route under
 * `src/app/api/auth` once customer auth lands with the backend.
 */
export function LoginForm({ dict }: { dict: Dictionary["auth"] }) {
  const [notice, setNotice] = useState(false);

  function preview(e: React.FormEvent) {
    e.preventDefault();
    setNotice(true);
  }

  return (
    <form onSubmit={preview} className="flex flex-col gap-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-bold text-ink">
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder={dict.emailPlaceholder}
          className={inputClass}
        />
      </div>

      <div>
        <div className="mb-1 flex items-baseline justify-between gap-2">
          <label htmlFor="password" className="block text-sm font-bold text-ink">
            {dict.password}
          </label>
          <button
            type="button"
            onClick={() => setNotice(true)}
            className="text-sm font-semibold text-cta hover:underline"
          >
            {dict.forgot}
          </button>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder={dict.passwordPlaceholder}
          className={inputClass}
        />
      </div>

      <Button type="submit" size="md" fullWidth className="mt-2">
        {dict.submit}
      </Button>

      {notice && (
        <p role="status" className="rounded-[10px] bg-soft p-4 text-center text-sm text-ink/70">
          {dict.soon}
        </p>
      )}

      <p className="text-center text-sm text-ink/70">
        {dict.noAccount}{" "}
        <button
          type="button"
          onClick={() => setNotice(true)}
          className="font-bold text-cta hover:underline"
        >
          {dict.register}
        </button>
      </p>
    </form>
  );
}
