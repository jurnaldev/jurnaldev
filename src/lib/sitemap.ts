import type { MetadataRoute } from "next"
import {
  articlePath,
  homePath,
  journalPath,
  locales,
  portfolioPath,
  projectPath,
  type Locale,
} from "@/lib/i18n/routing"
import type { LocalizedSlugRecord } from "@/lib/strapi/types"
import { absoluteUrl } from "./site"

type SlugLoader = () => Promise<LocalizedSlugRecord[]>

function groupLanguages(
  records: LocalizedSlugRecord[],
  buildPath: (locale: Locale, slug: string) => string,
): Map<string, Partial<Record<Locale, string>>> {
  const groups = new Map<string, Partial<Record<Locale, string>>>()

  for (const record of records) {
    const languages = groups.get(record.documentId) ?? {}
    languages[record.locale] = absoluteUrl(
      buildPath(record.locale, record.slug),
    )
    for (const localization of record.localizations) {
      languages[localization.locale] = absoluteUrl(
        buildPath(localization.locale, localization.slug),
      )
    }
    groups.set(record.documentId, languages)
  }

  return groups
}

export async function buildSitemapEntries(
  articleLoader: SlugLoader,
  projectLoader: SlugLoader,
): Promise<MetadataRoute.Sitemap> {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>()
  const add = (
    path: string,
    priority: number,
    languages?: Partial<Record<Locale, string>>,
  ) => {
    const url = absoluteUrl(path)
    entries.set(url, {
      url,
      lastModified: new Date(),
      priority,
      ...(languages ? { alternates: { languages } } : {}),
    })
  }

  const homeLanguages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(homePath(locale))]),
  ) as Record<Locale, string>
  const journalLanguages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(journalPath(locale))]),
  ) as Record<Locale, string>
  const portfolioLanguages = Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(portfolioPath(locale))]),
  ) as Record<Locale, string>

  for (const locale of locales) {
    add(homePath(locale), 1, homeLanguages)
    add(journalPath(locale), 0.8, journalLanguages)
    add(portfolioPath(locale), 0.8, portfolioLanguages)
  }

  try {
    const articles = await articleLoader()
    const groups = groupLanguages(articles, articlePath)
    articles.forEach(({ documentId, locale, slug }) =>
      add(articlePath(locale, slug), 0.7, groups.get(documentId)),
    )
  } catch (error) {
    console.error("[sitemap] article slugs unavailable", error)
  }
  try {
    const projects = await projectLoader()
    const groups = groupLanguages(projects, projectPath)
    projects.forEach(({ documentId, locale, slug }) =>
      add(projectPath(locale, slug), 0.7, groups.get(documentId)),
    )
  } catch (error) {
    console.error("[sitemap] project slugs unavailable", error)
  }
  return [...entries.values()]
}
