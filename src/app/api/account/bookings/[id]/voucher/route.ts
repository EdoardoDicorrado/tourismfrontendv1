import { NextResponse } from "next/server";

import { getSession } from "@/lib/account/session";
import { getBackendApiUrl } from "@/lib/env";

const BASE = "/api/storefront/v1";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let upstream: Response;
  try {
    const url = `${getBackendApiUrl()}${BASE}/account/bookings/${encodeURIComponent(id)}/voucher.pdf`;
    upstream = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/pdf",
        Authorization: `Bearer ${session.token}`,
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "voucher_failed" }, { status: 502 });
  }

  if (!upstream.ok) {
    if (upstream.status === 401) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
    if (upstream.status === 403) {
      return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
    }
    if (upstream.status === 404) {
      return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ ok: false, error: "voucher_failed" }, { status: 502 });
  }

  if (!upstream.body) {
    return NextResponse.json({ ok: false, error: "voucher_failed" }, { status: 502 });
  }

  const headers = new Headers({
    "Cache-Control": "no-store",
    "Content-Type": upstream.headers.get("content-type") ?? "application/pdf",
    "X-Content-Type-Options": "nosniff",
  });
  const disposition = upstream.headers.get("content-disposition");
  if (disposition) headers.set("Content-Disposition", disposition);
  const length = upstream.headers.get("content-length");
  if (length) headers.set("Content-Length", length);

  return new Response(upstream.body, { status: 200, headers });
}
