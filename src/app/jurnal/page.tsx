"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/contexts/lang-context"
import { PageHeader } from "@/components/page-header"
import { ArticleCard } from "@/components/article/article-card"
import type { StrapiArticle } from "@/lib/strapi/types"

const copy = {
  en: {
    kicker: "Journal",
    title: "Notes from learning.",
    subtitle:
      "A running log of what I'm learning as a backend engineer exploring AI. Unpolished, honest, mine.",
    empty: "No entries yet. Check back soon.",
    count: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  },
  id: {
    kicker: "Jurnal",
    title: "Catatan dari proses belajar.",
    subtitle:
      "Log berjalan dari apa yang gw pelajarin sebagai backend engineer yang lagi eksplor AI. Mentah, jujur, milik gw.",
    empty: "Belum ada entry. Cek lagi nanti ya.",
    count: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  },
}

export default function JurnalListPage() {
  const { lang } = useLang()
  const t = copy[lang]
  const [articles, setArticles] = useState<StrapiArticle[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetch(`/api/articles?locale=${lang}`)
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

  return (
    <main style={{ minHeight: "100vh", position: "relative" }}>
      <div className="grid-overlay" />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "760px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <PageHeader />

        {/* Hero */}
        <section style={{ marginBottom: "4rem" }}>
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--text-subtle)",
              letterSpacing: "0.1em",
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            ◆ {t.kicker}
          </div>
          <h1
            style={{
              fontSize: "clamp(2.25rem, 5vw, 3rem)",
              fontWeight: 500,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
              margin: "0 0 1rem 0",
              color: "var(--text)",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              lineHeight: 1.55,
              color: "var(--text-muted)",
              margin: 0,
              maxWidth: "580px",
              letterSpacing: "-0.005em",
            }}
          >
            {t.subtitle}
          </p>
        </section>

        {/* Count */}
        {articles && articles.length > 0 && (
          <div
            style={{
              fontFamily: "var(--font-geist-mono), monospace",
              fontSize: "11px",
              color: "var(--text-subtle)",
              letterSpacing: "0.05em",
              marginBottom: "1.25rem",
              paddingBottom: "1rem",
              borderBottom: "1px solid var(--border)",
            }}
          >
            {t.count(articles.length)}
          </div>
        )}

        {/* Grid */}
        {articles === null ? (
          <LoadingGrid />
        ) : articles.length === 0 ? (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              color: "var(--text-muted)",
              border: "1px dashed var(--border)",
              borderRadius: "10px",
            }}
          >
            {t.empty}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "16px",
            }}
          >
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} index={i} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function LoadingGrid() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "16px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            borderRadius: "10px",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            overflow: "hidden",
            opacity: 0.5,
          }}
        >
          <div style={{ height: "140px", background: "var(--border)" }} />
          <div style={{ padding: "16px 18px" }}>
            <div
              style={{
                height: "10px",
                background: "var(--border)",
                borderRadius: "3px",
                marginBottom: "10px",
                width: "40%",
              }}
            />
            <div
              style={{
                height: "14px",
                background: "var(--border)",
                borderRadius: "3px",
                marginBottom: "8px",
                width: "85%",
              }}
            />
            <div
              style={{
                height: "10px",
                background: "var(--border)",
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
