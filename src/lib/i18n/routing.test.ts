import { describe, expect, it } from "vitest"

import {
  articlePath,
  assertLocale,
  homePath,
  isLocale,
  journalPath,
  localizedPath,
  portfolioPath,
  projectPath,
  replacePathLocale,
} from "./routing"

describe("locale routing", () => {
  it("validates supported locales", () => {
    expect(isLocale("en")).toBe(true)
    expect(isLocale("id")).toBe(true)
    expect(isLocale("fr")).toBe(false)
    expect(assertLocale("en")).toBe("en")
    expect(() => assertLocale("fr")).toThrow("Unsupported locale: fr")
  })

  it("builds encoded localized paths from decoded segments", () => {
    expect(localizedPath("id", "jurnal", "judul dengan spasi")).toBe(
      "/id/jurnal/judul%20dengan%20spasi",
    )
    expect(localizedPath("en", "jurnal", "already%20encoded")).toBe(
      "/en/jurnal/already%2520encoded",
    )
    expect(localizedPath("en", "jurnal", "folder/slug")).toBe(
      "/en/jurnal/folder%2Fslug",
    )
  })

  it("builds home, listing, article, and project paths without trailing slashes", () => {
    expect(homePath("en")).toBe("/en")
    expect(journalPath("id")).toBe("/id/jurnal")
    expect(articlePath("en", "an article")).toBe("/en/jurnal/an%20article")
    expect(portfolioPath("id")).toBe("/id/portfolio")
    expect(projectPath("en", "a project")).toBe(
      "/en/portfolio/a%20project",
    )
  })

  it("replaces only a leading locale and preserves the rest of the path", () => {
    expect(replacePathLocale("/en/jurnal/a?draft=1", "id")).toBe(
      "/id/jurnal/a?draft=1",
    )
    expect(
      replacePathLocale(
        "/id/portfolio/en?next=%2Fen%2Fjurnal&draft=1",
        "en",
      ),
    ).toBe("/en/portfolio/en?next=%2Fen%2Fjurnal&draft=1")
    expect(replacePathLocale("/en", "id")).toBe("/id")
    expect(replacePathLocale("/jurnal/a", "id")).toBeNull()
    expect(replacePathLocale("/english/jurnal/a", "id")).toBeNull()
  })
})
