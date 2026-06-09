import type { StrapiArticle } from "@/lib/strapi/types"
import { formatDate, formatEntryNumber } from "@/lib/article-utils"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function ArticleHeader({
  article,
  readingTime,
}: {
  article: StrapiArticle
  readingTime: string
}) {
  const coverUrl = strapiMediaUrl(article.cover?.url)

  return (
    <header style={{ marginBottom: "3rem" }}>
      {/* Meta strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "10px",
          color: "var(--slate)",
          letterSpacing: "0.2px",
          textTransform: "uppercase",
        }}
      >
        <span>{formatEntryNumber(article.entryNumber)}</span>
        <span style={{ color: "var(--hairline-soft)" }}>/</span>
        <span>{formatDate(article.publishedAt, article.locale)}</span>
        <span style={{ color: "var(--hairline-soft)" }}>/</span>
        <span>{readingTime}</span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 400,
          letterSpacing: "-1.2px",
          lineHeight: 1.05,
          margin: "0 0 1rem 0",
          color: "var(--ink)",
        }}
      >
        {article.title}
      </h1>

      {/* Excerpt */}
      <p
        style={{
          fontSize: "1.125rem",
          lineHeight: 1.5,
          color: "var(--graphite)",
          margin: "0 0 2rem 0",
        }}
      >
        {article.excerpt}
      </p>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "6px",
            flexWrap: "wrap",
            marginBottom: "2rem",
          }}
        >
          {article.tags.map((tag) => (
            <Tag key={tag.id}>{tag.name}</Tag>
          ))}
        </div>
      )}

      {/* Cover image */}
      {coverUrl && (
        <figure style={{ margin: "0 0 2.5rem 0" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt={article.cover?.alternativeText || article.title}
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "8px",
              display: "block",
            }}
          />
        </figure>
      )}
    </header>
  )
}
