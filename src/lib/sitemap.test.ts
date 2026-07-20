import { describe, expect, it, vi } from "vitest"
import { buildSitemapEntries } from "./sitemap"

describe("buildSitemapEntries", () => {
  it("includes static and deduplicated dynamic routes", async () => {
    const entries = await buildSitemapEntries(
      async () => [
        { slug: "one", locale: "en" },
        { slug: "one", locale: "id" },
      ],
      async () => [{ slug: "project", locale: "en" }],
    )
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://jurnal.dev/",
      "https://jurnal.dev/jurnal",
      "https://jurnal.dev/portfolio",
      "https://jurnal.dev/jurnal/one",
      "https://jurnal.dev/portfolio/project",
    ])
  })

  it("keeps static and successful sources when one loader fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const entries = await buildSitemapEntries(
      async () => {
        throw new Error("CMS down")
      },
      async () => [{ slug: "project", locale: "id" }],
    )
    expect(entries.map((entry) => entry.url)).toContain(
      "https://jurnal.dev/portfolio/project",
    )
    expect(entries).toHaveLength(4)
  })
})
