import { articlePath, projectPath, type Locale } from "@/lib/i18n/routing"

const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jurnal.dev"

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function articleUrl(locale: Locale, slug: string): string {
  return absoluteUrl(articlePath(locale, slug))
}

export function projectUrl(locale: Locale, slug: string): string {
  return absoluteUrl(projectPath(locale, slug))
}
