import type { BrowserData } from "@/lib/checkout/types";

/**
 * Collect the EMV3DS browser data the Redsys 3DS2 authentication leg requires.
 *
 * Runs in the browser at authorize time (navigator/screen reflect the cardholder
 * environment). `browserAcceptHeader` is intentionally omitted here — JS cannot
 * read its own HTTP Accept header, so the BFF fills it from the request.
 *
 * See the backend `AuthorizationService` (sdkParams.browser whitelist) and
 * issue tatanka3-8t62.
 */

/** EMV3DS-allowed colour depths (bits); screen.colorDepth (e.g. 30) is clamped down. */
const ALLOWED_COLOR_DEPTHS = [48, 32, 24, 16, 15, 8, 4, 1];

function nearestColorDepth(depth: number): number {
  return ALLOWED_COLOR_DEPTHS.find((allowed) => depth >= allowed) ?? 24;
}

export function collectBrowserData(): BrowserData {
  const screen = typeof window !== "undefined" ? window.screen : undefined;

  return {
    // No 3DSMethod fingerprint iframe is run → completion indicator "N".
    threeDSCompInd: "N",
    browserJavaEnabled:
      typeof navigator.javaEnabled === "function" ? navigator.javaEnabled() : false,
    browserJavascriptEnabled: true,
    browserLanguage: navigator.language || "en",
    browserColorDepth: String(nearestColorDepth(screen?.colorDepth ?? 24)),
    browserScreenHeight: String(screen?.height ?? 0),
    browserScreenWidth: String(screen?.width ?? 0),
    browserTZ: String(new Date().getTimezoneOffset()),
    browserUserAgent: navigator.userAgent,
  };
}
