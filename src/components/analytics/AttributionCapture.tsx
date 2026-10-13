"use client";

import { useEffect } from "react";
import { ATTRIBUTION_STORAGE_KEY, type AttributionSnapshot } from "@/lib/attribution";

/** Stores the first-touch referrer / UTM / click id once per browser, for the contact form to send along. */
export default function AttributionCapture() {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)) return;
      const params = new URLSearchParams(window.location.search);
      const referrer = document.referrer && !document.referrer.includes(window.location.host) ? document.referrer : "";
      const snapshot: AttributionSnapshot = {
        referrer,
        landingPage: window.location.pathname,
        utmSource: params.get("utm_source") ?? "",
        utmMedium: params.get("utm_medium") ?? "",
        utmCampaign: params.get("utm_campaign") ?? "",
        clickId: params.get("gclid") ?? params.get("yclid") ?? params.get("msclkid") ?? "",
        firstSeen: new Date().toISOString(),
      };
      window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // Storage blocked (private mode, disabled cookies): attribution is best-effort.
    }
  }, []);

  return null;
}
