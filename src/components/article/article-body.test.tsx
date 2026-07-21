import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { ArticleBody } from "./article-body"

const { JSDOM } = createRequire(import.meta.url)("jsdom") as {
  JSDOM: new (html: string) => { window: Window & typeof globalThis }
}

describe("ArticleBody paragraph spacing", () => {
  it("adds one line of space between consecutive paragraphs", async () => {
    const article = await ArticleBody({
      body: "First paragraph.\n\nSecond paragraph.",
    })
    const markup = renderToStaticMarkup(article)
    const cssPath = fileURLToPath(
      new URL("../../app/globals.css", import.meta.url),
    )
    const css = readFileSync(cssPath, "utf8")
    const dom = new JSDOM(`<style>${css}</style>${markup}`)
    const paragraphs = dom.window.document.querySelectorAll("p")

    expect(paragraphs).toHaveLength(2)
    expect(dom.window.getComputedStyle(paragraphs[0]).marginTop).toBe("0px")
    expect(dom.window.getComputedStyle(paragraphs[1]).marginTop).toBe("1rem")
  })
})
