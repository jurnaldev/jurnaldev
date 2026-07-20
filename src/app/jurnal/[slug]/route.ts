import { type NextRequest, NextResponse } from "next/server"

import { resolveLegacySlug } from "@/lib/i18n/legacy-redirect"
import { articlePath } from "@/lib/i18n/routing"
import { fetchArticleBySlug } from "@/lib/strapi"

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

  const target = request.nextUrl.clone()
  target.pathname = articlePath(resolved.locale, resolved.slug)
  return NextResponse.redirect(target, 308)
}
