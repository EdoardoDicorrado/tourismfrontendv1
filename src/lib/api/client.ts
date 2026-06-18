import "server-only";

import { getBackendApiUrl } from "@/lib/env";
import type { Locale } from "@/lib/i18n/config";

/** Error thrown when the backend responds with a non-2xx status. */
export class BackendError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: unknown,
  ) {
    super(message);
    this.name = "BackendError";
  }
}

export interface BackendFetchOptions extends Omit<RequestInit, "body"> {
  /** Path relative to BACKEND_API_URL, e.g. "/health" or "/api/storefront/products". */
  path: string;
  /** Bearer token for an authenticated customer/session call. */
  token?: string;
  /** JSON-serializable request body (sets Content-Type automatically). */
  body?: unknown;
  /**
   * Active UI locale. Forwarded as `Accept-Language` so the backend can return
   * per-locale content (product texts, etc. — the storefront's source of truth).
   */
  locale?: Locale;
}

/**
 * Typed fetch wrapper for the tatanka3 Laravel backend.
 *
 * Server-only: keeps auth tokens out of the browser. The backend is the single
 * source of truth — this client only reads, and writes go through the backend's
 * own endpoints (it is the only writer for orders/bookings).
 *
 * Note (Next.js 16): `fetch` is NOT cached by default. We default to
 * `no-store`; pass `cache`/`next` explicitly to opt into caching per call.
 */
export async function backendFetch<T = unknown>({
  path,
  token,
  body,
  locale,
  headers,
  cache,
  ...init
}: BackendFetchOptions): Promise<T> {
  const base = getBackendApiUrl();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...init,
    cache: cache ?? "no-store",
    headers: {
      Accept: "application/json",
      ...(locale ? { "Accept-Language": locale } : {}),
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const text = await res.text();
  const data = text ? safeJsonParse(text) : null;

  if (!res.ok) {
    throw new BackendError(`Backend responded ${res.status} for ${path}`, res.status, data);
  }

  return data as T;
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
