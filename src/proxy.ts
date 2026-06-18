import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, type Locale } from "@/lib/i18n/config";

/**
 * Locale routing (Next.js 16 renamed `middleware` → `proxy`).
 *
 * Every page lives under /[lang]. Requests without a locale prefix are
 * redirected to the best match: persisted cookie → Accept-Language → default.
 * The chosen locale is stored in NEXT_LOCALE so the choice sticks across visits.
 */

const COOKIE = "NEXT_LOCALE";
const ONE_YEAR = 60 * 60 * 24 * 365;

function detectLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (isLocale(cookie)) return cookie;

  const header = request.headers.get("accept-language");
  if (header) {
    for (const part of header.split(",")) {
      const tag = part.split(";")[0]?.trim().toLowerCase();
      const base = tag?.split("-")[0];
      if (isLocale(base)) return base;
    }
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const current = pathname.split("/")[1];

  // Already locale-prefixed → continue, refreshing the cookie if it drifted.
  if (isLocale(current)) {
    const response = NextResponse.next();
    if (request.cookies.get(COOKIE)?.value !== current) {
      response.cookies.set(COOKIE, current, { path: "/", maxAge: ONE_YEAR });
    }
    return response;
  }

  // No locale → redirect to the detected one, preserving the rest of the path.
  const locale = detectLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url);
  response.cookies.set(COOKIE, locale, { path: "/", maxAge: ONE_YEAR });
  return response;
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension (public assets).
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
