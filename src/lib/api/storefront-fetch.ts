import "server-only";

import { backendFetch, BackendError } from "@/lib/api/client";
import type { Locale } from "@/lib/i18n/config";

/**
 * Shared low-level helpers for the storefront READ seams (catalog + availability).
 * Both proxy GETs to tatanka3 and must degrade to `null` on a missing/undeployed
 * endpoint (404, expected on prod) or an unreachable backend, so callers fall back
 * to fixtures/placeholders. Kept here so the two seams can't drift.
 */

/** Build a `?a=b&…` query string, dropping empty/undefined values. */
export function query(params: Record<string, string | undefined>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(key, value);
  }
  const s = sp.toString();
  return s ? `?${s}` : "";
}

/**
 * A `tryFetch` bound to a seam `label` (used only in the single warning logged for
 * 5xx/network — 404s stay quiet). Returns `null` on ANY backend/network failure so
 * the caller can fall back gracefully.
 */
export function makeTryFetch(label: string) {
  return async function tryFetch<T>(path: string, locale: Locale): Promise<T | null> {
    try {
      return await backendFetch<T>({ path, locale });
    } catch (err) {
      // 404 = endpoint not deployed (expected on prod): quiet. 5xx/network: one warning.
      if (!(err instanceof BackendError) || err.status >= 500) {
        console.warn(`[${label}] ${path} unavailable, falling back:`, String(err));
      }
      return null;
    }
  };
}
