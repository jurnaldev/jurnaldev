"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/contexts/lang-context"
import { SiteHeader } from "@/components/layout/site-header"
import { ArticleCard } from "@/components/article/article-card"
import type { StrapiArticle } from "@/lib/strapi/types"

const copy = {
  en: {
    eyebrow: "Journal",
    title: "Notes from learning.",
    subtitle:
      "A running log of what I'm learning as a backend engineer exploring AI. Unpolished, honest, mine.",
    empty: "No entries yet. Check back soon.",
    count: (n: number) => `${n} ${n === 1 ? "entry" : "entries"}`,
  },
  id: {
    eyebrow: "Jurnal",
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
      .catch(() => { mounted = false })
    return () => { mounted = false }
  }, [lang])

  return (
    <main className="page-enter" style={{ minHeight: "100dvh", position: "relative" }}>
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

        {articles !== null && articles.length > 0 && (
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
            {t.count(articles.length)}
          </div>
        )}

        <div style={{ height: "1px", background: "var(--hairline)" }} />

        {articles === null ? (
          <LoadingList />
        ) : articles.length === 0 ? (
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
            {articles.map((article, i) => (
              <div
                key={article.id}
                style={{
                  borderBottom:
                    i < articles.length - 1 ? "1px solid var(--hairline)" : "none",
                }}
              >
                <ArticleCard article={article} index={i} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

function LoadingList() {
  return (
    <div>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: "14px",
            alignItems: "flex-start",
            padding: "14px 0",
            borderBottom: i < 2 ? "1px solid var(--hairline)" : "none",
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
