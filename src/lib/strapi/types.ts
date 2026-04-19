// Strapi response types

export type Locale = 'en' | 'id';

export interface StrapiImage {
  id: number;
  url: string;
  width: number;
  height: number;
  alternativeText?: string | null;
  formats?: {
    thumbnail?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
  };
}

export interface StrapiTag {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface StrapiAuthor {
  id: number;
  documentId: string;
  name: string;
  bio?: string;
  avatar?: StrapiImage | null;
  socials?: {
    instagram?: string;
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface StrapiArticle {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string; // Markdown content
  publishedAt: string;
  updatedAt: string;
  locale: Locale;
  localizations?: Array<{
    id: number;
    documentId: string;
    locale: Locale;
    slug: string;
  }>;
  cover?: StrapiImage | null;
  tags?: StrapiTag[];
  author?: StrapiAuthor | null;
  featured?: boolean;
  entryNumber?: number; // e.g., 001, 002, 003
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, never>;
}
