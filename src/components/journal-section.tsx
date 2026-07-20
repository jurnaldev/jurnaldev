"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ImageOff } from "lucide-react"
import { useLang, type Lang } from "@/contexts/lang-context"
import { strapiMediaUrl } from "@/lib/strapi"
import { formatDateShort, formatEntryNumber } from "@/lib/article-utils"
import type { StrapiArticleSummary, StrapiEmptyState } from "@/lib/strapi/types"
import { loadArticles } from "@/lib/client/load-articles"

interface Props {
  emptyState: Record<Lang, StrapiEmptyState>
  viewAllLabel: Record<Lang, string>
}

export function JournalSection({ emptyState, viewAllLabel }: Props) {
  const { lang } = useLang()
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{
    lang: Lang
    status: "loading" | "success" | "error"
    articles: StrapiArticleSummary[]
  }>({ lang, status: "loading", articles: [] })
  const current =
    result.lang === lang
      ? result
      : { lang, status: "loading" as const, articles: [] }
  const articles = current.articles

  useEffect(() => {
    const controller = new AbortController()
    loadArticles(`/api/articles?locale=${lang}&limit=3`, controller.signal)
      .then((nextArticles) => {
        setResult({ lang, status: "success", articles: nextArticles })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setResult({ lang, status: "error", articles: [] })
      })
    return () => controller.abort()
  }, [lang, retry])

  if (current.status === "error") {
    return (
      <div style={{ padding: "1.5rem", border: "1px solid var(--hairline)" }}>
        <p style={{ color: "var(--graphite)" }}>
          {lang === "id"
            ? "Artikel sementara tidak tersedia. Coba lagi."
            : "Articles are temporarily unavailable. Try again."}
        </p>
        <button
          type="button"
          onClick={() => {
            setResult({ lang, status: "loading", articles: [] })
            setRetry((value) => value + 1)
          }}
        >
          {lang === "id" ? "Coba lagi" : "Try again"}
        </button>
      </div>
    )
  }

  if (current.status === "success" && articles.length === 0) {
    return <EmptyState empty={emptyState[lang]} />
  }

  if (current.status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.5rem",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 0",
              borderBottom: i < 2 ? "1px solid var(--hairline)" : "none",
              opacity: 0.4,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "38px",
                background: "var(--hairline)",
                borderRadius: "6px",
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: "9px",
                  background: "var(--hairline)",
                  borderRadius: "3px",
                  marginBottom: "6px",
                  width: "30%",
                }}
              />
              <div
                style={{
                  height: "13px",
                  background: "var(--hairline)",
                  borderRadius: "3px",
                  width: "75%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
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
        {articles.map((article, i) => {
          const coverUrl = strapiMediaUrl(article.cover?.url)
          return (
            <Link
              key={article.id}
              href={`/jurnal/${article.slug}`}
              className="article-card-row card-enter"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 0",
                borderBottom:
                  i < articles.length - 1
                    ? "1px solid var(--hairline)"
                    : "none",
                textDecoration: "none",
                color: "inherit",
                transition: "opacity 0.15s ease",
                animationDelay: `${i * 60}ms`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
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
        href="/jurnal"
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
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {viewAllLabel[lang]}
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
