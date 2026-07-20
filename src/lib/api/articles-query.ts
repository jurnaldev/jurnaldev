import type { Locale } from "@/lib/strapi/types"

export type ArticlesQueryErrorCode = "INVALID_LOCALE" | "INVALID_LIMIT"

export interface ArticlesQuery {
  locale: Locale
  limit?: number
  featured: boolean
}

export class ArticlesQueryError extends Error {
  constructor(
    public code: ArticlesQueryErrorCode,
    message: string,
  ) {
    super(message)
    this.name = "ArticlesQueryError"
  }
}

export function parseArticlesQuery(params: URLSearchParams): ArticlesQuery {
  const rawLocale = params.get("locale") ?? "en"
  if (rawLocale !== "en" && rawLocale !== "id") {
    throw new ArticlesQueryError("INVALID_LOCALE", "locale must be en or id")
  }

  const rawLimit = params.get("limit")
  let limit: number | undefined
  if (rawLimit !== null) {
    limit = Number(rawLimit)
    if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
      throw new ArticlesQueryError(
        "INVALID_LIMIT",
        "limit must be an integer from 1 to 50",
      )
    }
  }

  return {
    locale: rawLocale,
    limit,
    featured: params.get("featured") === "true",
  }
}
