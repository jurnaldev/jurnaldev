import { fetchArticles } from "@/lib/strapi"
import { ArticlesQueryError, parseArticlesQuery } from "./articles-query"

type ArticleFetcher = typeof fetchArticles

export async function handleArticlesRequest(
  request: Request,
  fetcher: ArticleFetcher = fetchArticles,
): Promise<Response> {
  try {
    const query = parseArticlesQuery(new URL(request.url).searchParams)
    const articles = await fetcher(query.locale, {
      limit: query.limit,
      featured: query.featured,
    })
    return Response.json({ articles })
  } catch (error) {
    if (error instanceof ArticlesQueryError) {
      return Response.json(
        {
          articles: [],
          error: { code: error.code, message: error.message },
        },
        { status: 400 },
      )
    }
    console.error("[api/articles] CMS request failed", error)
    return Response.json(
      {
        articles: [],
        error: {
          code: "CMS_UNAVAILABLE",
          message: "Articles are temporarily unavailable",
        },
      },
      { status: 503 },
    )
  }
}
