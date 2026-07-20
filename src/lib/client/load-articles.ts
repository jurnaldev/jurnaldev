import type { StrapiArticleSummary } from "@/lib/strapi/types"

export class ArticlesLoadError extends Error {}

export async function loadArticles(
  url: string,
  signal: AbortSignal,
): Promise<StrapiArticleSummary[]> {
  const response = await fetch(url, { signal })
  if (!response.ok) {
    throw new ArticlesLoadError("Articles are temporarily unavailable")
  }
  const data = (await response.json()) as { articles?: StrapiArticleSummary[] }
  return data.articles ?? []
}
