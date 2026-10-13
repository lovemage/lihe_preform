// First-touch source snapshot attached to contact enquiries, so leads from
// AI answer engines can be counted. Measured AI traffic is a lower bound:
// in-app browsers often send no referrer.

export const ATTRIBUTION_STORAGE_KEY = "lihe_first_touch";

export type AttributionSnapshot = {
  referrer: string;
  landingPage: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  clickId: string;
  firstSeen: string;
};

export type AttributionChannel = {
  channel: "ai" | "search" | "social" | "referral" | "campaign" | "direct";
  source: string;
};

const AI_SOURCES: [RegExp, string][] = [
  [/(^|\.)chatgpt\.com$|(^|\.)chat\.openai\.com$/, "ChatGPT"],
  [/(^|\.)perplexity\.ai$/, "Perplexity"],
  [/(^|\.)gemini\.google\.com$|(^|\.)bard\.google\.com$/, "Gemini"],
  [/(^|\.)copilot\.microsoft\.com$/, "Copilot"],
  [/(^|\.)claude\.ai$/, "Claude"],
  [/(^|\.)grok\.com$|(^|\.)x\.ai$/, "Grok"],
  [/(^|\.)chat\.deepseek\.com$/, "DeepSeek"],
  [/(^|\.)meta\.ai$/, "Meta AI"],
  [/(^|\.)you\.com$/, "You.com"],
];

const SEARCH_SOURCES = /(^|\.)(google|bing|yandex|duckduckgo|baidu|yahoo|ecosia|naver)\./;
const SOCIAL_SOURCES = /(^|\.)(linkedin|facebook|instagram|t\.co|twitter|x|youtube|vk|telegram|whatsapp)\./;

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return "";
  }
}

/** Order: AI engine (referrer or utm_source) > click id / UTM campaign > search > social > referral > direct. */
export function classifyAttribution(snapshot: Partial<AttributionSnapshot>): AttributionChannel {
  const host = hostOf(snapshot.referrer ?? "");
  const utm = (snapshot.utmSource ?? "").toLowerCase();

  for (const [pattern, name] of AI_SOURCES) {
    if ((host && pattern.test(host)) || (utm && pattern.test(utm))) return { channel: "ai", source: name };
  }
  if (utm === "chatgpt.com" || utm === "openai") return { channel: "ai", source: "ChatGPT" };
  if (snapshot.clickId || utm) return { channel: "campaign", source: utm || "click id" };
  if (host && SEARCH_SOURCES.test(`${host}.`)) return { channel: "search", source: host };
  if (host && SOCIAL_SOURCES.test(`${host}.`)) return { channel: "social", source: host };
  if (host && !host.endsWith("lihe-preform.com")) return { channel: "referral", source: host };
  return { channel: "direct", source: "(none)" };
}

/** Validates an untrusted snapshot from the browser: known keys only, strings capped at 300 chars. */
export function sanitizeAttribution(input: unknown): AttributionSnapshot | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const pick = (key: keyof AttributionSnapshot) =>
    typeof raw[key] === "string" ? (raw[key] as string).slice(0, 300) : "";
  return {
    referrer: pick("referrer"),
    landingPage: pick("landingPage"),
    utmSource: pick("utmSource"),
    utmMedium: pick("utmMedium"),
    utmCampaign: pick("utmCampaign"),
    clickId: pick("clickId"),
    firstSeen: pick("firstSeen"),
  };
}
