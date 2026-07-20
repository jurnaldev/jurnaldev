import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { calculateReadingTime, extractHeadings } from "@/lib/article-utils"
import {
  buildPageAlternates,
  openGraphLocaleSet,
} from "@/lib/i18n/metadata"
import {
  articlePath,
  isLocale,
  type Locale,
} from "@/lib/i18n/routing"
import { articleUrl } from "@/lib/site"
import {
  fetchArticleBySlug,
  fetchRelatedArticles,
  strapiMediaUrl,
} from "@/lib/strapi"
import type { StrapiArticle } from "@/lib/strapi/types"

import { ArticleView } from "./article-view"

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

function articleLanguages(article: StrapiArticle) {
  const languages: Partial<Record<Locale, string>> = {
    [article.locale]: articlePath(article.locale, article.slug),
  }

  for (const localization of article.localizations ?? []) {
    languages[localization.locale] = articlePath(
      localization.locale,
      localization.slug,
    )
  }

  return languages
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const article = await fetchArticleBySlug(slug, candidate)
  if (!article) return { title: "Not found · jurnal.dev" }

  const ogImage = strapiMediaUrl(article.cover?.url)
  const languages = articleLanguages(article)
  const availableLocales = Object.keys(languages) as Locale[]
  const url = articleUrl(candidate, article.slug)

  return {
    title: article.title,
    description: article.excerpt,
    alternates: buildPageAlternates({
      canonicalPath: articlePath(candidate, article.slug),
      languages,
    }),
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      ...openGraphLocaleSet(candidate, availableLocales),
      url,
      publishedTime: article.publishedAt,
      authors: article.author?.name ? [article.author.name] : undefined,
      tags: article.tags?.map((tag) => tag.name),
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
  const { locale: candidate, slug } = await params
  if (!isLocale(candidate)) notFound()

  const article = await fetchArticleBySlug(slug, candidate)
  if (!article) notFound()

  const headingPrefix = `article-${candidate}`
  const meta = {
    readingTime: calculateReadingTime(article.body),
    headings: extractHeadings(article.body, headingPrefix),
  }
  const tagIds = article.tags?.map((tag) => tag.id) ?? []
  const related = await fetchRelatedArticles(
    article.slug,
    tagIds,
    candidate,
    3,
  )
  const alternateLocale = candidate === "en" ? "id" : "en"
  const alternate = article.localizations?.find(
    (localization) => localization.locale === alternateLocale,
  )
  const alternateHref = alternate
    ? articlePath(alternate.locale, alternate.slug)
    : null

  return (
    <ArticleView
      article={article}
      meta={meta}
      related={related}
      locale={candidate}
      alternateHref={alternateHref}
    />
  )
}

export const revalidate = 60
