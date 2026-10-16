import { ATTRIBUTION_STORAGE_KEY, classifyAttribution, sanitizeAttribution } from "./attribution";

export type ConversionEvent = "quote_click" | "email_click" | "phone_click" | "whatsapp_click" | "inquiry_success";

type Metrica = ((...args: unknown[]) => void) & { a?: unknown[][]; l?: number };

/** Uses the site's existing counter. Never include form fields or contact details. */
export function trackConversion(event: ConversionEvent, productId?: string) {
  if (typeof window === "undefined") return;
  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID?.trim();
  if (!counterId || !/^\d+$/.test(counterId)) return;

  try {
    const params: Record<string, string> = {
      page_path: window.location.pathname,
      locale: window.location.pathname.split("/")[1] || "en",
    };
    if (productId && /^\d+$/.test(productId)) params.product_id = productId;

    try {
      const raw = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      const attribution = sanitizeAttribution(raw ? JSON.parse(raw) : null);
      if (attribution) {
        params.source_channel = classifyAttribution(attribution).channel;
        params.landing_page = new URL(attribution.landingPage, window.location.origin).pathname;
      }
    } catch {
      // Blocked storage must not prevent conversion tracking or form submission.
    }

    const target = window as Window & { ym?: Metrica };
    if (!target.ym) {
      const queue: Metrica = (...args) => { (queue.a ??= []).push(args); };
      queue.l = Date.now();
      target.ym = queue;
    }
    target.ym(Number(counterId), "reachGoal", event, params);
  } catch {
    // Analytics is best-effort and must never interrupt an inquiry.
  }
}
