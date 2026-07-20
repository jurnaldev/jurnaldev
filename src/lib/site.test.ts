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
    const { SITE_URL, articleUrl } = await import("./site")
    expect(SITE_URL).toBe("https://example.com")
    expect(articleUrl("artikel-id")).toBe(
      "https://example.com/jurnal/artikel-id",
    )
  })
})
