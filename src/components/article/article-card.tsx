import Link from "next/link"
import type { StrapiArticle } from "@/lib/strapi/types"
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from "@/lib/article-utils"
import { strapiMediaUrl } from "@/lib/strapi"
import { Tag } from "@/components/ui/tag"

export function ArticleCard({
  article,
}: {
  article: StrapiArticle
  index?: number
}) {
  const coverUrl = strapiMediaUrl(article.cover?.url)
  const readingTime = calculateReadingTime(article.body)

  return (
    <Link
      href={`/jurnal/${article.slug}`}
      className="article-card-row"
      style={{
        display: "flex",
        gap: "14px",
        alignItems: "flex-start",
        padding: "14px 0",
        textDecoration: "none",
        color: "inherit",
        transition: "opacity 0.15s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: "80px",
          height: "54px",
          borderRadius: "6px",
          flexShrink: 0,
          backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          background: coverUrl ? undefined : "var(--surface-cool)",
        }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: "var(--font-geist-mono), monospace",
            fontSize: "9px",
            color: "var(--slate)",
            letterSpacing: "0.2px",
            textTransform: "uppercase",
            marginBottom: "4px",
            display: "flex",
            gap: "6px",
            alignItems: "center",
          }}
        >
          <span>{formatEntryNumber(article.entryNumber)}</span>
          <span>·</span>
          <span>{formatDateShort(article.publishedAt, article.locale)}</span>
          <span>·</span>
          <span>{readingTime.text}</span>
        </div>

        <h3
          className="article-card-title"
          style={{
            fontSize: "14px",
            fontWeight: 400,
            letterSpacing: "-0.4px",
            lineHeight: 1.3,
            margin: "0 0 4px 0",
            color: "var(--ink)",
          }}
        >
          {article.title}
        </h3>

        {article.excerpt && (
          <p
            style={{
              fontSize: "12px",
              lineHeight: 1.4,
              letterSpacing: "-0.16px",
              color: "var(--graphite)",
              margin: "0 0 6px 0",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {article.excerpt}
          </p>
        )}

        {article.tags && article.tags.length > 0 && (
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
            {article.tags.slice(0, 3).map((tag) => (
              <Tag key={tag.id}>{tag.name}</Tag>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
