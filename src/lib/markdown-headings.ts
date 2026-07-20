import GithubSlugger from "github-slugger"
import { toString } from "mdast-util-to-string"
import { unified } from "unified"
import { visit } from "unist-util-visit"
import remarkParse from "remark-parse"
import type { Heading as MdastHeading, Root as MdastRoot } from "mdast"
import type { Element, Root as HastRoot } from "hast"

export interface Heading {
  text: string
  slug: string
  level: number
}

export function createHeadingSlugger(prefix: string) {
  const slugger = new GithubSlugger()
  return (text: string) => `${prefix}-${slugger.slug(text)}`
}

export function extractHeadings(body: string, prefix = "content"): Heading[] {
  const tree = unified().use(remarkParse).parse(body) as MdastRoot
  const nextSlug = createHeadingSlugger(prefix)
  const headings: Heading[] = []
  visit(tree, "heading", (node: MdastHeading) => {
    if (node.depth !== 2 && node.depth !== 3) return
    const text = toString(node)
    headings.push({ text, slug: nextSlug(text), level: node.depth })
  })
  return headings
}

function hastText(node: Element): string {
  return node.children
    .map((child) => {
      if (child.type === "text") return child.value
      if (child.type === "element") return hastText(child)
      return ""
    })
    .join("")
}

export function createHeadingIdPlugin(prefix: string) {
  const nextSlug = createHeadingSlugger(prefix)
  return function headingIdAttacher() {
    return (tree: HastRoot) => {
      visit(tree, "element", (node: Element) => {
        if (node.tagName !== "h2" && node.tagName !== "h3") return
        node.properties ??= {}
        node.properties.id = nextSlug(hastText(node))
      })
    }
  }
}
