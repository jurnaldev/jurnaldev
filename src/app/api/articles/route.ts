import { NextRequest, NextResponse } from "next/server"
import { fetchArticles } from "@/lib/strapi"
import type { Locale } from "@/lib/strapi/types"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const locale = (searchParams.get("locale") || "en") as Locale
  const limit = searchParams.get("limit")
  const featured = searchParams.get("featured") === "true"

  try {
    const articles = await fetchArticles(locale, {
      limit: limit ? Number(limit) : undefined,
      featured,
    })
    return NextResponse.json({ articles })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    return NextResponse.json(
      { articles: [], error: message },
      { status: 200 }, // Return empty list gracefully
    )
  }
}
