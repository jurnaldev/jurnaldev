import { NextRequest } from "next/server"
import { handleArticlesRequest } from "@/lib/api/articles-handler"

export function GET(request: NextRequest) {
  return handleArticlesRequest(request)
}
