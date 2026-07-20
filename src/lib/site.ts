const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://jurnal.dev"

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "")

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`
}

export function articleUrl(slug: string): string {
  return absoluteUrl(`/jurnal/${slug}`)
}
