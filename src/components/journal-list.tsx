"use client"

import { useEffect, useState } from "react"

import { ArticleCard } from "@/components/article/article-card"
import { SiteHeader } from "@/components/layout/site-header"
import { loadArticles } from "@/lib/client/load-articles"
import type { Locale } from "@/lib/i18n/routing"
import type { StrapiArticleSummary } from "@/lib/strapi/types"

const copy = {
  en: {
    eyebrow: "Journal",
    title: "Notes from learning.",
    subtitle:
      "A running log of me. My interest, my learning, my thoughts. It's all here, hope y'll enjoy it.",
    empty: "No entries yet. Check back soon.",
    error: "Articles are temporarily unavailable. Try again.",
    retry: "Try again",
    count: (count: number) => `${count} ${count === 1 ? "entry" : "entries"}`,
  },
  id: {
    eyebrow: "Jurnal",
    title: "Catatan dari proses belajar.",
    subtitle: `"Log" gue. Minat gue, proses belajar gue, pemikiran gue. Semua ada di sini, semoga klean suka. ✌️`,
    empty: "Belum ada entry. Cek lagi nanti ya.",
    error: "Artikel sementara tidak tersedia. Coba lagi.",
    retry: "Coba lagi",
    count: (count: number) => `${count} entries`,
  },
}

export function JournalList({ locale }: { locale: Locale }) {
  const t = copy[locale]
  const [retry, setRetry] = useState(0)
  const [result, setResult] = useState<{
    status: "loading" | "success" | "error"
    articles: StrapiArticleSummary[]
  }>({ status: "loading", articles: [] })

  useEffect(() => {
    const controller = new AbortController()
    loadArticles(`/api/articles?locale=${locale}`, controller.signal)
      .then((articles) => {
        setResult({ status: "success", articles })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return
        setResult({ status: "error", articles: [] })
      })
    return () => controller.abort()
  }, [locale, retry])

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100dvh", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader />

        <section style={{ marginBottom: "3rem" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: 500,
              color: "var(--slate)",
              letterSpacing: "0.35px",
              textTransform: "uppercase",
              marginBottom: "8px",
            }}
          >
            {t.eyebrow}
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 2.75rem)",
              fontWeight: 400,
              letterSpacing: "-1px",
              lineHeight: 1.05,
              margin: "0 0 0.75rem 0",
              color: "var(--ink)",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: "1rem",
              lineHeight: 1.5,
              color: "var(--graphite)",
              margin: 0,
              maxWidth: "540px",
            }}
          >
            {t.subtitle}
          </p>
        </section>

        {result.status === "success" && result.articles.length > 0 && (
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--stone)",
              letterSpacing: "0.2px",
              textTransform: "uppercase",
              marginBottom: "4px",
            }}
          >
            {t.count(result.articles.length)}
          </div>
        )}

        <div style={{ height: "1px", background: "var(--hairline)" }} />

        {result.status === "loading" ? (
          <LoadingList />
        ) : result.status === "error" ? (
          <ErrorState
            message={t.error}
            retryLabel={t.retry}
            onRetry={() => {
              setResult({ status: "loading", articles: [] })
              setRetry((value) => value + 1)
            }}
          />
        ) : result.articles.length === 0 ? (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              color: "var(--graphite)",
              border: "1px solid var(--hairline)",
              marginTop: "1rem",
            }}
          >
            {t.empty}
          </div>
        ) : (
          <div>
            {result.articles.map((article, index) => (
              <div
                key={article.id}
                style={{
                  borderBottom:
                    index < result.articles.length - 1
                      ? "1px solid var(--hairline)"
                      : "none",
                }}
              >
                <ArticleCard article={article} index={index} locale={locale} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function ErrorState({
  message,
  retryLabel,
  onRetry,
}: {
  message: string
  retryLabel: string
  onRetry: () => void
}) {
  return (
    <div style={{ padding: "3rem 1.5rem", textAlign: "center" }}>
      <p style={{ color: "var(--graphite)" }}>{message}</p>
      <button type="button" onClick={onRetry}>
        {retryLabel}
      </button>
    </div>
  )
}

function LoadingList() {
  return (
    <div>
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            padding: "14px 0",
            borderBottom: index < 2 ? "1px solid var(--hairline)" : "none",
            opacity: 0.4,
          }}
        >
          <div
            style={{
              width: "80px",
              height: "54px",
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
                marginBottom: "8px",
                width: "35%",
              }}
            />
            <div
              style={{
                height: "14px",
                background: "var(--hairline)",
                borderRadius: "3px",
                marginBottom: "6px",
                width: "80%",
              }}
            />
            <div
              style={{
                height: "12px",
                background: "var(--hairline)",
                borderRadius: "3px",
                width: "60%",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
