import { NextResponse } from "next/server";

import { BackendError, backendFetch } from "@/lib/api/client";

/**
 * Smoke test for the frontend → backend wiring.
 *
 * Hits the Laravel backend's JSON healthcheck (`/health`) through the
 * server-only API client. Visit `/api/backend-health` to confirm the
 * BACKEND_API_URL connection works end-to-end.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const backend = await backendFetch({ path: "/health" });
    return NextResponse.json({ ok: true, backend });
  } catch (err) {
    if (err instanceof BackendError) {
      return NextResponse.json(
        { ok: false, status: err.status, body: err.body },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
