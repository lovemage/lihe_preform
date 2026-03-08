export const ADMIN_LOCALES = ["en", "ru", "es"] as const;

export const PUBLISH_LOCALES = ["en", "ru"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];
export type PublishLocale = (typeof PUBLISH_LOCALES)[number];

export function isAdminLocale(value: string): value is AdminLocale {
  return ADMIN_LOCALES.includes(value as AdminLocale);
}

export function isPublishLocale(value: string): value is PublishLocale {
  return PUBLISH_LOCALES.includes(value as PublishLocale);
}
