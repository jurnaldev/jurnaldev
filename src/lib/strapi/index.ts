import type { Locale, StrapiArticle } from "./types"
import * as client from "./client"
import * as mock from "./mock"

const USE_MOCK = !process.env.NEXT_PUBLIC_STRAPI_URL

export async function fetchArticles(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiArticle[]> {
  if (USE_MOCK) {
    let articles = mock.getMockArticles(locale)
    if (options?.featured) articles = articles.filter((a) => a.featured)
    if (options?.limit) articles = articles.slice(0, options.limit)
    return articles
  }

  try {
    return await client.getArticles(locale, options)
  } catch (err) {
    console.warn("[strapi] fetchArticles failed, falling back to mock:", err)
    let articles = mock.getMockArticles(locale)
    if (options?.featured) articles = articles.filter((a) => a.featured)
    if (options?.limit) articles = articles.slice(0, options.limit)
    return articles
  }
}

export async function fetchArticleBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiArticle | null> {
  if (USE_MOCK) return mock.getMockArticleBySlug(slug, locale)

  try {
    return await client.getArticleBySlug(slug, locale)
  } catch (err) {
    console.warn(
      "[strapi] fetchArticleBySlug failed, falling back to mock:",
      err,
    )
    return mock.getMockArticleBySlug(slug, locale)
  }
}

export async function fetchRelatedArticles(
  currentSlug: string,
  tagIds: number[],
  locale: Locale = "en",
  limit = 3,
): Promise<StrapiArticle[]> {
  if (USE_MOCK) {
    return mock
      .getMockArticles(locale)
      .filter(
        (a) =>
          a.slug !== currentSlug && a.tags?.some((t) => tagIds.includes(t.id)),
      )
      .slice(0, limit)
  }

  try {
    return await client.getRelatedArticles(currentSlug, tagIds, locale, limit)
  } catch {
    return []
  }
}

export async function fetchAllSlugs(): Promise<
  Array<{ slug: string; locale: Locale }>
> {
  if (USE_MOCK) {
    return mock.mockArticles.map((a) => ({ slug: a.slug, locale: a.locale }))
  }

  try {
    return await client.getAllSlugs()
  } catch {
    return mock.mockArticles.map((a) => ({ slug: a.slug, locale: a.locale }))
  }
}

export { strapiMediaUrl } from "./client"
