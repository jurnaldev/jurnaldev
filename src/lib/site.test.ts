import { describe, expect, it, vi } from "vitest"

describe("site URL", () => {
  it("defaults to the production origin", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "")
    vi.resetModules()
    const { SITE_URL } = await import("./site")
    expect(SITE_URL).toBe("https://jurnal.dev")
  })

  it("removes a configured trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/")
    vi.resetModules()
    const { SITE_URL, absoluteUrl, articleUrl, projectUrl } = await import(
      "./site"
    )
    expect(SITE_URL).toBe("https://example.com")
    expect(absoluteUrl("/id/jurnal/artikel-id")).toBe(
      "https://example.com/id/jurnal/artikel-id",
    )
    expect(articleUrl("id", "artikel id")).toBe(
      "https://example.com/id/jurnal/artikel%20id",
    )
    expect(projectUrl("en", "project one")).toBe(
      "https://example.com/en/portfolio/project%20one",
    )
  })
})
