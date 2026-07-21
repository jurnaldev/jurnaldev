import { NextResponse } from "next/server"
import { homePath } from "@/lib/i18n/routing"
import { absoluteUrl } from "@/lib/site"

export function GET() {
  return NextResponse.redirect(absoluteUrl(homePath("en")), 308)
}
