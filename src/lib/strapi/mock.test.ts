import { describe, expect, it } from "vitest"
import { getMockArticleSummaries } from "./mock"

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
