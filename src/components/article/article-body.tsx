import { codeToHtml } from "shiki"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeSlug from "rehype-slug"
import type { Components } from "react-markdown"
import { Callout } from "./callout"
import { Mermaid } from "./mermaid"
import { CodeBlock } from "./code-block"
import { InstagramEmbed } from "./instagram-embed"
import { parseMarkdownBlocks } from "@/lib/markdown-blocks"
import { createHeadingIdPlugin } from "@/lib/markdown-headings"

interface ArticleBodyProps {
  body: string
  headingPrefix?: string
}

export async function ArticleBody({
  body,
  headingPrefix = "content",
}: ArticleBodyProps) {
  const blocks = parseMarkdownBlocks(body)
  const headingPlugin = createHeadingIdPlugin(headingPrefix)
  const highlightedMap = new Map<string, string>()

  const collectHighlights = async (md: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g
    const matches = Array.from(md.matchAll(codeBlockRegex))
    await Promise.all(
      matches.map(async (m) => {
        const [full, lang, code] = m
        const effectiveLang = lang || "text"
        if (effectiveLang === "mermaid") return
        if (highlightedMap.has(full)) return
        try {
          const html = await codeToHtml(code, {
            lang: effectiveLang,
            themes: { light: "github-light", dark: "github-dark-dimmed" },
            defaultColor: false,
          })
          highlightedMap.set(full, html)
        } catch {
          highlightedMap.set(full, "")
        }
      }),
    )
  }

  for (const block of blocks) {
    if (block.type === "md") await collectHighlights(block.content)
    if (block.type === "callout") await collectHighlights(block.content)
  }

  return (
    <div style={{ fontSize: "16px", color: "var(--text)" }}>
      {blocks.map((block, i) => {
        if (block.type === "instagram") {
          return <InstagramEmbed key={i} url={block.url} />
        }
        if (block.type === "callout") {
          return (
            <Callout key={i} type={block.variant}>
              <MarkdownContent
                content={block.content}
                highlightedMap={highlightedMap}
                headingPlugin={headingPlugin}
              />
            </Callout>
          )
        }
        return (
          <MarkdownContent
            key={i}
            content={block.content}
            highlightedMap={highlightedMap}
            headingPlugin={headingPlugin}
          />
        )
      })}
    </div>
  )
}

function MarkdownContent({
  content,
  highlightedMap,
  headingPlugin,
}: {
  content: string
  highlightedMap: Map<string, string>
  headingPlugin: ReturnType<typeof createHeadingIdPlugin>
}) {
  const components: Components = {
    h2: ({ children, ...props }) => (
      <h2
        style={{
          fontSize: "1.5rem",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          marginTop: "3rem",
          marginBottom: "1rem",
          color: "var(--text)",
          scrollMarginTop: "2rem",
        }}
        {...props}
      >
        {children}
      </h2>
    ),
    h3: ({ children, ...props }) => (
      <h3
        style={{
          fontSize: "1.15rem",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          marginTop: "2rem",
          marginBottom: "0.75rem",
          color: "var(--text)",
          scrollMarginTop: "2rem",
        }}
        {...props}
      >
        {children}
      </h3>
    ),
    p: ({ children, ...props }) => (
      <p
        className="article-paragraph"
        style={{
          fontSize: "1rem",
          lineHeight: 1.75,
          color: "var(--text)",
          margin: "0",
          letterSpacing: "-0.003em",
        }}
        {...props}
      >
        {children}
      </p>
    ),
    a: ({ children, href, ...props }) => (
      <a
        href={href}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        style={{
          color: "var(--text)",
          textDecoration: "underline",
          textDecorationColor: "var(--border-hover)",
          textUnderlineOffset: "3px",
          textDecorationThickness: "1px",
        }}
        {...props}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul
        style={{
          margin: "1rem 0 1.5rem 1.25rem",
          padding: 0,
          lineHeight: 1.75,
        }}
        {...props}
      >
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol
        style={{
          margin: "1rem 0 1.5rem 1.25rem",
          padding: 0,
          lineHeight: 1.75,
        }}
        {...props}
      >
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li style={{ marginBottom: "0.4rem" }} {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        style={{
          borderLeft: "3px solid var(--border-hover)",
          paddingLeft: "1.25rem",
          margin: "1.5rem 0",
          fontStyle: "italic",
          color: "var(--text-muted)",
          fontSize: "1.05rem",
          lineHeight: 1.65,
        }}
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }) => (
      <div style={{ overflowX: "auto", margin: "1.5rem 0" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead style={{ background: "var(--bg-elevated)" }} {...props}>
        {children}
      </thead>
    ),
    th: ({ children, ...props }) => (
      <th
        style={{
          padding: "10px 14px",
          textAlign: "left",
          fontWeight: 500,
          borderBottom: "1px solid var(--border)",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "12px",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
        }}
        {...props}
      >
        {children}
      </td>
    ),
    img: ({ src, alt, ...props }) => (
      <figure style={{ margin: "1.5rem 0" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src as string}
          alt={alt || ""}
          style={{
            width: "100%",
            height: "auto",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            display: "block",
          }}
          {...props}
        />
        {alt && (
          <figcaption
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--text-subtle)",
              textAlign: "center",
              marginTop: "8px",
              letterSpacing: "0.02em",
            }}
          >
            {alt}
          </figcaption>
        )}
      </figure>
    ),
    hr: () => (
      <hr
        style={{
          border: "none",
          borderTop: "1px solid var(--border)",
          margin: "2.5rem 0",
        }}
      />
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "")
      const lang = match ? match[1] : ""
      const codeText = String(children).replace(/\n$/, "")
      const isInline = !className

      if (isInline) {
        return (
          <code
            style={{
              background: "var(--code-bg)",
              border: "1px solid var(--code-border)",
              borderRadius: "4px",
              padding: "1px 6px",
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "0.88em",
              color: "var(--text)",
            }}
            {...props}
          >
            {children}
          </code>
        )
      }

      if (lang === "mermaid") {
        return <Mermaid chart={codeText} />
      }

      const fullBlock = `\`\`\`${lang}\n${codeText}\`\`\``
      const highlighted = highlightedMap.get(fullBlock) ?? ""

      return <CodeBlock code={codeText} language={lang} html={highlighted} />
    },
    pre: ({ children }) => <>{children}</>,
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, headingPlugin]}
      components={components}
    >
      {content}
    </ReactMarkdown>
  )
}
