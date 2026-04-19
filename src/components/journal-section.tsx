"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowRight } from "lucide-react"
import { useLang } from "@/contexts/lang-context"
import { content } from "@/lib/content"
import { ArticleCard } from "@/components/article/article-card"
import type { StrapiArticle } from "@/lib/strapi/types"

const labels = {
  en: { viewAll: "View all entries" },
  id: { viewAll: "Lihat semua entry" },
}

export function JournalSection() {
  const { lang } = useLang()
  const t = content[lang]
  const l = labels[lang]
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

  // Empty state
  if (articles !== null && articles.length === 0) {
    return <EmptyState t={t} />
  }

  // Loading skeleton
  if (articles === null) {
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "1.5rem",
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
              opacity: 0.4,
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
                  width: "80%",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Article cards + view all link
  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "1.5rem",
        }}
      >
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
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
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "var(--text-muted)")
        }
      >
        {l.viewAll}
        <ArrowRight size={14} strokeWidth={2} />
      </Link>
    </>
  )
}

function EmptyState({ t }: { t: (typeof content)["en"] }) {
  const gradients = [
    "var(--card-gradient-0)",
    "var(--card-gradient-1)",
    "var(--card-gradient-2)",
  ]

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "2rem",
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
              opacity: 0.6,
            }}
          >
            <div
              style={{
                height: "100px",
                background: gradients[i],
                borderBottom: "1px solid var(--border)",
              }}
            />
            <div style={{ padding: "14px 16px" }}>
              <div
                style={{
                  fontFamily: "var(--font-geist-mono), monospace",
                  fontSize: "10px",
                  color: "var(--text-subtle)",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                #00{i + 1} · COMING SOON
              </div>
              <div
                style={{
                  height: "12px",
                  background: "var(--border)",
                  borderRadius: "3px",
                  marginBottom: "8px",
                  width: "80%",
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
            {t.journalEmpty.title}
          </h3>
          <p
            style={{
              fontSize: "13px",
              color: "var(--text-muted)",
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {t.journalEmpty.desc}
          </p>
        </div>
        <a
          href="https://instagram.com/jurnal.dev"
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
          {t.journalEmpty.cta}
          <ArrowUpRight size={14} strokeWidth={2} />
        </a>
      </div>
    </>
  )
}
