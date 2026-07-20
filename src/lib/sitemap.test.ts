import { describe, expect, it, vi } from "vitest"
import { buildSitemapEntries } from "./sitemap"

describe("buildSitemapEntries", () => {
  it("includes only localized routes and groups translations by explicit identity", async () => {
    const entries = await buildSitemapEntries(
      async () => [
        {
          documentId: "shared-article-id",
          slug: "english-words",
          locale: "en",
          localizations: [{ locale: "id", slug: "kata-indonesia" }],
        },
        {
          documentId: "shared-article-id",
          slug: "kata-indonesia",
          locale: "id",
          localizations: [{ locale: "en", slug: "english-words" }],
        },
      ],
      async () => [
        {
          documentId: "project-id",
          slug: "project",
          locale: "en",
          localizations: [],
        },
        {
          documentId: "english-only-project",
          slug: "shared-looking-slug",
          locale: "en",
          localizations: [],
        },
        {
          documentId: "indonesian-only-project",
          slug: "shared-looking-slug",
          locale: "id",
          localizations: [],
        },
      ],
    )
    expect(entries.map((entry) => entry.url)).toEqual([
      "https://jurnal.dev/en",
      "https://jurnal.dev/en/jurnal",
      "https://jurnal.dev/en/portfolio",
      "https://jurnal.dev/id",
      "https://jurnal.dev/id/jurnal",
      "https://jurnal.dev/id/portfolio",
      "https://jurnal.dev/en/jurnal/english-words",
      "https://jurnal.dev/id/jurnal/kata-indonesia",
      "https://jurnal.dev/en/portfolio/project",
      "https://jurnal.dev/en/portfolio/shared-looking-slug",
      "https://jurnal.dev/id/portfolio/shared-looking-slug",
    ])

    expect(entries[6].alternates?.languages).toEqual({
      en: "https://jurnal.dev/en/jurnal/english-words",
      id: "https://jurnal.dev/id/jurnal/kata-indonesia",
    })
    expect(entries[7].alternates?.languages).toEqual(
      entries[6].alternates?.languages,
    )
    expect(
      entries.every((entry) =>
        /^https:\/\/jurnal\.dev\/(en|id)(\/|$)/.test(entry.url),
      ),
    ).toBe(true)

    const englishOnly = entries.find(
      (entry) =>
        entry.url ===
        "https://jurnal.dev/en/portfolio/shared-looking-slug",
    )
    const indonesianOnly = entries.find(
      (entry) =>
        entry.url ===
        "https://jurnal.dev/id/portfolio/shared-looking-slug",
    )
    expect(englishOnly?.alternates?.languages).toEqual({
      en: "https://jurnal.dev/en/portfolio/shared-looking-slug",
    })
    expect(indonesianOnly?.alternates?.languages).toEqual({
      id: "https://jurnal.dev/id/portfolio/shared-looking-slug",
    })

    const alternateUrls = entries.flatMap((entry) =>
      Object.values(entry.alternates?.languages ?? {}).filter(
        (url): url is string => typeof url === "string",
      ),
    )
    expect(alternateUrls.length).toBeGreaterThan(0)
    expect(
      alternateUrls.every((url) =>
        /^https:\/\/jurnal\.dev\/(en|id)(\/|$)/.test(url),
      ),
    ).toBe(true)
  })

  it("keeps static and successful sources when one loader fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined)
    const entries = await buildSitemapEntries(
      async () => {
        throw new Error("CMS down")
      },
      async () => [
        {
          documentId: "project-id",
          slug: "project",
          locale: "id",
          localizations: [],
        },
      ],
    )
    expect(entries.map((entry) => entry.url)).toContain(
      "https://jurnal.dev/id/portfolio/project",
    )
    expect(entries).toHaveLength(7)
  })
})
