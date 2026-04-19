import type { StrapiArticle } from "@/lib/strapi/types"
import { ArticleCard } from "./article-card"

export function RelatedArticles({
  articles,
  label,
}: {
  articles: StrapiArticle[]
  label: string
}) {
  if (articles.length === 0) return null

  return (
    <section style={{ margin: "3rem 0 0" }}>
      <div
        style={{
          fontFamily: "var(--font-geist-mono), monospace",
          fontSize: "11px",
          color: "var(--text-subtle)",
          letterSpacing: "0.1em",
          marginBottom: "1.5rem",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        {articles.map((article, i) => (
          <ArticleCard key={article.id} article={article} index={i} />
        ))}
      </div>
    </section>
  )
}
