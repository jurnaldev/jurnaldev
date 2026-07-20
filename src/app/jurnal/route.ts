import { type NextRequest, NextResponse } from "next/server"

import { journalPath } from "@/lib/i18n/routing"

export function GET(request: NextRequest) {
  const target = request.nextUrl.clone()
  target.pathname = journalPath("en")
  return NextResponse.redirect(target, 308)
}
