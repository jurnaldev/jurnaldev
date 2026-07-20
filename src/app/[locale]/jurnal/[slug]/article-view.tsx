import { ArticleBody } from "@/components/article/article-body"
import { ArticleHeader } from "@/components/article/article-header"
import { AuthorCard } from "@/components/article/author-card"
import { GiscusComments } from "@/components/article/giscus-comments"
import { RelatedArticles } from "@/components/article/related-articles"
import { ShareButtons } from "@/components/article/share-buttons"
import { TableOfContents } from "@/components/article/toc"
import { SiteHeader } from "@/components/layout/site-header"
import type { Locale } from "@/lib/i18n/routing"
import { articleUrl } from "@/lib/site"
import type { StrapiArticle, StrapiArticleSummary } from "@/lib/strapi/types"

interface ArticleMeta {
  readingTime: { minutes: number; text: string }
  headings: Array<{ text: string; slug: string; level: number }>
}

interface Props {
  article: StrapiArticle
  meta: ArticleMeta
  related: StrapiArticleSummary[]
  locale: Locale
  alternateHref: string | null
}

export async function ArticleView({
  article,
  meta,
  related,
  locale,
  alternateHref,
}: Props) {
  const body = await ArticleBody({
    body: article.body,
    headingPrefix: `article-${locale}`,
  })

  return (
    <main
      className="page-enter"
      style={{ minHeight: "100vh", position: "relative" }}
    >
      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: "960px",
          margin: "0 auto",
          padding: "2rem 1.5rem 4rem",
        }}
      >
        <SiteHeader alternateHref={alternateHref} />

        <div className="article-layout">
          <article style={{ minWidth: 0 }}>
            <ArticleHeader
              article={article}
              readingTime={meta.readingTime.text}
            />
            {body}
            <div
              style={{
                borderTop: "1px solid var(--hairline)",
                marginTop: "3rem",
                paddingTop: "2rem",
              }}
            >
              <ShareButtons
                title={article.title}
                url={articleUrl(locale, article.slug)}
              />
            </div>
            {article.author && <AuthorCard author={article.author} />}
            <RelatedArticles
              articles={related}
              label={locale === "id" ? "Jurnal lainnya" : "More entries"}
              locale={locale}
            />
            <GiscusComments slug={article.slug} />
          </article>

          <aside className="toc-sidebar">
            <TableOfContents headings={meta.headings} />
          </aside>
        </div>
      </div>
    </main>
  )
}
