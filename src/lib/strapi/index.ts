import type {
  Locale,
  StrapiArticle,
  StrapiArticleSummary,
  StrapiProject,
  StrapiLandingPage,
  StrapiSocialLink,
} from "./types"
import * as client from "./client"
import * as mock from "./mock"
import { getStrapiMode } from "./policy"

const STRAPI_MODE = getStrapiMode({
  NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
  STRAPI_MOCK_FALLBACK: process.env.STRAPI_MOCK_FALLBACK,
})

async function fromSource<T>(
  mockRead: () => T,
  strapiRead: () => Promise<T>,
): Promise<T> {
  if (STRAPI_MODE === "mock") return mockRead()
  try {
    return await strapiRead()
  } catch (error) {
    if (STRAPI_MODE === "strapi-with-fallback") {
      console.warn(
        "[strapi] request failed; explicit mock fallback enabled",
        error,
      )
      return mockRead()
    }
    throw error
  }
}

function applyProjectOptions(
  projects: StrapiProject[],
  options?: { limit?: number; featured?: boolean },
): StrapiProject[] {
  let result = options?.featured ? projects.filter((p) => p.featured) : projects
  if (options?.limit != null) result = result.slice(0, options.limit)
  return result
}

export async function fetchArticles(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiArticleSummary[]> {
  const readMock = () => {
    let articles = mock.getMockArticleSummaries(locale)
    if (options?.featured) articles = articles.filter((a) => a.featured)
    if (options?.limit) articles = articles.slice(0, options.limit)
    return articles
  }
  return fromSource(readMock, () => client.getArticles(locale, options))
}

export async function fetchArticleBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiArticle | null> {
  return fromSource(
    () => mock.getMockArticleBySlug(slug, locale),
    () => client.getArticleBySlug(slug, locale),
  )
}

export async function fetchRelatedArticles(
  currentSlug: string,
  tagIds: number[],
  locale: Locale = "en",
  limit = 3,
): Promise<StrapiArticleSummary[]> {
  return fromSource(
    () =>
      mock
        .getMockArticleSummaries(locale)
        .filter(
          (a) =>
            a.slug !== currentSlug &&
            a.tags?.some((t) => tagIds.includes(t.id)),
        )
        .slice(0, limit),
    () => client.getRelatedArticles(currentSlug, tagIds, locale, limit),
  )
}

export async function fetchAllSlugs(): Promise<
  Array<{ slug: string; locale: Locale }>
> {
  return fromSource(
    () => mock.mockArticles.map((a) => ({ slug: a.slug, locale: a.locale })),
    () => client.getAllSlugs(),
  )
}

export async function fetchProjects(
  locale: Locale = "en",
  options?: { limit?: number; featured?: boolean },
): Promise<StrapiProject[]> {
  return fromSource(
    () => applyProjectOptions(mock.getMockProjects(locale), options),
    () => client.getProjects(locale, options),
  )
}

export async function fetchProjectBySlug(
  slug: string,
  locale: Locale = "en",
): Promise<StrapiProject | null> {
  return fromSource(
    () => mock.getMockProjectBySlug(slug, locale),
    () => client.getProjectBySlug(slug, locale),
  )
}

export async function fetchAllProjectSlugs(): Promise<
  Array<{ slug: string; locale: Locale }>
> {
  return fromSource(
    () => mock.mockProjects.map((p) => ({ slug: p.slug, locale: p.locale })),
    () => client.getAllProjectSlugs(),
  )
}

export async function fetchLandingPage(
  locale: Locale = "en",
): Promise<StrapiLandingPage> {
  return fromSource(
    () => mock.getMockLandingPage(locale),
    () => client.getLandingPage(locale),
  )
}

export async function fetchSocialLinks(): Promise<StrapiSocialLink[]> {
  return fromSource(
    () => mock.getMockSocialLinks(),
    () => client.getSocialLinks(),
  )
}

export { strapiMediaUrl } from "./client"
