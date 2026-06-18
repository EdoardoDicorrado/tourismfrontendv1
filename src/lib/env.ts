import "server-only";

/**
 * Server-only environment access.
 *
 * The frontend is a pure API client of the tatanka3 Laravel backend; the
 * backend URL must never be exposed to the browser, so it is intentionally
 * NOT a `NEXT_PUBLIC_*` variable. Client components reach the backend through
 * our own route handlers (`src/app/api/...`), never directly.
 */
export function getBackendApiUrl(): string {
  const url = process.env.BACKEND_API_URL;
  if (!url) {
    throw new Error(
      "BACKEND_API_URL is not set. Copy .env.example to .env.local and fill it in.",
    );
  }
  // Normalize: drop a trailing slash so callers can pass "/path" safely.
  return url.replace(/\/+$/, "");
}
