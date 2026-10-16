"use client";

import { useEffect } from "react";
import { trackConversion, type ConversionEvent } from "@/lib/conversions";

export default function ConversionTracking() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      const url = new URL(link.href, window.location.origin);
      let goal: ConversionEvent | undefined;
      if (url.protocol === "mailto:") goal = "email_click";
      else if (url.protocol === "tel:") goal = "phone_click";
      else if (["wa.me", "api.whatsapp.com", "web.whatsapp.com"].includes(url.hostname)) goal = "whatsapp_click";
      else if (url.origin === window.location.origin && /^\/(en|ru|es)\/contact\/?$/.test(url.pathname)) goal = "quote_click";
      if (goal) trackConversion(goal, url.searchParams.get("product") ?? undefined);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
