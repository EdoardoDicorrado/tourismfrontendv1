"use client";

import { useEffect, useRef } from "react";

/**
 * 3DS2 challenge frame. When the bank requires Strong Customer Authentication, the
 * authorize response carries the ACS URL + challenge request (`creq`). Per the EMV
 * 3DS spec the browser must POST `creq` to the ACS inside an iframe, where the bank
 * renders its challenge UI (OTP, app approval, …). The cardholder completes it there;
 * the ACS then posts `cres` server-side to our `/payments/redsys/3ds-callback` leg.
 *
 * This component only mounts the iframe and auto-submits the POST once. The parent
 * (`CheckoutView`) polls `/api/checkout/payment/status` for the final outcome — the
 * `cres` return-leg never reaches the browser.
 */

const ACS_FRAME_NAME = "tm-redsys-acs";

export function RedsysChallengeFrame({
  acsURL,
  creq,
  sessionData,
}: {
  acsURL: string;
  creq: string;
  /** Optional `threeDSSessionData` echoed back by the ACS (opaque to us). */
  sessionData?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    // Submit exactly once: the ACS expects a single POST to start the challenge.
    if (submittedRef.current || !acsURL || !creq) return;
    submittedRef.current = true;
    formRef.current?.submit();
  }, [acsURL, creq]);

  return (
    <div className="mt-3">
      <form ref={formRef} method="POST" action={acsURL} target={ACS_FRAME_NAME} className="hidden">
        <input type="hidden" name="creq" value={creq} readOnly />
        {sessionData ? (
          <input type="hidden" name="threeDSSessionData" value={sessionData} readOnly />
        ) : null}
      </form>
      <iframe
        name={ACS_FRAME_NAME}
        title="3-D Secure"
        className="h-[420px] w-full rounded-[10px] border border-stroke bg-white"
      />
    </div>
  );
}
