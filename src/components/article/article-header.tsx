import { Clock, Calendar, Tag as TagIcon } from "lucide-react"
import type { StrapiArticle } from "@/lib/strapi/types"
import { formatDate, formatEntryNumber } from "@/lib/article-utils"
import { strapiMediaUrl } from "@/lib/strapi"

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
      {/* Entry number + date badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--text-subtle)",
          letterSpacing: "0.05em",
          textTransform: "uppercase",
        }}
      >
        <span>{formatEntryNumber(article.entryNumber)}</span>
        <span style={{ color: "var(--border-hover)" }}>/</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Calendar size={11} strokeWidth={2} />
          {formatDate(article.publishedAt, article.locale)}
        </span>
        <span style={{ color: "var(--border-hover)" }}>/</span>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Clock size={11} strokeWidth={2} />
          {readingTime}
        </span>
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: "clamp(2rem, 5vw, 2.75rem)",
          fontWeight: 500,
          letterSpacing: "-0.03em",
          lineHeight: 1.15,
          margin: "0 0 1rem 0",
          color: "var(--text)",
        }}
      >
        {article.title}
      </h1>

      {/* Excerpt */}
      <p
        style={{
          fontSize: "1.125rem",
          lineHeight: 1.55,
          color: "var(--text-muted)",
          margin: "0 0 2rem 0",
          letterSpacing: "-0.005em",
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
            alignItems: "center",
          }}
        >
          <TagIcon
            size={12}
            strokeWidth={2}
            style={{ color: "var(--text-subtle)" }}
          />
          {article.tags.map((tag) => (
            <span
              key={tag.id}
              style={{
                fontFamily: "var(--font-geist-mono), monospace",
                fontSize: "11px",
                letterSpacing: "0.02em",
                padding: "3px 10px",
                border: "1px solid var(--border)",
                borderRadius: "999px",
                color: "var(--text-muted)",
                background: "var(--bg-elevated)",
              }}
            >
              {tag.name}
            </span>
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
              borderRadius: "10px",
              border: "1px solid var(--border)",
              display: "block",
            }}
          />
        </figure>
      )}
    </header>
  )
}
