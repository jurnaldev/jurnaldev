"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { useLang, type Lang } from "@/contexts/lang-context"
import {
  formatDateShort,
  formatEntryNumber,
  calculateReadingTime,
} from "@/lib/article-utils"
import type { StrapiArticle, StrapiEmptyState } from "@/lib/strapi/types"

interface Props {
  emptyState: Record<Lang, StrapiEmptyState>
  viewAllLabel: Record<Lang, string>
}

export function JournalSection({ emptyState, viewAllLabel }: Props) {
  const { lang } = useLang()
  const [articles, setArticles] = useState<StrapiArticle[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/articles?locale=${lang}&limit=3`)
      .then((r) => r.json())
      .then((data) => {
        if (mounted) setArticles(data.articles ?? [])
      })
      .catch(() => {
        if (mounted) setArticles([])
      })
    return () => {
      mounted = false
    }
  }, [lang])

  if (articles !== null && articles.length === 0) {
    return <EmptyState empty={emptyState[lang]} />
  }

  if (articles === null) {
    return (
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 0",
              borderBottom: i < 2 ? "1px solid var(--border)" : "none",
              opacity: 0.4,
            }}
          >
            <div>
              <div
                style={{
                  height: "10px",
                  background: "var(--border)",
                  borderRadius: "3px",
                  marginBottom: "6px",
                  width: "120px",
                }}
              />
              <div
                style={{
                  height: "14px",
                  background: "var(--border)",
                  borderRadius: "3px",
                  width: "220px",
                }}
              />
            </div>
            <div
              style={{
                height: "22px",
                background: "var(--border)",
                borderRadius: "5px",
                width: "44px",
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", marginBottom: "1.5rem" }}>
        {articles.map((article, i) => {
          const readingTime = calculateReadingTime(article.body)
          return (
            <Link
              key={article.id}
              href={`/jurnal/${article.slug}`}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom:
                  i < articles.length - 1 ? "1px solid var(--border)" : "none",
                textDecoration: "none",
                color: "inherit",
                transition: "opacity 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-geist-mono), monospace",
                    fontSize: "10px",
                    color: "var(--text-subtle)",
                    letterSpacing: "0.04em",
                    marginBottom: "3px",
                  }}
                >
                  {formatEntryNumber(article.entryNumber)} ·{" "}
                  {formatDateShort(article.publishedAt, article.locale)}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "var(--text)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {article.title}
                </div>
              </div>
              <div
                style={{
                  background: "var(--bg-elevated)",
                  borderRadius: "5px",
                  padding: "2px 8px",
                  boxShadow: "var(--shadow-badge)",
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "10px",
                  color: "var(--text-subtle)",
                  flexShrink: 0,
                  marginLeft: "12px",
                }}
              >
                {readingTime.text}
              </div>
            </Link>
          )
        })}
      </div>

      <Link
        href="/jurnal"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: "13px",
          color: "var(--text-muted)",
          textDecoration: "none",
          transition: "color 0.15s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        {viewAllLabel[lang]}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    </>
  )
}

function EmptyState({ empty }: { empty: StrapiEmptyState }) {
  return (
    <div
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
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
            fontWeight: 500,
            margin: "0 0 6px 0",
            color: "var(--text)",
            letterSpacing: "-0.01em",
          }}
        >
          {empty.title}
        </h3>
        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted)",
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
            padding: "8px 14px",
            background: "var(--text)",
            color: "var(--bg)",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            transition: "transform 0.15s ease",
          }}
        >
          {empty.cta}
          <ArrowUpRight size={14} strokeWidth={2} />
        </a>
      )}
    </div>
  )
}
