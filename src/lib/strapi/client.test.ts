import { afterEach, describe, expect, it, vi } from "vitest"
import {
  getAllProjectSlugs,
  getAllSlugs,
  getArticles,
  getProjectBySlug,
  getProjects,
} from "./client"

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("Strapi article summaries", () => {
  it("uses an eight-second timeout and excludes body from list fields", async () => {
    const signal = new AbortController().signal
    const timeout = vi.spyOn(AbortSignal, "timeout").mockReturnValue(signal)
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ data: [], meta: { pagination: {} } })),
      )
    vi.stubGlobal("fetch", fetchMock)

    await getArticles("en")

    expect(timeout).toHaveBeenCalledWith(8_000)
    const [url, options] = fetchMock.mock.calls[0]
    expect(String(url)).toContain("fields%5B0%5D=documentId")
    expect(String(url)).not.toContain("body")
    expect(options.signal).toBe(signal)
  })
})

describe("Strapi localized slug enumeration", () => {
  it.each([
    ["articles", getAllSlugs],
    ["projects", getAllProjectSlugs],
  ] as const)(
    "retains identity and localization data for %s",
    async (collection, enumerate) => {
      const fetchMock = vi.fn().mockImplementation((url: string) => {
        const locale = String(url).includes("locale=en") ? "en" : "id"
        const slug = locale === "en" ? "english-slug" : "slug-indonesia"
        const alternateLocale = locale === "en" ? "id" : "en"
        const alternateSlug =
          locale === "en" ? "slug-indonesia" : "english-slug"

        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: [
                {
                  documentId: `${collection}-shared-id`,
                  slug,
                  localizations: [
                    { locale: alternateLocale, slug: alternateSlug },
                  ],
                },
              ],
              meta: { pagination: {} },
            }),
          ),
        )
      })
      vi.stubGlobal("fetch", fetchMock)

      await expect(enumerate()).resolves.toEqual([
        {
          documentId: `${collection}-shared-id`,
          locale: "en",
          slug: "english-slug",
          localizations: [{ locale: "id", slug: "slug-indonesia" }],
        },
        {
          documentId: `${collection}-shared-id`,
          locale: "id",
          slug: "slug-indonesia",
          localizations: [{ locale: "en", slug: "english-slug" }],
        },
      ])

      for (const [url] of fetchMock.mock.calls) {
        expect(String(url)).toContain("fields%5B0%5D=documentId")
        expect(String(url)).toContain("fields%5B1%5D=slug")
        expect(String(url)).toContain("populate%5Blocalizations%5D")
      }
    },
  )

  it("normalizes absent localization arrays", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({
              data: [{ documentId: "untranslated", slug: "only-one" }],
              meta: { pagination: {} },
            }),
          ),
        ),
      ),
    )

    const records = await getAllSlugs()
    expect(records.every((record) => record.localizations.length === 0)).toBe(
      true,
    )
  })
})

describe("optional Strapi project collection", () => {
  function stubResponse(status: number, statusText: string) {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status, statusText })),
    )
  }

  it("returns an empty project list when the collection is missing", async () => {
    stubResponse(404, "Not Found")
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await expect(getProjects("en")).resolves.toEqual([])
    expect(warn).toHaveBeenCalledWith(
      "[strapi] projects collection unavailable (404); returning an empty result",
    )
  })

  it("returns null for project detail when the collection is missing", async () => {
    stubResponse(404, "Not Found")
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await expect(getProjectBySlug("missing", "en")).resolves.toBeNull()
  })

  it("returns no project slugs when the collection is missing", async () => {
    stubResponse(404, "Not Found")
    vi.spyOn(console, "warn").mockImplementation(() => undefined)

    await expect(getAllProjectSlugs()).resolves.toEqual([])
  })

  it("still rejects non-404 project failures", async () => {
    stubResponse(500, "Internal Server Error")

    await expect(getProjects("en")).rejects.toThrow(
      "Strapi fetch failed: 500 Internal Server Error",
    )
  })

  it("still rejects 404 responses from non-project resources", async () => {
    stubResponse(404, "Not Found")

    await expect(getArticles("en")).rejects.toThrow(
      "Strapi fetch failed: 404 Not Found",
    )
  })
})
