import { describe, expect, it, vi } from "vitest"
import { handleArticlesRequest } from "./articles-handler"

describe("handleArticlesRequest", () => {
  it("returns validated articles", async () => {
    const fetcher = vi.fn().mockResolvedValue([{ id: 1, slug: "one" }])
    const response = await handleArticlesRequest(
      new Request("https://example.com/api/articles?locale=id&limit=3"),
      fetcher,
    )
    expect(response.status).toBe(200)
    expect(fetcher).toHaveBeenCalledWith("id", {
      limit: 3,
      featured: false,
    })
  })

  it("returns a stable validation response", async () => {
    const response = await handleArticlesRequest(
      new Request("https://example.com/api/articles?locale=fr"),
    )
    expect(response.status).toBe(400)
    expect(await response.json()).toMatchObject({
      articles: [],
      error: { code: "INVALID_LOCALE" },
    })
  })

  it("sanitizes CMS failures", async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error("secret cms endpoint"))
    const response = await handleArticlesRequest(
      new Request("https://example.com/api/articles"),
      fetcher,
    )
    const text = await response.text()
    expect(response.status).toBe(503)
    expect(text).toContain("CMS_UNAVAILABLE")
    expect(text).not.toContain("secret cms endpoint")
  })
})
