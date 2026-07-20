import { type NextRequest, NextResponse } from "next/server"

import { resolveLegacySlug } from "@/lib/i18n/legacy-redirect"
import { projectPath } from "@/lib/i18n/routing"
import { fetchProjectBySlug } from "@/lib/strapi"

interface LegacyProjectRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(
  request: NextRequest,
  { params }: LegacyProjectRouteContext,
) {
  const { slug } = await params
  const resolved = await resolveLegacySlug(slug, fetchProjectBySlug)
  if (!resolved) return new NextResponse(null, { status: 404 })

  const target = request.nextUrl.clone()
  target.pathname = projectPath(resolved.locale, resolved.slug)
  return NextResponse.redirect(target, 308)
}
