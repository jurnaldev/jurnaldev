// Strapi response types

export type Locale = "en" | "id"

export interface StrapiImage {
  id: number
  url: string
  width: number
  height: number
  alternativeText?: string | null
  formats?: {
    thumbnail?: { url: string; width: number; height: number }
    small?: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
    large?: { url: string; width: number; height: number }
  }
}

export interface StrapiTag {
  id: number
  documentId: string
  name: string
  slug: string
}

export interface StrapiAuthor {
  id: number
  documentId: string
  name: string
  bio?: string
  avatar?: StrapiImage | null
  socials?: {
    instagram?: string
    twitter?: string
    github?: string
    linkedin?: string
  }
}

export interface StrapiArticle {
  id: number
  documentId: string
  slug: string
  title: string
  excerpt: string
  body: string // Markdown content
  publishedAt: string
  updatedAt: string
  locale: Locale
  localizations?: Array<{
    id: number
    documentId: string
    locale: Locale
    slug: string
  }>
  cover?: StrapiImage | null
  tags?: StrapiTag[]
  author?: StrapiAuthor | null
  featured?: boolean
  entryNumber?: number // e.g., 001, 002, 003
}

export interface StrapiListResponse<T> {
  data: T[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

export interface StrapiSingleResponse<T> {
  data: T
  meta: Record<string, never>
}

// --- Landing page (single type) ---

export interface StrapiSectionLabels {
  about: string
  journal: string
  lab: string
  connect: string
}

export interface StrapiEmptyState {
  title: string
  desc: string
  cta?: string
  ctaHref?: string
}

export interface StrapiSeo {
  metaTitle: string
  metaDescription: string
  keywords?: string
  ogImage?: StrapiImage | null
}

export interface StrapiLandingPage {
  id: number
  documentId: string
  locale: Locale
  role: string
  location: string
  tagline: string
  displayName: string
  handle: string
  statusDot: boolean
  about: string // markdown
  currentlyLabel: string
  currentlyValue: string
  stackLabel: string
  stackValue: string
  labCaption: string
  footer: string
  built: string
  sections: StrapiSectionLabels
  journalEmpty: StrapiEmptyState
  journalViewAll: string
  avatar?: StrapiImage | null
  seo?: StrapiSeo | null
}

export type SocialIcon =
  | "instagram"
  | "linkedin"
  | "github"
  | "twitter"
  | "email"
  | "rss"

export interface StrapiSocialLink {
  id: number
  documentId: string
  name: string
  href: string
  order: number
  enabled: boolean
  icon?: SocialIcon | null
}
