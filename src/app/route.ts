import { type NextRequest, NextResponse } from "next/server"

import { homePath } from "@/lib/i18n/routing"

export function GET(request: NextRequest) {
  const target = request.nextUrl.clone()
  target.pathname = homePath("en")
  return NextResponse.redirect(target, 308)
}
