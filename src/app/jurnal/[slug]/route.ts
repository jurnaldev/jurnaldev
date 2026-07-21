import { type NextRequest, NextResponse } from "next/server"

import { resolveLegacySlug } from "@/lib/i18n/legacy-redirect"
import { fetchArticleBySlug } from "@/lib/strapi"
import { articleUrl } from "@/lib/site"

interface LegacyArticleRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  { params }: LegacyArticleRouteContext,
) {
  const { slug } = await params
  const resolved = await resolveLegacySlug(slug, fetchArticleBySlug)
  if (!resolved) return new NextResponse(null, { status: 404 })

  return NextResponse.redirect(articleUrl(resolved.locale, resolved.slug), 308)
}
