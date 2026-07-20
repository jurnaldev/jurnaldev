import { describe, expect, it } from "vitest"
import {
  getMockAllProjectSlugs,
  getMockAllSlugs,
  getMockArticleSummaries,
} from "./mock"

describe("mock article summaries", () => {
  it("never exposes body or localization payloads", () => {
    const summaries = getMockArticleSummaries("en")
    expect(summaries.length).toBeGreaterThan(0)
    for (const summary of summaries) {
      expect("body" in summary).toBe(false)
      expect("localizations" in summary).toBe(false)
    }
  })
})

describe("mock localized slug enumeration", () => {
  it.each([
    [
      "article",
      getMockAllSlugs,
      "my-first-llm-call",
      "pertama-kali-manggil-llm",
    ],
    [
      "project",
      getMockAllProjectSlugs,
      "jurnal-summarizer",
      "perangkum-jurnal",
    ],
  ] as const)(
    "uses shared identity and reciprocal real slugs for a translated %s pair",
    (_kind, enumerate, englishSlug, indonesianSlug) => {
      const records = enumerate()
      const english = records.find((record) => record.slug === englishSlug)
      const indonesian = records.find(
        (record) => record.slug === indonesianSlug,
      )

      expect(english?.documentId).toBe(indonesian?.documentId)
      expect(english?.localizations).toContainEqual({
        locale: "id",
        slug: indonesianSlug,
      })
      expect(indonesian?.localizations).toContainEqual({
        locale: "en",
        slug: englishSlug,
      })
      expect(englishSlug).not.toBe(indonesianSlug)
    },
  )

  it("retains a genuinely untranslated record", () => {
    expect(getMockAllSlugs()).toContainEqual(
      expect.objectContaining({
        slug: "agent-pertama-gw",
        locale: "id",
        localizations: [],
      }),
    )
  })
})
