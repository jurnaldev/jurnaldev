import { type NextRequest, NextResponse } from "next/server"

import { portfolioPath } from "@/lib/i18n/routing"

export function GET(request: NextRequest) {
  const target = request.nextUrl.clone()
  target.pathname = portfolioPath("en")
  return NextResponse.redirect(target, 308)
}
