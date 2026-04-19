import type {
  StrapiArticle,
  StrapiListResponse,
  StrapiSingleResponse,
  Locale,
} from "./types"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || ""

interface FetchOptions {
  next?: { revalidate?: number; tags?: string[] }
  cache?: RequestCache
}

async function strapiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${STRAPI_URL}/api${path}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (STRAPI_TOKEN) headers.Authorization = `Bearer ${STRAPI_TOKEN}`

  const res = await fetch(url, {
    headers,
    next: options.next ?? { revalidate: 60 }, // ISR: 60s default
    cache: options.cache,
  })

  if (!res.ok) {
    throw new Error(
      `Strapi fetch failed: ${res.status} ${res.statusText} — ${url}`,
    )
  }

  return res.json()
}

/**
 * Absolute URL for Strapi media (handles relative URLs from Strapi).
 */
export function strapiMediaUrl(url: string | undefined | null): string | null {
  if (!url) return null
  if (url.startsWith("http")) return url
  return `${STRAPI_URL}${url}`
}

// --- Article queries ---

export async function getArticles(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiArticle[]> {
  const params = new URLSearchParams({
    locale,
    "sort[0]": "publishedAt:desc",
    "populate[cover]": "true",
    "populate[tags]": "true",
    "populate[author][populate]": "avatar",
  })
  if (options?.limit) params.set("pagination[limit]", String(options.limit))
  if (options?.featured) params.set("filters[featured][$eq]", "true")

  const res = await strapiFetch<StrapiListResponse<StrapiArticle>>(
    `/articles?${params.toString()}`,
    { next: { revalidate: 60, tags: ["articles"] } },
  )
  return res.data
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiArticle | null> {
  const params = new URLSearchParams({
    locale,
    "filters[slug][$eq]": slug,
    "populate[cover]": "true",
    "populate[tags]": "true",
    "populate[author][populate]": "avatar",
    "populate[localizations]": "true",
  })

  const res = await strapiFetch<StrapiListResponse<StrapiArticle>>(
    `/articles?${params.toString()}`,
    { next: { revalidate: 60, tags: [`article:${slug}`] } },
  )
  return res.data[0] ?? null
}

export async function getRelatedArticles(
  currentSlug: string,
  tagIds: number[],
  locale: Locale = "en",
  limit = 3,
): Promise<StrapiArticle[]> {
  if (!tagIds.length) return []

  const params = new URLSearchParams({
    locale,
    "sort[0]": "publishedAt:desc",
    "populate[cover]": "true",
    "populate[tags]": "true",
    "filters[slug][$ne]": currentSlug,
    "pagination[limit]": String(limit),
  })
  tagIds.forEach((id, i) => {
    params.set(`filters[tags][id][$in][${i}]`, String(id))
  })

  const res = await strapiFetch<StrapiListResponse<StrapiArticle>>(
    `/articles?${params.toString()}`,
    { next: { revalidate: 300 } },
  )
  return res.data
}

export async function getAllSlugs(): Promise<
  Array<{ slug: string; locale: Locale }>
> {
  const result: Array<{ slug: string; locale: Locale }> = []

  for (const locale of ["en", "id"] as Locale[]) {
    try {
      const params = new URLSearchParams({
        locale,
        "fields[0]": "slug",
        "pagination[limit]": "1000",
      })
      const res = await strapiFetch<StrapiListResponse<{ slug: string }>>(
        `/articles?${params.toString()}`,
        { next: { revalidate: 300 } },
      )
      res.data.forEach((a) => result.push({ slug: a.slug, locale }))
    } catch {
      // Strapi offline — return empty so build doesn't fail
    }
  }

  return result
}
