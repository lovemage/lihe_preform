import type { AdminLocale } from "@/lib/admin/locales";

export type LocalizedText = Partial<Record<AdminLocale, string>>;

export type ProductTranslationInput = {
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
};

export type ProductRecord = {
  id: number;
  slug: string;
  categoryKey: string;
  status: string;
  sortOrder: number;
  thumbnailMediaId: number | null;
  translations: Partial<Record<AdminLocale, ProductTranslationInput>>;
  gallery: Array<{
    mediaId: number;
    sortOrder: number;
    isPrimary: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type MediaRecord = {
  id: number;
  r2Key: string;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  originalFilename: string;
  createdAt: string;
  updatedAt: string;
  alt: Partial<Record<AdminLocale, string>>;
};

export type HomeContentRecord = {
  locale: AdminLocale;
  content: Record<string, unknown>;
  updatedAt: string;
};
