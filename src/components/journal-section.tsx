"use client"

import Link from "next/link"
import { ImageOff } from "lucide-react"

import { formatDateShort, formatEntryNumber } from "@/lib/article-utils"
import { articlePath, journalPath, type Locale } from "@/lib/i18n/routing"
import { strapiMediaUrl } from "@/lib/strapi"
import type { StrapiArticleSummary, StrapiEmptyState } from "@/lib/strapi/types"

interface Props {
  articles: StrapiArticleSummary[]
  emptyState: StrapiEmptyState
  locale: Locale
  viewAllLabel: string
}

export function JournalSection({
  articles,
  emptyState,
  locale,
  viewAllLabel,
}: Props) {
  if (articles.length === 0) {
    return <EmptyState empty={emptyState} />
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.5rem",
        }}
      >
        {articles.map((article, index) => {
          const coverUrl = strapiMediaUrl(article.cover?.url)

          return (
            <Link
              key={article.id}
              href={articlePath(locale, article.slug)}
              className="article-card-row card-enter"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 0",
                borderBottom:
                  index < articles.length - 1
                    ? "1px solid var(--hairline)"
                    : "none",
                textDecoration: "none",
                color: "inherit",
                transition: "opacity 0.15s ease",
                animationDelay: `${index * 60}ms`,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.opacity = "0.7"
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.opacity = "1"
              }}
            >
              {coverUrl ? (
                <div
                  style={{
                    width: "56px",
                    height: "38px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    backgroundImage: `url(${coverUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "56px",
                    height: "38px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    background: "var(--surface-cool)",
                    border: "1px solid var(--hairline)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--stone)",
                  }}
                >
                  <ImageOff size={13} strokeWidth={1.5} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "9px",
                    color: "var(--slate)",
                    letterSpacing: "0.2px",
                    textTransform: "uppercase",
                    marginBottom: "3px",
                  }}
                >
                  {formatEntryNumber(article.entryNumber)} ·{" "}
                  {formatDateShort(article.publishedAt, article.locale)}
                </div>
                <div
                  className="article-card-title"
                  style={{
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "var(--ink)",
                    letterSpacing: "-0.3px",
                    lineHeight: 1.35,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {article.title}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href={journalPath(locale)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "6px 16px",
          border: "1px solid var(--ink)",
          borderRadius: "9999px",
          fontSize: "13px",
          fontWeight: 600,
          color: "var(--ink)",
          textDecoration: "none",
          transition: "opacity 0.15s ease",
        }}
        onMouseEnter={(event) => {
          event.currentTarget.style.opacity = "0.7"
        }}
        onMouseLeave={(event) => {
          event.currentTarget.style.opacity = "1"
        }}
      >
        {viewAllLabel}
      </Link>
    </>
  )
}

function EmptyState({ empty }: { empty: StrapiEmptyState }) {
  return (
    <div
      style={{
        border: "1px solid var(--hairline)",
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1rem",
        flexWrap: "wrap",
        marginBottom: "1.5rem",
      }}
    >
      <div style={{ flex: 1, minWidth: "240px" }}>
        <h3
          style={{
            fontSize: "15px",
            fontWeight: 400,
            margin: "0 0 6px 0",
            color: "var(--ink)",
            letterSpacing: "-0.3px",
          }}
        >
          {empty.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--graphite)",
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          {empty.desc}
        </p>
      </div>
      {empty.cta && empty.ctaHref && (
        <a
          href={empty.ctaHref}
          target="_blank"
          rel="noopener noreferrer"
          className="cta-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 16px",
            background: "var(--primary)",
            color: "var(--on-primary)",
            textDecoration: "none",
            borderRadius: "9999px",
            fontSize: "13px",
            fontWeight: 600,
            whiteSpace: "nowrap",
            transition: "transform 0.15s ease",
          }}
        >
          {empty.cta}
        </a>
      )}
    </div>
  )
}
