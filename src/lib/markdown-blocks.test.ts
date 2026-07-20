import { describe, expect, it } from "vitest"
import { parseMarkdownBlocks } from "./markdown-blocks"

describe("parseMarkdownBlocks", () => {
  it("keeps normal Markdown", () => {
    expect(parseMarkdownBlocks("## Hello\n\nWorld")).toEqual([
      { type: "md", content: "## Hello\n\nWorld" },
    ])
  })

  it.each(["info", "warning", "tip", "success"] as const)(
    "parses %s callouts",
    (variant) => {
      expect(parseMarkdownBlocks(`:::${variant}\nKeep me\n:::`)).toEqual([
        { type: "callout", variant, content: "Keep me" },
      ])
    },
  )

  it("parses Instagram posts and reels", () => {
    expect(
      parseMarkdownBlocks(
        "https://instagram.com/reel/ABC123/\nhttps://www.instagram.com/p/XYZ/",
      ),
    ).toEqual([
      { type: "instagram", url: "https://instagram.com/reel/ABC123/" },
      { type: "instagram", url: "https://www.instagram.com/p/XYZ/" },
    ])
  })

  it("does not parse markers inside code fences", () => {
    const body = "```text\n:::warning\nhttps://instagram.com/reel/ABC/\n```"
    expect(parseMarkdownBlocks(body)).toEqual([{ type: "md", content: body }])
  })

  it("preserves an unclosed callout without losing input", () => {
    expect(parseMarkdownBlocks(":::warning\nkeep me")).toEqual([
      { type: "md", content: ":::warning\nkeep me" },
    ])
  })
})
