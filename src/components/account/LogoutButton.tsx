"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Locale } from "@/lib/i18n/config";

/**
 * Logout control for the account sidebar. POSTs to the logout BFF (which clears
 * the httpOnly cookie) then client-navigates to the customer login. We can't let
 * the fetch follow a server redirect (it wouldn't change the browser URL), so we
 * push the route after a successful response. `router.refresh()` drops the now
 * stale server-rendered session UI.
 *
 * `useState` for the in-flight flag, handler on `onClick` (no setState-in-effect
 * — React Compiler is on).
 */
export function LogoutButton({ lang, label }: { lang: Locale; label: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Best-effort: even if the request fails, send the user back to login.
    }
    router.push(`/${lang}/area/accedi`);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="w-full rounded-[10px] border border-stroke px-4 py-2.5 text-sm font-bold text-ink transition-colors hover:border-cta hover:text-cta disabled:opacity-60"
    >
      {label}
    </button>
  );
}
