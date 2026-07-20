import { describe, expect, it } from "vitest"
import { createHeadingIdPlugin, extractHeadings } from "./markdown-headings"
import type { Root } from "hast"

describe("Markdown heading IDs", () => {
  it("extracts visible formatted text with stable duplicate IDs", () => {
    expect(
      extractHeadings(
        "## Setup\n## Setup\n### **Bold** [link](/x) and `code`\n## Café déjà vu",
        "article-en",
      ),
    ).toEqual([
      { text: "Setup", slug: "article-en-setup", level: 2 },
      { text: "Setup", slug: "article-en-setup-1", level: 2 },
      {
        text: "Bold link and code",
        slug: "article-en-bold-link-and-code",
        level: 3,
      },
      {
        text: "Café déjà vu",
        slug: "article-en-café-déjà-vu",
        level: 2,
      },
    ])
  })

  it("ignores headings inside code fences", () => {
    expect(extractHeadings("```md\n## Hidden\n```", "article-id")).toEqual([])
  })

  it("shares duplicate state across rendered Markdown blocks", () => {
    const plugin = createHeadingIdPlugin("article-en")
    const tree = (text: string): Root => ({
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h2",
          properties: {},
          children: [{ type: "text", value: text }],
        },
      ],
    })
    const first = tree("Setup")
    const second = tree("Setup")
    plugin()(first)
    plugin()(second)
    expect(first.children[0]).toMatchObject({
      properties: { id: "article-en-setup" },
    })
    expect(second.children[0]).toMatchObject({
      properties: { id: "article-en-setup-1" },
    })
  })
})
