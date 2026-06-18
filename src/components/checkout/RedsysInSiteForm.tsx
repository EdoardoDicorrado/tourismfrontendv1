"use client";

import Script from "next/script";
import { useEffect, useRef } from "react";

import type { RedsysInSiteSession } from "@/lib/checkout/types";

/**
 * Redsys InSite hosted card form. This is the one piece that *must* run in the
 * browser: the SDK renders Redsys-hosted iframes for PAN/expiry/CVV, so the card
 * number never touches our servers (PCI SAQ-A). On "pay" it posts back a single-use
 * `idOper` token, which the parent sends to `/api/checkout/payment/authorize`.
 *
 * SDK contract verified in `docs/redsys-insite-sandbox-test.html`:
 *   getInSiteForm(id, estiloBoton, estiloBody, estiloCaja, estiloInputs, textoBoton,
 *                 fuc, terminal, order, idioma, mostrarLogo)
 *   storeIdOper(event, tokenFieldId, errFieldId, merchantValidation) → writes the
 *     idOper into #tokenFieldId (or an errorCode into #errFieldId).
 */

declare global {
  interface Window {
    getInSiteForm?: (
      id: string,
      estiloBoton: string,
      estiloBody: string,
      estiloCaja: string,
      estiloInputs: string,
      textoBoton: string,
      fuc: string,
      terminal: string,
      order: string,
      idioma: string,
      mostrarLogo: boolean,
    ) => void;
    storeIdOper?: (
      event: MessageEvent,
      tokenFieldId: string,
      errFieldId: string,
      merchantValidation: () => boolean,
    ) => void;
  }
}

const CARD_FORM_ID = "tm-redsys-card-form";
const TOKEN_ID = "tm-redsys-token";
const ERROR_ID = "tm-redsys-error";

export function RedsysInSiteForm({
  session,
  payButtonLabel,
  onToken,
  onError,
}: {
  session: RedsysInSiteSession;
  payButtonLabel: string;
  onToken: (idOper: string) => void;
  onError: (code: string) => void;
}) {
  const mountedRef = useRef(false);
  const tokenRef = useRef<HTMLInputElement>(null);
  const errorRef = useRef<HTMLInputElement>(null);

  // Keep the latest callbacks in a ref so the message subscription can stay
  // mounted once (empty deps) without going stale across parent re-renders.
  const handlersRef = useRef({ onToken, onError });
  useEffect(() => {
    handlersRef.current = { onToken, onError };
  });

  function mountForm() {
    if (mountedRef.current || typeof window.getInSiteForm !== "function") return;
    mountedRef.current = true;
    // amount is bound server-side at authorize; the form only needs fuc/terminal/order.
    window.getInSiteForm(
      CARD_FORM_ID,
      "",
      "",
      "",
      "",
      payButtonLabel,
      session.merchantCode,
      session.terminal,
      session.merchantOrder,
      session.idioma,
      true,
    );
  }

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof window.storeIdOper !== "function") return;
      // We have no own fields to validate → always approve; the SDK then emits idOper.
      window.storeIdOper(event, TOKEN_ID, ERROR_ID, () => true);
      const code = errorRef.current?.value;
      const idOper = tokenRef.current?.value;
      if (code && code !== "0") {
        errorRef.current!.value = "";
        handlersRef.current.onError(code);
      } else if (idOper) {
        tokenRef.current!.value = "";
        handlersRef.current.onToken(idOper);
      }
    }

    window.addEventListener("message", handleMessage);
    // SDK may already be loaded from a previous mount — mount now; otherwise the
    // <Script> onLoad below handles the cold case. Both go through the mount guard.
    mountForm();
    return () => window.removeEventListener("message", handleMessage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script src={session.sdkUrl} strategy="afterInteractive" onLoad={mountForm} />
      <div id={CARD_FORM_ID} className="min-h-[64px]" />
      <input ref={tokenRef} type="hidden" id={TOKEN_ID} readOnly />
      <input ref={errorRef} type="hidden" id={ERROR_ID} readOnly />
    </>
  );
}
