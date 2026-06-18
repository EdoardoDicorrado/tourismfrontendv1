import { NextResponse, type NextRequest } from "next/server";

import { getPaymentInfo, updatePaymentInfo } from "@/lib/account/client";
import { getSession } from "@/lib/account/session";
import type { PaymentInfoPatch } from "@/lib/account/types";

/**
 * Agency payment BFF — read / update the agency's billing + payout details
 * (VAT/tax + identity document, PayPal, bank transfer coordinates).
 *
 * READ masks the sensitive fields (IBAN, account, identity, paypal — last 4
 * only). On PATCH we send cleartext write-only: an OMITTED field is left
 * unchanged upstream, and the backend also treats an empty string as "leave
 * unchanged" (so a masked placeholder the user never edits is a no-op).
 * `guarantees`/`deposit` are READ-ONLY (admin-managed) and never patched.
 *
 * Auth: agency session from the httpOnly cookie; its bearer token is forwarded
 * to `@/lib/account/client` → `backendFetch` (single writer) with a mandatory
 * `Idempotency-Key`.
 */

export const dynamic = "force-dynamic";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const BANK_FIELDS = [
  "beneficiary",
  "iban",
  "account_number",
  "bank_name",
  "swift",
  "aba",
  "address",
  "city",
  "country_alpha2",
  "intermediary",
] as const;

const TOP_LEVEL_FIELDS = [
  "vat_id",
  "tax_code",
  "identity_document_type",
  "identity_document_number",
  "identity_document_country_alpha2",
  "paypal_email",
  "paypal_country_alpha2",
] as const;

function buildPatch(data: Record<string, unknown>): PaymentInfoPatch {
  const patch: PaymentInfoPatch = {};

  for (const key of TOP_LEVEL_FIELDS) {
    const v = asString(data[key]);
    if (v !== undefined) patch[key] = v;
  }

  const bankRaw = (data.bank_transfer ?? {}) as Record<string, unknown>;
  const bank: NonNullable<PaymentInfoPatch["bank_transfer"]> = {};
  for (const key of BANK_FIELDS) {
    const v = asString(bankRaw[key]);
    if (v !== undefined) bank[key] = v;
  }
  if (Object.keys(bank).length) patch.bank_transfer = bank;

  return patch;
}

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  try {
    const payment = await getPaymentInfo(session.token);
    return NextResponse.json({ ok: true, payment });
  } catch {
    return NextResponse.json({ ok: false, error: "payment_failed" }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "agency") {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  // Empty string = "leave unchanged" upstream, so only validate a non-blank value.
  const paypalEmail = asString(data.paypal_email);
  if (
    paypalEmail !== undefined &&
    paypalEmail !== "" &&
    !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(paypalEmail)
  ) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 422 });
  }

  const patch = buildPatch(data);

  try {
    const payment = await updatePaymentInfo(patch, session.token);
    return NextResponse.json({ ok: true, payment });
  } catch {
    return NextResponse.json({ ok: false, error: "payment_failed" }, { status: 502 });
  }
}
