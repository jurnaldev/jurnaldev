import { describe, expect, it, vi } from "vitest"

import { resolveLegacySlug } from "./legacy-redirect"

describe("resolveLegacySlug", () => {
  it("resolves an English-only slug", async () => {
    const fetchBySlug = vi.fn(async (_slug: string, locale: "en" | "id") =>
      locale === "en" ? { slug: "english-only" } : null,
    )

    await expect(
      resolveLegacySlug("english-only", fetchBySlug),
    ).resolves.toEqual({ locale: "en", slug: "english-only" })
  })

  it("resolves an Indonesian-only slug", async () => {
    const fetchBySlug = vi.fn(async (_slug: string, locale: "en" | "id") =>
      locale === "id" ? { slug: "khusus-indonesia" } : null,
    )

    await expect(
      resolveLegacySlug("khusus-indonesia", fetchBySlug),
    ).resolves.toEqual({ locale: "id", slug: "khusus-indonesia" })
  })

  it("prefers English when both locales contain the slug", async () => {
    const fetchBySlug = vi.fn(async (slug: string) => ({ slug }))

    await expect(resolveLegacySlug("shared", fetchBySlug)).resolves.toEqual({
      locale: "en",
      slug: "shared",
    })
  })

  it("returns null when neither locale contains the slug", async () => {
    const fetchBySlug = vi.fn(async () => null)

    await expect(resolveLegacySlug("missing", fetchBySlug)).resolves.toBeNull()
  })

  it("propagates a fetcher rejection instead of returning a false result", async () => {
    const outage = new Error("CMS down")
    const fetchBySlug = vi.fn(async (_slug: string, locale: "en" | "id") => {
      if (locale === "id") throw outage
      return { slug: "apparently-english" }
    })

    await expect(
      resolveLegacySlug("apparently-english", fetchBySlug),
    ).rejects.toBe(outage)
  })
})
