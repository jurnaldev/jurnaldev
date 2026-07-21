import { type NextRequest, NextResponse } from "next/server"

import { resolveLegacySlug } from "@/lib/i18n/legacy-redirect"
import { fetchProjectBySlug } from "@/lib/strapi"
import { projectUrl } from "@/lib/site"

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

  return NextResponse.redirect(projectUrl(resolved.locale, resolved.slug), 308)
}
