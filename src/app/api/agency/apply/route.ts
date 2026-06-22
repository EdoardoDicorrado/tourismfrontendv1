import { NextResponse, type NextRequest } from "next/server";

import { isNonEmptyString } from "@/lib/validation";

/**
 * Agency partnership LEAD (`POST /api/agency/apply`) — a candidatura, NOT an
 * account: an operator follows up. Distinct from `/auth/agency/signup`, which
 * creates a full account (email/password/billing).
 *
 * Body: `{ agencyName, vat, city, firstName, lastName, country?, phone, message?,
 * gdpr, locale? }`. No storefront lead endpoint is defined yet (CLAUDE.md), so this
 * validates and accepts in PREVIEW (the staff notification is backend-side). When
 * the endpoint lands, forward the lead from here — the wizard reads `{ ok }` and
 * won't change.
 */

export const dynamic = "force-dynamic";

const REQUIRED = ["agencyName", "vat", "city", "firstName", "lastName", "phone"] as const;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  for (const key of REQUIRED) {
    if (!isNonEmptyString(data[key])) {
      return NextResponse.json({ ok: false, error: `missing_${key}` }, { status: 422 });
    }
  }
  if (data.gdpr !== true) {
    return NextResponse.json({ ok: false, error: "gdpr_required" }, { status: 422 });
  }

  // TODO(backend): forward the lead to the staff-notification endpoint (shape TBD)
  // and return its result. Until then accept it (preview) so the wizard confirms.
  return NextResponse.json({ ok: true });
}
