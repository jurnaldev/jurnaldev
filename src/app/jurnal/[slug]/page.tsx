import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  strapiMediaUrl,
} from "@/lib/strapi"
import { calculateReadingTime, extractHeadings } from "@/lib/article-utils"
import { ArticleView } from "./article-view"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  // Try both locales to find the article
  const article =
    (await fetchArticleBySlug(slug, "en")) ||
    (await fetchArticleBySlug(slug, "id"))

  if (!article) {
    return { title: "Not found · jurnal.dev" }
  }

  const ogImage = strapiMediaUrl(article.cover?.url)

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      tags: article.tags?.map((t) => t.name),
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params

  // Fetch both locale versions so we can toggle without re-fetching
  const [articleEn, articleId] = await Promise.all([
    fetchArticleBySlug(slug, "en"),
    fetchArticleBySlug(slug, "id"),
  ])

  // If slug was for Indonesian version, also try to find the linked English version
  let resolvedEn = articleEn
  let resolvedId = articleId

  if (!resolvedEn && resolvedId?.localizations?.length) {
    const enLoc = resolvedId.localizations.find((l) => l.locale === "en")
    if (enLoc) resolvedEn = await fetchArticleBySlug(enLoc.slug, "en")
  }
  if (!resolvedId && resolvedEn?.localizations?.length) {
    const idLoc = resolvedEn.localizations.find((l) => l.locale === "id")
    if (idLoc) resolvedId = await fetchArticleBySlug(idLoc.slug, "id")
  }

  const primary = resolvedEn || resolvedId
  if (!primary) notFound()

  // Calculate reading time & headings for both versions
  const meta = {
    en: resolvedEn
      ? {
          readingTime: calculateReadingTime(resolvedEn.body),
          headings: extractHeadings(resolvedEn.body),
        }
      : null,
    id: resolvedId
      ? {
          readingTime: calculateReadingTime(resolvedId.body),
          headings: extractHeadings(resolvedId.body),
        }
      : null,
  }

  // Related articles based on tags (use primary version tags)
  const tagIds = primary.tags?.map((t) => t.id) ?? []
  const [relatedEn, relatedId] = await Promise.all([
    resolvedEn ? fetchRelatedArticles(resolvedEn.slug, tagIds, "en", 3) : [],
    resolvedId ? fetchRelatedArticles(resolvedId.slug, tagIds, "id", 3) : [],
  ])

  return (
    <ArticleView
      articleEn={resolvedEn}
      articleId={resolvedId}
      metaEn={meta.en}
      metaId={meta.id}
      relatedEn={relatedEn}
      relatedId={relatedId}
      slug={slug}
    />
  )
}

// ISR: revalidate every 60s
export const revalidate = 60
