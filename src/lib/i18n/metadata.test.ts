import { describe, expect, it } from "vitest"

import {
  buildPageAlternates,
  openGraphLocale,
  openGraphLocaleSet,
} from "./metadata"

describe("localized metadata", () => {
  it("builds absolute canonical and language alternate URLs", () => {
    expect(
      buildPageAlternates({
        canonicalPath: "/id/jurnal/artikel-id",
        languages: {
          en: "/en/jurnal/article-en",
          id: "/id/jurnal/artikel-id",
        },
      }),
    ).toEqual({
      canonical: "https://jurnal.dev/id/jurnal/artikel-id",
      languages: {
        en: "https://jurnal.dev/en/jurnal/article-en",
        id: "https://jurnal.dev/id/jurnal/artikel-id",
      },
    })
  })

  it("omits a missing translation", () => {
    expect(
      buildPageAlternates({
        canonicalPath: "/en/jurnal/english-only",
        languages: { en: "/en/jurnal/english-only" },
      }),
    ).toEqual({
      canonical: "https://jurnal.dev/en/jurnal/english-only",
      languages: {
        en: "https://jurnal.dev/en/jurnal/english-only",
      },
    })
  })

  it("maps Open Graph locales and includes only available alternatives", () => {
    expect(openGraphLocale("en")).toBe("en_US")
    expect(openGraphLocale("id")).toBe("id_ID")
    expect(openGraphLocaleSet("en", ["en", "id"])).toEqual({
      locale: "en_US",
      alternateLocale: ["id_ID"],
    })
    expect(openGraphLocaleSet("id", ["id"])).toEqual({ locale: "id_ID" })
  })
})
